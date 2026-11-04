-- Curator write paths that touch several tables at once, so they run in one transaction.
-- They run as the caller (security invoker), so RLS still applies; the explicit check gives a clear error.

create function public.require_curator()
returns void
language plpgsql
stable
as $$
begin
  if not public.is_curator() then
    raise exception 'Only the Curator can change the Archive' using errcode = '42501';
  end if;
end;
$$;

-- Creates or updates a Story and replaces its Tags and Storytellers. Names are matched to existing
-- records case-insensitively after trimming; unmatched names are created.
create function public.save_story(
  p_id uuid,
  p_youtube_id text,
  p_youtube_title text,
  p_display_title text,
  p_synopsis text,
  p_scare_level integer,
  p_broadcast_date date,
  p_province text,
  p_place text,
  p_status public.story_status,
  p_tags text[],
  p_storytellers text[]
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
begin
  perform require_curator();

  if p_id is null then
    insert into stories (
      youtube_id, youtube_title, display_title, synopsis, scare_level, broadcast_date, province, place, status
    ) values (
      p_youtube_id, p_youtube_title, p_display_title, p_synopsis, p_scare_level, p_broadcast_date,
      p_province, p_place, p_status
    )
    returning id into v_id;
  else
    update stories set
      youtube_id = p_youtube_id,
      youtube_title = p_youtube_title,
      display_title = p_display_title,
      synopsis = p_synopsis,
      scare_level = p_scare_level,
      broadcast_date = p_broadcast_date,
      province = p_province,
      place = p_place,
      status = p_status
    where id = p_id
    returning id into v_id;
    if v_id is null then
      raise exception 'Story % not found', p_id using errcode = 'P0002';
    end if;
  end if;

  insert into tags (name)
  select distinct on (lower(btrim(n))) btrim(n) from unnest(p_tags) as n where btrim(n) <> ''
  on conflict ((lower(btrim(name)))) do nothing;

  insert into storytellers (name)
  select distinct on (lower(btrim(n))) btrim(n) from unnest(p_storytellers) as n where btrim(n) <> ''
  on conflict ((lower(btrim(name)))) do nothing;

  delete from story_tags where story_id = v_id;
  insert into story_tags (story_id, tag_id)
  select v_id, t.id from tags t
  where lower(btrim(t.name)) in (select lower(btrim(n)) from unnest(p_tags) as n);

  delete from story_storytellers where story_id = v_id;
  insert into story_storytellers (story_id, storyteller_id)
  select v_id, s.id from storytellers s
  where lower(btrim(s.name)) in (select lower(btrim(n)) from unnest(p_storytellers) as n);

  return v_id;
end;
$$;

create function public.merge_tags(p_source uuid, p_target uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  perform require_curator();
  if p_source = p_target then
    return;
  end if;
  insert into story_tags (story_id, tag_id)
  select story_id, p_target from story_tags where tag_id = p_source
  on conflict do nothing;
  delete from tags where id = p_source;
end;
$$;

create function public.merge_storytellers(p_source uuid, p_target uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  perform require_curator();
  if p_source = p_target then
    return;
  end if;
  insert into story_storytellers (story_id, storyteller_id)
  select story_id, p_target from story_storytellers where storyteller_id = p_source
  on conflict do nothing;
  delete from storytellers where id = p_source;
end;
$$;

revoke execute on function public.require_curator() from public;
revoke execute on function public.save_story(
  uuid, text, text, text, text, integer, date, text, text, public.story_status, text[], text[]
) from public;
revoke execute on function public.merge_tags(uuid, uuid) from public;
revoke execute on function public.merge_storytellers(uuid, uuid) from public;

grant execute on function public.require_curator() to authenticated;
grant execute on function public.save_story(
  uuid, text, text, text, text, integer, date, text, text, public.story_status, text[], text[]
) to authenticated;
grant execute on function public.merge_tags(uuid, uuid) to authenticated;
grant execute on function public.merge_storytellers(uuid, uuid) to authenticated;
