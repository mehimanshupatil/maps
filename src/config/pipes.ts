// Stylized supply routes, loosely following the real mains: the Vaitarna
// system + Tansa run south-west along the western corridor, Bhatsa comes in
// from the east, everything meets around the Bhandup complex, then one trunk
// enters the city. Points are [lon, lat], lake → junction.

import type { LakeKey } from './lakes'

export const BHANDUP_JUNCTION: [number, number] = [72.937, 19.155]
export const CITY_END: [number, number] = [72.845, 18.99]
/** routing bend south of Vihar so west-bank feed lines don't cross the lakes */
export const SOUTH_BEND: [number, number] = [72.895, 19.118]

// Treatment facilities (from the Arghyam network diagram in data/map/water-path.jpg)
export interface Facility {
  name: string
  lonLat: [number, number]
  detail: string
}

export const FACILITIES: Facility[] = [
  {
    name: 'Bhandup Complex',
    lonLat: BHANDUP_JUNCTION,
    // sited on the shore of Vihar Lake per the CDP document
    detail: 'Master control centre + Asia’s largest water treatment plant',
  },
]

// Distribution zones fed from Bhandup / Vihar WTP (same diagram), approx positions
export interface Zone {
  name: string
  lonLat: [number, number]
}

export const ZONES: Zone[] = [
  { name: 'Borivali', lonLat: [72.856, 19.23] },
  { name: 'Malad', lonLat: [72.848, 19.186] },
  { name: 'Veravali', lonLat: [72.84, 19.135] },
  { name: 'Powai', lonLat: [72.905, 19.118] },
  { name: 'Ghatkopar', lonLat: [72.908, 19.08] },
  { name: 'Trombay', lonLat: [72.9, 19.0] },
  { name: 'Raoli', lonLat: [72.86, 19.03] },
  { name: 'Pali Hill', lonLat: [72.825, 19.065] },
  { name: 'Worli', lonLat: [72.815, 19.0] },
  { name: 'Bhandarwada', lonLat: [72.8, 18.955] },
]

export interface PipeRoute {
  key: LakeKey
  /** conveyance polyline, source → destination */
  points: Array<[number, number]>
  /** docks at the Bhandup manifold */
  viaTrunk: boolean
  /** tube thickness override: share of supply this main actually carries */
  radiusShare?: number
}

// Route start points = OSM reservoir centroids in src/config/lakes.ts.
// Per the CDP document: Upper Vaitarna releases into the Vaitarna river, flows
// through Middle Vaitarna down to Modak Sagar; piped conveyance to Bhandup
// starts at Modak Sagar (whose main therefore carries all three lakes' water).
export const PIPE_ROUTES: PipeRoute[] = [
  {
    // cascade link: UV → MV (river conveyance)
    key: 'upper_vaitarna',
    viaTrunk: false,
    points: [
      [73.5088, 19.8419],
      [73.485, 19.775],
      [73.44, 19.715],
    ],
  },
  {
    // cascade link: MV → Modak Sagar (river conveyance)
    key: 'middle_vaitarna',
    viaTrunk: false,
    points: [
      [73.44, 19.715],
      [73.385, 19.7],
      [73.3228, 19.6728],
    ],
  },
  {
    key: 'modak_sagar',
    viaTrunk: true,
    // carries Upper + Middle Vaitarna + its own water
    radiusShare: 0.151 + 0.11 + 0.11,
    points: [
      [73.3228, 19.6728],
      [73.21, 19.5],
      [73.04, 19.3],
      BHANDUP_JUNCTION,
    ],
  },
  {
    key: 'tansa',
    viaTrunk: true,
    points: [
      [73.2826, 19.5717],
      [73.12, 19.41],
      [73.0, 19.26],
      BHANDUP_JUNCTION,
    ],
  },
  {
    key: 'bhatsa',
    viaTrunk: true,
    points: [
      [73.4504, 19.5435],
      [73.3, 19.38],
      [73.12, 19.23],
      BHANDUP_JUNCTION,
    ],
  },
  {
    key: 'vehar',
    viaTrunk: true,
    points: [
      [72.9109, 19.1547],
      [72.926, 19.153],
      BHANDUP_JUNCTION,
    ],
  },
  {
    // Tulsi water is treated at the Bhandup complex like the trunk lakes
    key: 'tulsi',
    viaTrunk: true,
    points: [
      [72.9183, 19.1911],
      [72.928, 19.17],
      BHANDUP_JUNCTION,
    ],
  },
]


/** pipe tube radius from supply share */
export function pipeRadius(share: number): number {
  return 0.22 + share * 2.0
}
