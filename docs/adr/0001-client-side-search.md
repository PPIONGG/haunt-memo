# Search and filter Stories on the client, not in Postgres

Stories are mostly in Thai, and Postgres full-text search can't segment Thai words, so `to_tsvector` would give poor matches. The Archive is small (hundreds of Stories, a few thousand at most), so we ship every Published Story's searchable fields to the page with static generation/ISR, then search and filter on the client. Fans get instant results as they type, and the system needs no extra search service.

## Considered Options

- **Postgres `pg_trgm` / `ILIKE`**: works for Thai substrings, but every keystroke becomes a round trip and facet filtering gets more complex.
- **Algolia / Meilisearch**: good Thai support, but it's an extra service to sync and possibly pay for, which isn't worth it at this size.

## Consequences

Revisit this decision if the Archive grows into the many thousands and the page payload gets heavy.
