export interface KmlPolygon {
  name: string
  // Outer ring: array of [lat, lng] pairs (H3 convention)
  coords: [number, number][]
}

export function parseKml(kmlText: string): KmlPolygon[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(kmlText, 'application/xml')
  const placemarks = Array.from(doc.querySelectorAll('Placemark'))
  const results: KmlPolygon[] = []

  for (const pm of placemarks) {
    const coordEl = pm.querySelector('Polygon outerBoundaryIs LinearRing coordinates')
    if (!coordEl) continue
    const name = pm.querySelector('name')?.textContent?.trim() ?? 'Unnamed'
    const raw = coordEl.textContent?.trim() ?? ''
    const coords: [number, number][] = raw
      .split(/\s+/)
      .filter(Boolean)
      .map((triplet) => {
        const [lng, lat] = triplet.split(',').map(Number)
        return [lat, lng] // H3 expects [lat, lng]
      })
    if (coords.length > 2) results.push({ name, coords })
  }

  return results
}
