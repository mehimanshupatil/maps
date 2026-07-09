// Fetch real river courses (Vaitarna, Tansa, Ulhas, Bhatsa) from
// OpenStreetMap via Overpass, stitch way fragments into polylines, simplify,
// and write src/assets/rivers.json as [lon, lat] lines.
//
// Usage: node scripts/fetch-rivers.mjs

import { mkdir, writeFile } from 'node:fs/promises'

const BBOX = '18.85,72.65,20.1,73.8' // south,west,north,east
const QUERY = `[out:json][timeout:90];way["waterway"="river"]["name"~"Vaitarna|Ulhas|Tansa|Bhatsa|Mithi|Dahisar",i](${BBOX});out geom;`

const res = await fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: {
    'User-Agent': 'mumbai-water-viz/0.1',
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: `data=${encodeURIComponent(QUERY)}`,
})
if (!res.ok) throw new Error(`overpass ${res.status}`)
const data = await res.json()
console.log(`ways: ${data.elements.length}`)

const canonical = (raw) => {
  const n = raw.toLowerCase()
  if (n.includes('vaitarna')) return 'Vaitarna'
  if (n.includes('tansa')) return 'Tansa'
  if (n.includes('ulhas')) return 'Ulhas'
  if (n.includes('bhatsa')) return 'Bhatsa'
  return raw
}

// group way geometries per river
const byRiver = new Map()
for (const el of data.elements) {
  const name = canonical(el.tags.name)
  const pts = el.geometry.map((g) => [g.lon, g.lat])
  if (pts.length < 2) continue
  if (!byRiver.has(name)) byRiver.set(name, [])
  byRiver.get(name).push(pts)
}

const EPS = 0.003 // endpoint match tolerance, ~300m
const close = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) < EPS

/** greedily stitch way fragments that share endpoints */
function stitch(ways) {
  const pool = ways.map((w) => [...w])
  const lines = []
  while (pool.length) {
    let line = pool.pop()
    let grew = true
    while (grew) {
      grew = false
      for (let i = 0; i < pool.length; i++) {
        const w = pool[i]
        if (close(line[line.length - 1], w[0])) line = line.concat(w.slice(1))
        else if (close(line[line.length - 1], w[w.length - 1]))
          line = line.concat([...w].reverse().slice(1))
        else if (close(line[0], w[w.length - 1])) line = w.slice(0, -1).concat(line)
        else if (close(line[0], w[0])) line = [...w].reverse().slice(0, -1).concat(line)
        else continue
        pool.splice(i, 1)
        grew = true
        break
      }
    }
    lines.push(line)
  }
  return lines
}

// Douglas-Peucker
function simplify(points, eps) {
  if (points.length < 3) return points
  const d2 = (p, a, b) => {
    const dx = b[0] - a[0], dy = b[1] - a[1]
    const l2 = dx * dx + dy * dy
    let t = l2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2 : 0
    t = Math.max(0, Math.min(1, t))
    const qx = a[0] + t * dx - p[0], qy = a[1] + t * dy - p[1]
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

const out = []
for (const [name, ways] of byRiver) {
  const lines = stitch(ways)
    .map((l) => simplify(l, 0.0015).map(([lon, lat]) => [+lon.toFixed(4), +lat.toFixed(4)]))
    .filter((l) => l.length > 2)
    .sort((a, b) => b.length - a.length)
  out.push({ name, lines })
  console.log(`${name}: ${lines.length} lines, ${lines.reduce((s, l) => s + l.length, 0)} pts`)
}

await mkdir('src/assets', { recursive: true })
await writeFile('src/assets/rivers.json', JSON.stringify(out))
console.log('wrote src/assets/rivers.json')
