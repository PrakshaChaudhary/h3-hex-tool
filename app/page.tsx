'use client'
import dynamic from 'next/dynamic'
import { useCallback, useMemo, useState } from 'react'
import UploadZone from '@/components/UploadZone'
import SummaryTable from '@/components/SummaryTable'
import { parseKml, KmlPolygon } from '@/lib/kml-parser'
import { getHexCells, Resolution, RESOLUTIONS } from '@/lib/h3-utils'

// Leaflet must not be server-side rendered
const HexMap = dynamic(() => import('@/components/HexMap'), { ssr: false })

export default function Home() {
  const [polygons, setPolygons] = useState<KmlPolygon[]>([])
  const [activeRes, setActiveRes] = useState<Resolution[]>([7])
  const [fileName, setFileName] = useState<string>('')

  const handleKml = useCallback((kmlText: string, name: string) => {
    const parsed = parseKml(kmlText)
    setPolygons(parsed)
    setFileName(name)
  }, [])

  // Pre-compute counts for all polygons × all resolutions
  const counts = useMemo(() => {
    const result: Record<string, Record<Resolution, number>> = {}
    for (const p of polygons) {
      result[p.name] = {} as Record<Resolution, number>
      for (const r of RESOLUTIONS) {
        result[p.name][r] = getHexCells(p.coords, r).length
      }
    }
    return result
  }, [polygons])

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-3 flex items-center gap-3">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <h1 className="text-gray-900 font-semibold text-lg">H3 Hex Coverage Tool</h1>
        {fileName && (
          <span className="ml-2 text-sm text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{fileName}</span>
        )}
      </header>

      {/* Upload — shown only when no polygons loaded */}
      {polygons.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <p className="text-center text-gray-500 mb-6 text-sm">
              Upload a KML file to visualize H3 hex coverage at resolutions 6, 7, and 8
            </p>
            <UploadZone onLoad={handleKml} />
          </div>
        </div>
      )}

      {/* Map + sidebar — shown after upload */}
      {polygons.length > 0 && (
        <div className="flex-1 flex gap-4 p-4 min-h-0" style={{ height: 'calc(100vh - 57px)' }}>
          {/* Map */}
          <div className="flex-1 min-h-0">
            <HexMap polygons={polygons} activeRes={activeRes} />
          </div>

          {/* Sidebar */}
          <div className="w-72 flex flex-col gap-3">
            <SummaryTable
              polygons={polygons}
              counts={counts}
              activeRes={activeRes}
              onResChange={setActiveRes}
            />
            <button
              onClick={() => { setPolygons([]); setFileName('') }}
              className="text-sm text-gray-400 hover:text-gray-600 underline text-center"
            >
              Upload a different file
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
