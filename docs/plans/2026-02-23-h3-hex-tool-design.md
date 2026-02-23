# H3 Hex Coverage Tool — Design Doc
Date: 2026-02-23

## Problem
Analysts need a quick way to upload a KML boundary file and see how many
H3 hexagons (at resolutions 6, 7, and 8) are needed to cover that area,
with an interactive map to share with seniors.

## Chosen Approach
Pure-frontend Next.js app deployed to Vercel (static export).
No backend. All computation in the browser.

## Architecture

```
KML file (drag-and-drop upload)
  → @tmcw/togeojson: KML → GeoJSON polygons
  → h3-js: polyfill each polygon at res 6, 7, 8
  → react-leaflet: render interactive map with GeoJSON hex overlays
  → Summary table: hex counts per polygon per resolution
```

### Dependencies
- `next` — framework, static export
- `react-leaflet` + `leaflet` — interactive map
- `h3-js` — H3 hexagon computation (official JS port)
- `@tmcw/togeojson` — KML to GeoJSON conversion

## UI Layout
- Header: tool name
- Upload zone: drag-and-drop or click to select KML
- Two-column layout after upload:
  - Left (70%): Leaflet map with polygon boundaries + hex layers
  - Right (30%): summary table (polygon × resolution counts) + hex size guide
- Layer control on map: toggle Res 6 / Res 7 / Res 8

## Constraints
- Res 8 rendered only for smaller polygons (<70k cells) to avoid browser freeze
- Res 8 count shown in table regardless

## Deployment
- Vercel team: `prakshachaudharys-projects`
- GitHub repo → Vercel Git integration (automatic deploys on push)
- `next export` static output → zero server cost
