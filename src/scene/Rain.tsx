import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWaterData } from '../data/useWaterData'
import { useHeightfield } from './heightfield'

// Rain shafts over lakes that actually got rain in today's report.
const RAIN_THRESHOLD_MM = 40
const MAX_DROPS_PER_LAKE = 110

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Drop {
  x: number
  z: number
  top: number
  span: number
  seed: number
  speed: number
}

export function Rain() {
  const hf = useHeightfield()
  const { lakes } = useWaterData()
  const ref = useRef<THREE.InstancedMesh>(null)

  const drops = useMemo(() => {
    const rand = mulberry32(777)
    const list: Drop[] = []
    for (const lake of Object.values(lakes)) {
      const rain = lake.reading?.rainTodayMm ?? 0
      if (rain < RAIN_THRESHOLD_MM) continue
      const basin = hf.basinByKey[lake.key]
      const count = Math.min(MAX_DROPS_PER_LAKE, Math.round(rain * 0.6))
      for (let i = 0; i < count; i++) {
        const a = rand() * Math.PI * 2
        const rr = Math.sqrt(rand()) * basin.r * 1.3
        list.push({
          x: basin.cx + Math.cos(a) * rr,
          z: basin.cz + Math.sin(a) * rr,
          top: basin.rimY + 3 + rand() * 6,
          span: 8 + rand() * 4,
          seed: rand() * 100,
          speed: 9 + rand() * 5,
        })
      }
    }
    return list
  }, [hf, lakes])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    const mesh = ref.current
    if (!mesh) return
    const t = clock.elapsedTime
    drops.forEach((d, i) => {
      const y = d.top - ((t * d.speed + d.seed) % d.span)
      dummy.position.set(d.x, y, d.z)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  if (!drops.length) return null
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, drops.length]} frustumCulled={false}>
      <boxGeometry args={[0.035, 0.85, 0.035]} />
      <meshBasicMaterial color="#cfe8f2" transparent opacity={0.45} />
    </instancedMesh>
  )
}
