// Types for data/history.json — schema defined in PRD.md.

import type { LakeKey } from '../config/lakes'

export interface PreviousYearTotals {
  year: number
  liveStorageML: number
  pctUseful: number
}

export interface PreviousYearLake extends PreviousYearTotals {
  levelM: number
}

export interface LakeReading {
  levelM: number
  rise24hM: number
  liveStorageML: number
  pctUseful: number
  rainTodayMm: number
  rainSeasonMm: number
  previousYears: PreviousYearLake[]
}

export interface Totals {
  liveStorageML: number
  pctUseful: number
  previousYears: PreviousYearTotals[]
}

export interface DailyRecord {
  date: string
  reportTime: string
  totals: Totals
  lakes: Partial<Record<LakeKey, LakeReading>>
  remarks: string[]
}
