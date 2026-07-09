// Static per-lake configuration. Daily readings live in data/history.json.
// Scene axes: +x = east, +z = south (north is -z). Units are arbitrary "map units".
// Supply shares from BMC "contribution per 100 litre" chart; MLD + distances
// from data/map/info.txt.

export type Datum = 'M.S.L.' | 'T.H.D.'

export interface LakeConfig {
  key: LakeKey
  displayName: string
  /** Full Supply Level, metres above datum */
  fslM: number
  /** Low Draw-off Level, metres above datum */
  ldlM: number
  /** Useful content at FSL, million litres */
  fslUsefulML: number
  /** Share of Mumbai's daily supply (fraction, sums to ~1) */
  supplyShare: number
  /** Daily supply to Mumbai, million litres per day */
  supplyMLD: number
  /** Distance from the city, km (approx) */
  distanceKm: number
  datum: Datum
  /** Reservoir centroid from OSM (scripts probe, 2026-07-09) */
  lat: number
  lon: number
  /** one-liner history/context, from data/water supply mumbai bmc.pdf (CDP 2005-25) */
  about: string
}

export type LakeKey =
  | 'upper_vaitarna'
  | 'modak_sagar'
  | 'tansa'
  | 'middle_vaitarna'
  | 'bhatsa'
  | 'vehar'
  | 'tulsi'

export const LAKE_KEYS: LakeKey[] = [
  'upper_vaitarna',
  'modak_sagar',
  'tansa',
  'middle_vaitarna',
  'bhatsa',
  'vehar',
  'tulsi',
]

// Basin area ∝ sqrt(capacity)  ⇒  radius ∝ capacity^0.25 (PRD decision 6),
// with a floor so tiny lakes stay clickable — but capped for the in-city
// lakes, which sit within ~4 km of Powai/Vihar WTP/Bhandup and would
// otherwise swallow their neighbours at map scale.
const RADIUS_K = 0.45
const RADIUS_MIN = 3.4
const RADIUS_CAP: Partial<Record<LakeKey, number>> = { vehar: 4.2, tulsi: 3.4 }
export function basinRadius(lake: LakeConfig): number {
  const r = Math.max(RADIUS_MIN, RADIUS_K * Math.pow(lake.fslUsefulML, 0.25))
  return Math.min(r, RADIUS_CAP[lake.key] ?? Infinity)
}

export const CITY_LATLON = { lat: 18.96, lon: 72.82 }

/** Mumbai's approximate total daily demand, ML/day */
export const TOTAL_DEMAND_MLD = 4173

export const LAKES: Record<LakeKey, LakeConfig> = {
  upper_vaitarna: {
    key: 'upper_vaitarna',
    displayName: 'Upper Vaitarna',
    fslM: 603.51,
    ldlM: 595.44,
    fslUsefulML: 227047,
    supplyShare: 0.151,
    supplyMLD: 635,
    distanceKm: 163,
    datum: 'M.S.L.',
    about:
      "State-built multipurpose scheme (1972): generates 60 MW of hydro power, then releases water down the Vaitarna river to Modak Sagar. Made Mumbai's supply fully gravity-fed at the time.",
    lat: 19.8419,
    lon: 73.5088,
  },
  modak_sagar: {
    key: 'modak_sagar',
    displayName: 'Modak Sagar',
    fslM: 163.15,
    ldlM: 143.26,
    fslUsefulML: 128925,
    supplyShare: 0.11,
    supplyMLD: 455,
    distanceKm: 163,
    datum: 'T.H.D.',
    about:
      "Lower Vaitarna dam (1957) — India's first dam built with pre-cooled concrete, named for city engineer N.V. Modak. Its 87 km main was then the world's longest pipeline; surplus can refill Tansa via a 7.2 km tunnel.",
    lat: 19.6728,
    lon: 73.3228,
  },
  tansa: {
    key: 'tansa',
    displayName: 'Tansa',
    fslM: 128.63,
    ldlM: 118.87,
    fslUsefulML: 145080,
    supplyShare: 0.12,
    supplyMLD: 500,
    distanceKm: 106,
    datum: 'T.H.D.',
    about:
      "Built in four stages between 1886 and 1948 — a 2.8 km long dam whose water is drawn from seven outlets at different levels to pick the cleanest layer.",
    lat: 19.5717,
    lon: 73.2826,
  },
  middle_vaitarna: {
    key: 'middle_vaitarna',
    displayName: 'Middle Vaitarna',
    fslM: 285.0,
    ldlM: 220.0,
    fslUsefulML: 193530,
    supplyShare: 0.11,
    supplyMLD: 455,
    distanceKm: 102,
    datum: 'T.H.D.',
    about:
      "The newest dam (2014), between Upper and Lower Vaitarna — a 100 m roller-compacted concrete dam, 9th-fastest RCC build in the world. Its water travels via the river to Modak Sagar, then by tunnel toward Bhandup.",
    lat: 19.715,
    lon: 73.44,
  },
  bhatsa: {
    key: 'bhatsa',
    displayName: 'Bhatsa',
    fslM: 142.07,
    ldlM: 104.9,
    fslUsefulML: 717037,
    supplyShare: 0.483,
    supplyMLD: 2020,
    distanceKm: 110,
    datum: 'M.S.L.',
    about:
      "Developed in three World Bank-aided stages (1981–1997, expanded to 2007). Water is picked up at Pise weir, treated at Panjrapur, and injected into the Vaitarna mains — Mumbai's biggest single source today.",
    lat: 19.5435,
    lon: 73.4504,
  },
  vehar: {
    key: 'vehar',
    // BMC's daily table spells it "Vehar"; most sources use "Vihar"
    displayName: 'Vihar',
    fslM: 80.12,
    ldlM: 73.92,
    fslUsefulML: 27698,
    supplyShare: 0.021,
    supplyMLD: 90,
    distanceKm: 15,
    datum: 'T.H.D.',
    about:
      "Mumbai's first piped water scheme (1860) — three earthen dams impounding the Mithi river, 20 km north of the old city. Still in operation 165+ years later.",
    lat: 19.1547,
    lon: 72.9109,
  },
  tulsi: {
    key: 'tulsi',
    displayName: 'Tulsi',
    fslM: 139.17,
    ldlM: 131.07,
    fslUsefulML: 8046,
    supplyShare: 0.005,
    supplyMLD: 18,
    distanceKm: 18,
    datum: 'T.H.D.',
    about:
      "Built 1872–79 on the Mithi upstream of Vihar during a water crisis; its 18 MLD once fed the Malabar Hill reservoir through a 600 mm main.",
    lat: 19.1911,
    lon: 72.9183,
  },
}

export const ALL_LAKES: LakeConfig[] = LAKE_KEYS.map((k) => LAKES[k])
