# The Archive Map is our own SVG dot map, at Province level

The Map is drawn in-house as an SVG: a grid of dots clipped to an outline of Thailand, with a pin at each Province's capital. The outline is bundled in the repo (Natural Earth, public domain, via the `world-atlas` package) and so is a table of capital coordinates. We don't use a map library or map tiles. The only location a Story has is its Province, so street-level detail would add nothing, and a dot map can carry the Archive's own look in both themes without an API key, a quota or a third-party request on every visit.

## Considered Options

- **Leaflet or MapLibre with tiles**: zoom and streets for free, but a large client bundle, a tile provider to pay for or rate-limit, and a map that looks like every other map.
- **Province boundary polygons (a choropleth)**: precise, but a heavy dataset and a busier picture than pins on a dot field.

## Consequences

- Placing Stories more precisely than their Province (for a "near me" feature) needs a coordinate on each Story and probably a real map library. Revisit this ADR then.
