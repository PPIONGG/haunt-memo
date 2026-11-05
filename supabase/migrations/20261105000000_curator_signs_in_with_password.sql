-- The Curator signs in with email and password instead of Google (ADR 0006).
-- An allowlisted email is enough here because public sign-up is turned off in Supabase Auth:
-- the only accounts are the ones created in the dashboard, so nobody can claim the Curator's address.
create or replace function public.is_curator()
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
