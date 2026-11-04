# Haunt Memo

A curated Archive of ghost stories from The Ghost Radio. See `GLOSSARY.md`, `docs/specs/` and `docs/adr/`.

## Local development

Requires Docker (for local Supabase) and pnpm.

```bash
pnpm install
pnpm supabase start          # local Postgres + Auth, applies supabase/migrations
pnpm supabase status         # copy API_URL and ANON_KEY into .env.local (see .env.example)
pnpm dev
```

To use the admin area locally, add your email to the allowlist (Supabase Studio → SQL editor):

```sql
insert into public.curator_allowlist (email) values ('you@example.com');
```

Google sign-in against local Supabase needs `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` / `_SECRET` in `.env.local`.

## Tests

```bash
pnpm test        # pure domain modules (Vitest)
pnpm test:rls    # RLS integration tests; needs `pnpm supabase start`
pnpm typecheck
```

## Production (Supabase + Vercel)

1. Push the migrations: `pnpm supabase link` then `pnpm supabase db push`.
2. In Supabase Auth, enable the **Google** provider and **disable the Email provider**. The database already refuses writes from anyone who didn't sign up with Google, even with an allowlisted email; disabling email sign-up keeps impostor accounts from existing at all.
3. Add the Curator's email to `public.curator_allowlist`.
4. Add the site's `/auth/callback` URL to Supabase Auth's redirect URLs.
5. On Vercel, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
