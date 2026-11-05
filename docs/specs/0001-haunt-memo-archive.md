---
status: ready-for-agent
---

# Haunt Memo — the Archive

## Problem Statement

The Curator keeps their favourite ghost stories from YouTube in an Instagram Story Highlight. Most come from the channel "The Ghost Radio", but some come from other Channels. With around 100 clips in it, Fans struggle to browse back through it. The Highlight has no search, no filtering, and no way to tell stories apart without tapping through them one by one, so the collection gets harder to use the more it grows.

## Solution

Haunt Memo is a single-page web Archive, linked from the Curator's Instagram bio, that replaces the Highlight. Fans see every Published Story as a card and can search, filter, and sort them instantly, including in Thai. Tapping a card opens a modal with the Synopsis and details, and a button opens the clip on YouTube to listen. Fans can mark Stories as listened or favourite, and can pull up a random Story. Nothing needs an account.

The Curator signs in to a private admin area to add Stories. They paste a YouTube link, the title and thumbnail get filled in automatically, and they paste a JSON draft from Gemini to prefill the Display Title, Synopsis, Storytellers, Province/Place, and Tags. They set the Scare Level and Broadcast Date themselves, save the Story as a Draft, and Publish it when it's ready.

## User Stories

### Fan — browsing

1. As a Fan, I want to reach the Archive from the link in the Curator's Instagram bio, so that I don't have to tap through a long Highlight.
2. As a Fan, I want to see all Published Stories as cards on one page, so that I can scan the whole Archive quickly.
3. As a Fan, I want each card to show the thumbnail, Display Title, Tags, Province, and Scare Level, so that I can judge a Story at a glance.
4. As a Fan, I want the Scare Level shown as 1–5 ghost icons 👻, so that I can see how frightening a Story is without reading numbers.
5. As a Fan, I want Stories ordered by Added Date (newest first) by default, so that I see the Curator's latest picks first.
6. As a Fan, I want to sort Stories by Broadcast Date, so that I can follow them in the order they aired.
7. As a Fan, I want to sort Stories by Scare Level, so that I can find the scariest or the gentlest ones.
8. As a Fan, I want the page to load fast on mobile, because I usually come from Instagram on my phone.
9. As a Fan, I want to see how many Stories match my current search and filters, so that I know how big the result set is.
10. As a Fan, I want a clear empty state when nothing matches, so that I know to loosen my filters.

### Fan — searching and filtering

11. As a Fan, I want to type Thai text and see matching Stories instantly as I type, so that I can find a Story I half-remember.
12. As a Fan, I want my search to match the Display Title, the Synopsis, Storyteller names, and Place, so that any detail I remember can find the Story.
13. As a Fan, I want search to tolerate small typos and partial words, so that I don't need the exact wording.
14. As a Fan, I want to filter by one or more Tags, so that I can listen to one kind of story, such as hospitals.
15. As a Fan, I want to filter by Storyteller, so that I can hear every Story told by someone I liked.
16. As a Fan, I want to filter by Province, so that I can find stories from places I know.
17. As a Fan, I want to filter by Scare Level, so that I can match the Stories to my mood.
18. As a Fan, I want to filter by a Broadcast Date range, so that I can find Stories from a particular period.
19. As a Fan, I want search and filters to combine, so that I can narrow results precisely, for example "hospital" Tag + Chiang Mai + Scare Level ≥ 4.
20. As a Fan, I want to clear all filters in one tap, so that I can start over quickly.

### Fan — Story details and listening

21. As a Fan, I want to tap a card and see a modal with the full Synopsis, Storytellers, Place, and Broadcast Date, so that I can decide whether to listen.
22. As a Fan, I want the Synopsis to set up the story without spoiling the ending, so that the clip is still frightening when I listen.
23. As a Fan, I want an "Open in YouTube" button in the modal that opens the clip in the YouTube app or website, so that I can listen with the player I'm used to.
24. As a Fan, I want to close the modal and return to the same scroll position and filters, so that I don't lose my place.

