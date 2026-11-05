# Home, Map, Search and Mine are views on one page, not routes

The public Archive has four views (Home, Map, Search, Mine) behind a tab bar, but they're client state on the single public page rather than separate routes. All of them read the same Published Stories, which the page already ships whole for client-side search ([ADR 0001](0001-client-side-search.md)). Switching views therefore needs no request, and the page stays one statically generated, cached document. It also keeps [ADR 0002](0002-single-page-archive-link-out-to-youtube.md) intact: there are still no per-Story URLs.

## Consequences

- A view can't be bookmarked or shared, and the browser's back button doesn't step between views. If that becomes a problem, mirror the view in a query parameter (`?view=map`) on the same page rather than adding routes.
