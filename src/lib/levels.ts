export interface Level {
  id: string
  name: string
  minScore: number
}

export const LEVELS: Level[] = [
  { id: 'seedling', name: 'Seedling', minScore: 0 },
  { id: 'rain-watcher', name: 'Rain Watcher', minScore: 25 },
  { id: 'flood-reader', name: 'Flood Reader', minScore: 55 },
  { id: 'basin-guardian', name: 'Basin Guardian', minScore: 85 },
]

function levelsForMaximum(maximumScore: number) {
  return LEVELS.map((level) => ({
    ...level,
    minScore: Math.ceil((maximumScore * level.minScore) / 100),
  }))
}

export function getLevel(score: number, maximumScore = 100) {
  return levelsForMaximum(maximumScore).reduce(
    (current, level) => (score >= level.minScore ? level : current),
    levelsForMaximum(maximumScore)[0],
  )
}

export function getNextLevel(score: number, maximumScore = 100) {
  return (
    levelsForMaximum(maximumScore).find((level) => level.minScore > score) ??
    null
  )
}