### Fan — personal features (no account)

25. As a Fan, I want to mark a Story as listened, so that I can keep track of what I've already heard.
26. As a Fan, I want listened Stories to be visibly marked on their cards, so that I can skip them while browsing.
27. As a Fan, I want to filter to only unlistened Stories, so that I can find something new to hear.
28. As a Fan, I want to add a Story to my favourites, so that I can come back to the ones I loved.
29. As a Fan, I want to filter to only my favourites, so that I can replay them easily.
30. As a Fan, I want my listened and favourite marks to stay on my device without signing up, so that I keep them with no effort.
31. As a Fan, I want a "Random Story" button, so that I can let the Archive pick something for me.
32. As a Fan, I want "Random Story" to respect my current filters, so that I can get a random hospital story or a random unlistened Story.

### Curator — access

33. As the Curator, I want to sign in to the admin area with my email and password, so that I can get in without setting up anything else ([ADR 0006](../adr/0006-curator-signs-in-with-password.md)).
34. As the Curator, I want only my email to be allowed in, so that nobody else can change the Archive.
35. As the Curator, I want anyone who isn't me to be blocked even if they reach the admin URL or call the database directly, so that the Archive is safe.

### Curator — adding a Story

36. As the Curator, I want to paste a YouTube link and have the clip title and thumbnail filled in automatically, so that I don't type them.
37. As the Curator, I want the link to be accepted in any common YouTube URL format (watch, youtu.be, shorts, with extra query params), so that I can paste whatever I copied.
38. As the Curator, I want to be warned if that YouTube clip is already in the Archive, so that I don't add duplicates.
39. As the Curator, I want to copy a ready-made Gemini prompt that already includes the current Tag list, so that Gemini's draft fits the Archive's vocabulary.
40. As the Curator, I want to paste Gemini's JSON reply into the form and have it prefill Display Title, Synopsis, Storytellers, Province, Place, and Tags, so that adding a Story takes seconds.
41. As the Curator, I want a clear error if the pasted JSON is malformed or missing fields, so that I can fix it or ask Gemini again.
42. As the Curator, I want Tags in the Gemini draft that don't exist yet to be highlighted, so that I consciously decide whether to create a new Tag.
43. As the Curator, I want a Province that doesn't match one of the 77 Thai provinces to be flagged, so that the Province filter stays clean.
44. As the Curator, I want Storytellers from the draft matched to existing Storytellers by name, so that the same person isn't stored twice.
45. As the Curator, I want to edit any prefilled field before saving, so that I stay in control of what Fans see.
46. As the Curator, I want to set the Scare Level (1–5) myself, so that it reflects my own judgement.
47. As the Curator, I want to enter the Broadcast Date myself, so that it's accurate.
48. As the Curator, I want to pick Tags and Storytellers with autocomplete and create new ones inline, so that I can keep the vocabulary consistent.
49. As the Curator, I want to leave Province empty when the story happened abroad or the place is unknown, so that I don't have to invent data.
50. As the Curator, I want to save a Story as a Draft, so that I can finish it later before Fans see it.

### Curator — managing Stories

51. As the Curator, I want to see all my Stories, both Drafts and Published, in a list in the admin area, so that I can manage the Archive.
52. As the Curator, I want to filter the admin list by status, so that I can find unfinished Drafts.
53. As the Curator, I want to Publish a Draft, so that it appears in the Archive.
54. As the Curator, I want to move a Published Story back to Draft, so that I can hide it while I fix it.
55. As the Curator, I want to edit any field of an existing Story, so that I can correct mistakes.
56. As the Curator, I want to delete a Story, so that I can remove one I no longer want in the Archive.
57. As the Curator, I want changes to show up on the public Archive shortly after I save, so that I don't have to redeploy.
58. As the Curator, I want to rename or merge Tags, so that I can clean up the vocabulary over time.
59. As the Curator, I want to rename or merge Storytellers, so that I can fix duplicates.
60. As the Curator, I want to migrate my existing ~100 Highlight clips by adding them one by one through the same admin form, so that the Archive starts complete.

