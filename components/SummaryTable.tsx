import { KmlPolygon } from '@/lib/kml-parser'
import { RESOLUTIONS, RES_AREA, Resolution } from '@/lib/h3-utils'

interface Props {
  polygons: KmlPolygon[]
  counts: Record<string, Record<Resolution, number>>
  activeRes: Resolution[]
  onResChange: (r: Resolution[]) => void
}

export const RES_COLOR: Record<Resolution, { bg: string; dot: string; text: string }> = {
  6: { bg: 'bg-green-500',  dot: 'bg-green-500',  text: 'text-green-700' },
  7: { bg: 'bg-orange-400', dot: 'bg-orange-400', text: 'text-orange-600' },
  8: { bg: 'bg-purple-500', dot: 'bg-purple-500', text: 'text-purple-700' },
}

export default function SummaryTable({ polygons, counts, activeRes, onResChange }: Props) {
  const toggle = (r: Resolution) => {
    if (activeRes.includes(r)) {
      // Don't allow deselecting all
      if (activeRes.length === 1) return
      onResChange(activeRes.filter((x) => x !== r))
    } else {
      onResChange([...activeRes, r].sort() as Resolution[])
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-4">
      <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">H3 Hex Coverage</h2>

      {/* Resolution toggles — multi-select */}
      <div className="flex gap-2">
        {RESOLUTIONS.map((r) => {
          const on = activeRes.includes(r)
          return (
            <button
              key={r}
              onClick={() => toggle(r)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors border-2
                ${on
                  ? `${RES_COLOR[r].bg} text-white border-transparent`
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
            >
              Res {r}
            </button>
          )
        })}
      </div>

      {/* Counts table */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left py-2 px-2 text-gray-500 font-medium">Polygon</th>
            {RESOLUTIONS.map((r) => (
              <th key={r} className="text-right py-2 px-2 text-gray-500 font-medium">Res {r}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {polygons.map((p) => (
            <tr key={p.name} className="border-t border-gray-100">
              <td className="py-2 px-2 text-gray-700 max-w-[120px] truncate" title={p.name}>{p.name}</td>
              {RESOLUTIONS.map((r) => (
                <td
                  key={r}
                  className={`text-right py-2 px-2 font-mono font-medium transition-colors
                    ${activeRes.includes(r) ? RES_COLOR[r].text : 'text-gray-300'}`}
                >
                  {counts[p.name]?.[r]?.toLocaleString() ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Reference guide */}
      <div className="border-t pt-3">
        <p className="text-xs text-gray-500 font-medium mb-1">Hex size reference</p>
        {RESOLUTIONS.map((r) => (
          <div key={r} className="flex items-center gap-2 text-xs text-gray-500">
            <span className={`w-2 h-2 rounded-full ${RES_COLOR[r].dot}`} />
            <span>Res {r}: {RES_AREA[r]} per hex</span>
          </div>
        ))}
      </div>
    </div>
  )
}
