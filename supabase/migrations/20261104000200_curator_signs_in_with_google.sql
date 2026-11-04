-- An allowlisted email alone isn't proof: anyone can claim an address through password sign-up.
-- app_metadata is server-controlled, so the Curator must also be a Google-provisioned user.
create or replace function public.is_curator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'provider', '') = 'google'
    and exists (
      select 1 from public.curator_allowlist
      where email = lower(coalesce(auth.jwt() ->> 'email', ''))
    );
$$;
