-- The Archive: Stories, Tags, Storytellers, and the Curator allowlist.

-- The Curator is whoever signs in with an email in this table. It has RLS on and no policies,
-- so only the service role (or SQL console) can read or change it.
create table public.curator_allowlist (
  email text primary key check (email = lower(email))
);
alter table public.curator_allowlist enable row level security;

create function public.is_curator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.curator_allowlist
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke execute on function public.is_curator() from public;
grant execute on function public.is_curator() to anon, authenticated;

-- Keep in sync with src/domain/provinces.ts (the RLS tests check every entry is accepted).
create function public.thai_provinces()
returns text[]
language sql
immutable
as $$
  select array[
    'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น', 'จันทบุรี',
    'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด',
    'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี',
    'นราธิวาส', 'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี',
    'พระนครศรีอยุธยา', 'พะเยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์',
    'แพร่', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยะลา', 'ยโสธร', 'ร้อยเอ็ด', 'ระนอง',
    'ระยอง', 'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล',
    'สมุทรปราการ', 'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย',
    'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ',
    'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี'
  ]::text[];
$$;

create type public.story_status as enum ('draft', 'published');

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  youtube_id text not null unique check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  youtube_title text not null,
  display_title text not null,
  synopsis text not null default '',
  scare_level integer check (scare_level between 1 and 5),
  broadcast_date date,
  added_at timestamptz not null default now(),
  province text check (province = any (public.thai_provinces())),
  place text,
  status public.story_status not null default 'draft',
  updated_at timestamptz not null default now(),
  -- A Draft may be unfinished; a Published Story must be complete.
  constraint published_story_is_complete check (
    status = 'draft' or (
      scare_level is not null
      and broadcast_date is not null
      and btrim(display_title) <> ''
      and btrim(synopsis) <> ''
    )
  )
);

create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger stories_touch_updated_at
before update on public.stories
for each row execute function public.touch_updated_at();

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> '')
);
create unique index tags_name_key on public.tags (lower(btrim(name)));

create table public.storytellers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> '')
);
create unique index storytellers_name_key on public.storytellers (lower(btrim(name)));

create table public.story_tags (
  story_id uuid not null references public.stories (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (story_id, tag_id)
);
create index story_tags_tag_id_idx on public.story_tags (tag_id);

create table public.story_storytellers (
  story_id uuid not null references public.stories (id) on delete cascade,
  storyteller_id uuid not null references public.storytellers (id) on delete cascade,
  primary key (story_id, storyteller_id)
);
create index story_storytellers_storyteller_id_idx on public.story_storytellers (storyteller_id);

-- Row level security: Fans read Published Stories and what they link to; only the Curator writes.

alter table public.stories enable row level security;
alter table public.tags enable row level security;
alter table public.storytellers enable row level security;
alter table public.story_tags enable row level security;
alter table public.story_storytellers enable row level security;

create function public.is_published_story(p_story_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.stories where id = p_story_id and status = 'published');
$$;

revoke execute on function public.is_published_story(uuid) from public;
grant execute on function public.is_published_story(uuid) to anon, authenticated;

create policy "Fans read Published Stories" on public.stories
  for select using (status = 'published' or (select public.is_curator()));

create policy "Fans read Tags on Published Stories" on public.tags
  for select using (
    (select public.is_curator())
    or exists (select 1 from public.story_tags st where st.tag_id = tags.id and public.is_published_story(st.story_id))
  );

create policy "Fans read Storytellers on Published Stories" on public.storytellers
  for select using (
    (select public.is_curator())
    or exists (
      select 1 from public.story_storytellers ss
      where ss.storyteller_id = storytellers.id and public.is_published_story(ss.story_id)
    )
  );

create policy "Fans read Tag links of Published Stories" on public.story_tags
  for select using ((select public.is_curator()) or public.is_published_story(story_id));

create policy "Fans read Storyteller links of Published Stories" on public.story_storytellers
  for select using ((select public.is_curator()) or public.is_published_story(story_id));

do $$
declare
  t text;
begin
  foreach t in array array['stories', 'tags', 'storytellers', 'story_tags', 'story_storytellers'] loop
    execute format(
      'create policy "Curator inserts" on public.%I for insert with check ((select public.is_curator()))', t);
    execute format(
      'create policy "Curator updates" on public.%I for update using ((select public.is_curator())) with check ((select public.is_curator()))', t);
    execute format(
      'create policy "Curator deletes" on public.%I for delete using ((select public.is_curator()))', t);
  end loop;
end;
$$;
