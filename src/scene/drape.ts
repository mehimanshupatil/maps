import * as THREE from 'three'
import type { Heightfield } from './heightfield'

/**
 * Sample a scene-space polyline every `step` units and drape it over the
 * terrain, splitting into separate runs wherever it dips below `minH`
 * (sea, creeks, lake bowls).
 */
export function drapePolyline(
  hf: Heightfield,
  points: Array<{ x: number; z: number }>,
  step = 2,
  lift = 0.15,
  minH = -0.2,
): THREE.Vector3[][] {
  const runs: THREE.Vector3[][] = []
  let run: THREE.Vector3[] = []
  const push = (x: number, z: number) => {
    const h = hf.terrainHeight(x, z)
    if (h < minH) {
      if (run.length > 1) runs.push(run)
      run = []
    } else {
      run.push(new THREE.Vector3(x, h + lift, z))
    }
  }
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    const len = Math.hypot(b.x - a.x, b.z - a.z)
    const steps = Math.max(1, Math.ceil(len / step))
    for (let s = 0; s < steps; s++) {
      const t = s / steps
      push(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t)
    }
  }
  push(points[points.length - 1].x, points[points.length - 1].z)
  if (run.length > 1) runs.push(run)
  return runs
}
