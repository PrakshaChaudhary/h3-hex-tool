import { cellToBoundary, polygonToCells } from 'h3-js'

export const RESOLUTIONS = [6, 7, 8] as const
export type Resolution = (typeof RESOLUTIONS)[number]

// Approx average hex area in km² per resolution (from H3 docs)
export const RES_AREA: Record<Resolution, string> = {
  6: '~36 km²',
  7: '~5.2 km²',
  8: '~0.74 km²',
}

export function getHexCells(
  coords: [number, number][],
  resolution: Resolution
): string[] {
  // polygonToCells expects [[lat, lng], ...] — matches our convention
  return polygonToCells(coords, resolution, true)
}

export function cellsToGeoJson(cells: string[]) {
  return {
    type: 'FeatureCollection' as const,
    features: cells.map((cell) => {
      const boundary = cellToBoundary(cell) // returns [[lat,lng],...]
      const coords = [...boundary, boundary[0]].map(([lat, lng]) => [lng, lat]) // GeoJSON is [lng,lat]
      return {
        type: 'Feature' as const,
        geometry: { type: 'Polygon' as const, coordinates: [coords] },
        properties: { cell },
      }
    }),
  }
}
