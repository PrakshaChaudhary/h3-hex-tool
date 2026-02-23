'use client'
import { useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { KmlPolygon } from '@/lib/kml-parser'
import { cellsToGeoJson, getHexCells, Resolution } from '@/lib/h3-utils'

// Fix leaflet default marker icon path issue in Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const POLY_COLORS = ['#1a73e8', '#e53935', '#0d9488', '#f59e0b']

const RES_STYLE: Record<Resolution, { color: string; weight: number; fillOpacity: number }> = {
  6: { color: '#2ecc71', weight: 1.2, fillOpacity: 0.25 },
  7: { color: '#f39c12', weight: 0.7, fillOpacity: 0.18 },
  8: { color: '#8b5cf6', weight: 0.4, fillOpacity: 0.12 },
}

interface Props {
  polygons: KmlPolygon[]
  activeRes: Resolution[]
}

function FitBounds({ polygons }: { polygons: KmlPolygon[] }) {
  const map = useMap()
  useEffect(() => {
    if (!polygons.length) return
    const all = polygons.flatMap((p) => p.coords.map(([lat, lng]) => [lat, lng] as [number, number]))
    map.fitBounds(all as L.LatLngBoundsExpression)
  }, [polygons, map])
  return null
}

export default function HexMap({ polygons, activeRes }: Props) {
  return (
    <MapContainer
      center={[12.97, 77.59]}
      zoom={7}
      className="w-full h-full rounded-xl"
      preferCanvas
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com">CARTO</a>'
      />
      <FitBounds polygons={polygons} />

      {/* Polygon outlines */}
      {polygons.map((p, i) => {
        const color = POLY_COLORS[i % POLY_COLORS.length]
        const geoJson = {
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [p.coords.map(([lat, lng]) => [lng, lat])],
          },
          properties: { name: p.name },
        }
        return (
          <GeoJSON
            key={`poly-${p.name}`}
            data={geoJson}
            style={{ color, weight: 2.5, fillOpacity: 0.06 }}
          >
            <Tooltip permanent direction="center" className="font-medium text-xs">
              {p.name}
            </Tooltip>
          </GeoJSON>
        )
      })}

      {/* H3 hex layers — one per active resolution, rendered lowest-res first */}
      {([6, 7, 8] as Resolution[])
        .filter((r) => activeRes.includes(r))
        .map((r) =>
          polygons.map((p) => {
            const cells = getHexCells(p.coords, r)
            // Skip res 8 for large polygons (>70k cells) to prevent browser freeze
            if (r === 8 && cells.length > 70000) return null
            const geoJson = cellsToGeoJson(cells)
            const s = RES_STYLE[r]
            return (
              <GeoJSON
                key={`hex-${p.name}-${r}`}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data={geoJson as any}
                style={{
                  color: s.color,
                  weight: s.weight,
                  fillColor: s.color,
                  fillOpacity: s.fillOpacity,
                }}
              />
            )
          })
        )}
    </MapContainer>
  )
}