## Implementation Decisions

### Stack

- Next.js (App Router) + TypeScript, deployed on Vercel.
- UI built with shadcn/ui on Tailwind (Card, Dialog, Input/Command, Badge, Select, Form, Toggle).
- Supabase: Postgres for data and Supabase Auth with email and password for the Curator.
- Client-side fuzzy search (Fuse.js or equivalent) over the full Published dataset ([ADR 0001](../adr/0001-client-side-search.md)).

### Architecture and scope boundaries

- **Single-page Archive**: the public site is one page. Tapping a card opens a modal. There are no per-Story routes or per-Story URLs, and no embedded player: listening always links out to YouTube ([ADR 0002](../adr/0002-single-page-archive-link-out-to-youtube.md)).
- **Gemini outside the app**: the app never calls Gemini. The repo holds a prompt template and a JSON schema, and the admin form parses pasted JSON ([ADR 0003](../adr/0003-gemini-outside-the-app.md)).
- **Fans are anonymous**: they have no accounts and no Fan data on the server. Listened and favourite marks live in the browser's localStorage.
- The public page is statically generated with ISR. Admin mutations trigger on-demand revalidation of the public page so changes appear without a redeploy.

### Data model (Supabase / Postgres)

- **stories**: id, youtube_id (unique), youtube_title, display_title, synopsis, scare_level (integer 1–5), broadcast_date (date), added_at (timestamp, default now), province (nullable; constrained to the 77 Thai provinces), place (nullable text), status (`draft` | `published`), updated_at.
- **tags**: id, name (unique). **story_tags**: story_id, tag_id (many-to-many).
- **storytellers**: id, name (unique). **story_storytellers**: story_id, storyteller_id (many-to-many).
- Thumbnails aren't stored; they're derived from youtube_id via YouTube's standard thumbnail URL.
- The Province list is a fixed constant shared by the database constraint, the admin form, and the Gemini prompt.

### Access control (RLS)

- Anonymous and authenticated non-Curator roles can SELECT only `published` stories and their related tags and storytellers.
- Only the Curator can INSERT, UPDATE, or DELETE any table, and only the Curator can read Drafts. The Curator is identified by an allowlisted email checked in RLS policies.
- The admin UI also gates on the Curator session, but RLS is the source of truth.

### Archive domain module (pure, framework-free)

The deep module behind the public page. It takes the full list of Published Stories plus Fan state and returns what to render.

- `queryArchive(stories, criteria, fanState) → { stories, total }`
  - criteria: text query, Tag ids (match any), Storyteller ids, Province, Scare Level range, Broadcast Date range, listened filter (all / unlistened / listened), favourites-only, sort (`added_desc` default, `broadcast_desc`, `broadcast_asc`, `scare_desc`, `scare_asc`).
  - The text query fuzzy-matches Display Title, Synopsis, Storyteller names, and Place, and works on Thai text without word segmentation.
- `pickRandomStory(stories, criteria, fanState, rng) → story | null`: random choice within the current query result. The randomness source is injectable for deterministic tests.
- Fan state (listened set, favourites set) has a small storage adapter over localStorage. The domain module receives plain sets, never touches storage itself.

### Gemini draft module (pure)

- The prompt template is generated from the current Tag list and the Province list, so the Curator copies a prompt that's always up to date.
- Contract (JSON schema) for what Gemini returns:

```json
{
  "display_title": "string",
  "synopsis": "string, 3–5 sentences, no spoilers of the ending",
  "storytellers": ["string"],
  "province": "one of the 77 provinces | null",
  "place": "string | null",
  "tags": ["string, chosen from the provided Tag list"]
}
```

