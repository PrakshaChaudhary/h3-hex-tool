'use client'
import { useCallback, useState } from 'react'

interface Props {
  onLoad: (kmlText: string, fileName: string) => void
}

export default function UploadZone({ onLoad }: Props) {
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = (e) => onLoad(e.target?.result as string, file.name)
      reader.readAsText(file)
    },
    [onLoad]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file?.name.endsWith('.kml')) handleFile(file)
    },
    [handleFile]
  )

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors
        ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-400'}`}
      onClick={() => document.getElementById('kml-input')?.click()}
    >
      <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
      <p className="text-gray-600 font-medium">Drop your KML file here</p>
      <p className="text-gray-400 text-sm mt-1">or click to browse</p>
      <input
        id="kml-input"
        type="file"
        accept=".kml"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  )
}
