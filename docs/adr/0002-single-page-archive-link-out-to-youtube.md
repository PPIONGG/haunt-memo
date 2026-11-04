# Single-page Archive that links out to YouTube

The Archive replaces an Instagram Story Highlight and is reached from one link in the Curator's IG bio. So the site is a single page: tapping a Story card opens a modal, and there are no per-Story URLs or pages. Listening always happens on YouTube (app or web) through a link-out. We don't embed a player. This keeps the site small and sends views back to The Ghost Radio channel.

## Consequences

- Fans can't share or deep-link a single Story, and individual Stories get no per-Story SEO or OG previews.
- If sharing individual Stories becomes important later, add a `?story=` query param or `/stories/[slug]` routes on top of the existing data.
