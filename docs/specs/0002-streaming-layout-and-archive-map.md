---
status: in-progress
---

# Haunt Memo — streaming layout and the Archive Map

Builds on [0001](0001-haunt-memo-archive.md). It replaces 0001's UI decisions (one grid of cards on one page) and keeps everything else: the data model, access control, the Curator's admin area, client-side search ([ADR 0001](../adr/0001-client-side-search.md)) and linking out to YouTube ([ADR 0002](../adr/0002-single-page-archive-link-out-to-youtube.md)).

## Problem Statement

Most Fans arrive from the Curator's Instagram bio on a phone. A single grid with a filter panel works, but it gives Fans no reason to browse and no starting point. Every Story also has a Province, and nothing in the Archive shows it.

## Solution

The public Archive looks and works like a streaming app, on phones first and equally well on desktop. It has four views on the same page:

- **Home**: the newest Story as a full-width feature, then horizontal shelves of Stories (newest or unlistened, the biggest Tags, the scariest), and a teaser for the Map.
- **Map**: a dot map of Thailand with a pin on every Province that has Stories. A Fan picks a Region or taps a Province to see its Stories. The pins can show either how many Stories a Province has or how frightening they are on average.
- **Search**: the text search, filters and sort from 0001, with results in a grid.
- **Mine**: the Stories the Fan has listened to or saved as favourites.

Phones get a bottom tab bar and bottom sheets. Desktop gets a top navigation bar, a filter sidebar and a split map view. Story details open over the current view: full screen on a phone, as a large modal on desktop. The details show where the Story happened on a small map and suggest other Stories from the same Province.

## User Stories

1. As a Fan on my phone, I want to switch between Home, Map, Search and Mine with a tab bar at the bottom, so that I can reach everything with my thumb.
2. As a Fan, I want Home to open on the newest Story with a button straight to YouTube, so that I can start listening in one tap.
3. As a Fan, I want shelves of Stories grouped by theme, so that I can browse without typing.
4. As a Fan who has already listened to some Stories, I want a shelf of the Stories I haven't heard yet, so that I find something new.
5. As a Fan, I want to see on a map of Thailand where Stories happened, so that I can find Stories from places I know.
6. As a Fan, I want to filter the map by Region, so that I can focus on the part of the country I care about.
7. As a Fan, I want to tap a Province and see its Stories, its Story count and how frightening they are on average, so that I can pick a place to start.
8. As a Fan, I want to switch the map to show which Provinces are the most frightening, so that I can find the scariest places.
9. As a Fan, I want a Story's details to show where it happened and other Stories from the same Province, so that I can keep listening.
10. As a Fan on desktop, I want the same features laid out for a wide screen, with filters always visible next to the results, so that the site doesn't feel like a stretched phone page.

## Implementation Decisions

- The four views are client state on the one public page, not separate routes. See [ADR 0004](../adr/0004-views-on-one-page.md).
- The map is an SVG dot map drawn from a bundled outline of Thailand and a fixed table of Province capital coordinates. It has no map library, tiles or API key, and works at Province level only. See [ADR 0005](../adr/0005-svg-dot-map-at-province-level.md).
- Each Province belongs to one of four Regions (เหนือ, อีสาน, กลาง, ใต้). The mapping is a fixed constant next to the Province list.
- New pure domain modules, tested with Vitest:
  - `archive-map`: per-Province Story counts, average Scare Level and rank; Region lookup; map projection and the land dots.
  - `shelves`: the featured Story, the Home shelves, and related Stories for the details view.
- Look: graphite neutrals, one ember accent used for map pins and small highlights, an off-white primary button, Kanit as the only typeface, and line-icon ghosts for the Scare Level.
- Thumbnails stay derived from the YouTube id. The feature image on Home uses the high-resolution thumbnail and falls back to the standard one.

## Testing Decisions

- Unit tests cover the new domain modules through their public functions: counts and averages per Province, Stories without a Province, Region lookup for all 77 Provinces, a location for every Province, the land test, shelf selection and order, and related-Story order.
- The UI is checked by hand in demo mode (`HAUNT_MEMO_DEMO=1`) on a phone-sized and a desktop-sized screen.

## Out of Scope (Phase 2)

- "Near me": Stories within a distance of the Fan's location. It needs a coordinate per Story.
- Sharing a Story to an Instagram Story. It needs a link per Story, which reopens ADR 0002.
- Custom cover images in place of YouTube thumbnails. Prompts for generating them are in [docs/design/image-prompts.md](../design/image-prompts.md).
