import type { Round } from '../types'

export const DATA_VERSION = '1'
export const DATA_BASE = import.meta.env.VITE_DATA_BASE || '/data'

const DISPLAY_MINIMUMS = {
  rainfall_7day_mm: 100,
  rainfall_30day_mm: 300,
  upstream_rainfall_mm: 100,
} as const

export interface RainfallLimits {
  rainfall_7day_mm: number
  rainfall_30day_mm: number
  upstream_rainfall_mm: number
}

function roundedLimit(values: number[], minimum: number) {
  const maximum = Math.max(...values, 0)
  return Math.max(minimum, Math.ceil(maximum / 50) * 50)
}

export function getRainfallLimits(rounds: Round[]): RainfallLimits {
  return {
    rainfall_7day_mm: roundedLimit(
      rounds.map((round) => round.conditions.rainfall_7day_mm),
      DISPLAY_MINIMUMS.rainfall_7day_mm,
    ),
    rainfall_30day_mm: roundedLimit(
      rounds.map((round) => round.conditions.rainfall_30day_mm),
      DISPLAY_MINIMUMS.rainfall_30day_mm,
    ),
    upstream_rainfall_mm: roundedLimit(
      rounds.map((round) => round.conditions.upstream_rainfall_mm),
      DISPLAY_MINIMUMS.upstream_rainfall_mm,
    ),
  }
}
