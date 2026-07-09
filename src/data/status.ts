// Stock-status classification. Thresholds are editorial, not official BMC
// levels: lakes — danger <25% of useful capacity, warning <50%, safe above;
// city — also considers days of supply left at current demand.

export type Status = 'danger' | 'warning' | 'safe'

export function lakeStatus(pctUseful: number): Status {
  if (pctUseful < 25) return 'danger'
  if (pctUseful < 50) return 'warning'
  return 'safe'
}

export function cityStatus(pctUseful: number, daysOfSupply: number): Status {
  if (pctUseful < 20 || daysOfSupply < 60) return 'danger'
  if (pctUseful < 40 || daysOfSupply < 120) return 'warning'
  return 'safe'
}

export const STATUS_LABEL: Record<Status, string> = {
  danger: 'Critical',
  warning: 'Low',
  safe: 'Healthy',
}
