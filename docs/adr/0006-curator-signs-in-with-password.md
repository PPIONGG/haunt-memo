# The Curator signs in with email and password

The Curator signs in to the admin area with an email and password instead of Google. Setting up a Google OAuth client was too much work for a single Curator. The Curator's account is created by hand in the Supabase dashboard and public sign-up is turned off, so nobody else can get an account.

The database still decides who the Curator is. `is_curator()` requires an email on the allowlist and a confirmed email address. That stops anyone who signs up under the Curator's address before the real account exists, because they can't confirm an inbox they don't own.

This replaces the Google sign-in in [spec 0001](../specs/0001-haunt-memo-archive.md).
