import { useMemo } from 'react'
import { Html, Line } from '@react-three/drei'
import districtsData from '../assets/districts.json'
import { useHeightfield } from './heightfield'
import { drapePolyline } from './drape'

interface DistrictLines {
  name: string
  lines: Array<Array<[number, number]>> // [lon, lat]
}

const LABELS: Array<{ name: string; lon: number; lat: number }> = [
  { name: 'Mumbai', lon: 72.88, lat: 19.06 },
  { name: 'Thane', lon: 73.2, lat: 19.35 },
  { name: 'Palghar', lon: 72.95, lat: 19.75 },
  { name: 'Nashik', lon: 73.68, lat: 19.95 },
]

export function Districts() {
  const hf = useHeightfield()

  const lines = useMemo(() => {
    const data = districtsData as DistrictLines[]
    return data.flatMap((d) =>
      d.lines.flatMap((line, li) => {
        const scenePts = line.map(([lon, lat]) => hf.project(lon, lat))
        return drapePolyline(hf, scenePts, 2.5, 0.3).map((points, ri) => ({
          key: `${d.name}-${li}-${ri}`,
          points,
        }))
      }),
    )
  }, [hf])

  return (
    <>
      {lines.map((l) => (
        <Line
          key={l.key}
          points={l.points}
          color="#3d4f58"
          transparent
          opacity={0.5}
          dashed
          dashSize={1.6}
          gapSize={1.3}
          lineWidth={1.5}
        />
      ))}
      {LABELS.map((d) => {
        const p = hf.project(d.lon, d.lat)
        return (
          <Html
            key={d.name}
            position={[p.x, Math.max(hf.terrainHeight(p.x, p.z), 0) + 2, p.z]}
            center
            distanceFactor={160}
            zIndexRange={[40, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <div className="district-label">{d.name.toUpperCase()}</div>
          </Html>
        )
      })}
    </>
  )
}
