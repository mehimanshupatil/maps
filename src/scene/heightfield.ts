// Real-DEM heightfield. Loads the Int16 heightmap produced by
// scripts/fetch-terrain.mjs, maps lon/lat → scene coords (web mercator), and
// carves a stylized reservoir bowl (raised dam rim) at each lake so the daily
// fill level stays readable despite the low real elevation of coastal lakes.

import { suspend } from 'suspend-react'
import { ALL_LAKES, basinRadius, type LakeKey } from '../config/lakes'

export const SCENE_W = 260
/** vertical exaggeration over true scale */
const EXAGGERATION = 2.5
/** raised dam rim above local ground, scene units */
const RIM_RAISE = 0.45

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v
}
function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp01((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export interface Basin {
  key: LakeKey
  cx: number
  cz: number
  r: number
  rimY: number
  floorY: number
  waterMinY: number
  waterMaxY: number
}

export interface Heightfield {
  sceneW: number
  sceneH: number
  /** scene units per metre of real elevation */
  unitsPerMetre: number
  project(lon: number, lat: number): { x: number; z: number }
  /** raw DEM elevation in metres (for coloring) */
  groundMetres(x: number, z: number): number
  /** DEM height in scene units (no basins), land lifted above the sea plane */
  groundHeight(x: number, z: number): number
  /** DEM height with reservoir bowls carved in */
  terrainHeight(x: number, z: number): number
  basins: Basin[]
  basinByKey: Record<LakeKey, Basin>
  waterY(key: LakeKey, fill: number): number
}

interface Meta {
  width: number
  height: number
  west: number
  east: number
  north: number
  south: number
}

async function build(): Promise<Heightfield> {
  const base = import.meta.env.BASE_URL
  const [meta, buf] = await Promise.all([
    fetch(`${base}terrain/meta.json`).then((r) => r.json() as Promise<Meta>),
    fetch(`${base}terrain/heights.bin`).then((r) => r.arrayBuffer()),
  ])
  const heights = new Int16Array(buf)
  const { width: gw, height: gh } = meta

  const sceneH = (SCENE_W * gh) / gw

  const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))
  const mercTop = mercY(meta.north)
  const mercBot = mercY(meta.south)

  const midLat = ((meta.north + meta.south) / 2) * (Math.PI / 180)
  const widthMetres = ((meta.east - meta.west) * Math.PI * 6378137 * Math.cos(midLat)) / 180
  const unitsPerMetre = (SCENE_W / widthMetres) * EXAGGERATION

  const project = (lon: number, lat: number) => ({
    x: ((lon - meta.west) / (meta.east - meta.west) - 0.5) * SCENE_W,
    z: ((mercTop - mercY(lat)) / (mercTop - mercBot) - 0.5) * sceneH,
  })

  function groundMetres(x: number, z: number): number {
    const u = clamp01(x / SCENE_W + 0.5) * (gw - 1)
    const v = clamp01(z / sceneH + 0.5) * (gh - 1)
    const x0 = Math.floor(u)
    const y0 = Math.floor(v)
    const x1 = Math.min(x0 + 1, gw - 1)
    const y1 = Math.min(y0 + 1, gh - 1)
    const fx = u - x0
    const fy = v - y0
    const h00 = heights[y0 * gw + x0]
    const h10 = heights[y0 * gw + x1]
    const h01 = heights[y1 * gw + x0]
    const h11 = heights[y1 * gw + x1]
    return (h00 * (1 - fx) + h10 * fx) * (1 - fy) + (h01 * (1 - fx) + h11 * fx) * fy
  }

  // Low coastal land (Mumbai city, creek flats) sits at 0–5m in the DEM and
  // would disappear under the sea plane — lift real land to a visible minimum.
  const LAND_MIN = 0.18
  function groundHeight(x: number, z: number): number {
    const m = groundMetres(x, z)
    const h = m * unitsPerMetre
    // keep tidal flats/mangroves (<1m) as water so the creeks stay readable
    return m > 1 ? Math.max(h, LAND_MIN) : h
  }

  const basins: Basin[] = ALL_LAKES.map((lake) => {
    const { x: cx, z: cz } = project(lake.lon, lake.lat)
    const r = basinRadius(lake)
    const rimY = groundHeight(cx, cz) + RIM_RAISE
    const floorY = Math.max(0.12, rimY - (1.0 + r * 0.12))
    return {
      key: lake.key,
      cx,
      cz,
      r,
      rimY,
      floorY,
      waterMinY: floorY + 0.15,
      waterMaxY: rimY - 0.25,
    }
  })
  const basinByKey = Object.fromEntries(basins.map((b) => [b.key, b])) as Record<LakeKey, Basin>

  function terrainHeight(x: number, z: number): number {
    let h = groundHeight(x, z)
    for (const b of basins) {
      const dx = x - b.cx
      const dz = z - b.cz
      if (Math.abs(dx) > b.r * 1.3 || Math.abs(dz) > b.r * 1.3) continue
      const d = Math.sqrt(dx * dx + dz * dz)
      if (d < b.r * 1.15) {
        // walls rise from surrounding ground to the dam rim…
        h = lerp(h, b.rimY, 1 - smoothstep(b.r * 0.9, b.r * 1.15, d))
        // …then the bowl drops to the floor inside
        h = lerp(h, b.floorY, 1 - smoothstep(b.r * 0.6, b.r * 0.92, d))
      }
    }
    return h
  }

  function waterY(key: LakeKey, fill: number): number {
    const b = basinByKey[key]
    return lerp(b.waterMinY, b.waterMaxY, clamp01(fill))
  }

  return {
    sceneW: SCENE_W,
    sceneH,
    unitsPerMetre,
    project,
    groundMetres,
    groundHeight,
    terrainHeight,
    basins,
    basinByKey,
    waterY,
  }
}

let cached: Promise<Heightfield> | null = null
export function loadHeightfield(): Promise<Heightfield> {
  cached ??= build()
  return cached
}

/** Suspense hook — components render only once the DEM is loaded. */
export function useHeightfield(): Heightfield {
  return suspend(loadHeightfield, ['heightfield'])
}
