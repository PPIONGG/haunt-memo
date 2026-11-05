# Haunt Memo

A curated Archive of ghost stories from YouTube, mostly from The Ghost Radio but open to any Channel. See `GLOSSARY.md`, `docs/specs/` and `docs/adr/`.

## Local development

Requires Docker (for local Supabase) and pnpm.

```bash
pnpm install
pnpm supabase start          # local Postgres + Auth, applies supabase/migrations
pnpm supabase status         # copy API_URL and ANON_KEY into .env.local (see .env.example)
pnpm dev
```

To use the admin area locally (sign-up is off, see [ADR 0006](docs/adr/0006-curator-signs-in-with-password.md)):

1. Supabase Studio (http://127.0.0.1:54323) → Authentication → Add user → Create new user, with **Auto Confirm User** ticked.
2. SQL editor:

   ```sql
   insert into public.curator_allowlist (email) values ('you@example.com');
   ```

3. Sign in at `/admin/sign-in` with that email and password.

## Preview without Supabase

Run the public Archive with made-up sample Stories (no database, no `.env.local` needed):

```bash
HAUNT_MEMO_DEMO=1 pnpm dev
```

Thumbnails don't load in this mode because the sample YouTube ids are placeholders. The admin area still needs Supabase.

## Tests

```bash
pnpm test        # pure domain modules (Vitest)
pnpm test:rls    # RLS integration tests; needs `pnpm supabase start`
pnpm typecheck
```

## Production (Supabase + Vercel)

1. Push the migrations: `pnpm supabase link` then `pnpm supabase db push`.
2. In Supabase Auth → Sign In / Providers, turn off **Allow new users to sign up**. Keep the Email provider on.
3. Authentication → Users → Add user → Create new user for the Curator, with **Auto Confirm User** ticked.
4. Add the Curator's email to `public.curator_allowlist`.
5. On Vercel, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
