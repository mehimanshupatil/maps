import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import riversData from '../assets/rivers.json'
import { useHeightfield } from './heightfield'
import { drapePolyline } from './drape'

interface RiverLines {
  name: string
  lines: Array<Array<[number, number]>> // [lon, lat], real OSM courses
}

export function Rivers() {
  const hf = useHeightfield()

  const lines = useMemo(() => {
    const data = riversData as RiverLines[]
    return data.flatMap((r) =>
      r.lines.flatMap((line, li) => {
        const scenePts = line.map(([lon, lat]) => hf.project(lon, lat))
        return drapePolyline(hf, scenePts, 1.5, 0.35).map((points, ri) => ({
          name: `${r.name}-${li}-${ri}`,
          points,
        }))
      }),
    )
  }, [hf])

  return (
    <>
      {lines.map((l) => (
        <Line
          key={l.name}
          points={l.points}
          color="#3fa8c9"
          transparent
          opacity={0.85}
          lineWidth={2.5}
        />
      ))}
    </>
  )
}