- `parseGeminiDraft(rawText, { existingTags, existingStorytellers, provinces }) → { ok: true, formValues, warnings } | { ok: false, errors }`
  - Accepts the JSON even when it's wrapped in markdown code fences or surrounded by prose.
  - Matches Tags and Storytellers to existing records by normalised name (trimmed whitespace, case-insensitive). Anything unmatched is flagged as new.
  - Flags a Province that isn't in the list and leaves the field empty.
  - Never sets Scare Level or Broadcast Date.

### YouTube integration

- `parseYouTubeUrl(url) → youtubeId | null` handles watch, youtu.be, shorts, embed, and URLs with extra query params.
- Title lookup goes through YouTube oEmbed (no API key), called from a server action so the browser avoids CORS issues. If the lookup fails, the Curator can type the title manually.

### Admin area

- Behind email and password sign-in. Non-allowlisted accounts are signed out with a "not authorised" message.
- Story list with a status filter, a create/edit form, Publish/Unpublish, delete with confirmation, and Tag/Storyteller rename and merge.
- The form has a "Copy Gemini prompt" button and a "Paste Gemini JSON" area that prefills fields and shows warnings inline.
- A duplicate youtube_id check runs before saving.

## Testing Decisions

- Good tests check external behaviour through the module's public interface (inputs → outputs, or role → allowed/denied), not internal structure. A refactor that keeps behaviour the same shouldn't break any test.
- **Seam 1, the pure domain modules (Vitest unit tests)**:
  - `queryArchive`: Thai text search (partial words, small typos), each filter alone and combined, every sort order, listened/favourites filters, empty results, and the total count.
  - `pickRandomStory`: respects criteria, returns null for an empty result, and is deterministic with a seeded rng.
  - `parseGeminiDraft`: valid JSON, fenced or prose-wrapped JSON, malformed JSON, missing fields, new vs existing Tags and Storytellers, an invalid Province, and that it never sets Scare Level or Broadcast Date.
  - `parseYouTubeUrl`: every supported URL shape plus invalid inputs.
- **Seam 2, Supabase RLS (integration tests against local Supabase via the Supabase CLI)**:
  - An anonymous client sees only Published stories and can't see Drafts.
  - Anonymous and non-Curator authenticated clients can't insert, update, or delete any table.
  - The Curator can read Drafts and perform every write.
  - Province and scare_level constraints reject invalid values.
- No prior art exists; the repo is greenfield. These tests set the pattern.
- UI components and E2E flows aren't tested automatically in this scope.

## Out of Scope

- Per-Story pages or URLs, deep links, and per-Story OG previews.
- Embedded YouTube playback and timestamped segments within a clip (one Story is one YouTube video).
- A Curator's Note (a personal "why I love this"): dropped by decision. The Synopsis is the only prose.
- Fan accounts, comments, likes, server-side favourites, and cross-device sync.
- Calling the Gemini API or the YouTube Data API from the app, and automatically fetching the Broadcast Date.
- Automated import from Instagram, and bulk CSV import.
- More than one Curator, and roles.
- Server-side or external search engines.
- E2E/UI automated tests.

## Further Notes

- The vocabulary follows [GLOSSARY.md](../../GLOSSARY.md): Archive, Story, Channel, Curator, Fan, Synopsis, Display Title, Storyteller, Tag, Scare Level, Province, Place, Broadcast Date, Added Date, Draft, Published.
- A Story can come from any YouTube Channel, not just The Ghost Radio. Nothing in the data model ties a Story to one Channel. The Channel isn't stored or shown yet, and Fans can't filter by it. If that becomes useful, add a Channel field filled from oEmbed's `author_name`.
- Revisit ADR 0001 if the Archive grows into the many thousands of Stories.
- This spec hasn't been published to an issue tracker yet. Run `/setup-matt-pocock-skills` to configure one, then publish this spec with the `ready-for-agent` label.
- The UI is Thai-first. A dark theme fits the subject matter.
