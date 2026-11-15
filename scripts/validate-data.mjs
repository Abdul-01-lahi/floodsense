import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const dataDirectory = resolve('public', 'data')
const files = ['rounds.json', 'trends.json', 'leaderboard.json']
let hasFailures = false

async function readJson(file) {
  try {
    const contents = await readFile(resolve(dataDirectory, file), 'utf8')
    return { value: JSON.parse(contents), problems: [] }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { value: null, problems: [`file: ${message}`] }
  }
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function requireString(
  object,
  field,
  problems,
  { nonEmpty = false, prefix = '' } = {},
) {
  const label = prefix ? `${prefix}.${field}` : field
  if (typeof object[field] !== 'string') {
    problems.push(`${label}: expected a string`)
  } else if (nonEmpty && object[field].trim() === '') {
    problems.push(`${label}: expected a non-empty string`)
  }
}

function requireNumber(object, field, problems, prefix = '') {
  const label = prefix ? `${prefix}.${field}` : field
  if (!isFiniteNumber(object[field])) {
    problems.push(`${label}: expected a finite number`)
  }
}

function validateRounds(value) {
  const problems = []
  if (!Array.isArray(value) || value.length === 0) {
    return ['file: expected a non-empty array']
  }

  const roundIds = new Set()
  value.forEach((round, index) => {
    const prefix = `[${index}]`
    if (!isObject(round)) {
      problems.push(`${prefix}: expected an object`)
      return
    }

    requireNumber(round, 'round_id', problems, prefix)
    if (isFiniteNumber(round.round_id)) {
      if (roundIds.has(round.round_id)) {
        problems.push(`${prefix}.round_id: duplicate value ${round.round_id}`)
      }
      roundIds.add(round.round_id)
    }
    requireString(round, 'district', problems, { nonEmpty: true, prefix })
    requireString(round, 'season', problems, { nonEmpty: true, prefix })
    requireNumber(round, 'week', problems, prefix)

    if (!isObject(round.conditions)) {
      problems.push(`${prefix}.conditions: expected an object`)
    } else {
      const conditions = round.conditions
      for (const field of [
        'rainfall_7day_mm',
        'rainfall_30day_mm',
        'upstream_rainfall_mm',
      ]) {
        requireNumber(conditions, field, problems, `${prefix}.conditions`)
        if (isFiniteNumber(conditions[field]) && conditions[field] < 0) {
          problems.push(`${prefix}.conditions.${field}: must be >= 0`)
        }
      }
      requireNumber(conditions, 'soil_moisture', problems, `${prefix}.conditions`)
      if (
        isFiniteNumber(conditions.soil_moisture) &&
        (conditions.soil_moisture < 0 || conditions.soil_moisture > 1)
      ) {
        problems.push(`${prefix}.conditions.soil_moisture: must be between 0 and 1`)
      }
      requireNumber(
        conditions,
        'cropland_share_pct',
        problems,
        `${prefix}.conditions`,
      )
      if (
        isFiniteNumber(conditions.cropland_share_pct) &&
        (conditions.cropland_share_pct < 0 || conditions.cropland_share_pct > 100)
      ) {
        problems.push(
          `${prefix}.conditions.cropland_share_pct: must be between 0 and 100`,
        )
      }
    }

    if (!['low', 'rising', 'critical'].includes(round.model_risk)) {
      problems.push(
        `${prefix}.model_risk: expected low, rising, or critical`,
      )
    }
    if (!['flood', 'no_flood'].includes(round.actual_outcome)) {
      problems.push(`${prefix}.actual_outcome: expected flood or no_flood`)
    }
    if (!Array.isArray(round.top_factors) || round.top_factors.length === 0) {
      problems.push(`${prefix}.top_factors: expected a non-empty array`)
    } else {
      round.top_factors.forEach((factor, factorIndex) => {
        if (typeof factor !== 'string' || factor.trim() === '') {
          problems.push(
            `${prefix}.top_factors[${factorIndex}]: expected a non-empty string`,
          )
        }
      })
    }
    if (typeof round.explanation !== 'string' || round.explanation.trim() === '') {
      problems.push(`${prefix}.explanation: expected a non-empty string`)
    }
  })
  return problems
}

function validateTrends(value) {
  const problems = []
  if (!Array.isArray(value) || value.length === 0) {
    return ['file: expected a non-empty array']
  }

  value.forEach((trend, index) => {
    const prefix = `[${index}]`
    if (!isObject(trend)) {
      problems.push(`${prefix}: expected an object`)
      return
    }
    requireString(trend, 'variable', problems, { nonEmpty: true, prefix })
    requireString(trend, 'unit', problems, { nonEmpty: true, prefix })
    if (!Array.isArray(trend.seasons) || trend.seasons.length < 3) {
      problems.push(`${prefix}.seasons: expected an array with at least 3 entries`)
    } else {
      trend.seasons.forEach((season, seasonIndex) => {
        const seasonPrefix = `${prefix}.seasons[${seasonIndex}]`
        if (!isObject(season)) {
          problems.push(`${seasonPrefix}: expected an object`)
          return
        }
        requireString(season, 'season', problems, {
          nonEmpty: true,
          prefix: seasonPrefix,
        })
        requireNumber(season, 'value', problems, seasonPrefix)
      })
    }
    if (!['increasing', 'decreasing', 'flat'].includes(trend.trend)) {
      problems.push(`${prefix}.trend: expected increasing, decreasing, or flat`)
    }
    if (typeof trend.significant !== 'boolean') {
      problems.push(`${prefix}.significant: expected a boolean`)
    }
    requireString(trend, 'test', problems, { nonEmpty: true, prefix })
    requireNumber(trend, 'p_value', problems, prefix)
    if (
      isFiniteNumber(trend.p_value) &&
      (trend.p_value < 0 || trend.p_value > 1)
    ) {
      problems.push(`${prefix}.p_value: must be between 0 and 1`)
    }
  })
  return problems
}

function validateLeaderboard(value) {
  const problems = []
  if (!Array.isArray(value)) {
    return ['file: expected an array']
  }

  value.forEach((entry, index) => {
    const prefix = `[${index}]`
    if (!isObject(entry)) {
      problems.push(`${prefix}: expected an object`)
      return
    }
    requireString(entry, 'name', problems, { nonEmpty: true, prefix })
    requireNumber(entry, 'score', problems, prefix)
  })
  return problems
}

const validators = {
  'rounds.json': validateRounds,
  'trends.json': validateTrends,
  'leaderboard.json': validateLeaderboard,
}

for (const file of files) {
  const { value, problems: readProblems } = await readJson(file)
  const problems = readProblems.length
    ? readProblems
    : validators[file](value)

  if (problems.length > 0) {
    hasFailures = true
    console.log(`${file}: FAIL`)
    problems.forEach((problem) => console.log(`  - ${problem}`))
  } else {
    console.log(`${file}: PASS`)
  }
}

if (hasFailures) {
  process.exitCode = 1
}
