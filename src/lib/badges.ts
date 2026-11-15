export interface Badge {
  id: string
  name: string
  description: string
  icon: string
}

export const BADGES: Badge[] = [
  {
    id: 'first-round',
    name: 'First Round',
    description: 'Complete your first round.',
    icon: '🌱',
  },
  {
    id: 'three-correct',
    name: '3 Correct in a Row',
    description: 'Make three correct calls in a row.',
    icon: '🎯',
  },
  {
    id: 'trend-explorer',
    name: 'Trend Explorer',
    description: 'Visit the trends page.',
    icon: '📈',
  },
  {
    id: 'perfect-season',
    name: 'Perfect Season',
    description: 'Get every call right in one season.',
    icon: '🏆',
  },
]
