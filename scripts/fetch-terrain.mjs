// Fetch real elevation for the Mumbai water-supply region from AWS Terrain
// Tiles (terrarium encoding, public bucket), stitch, downsample, and write a
// compact Int16 heightmap the app loads at runtime.
//
// Usage: node scripts/fetch-terrain.mjs
// Output: public/terrain/heights.bin (Int16 LE metres), public/terrain/meta.json

import { PNG } from 'pngjs'
import { mkdir, writeFile } from 'node:fs/promises'

const ZOOM = 11
// lon/lat box: Arabian Sea coast to past the Ghats crest, south Mumbai to
// north of Upper Vaitarna
const WEST = 72.65
const EAST = 73.8
const NORTH = 20.1
const SOUTH = 18.85
const DOWNSAMPLE = 4

const n = 2 ** ZOOM
const lonToX = (lon) => ((lon + 180) / 360) * n
const latToY = (lat) => {
  const r = (lat * Math.PI) / 180
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n
}
const xToLon = (x) => (x / n) * 360 - 180
const yToLat = (y) => {
  const t = Math.PI * (1 - (2 * y) / n)
  return (Math.atan(Math.sinh(t)) * 180) / Math.PI
}

const x0 = Math.floor(lonToX(WEST))
const x1 = Math.floor(lonToX(EAST))
const y0 = Math.floor(latToY(NORTH))
const y1 = Math.floor(latToY(SOUTH))

const tilesX = x1 - x0 + 1
const tilesY = y1 - y0 + 1
const W = tilesX * 256
const H = tilesY * 256
console.log(`tiles: ${tilesX}x${tilesY} (${tilesX * tilesY}), stitched ${W}x${H}`)

const stitched = new Float32Array(W * H)

async function fetchTile(tx, ty) {
  const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${ZOOM}/${tx}/${ty}.png`
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`${res.status} ${url}`)
      const buf = Buffer.from(await res.arrayBuffer())
      const png = PNG.sync.read(buf)
      const ox = (tx - x0) * 256
      const oy = (ty - y0) * 256
      for (let py = 0; py < 256; py++) {
        for (let px = 0; px < 256; px++) {
          const i = (py * 256 + px) * 4
          const m = png.data[i] * 256 + png.data[i + 1] + png.data[i + 2] / 256 - 32768
          stitched[(oy + py) * W + (ox + px)] = m
        }
      }
      return
    } catch (e) {
      if (attempt === 2) throw e
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
    }
  }
}

const jobs = []
for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) jobs.push([tx, ty])
const CONCURRENCY = 8
let done = 0
async function worker() {
  while (jobs.length) {
    const [tx, ty] = jobs.pop()
    await fetchTile(tx, ty)
    if (++done % 10 === 0) console.log(`  ${done} tiles`)
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))
console.log(`fetched all tiles`)

// downsample by averaging DOWNSAMPLE x DOWNSAMPLE blocks
const gw = Math.floor(W / DOWNSAMPLE)
const gh = Math.floor(H / DOWNSAMPLE)
const grid = new Int16Array(gw * gh)
for (let gy = 0; gy < gh; gy++) {
  for (let gx = 0; gx < gw; gx++) {
    let sum = 0
    for (let dy = 0; dy < DOWNSAMPLE; dy++)
      for (let dx = 0; dx < DOWNSAMPLE; dx++)
        sum += stitched[(gy * DOWNSAMPLE + dy) * W + gx * DOWNSAMPLE + dx]
    grid[gy * gw + gx] = Math.round(sum / (DOWNSAMPLE * DOWNSAMPLE))
  }
}

const meta = {
  width: gw,
  height: gh,
  // exact geographic bounds of the stitched tile block (web mercator aligned)
  west: xToLon(x0),
  east: xToLon(x1 + 1),
  north: yToLat(y0),
  south: yToLat(y1 + 1),
  zoom: ZOOM,
  downsample: DOWNSAMPLE,
  encoding: 'int16-le-metres',
  source: 'AWS Terrain Tiles (terrarium), https://registry.opendata.aws/terrain-tiles/',
}

await mkdir('public/terrain', { recursive: true })
await writeFile('public/terrain/heights.bin', Buffer.from(grid.buffer))
await writeFile('public/terrain/meta.json', JSON.stringify(meta, null, 2))
console.log(`wrote public/terrain/heights.bin (${gw}x${gh}, ${grid.byteLength} bytes)`)
console.log(meta)
