// Fetch real district boundaries (geoBoundaries IND ADM2), keep the districts
// around the Mumbai water system, clip to our bbox, simplify, and write a
// small JSON of boundary polylines in lon/lat.
//
// Usage: node scripts/fetch-districts.mjs
// Output: src/assets/districts.json

import { mkdir, writeFile } from 'node:fs/promises'

const URL =
  'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/IND/ADM2/geoBoundaries-IND-ADM2_simplified.geojson'

const KEEP = ['Mumbai', 'Mumbai Suburban', 'Thane', 'Palghar', 'Nashik', 'Raigad', 'Ahmadnagar', 'Ahmednagar', 'Dhule', 'Nandurbar']
// bbox slightly larger than the terrain so lines run off the edge cleanly
const WEST = 72.5
const EAST = 74.0
const NORTH = 20.25
const SOUTH = 18.7

console.log('downloading geoBoundaries IND ADM2 (simplified)…')
const res = await fetch(URL)
if (!res.ok) throw new Error(`${res.status}`)
const gj = await res.json()
console.log(`features: ${gj.features.length}`)

const inBox = ([lon, lat]) => lon >= WEST && lon <= EAST && lat >= SOUTH && lat <= NORTH

// Douglas-Peucker on lon/lat
function simplify(points, eps) {
  if (points.length < 3) return points
  const d2 = (p, a, b) => {
    const [px, py] = p, [ax, ay] = a, [bx, by] = b
    const dx = bx - ax, dy = by - ay
    const l2 = dx * dx + dy * dy
    let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0
    t = Math.max(0, Math.min(1, t))
    const qx = ax + t * dx - px, qy = ay + t * dy - py
    return qx * qx + qy * qy
  }
  const keep = new Uint8Array(points.length)
  keep[0] = keep[points.length - 1] = 1
  const stack = [[0, points.length - 1]]
  while (stack.length) {
    const [i0, i1] = stack.pop()
    let maxD = 0, maxI = -1
    for (let i = i0 + 1; i < i1; i++) {
      const d = d2(points[i], points[i0], points[i1])
      if (d > maxD) { maxD = d; maxI = i }
    }
    if (maxD > eps * eps) {
      keep[maxI] = 1
      stack.push([i0, maxI], [maxI, i1])
    }
  }
  return points.filter((_, i) => keep[i])
}

/** split a ring into runs of consecutive in-bbox points */
function clipRuns(ring) {
  const runs = []
  let run = []
  for (const pt of ring) {
    if (inBox(pt)) run.push(pt)
    else {
      if (run.length > 1) runs.push(run)
      run = []
    }
  }
  if (run.length > 1) runs.push(run)
  return runs
}

const out = []
for (const f of gj.features) {
  const name = f.properties.shapeName
  if (!KEEP.includes(name)) continue
  const geom = f.geometry
  const polys = geom.type === 'MultiPolygon' ? geom.coordinates : [geom.coordinates]
  const lines = []
  for (const poly of polys) {
    for (const ring of poly) {
      for (const run of clipRuns(ring)) {
        const simp = simplify(run, 0.004)
        if (simp.length > 1) lines.push(simp.map(([lon, lat]) => [+lon.toFixed(4), +lat.toFixed(4)]))
      }
    }
  }
  if (lines.length) {
    out.push({ name, lines })
    console.log(`${name}: ${lines.length} lines, ${lines.reduce((s, l) => s + l.length, 0)} pts`)
  }
}

await mkdir('src/assets', { recursive: true })
await writeFile('src/assets/districts.json', JSON.stringify(out))
console.log('wrote src/assets/districts.json')
