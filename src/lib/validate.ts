import type { Round, Trend } from '../types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function isRound(value: unknown): value is Round {
  if (!isRecord(value) || !isRecord(value.conditions)) return false

  const conditions = value.conditions
  const rainfallFields = [
    'rainfall_7day_mm',
    'rainfall_30day_mm',
    'upstream_rainfall_mm',
  ]

  return (
    typeof value.round_id === 'number' &&
    isNonEmptyString(value.district) &&
    isNonEmptyString(value.season) &&
    typeof value.week === 'number' &&
    rainfallFields.every(
      (field) =>
        typeof conditions[field] === 'number' &&
        Number.isFinite(conditions[field]) &&
        conditions[field] >= 0,
    ) &&
    typeof conditions.soil_moisture === 'number' &&
    Number.isFinite(conditions.soil_moisture) &&
    conditions.soil_moisture >= 0 &&
    conditions.soil_moisture <= 1 &&
    typeof conditions.cropland_share_pct === 'number' &&
    Number.isFinite(conditions.cropland_share_pct) &&
    conditions.cropland_share_pct >= 0 &&
    conditions.cropland_share_pct <= 100 &&
    ['low', 'rising', 'critical'].includes(value.model_risk as string) &&
    ['flood', 'no_flood'].includes(value.actual_outcome as string) &&
    Array.isArray(value.top_factors) &&
    value.top_factors.length > 0 &&
    value.top_factors.every(isNonEmptyString) &&
    isNonEmptyString(value.explanation)
  )
}

export function isTrend(value: unknown): value is Trend {
  if (!isRecord(value) || !Array.isArray(value.seasons)) return false

  return (
    isNonEmptyString(value.variable) &&
    isNonEmptyString(value.unit) &&
    value.seasons.every(
      (season) =>
        isRecord(season) &&
        isNonEmptyString(season.season) &&
        typeof season.value === 'number' &&
        Number.isFinite(season.value),
    ) &&
    ['increasing', 'decreasing', 'flat'].includes(value.trend as string) &&
    typeof value.significant === 'boolean' &&
    isNonEmptyString(value.test) &&
    typeof value.p_value === 'number' &&
    Number.isFinite(value.p_value) &&
    value.p_value >= 0 &&
    value.p_value <= 1
  )
}

export function filterValid<T>(
  value: unknown,
  guard: (record: unknown) => record is T,
  label: string,
): T[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((record, index) => {
    if (guard(record)) return [record]
    console.warn(`[data] Dropped invalid ${label} record at index ${index}`)
    return []
  })
}
