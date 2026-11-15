import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getLevel, type Level } from '../lib/levels'
import type { Risk } from '../types'

interface StoredProgress {
  score: number
  roundsPlayed: number
  badges: string[]
  correctStreak: number
  roundSignature: string
}

interface GameContextValue {
  district: string
  currentRoundIndex: number
  score: number
  roundsPlayed: number
  answers: Record<number, Risk>
  decisionBonuses: Record<number, boolean>
  badges: string[]
  levelUp: Level | null
  setDistrict: (district: string) => void
  configureRounds: (roundIds: number[]) => void
  submitAnswer: (
    roundId: number,
    answer: Risk,
    correctRisk: Risk,
    isFinalRound?: boolean,
    totalRounds?: number,
  ) => void
  awardDecisionBonus: (roundId: number) => void
  markTrendVisited: () => void
  advanceRound: () => void
  dismissLevelUp: () => void
}

const STORAGE_KEY = 'floodsense-progress'
const GameContext = createContext<GameContextValue | null>(null)

const defaultProgress: StoredProgress = {
  score: 0,
  roundsPlayed: 0,
  badges: [],
  correctStreak: 0,
  roundSignature: '',
}

function readProgress(): StoredProgress {
  try {
    if (typeof window === 'undefined') return defaultProgress
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaultProgress
    const parsed: unknown = JSON.parse(saved)
    if (!parsed || typeof parsed !== 'object') return defaultProgress
    const value = parsed as Partial<StoredProgress>
    return {
      score: typeof value.score === 'number' ? value.score : 0,
      roundsPlayed:
        typeof value.roundsPlayed === 'number' ? value.roundsPlayed : 0,
      badges: Array.isArray(value.badges)
        ? value.badges.filter((badge): badge is string => typeof badge === 'string')
        : [],
      correctStreak:
        typeof value.correctStreak === 'number' ? value.correctStreak : 0,
      roundSignature:
        typeof value.roundSignature === 'string' ? value.roundSignature : '',
    }
  } catch {
    return defaultProgress
  }
}

function saveProgress(progress: StoredProgress) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    }
  } catch {
    // Progress remains available for the current session when storage is unavailable.
  }
}

export function getAnswerPoints(answer: Risk, correctRisk: Risk) {
  const riskLevels: Record<Risk, number> = {
    low: 0,
    rising: 1,
    critical: 2,
  }
  const difference = Math.abs(riskLevels[answer] - riskLevels[correctRisk])
  return difference === 0 ? 10 : difference === 1 ? 5 : 0
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [storedProgress] = useState(readProgress)
  const [district, setDistrictState] = useState('')
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0)
  const [score, setScore] = useState(storedProgress.score)
  const [roundsPlayed, setRoundsPlayed] = useState(storedProgress.roundsPlayed)
  const [answers, setAnswers] = useState<Record<number, Risk>>({})
  const [decisionBonuses, setDecisionBonuses] = useState<Record<number, boolean>>({})
  const [badges, setBadges] = useState(storedProgress.badges)
  const [correctStreak, setCorrectStreak] = useState(storedProgress.correctStreak)
  const [roundSignature, setRoundSignature] = useState(
    storedProgress.roundSignature,
  )
  const [maximumScore, setMaximumScore] = useState(100)
  const [seasonCorrect, setSeasonCorrect] = useState(0)
  const [levelUp, setLevelUp] = useState<Level | null>(null)

  useEffect(() => {
    saveProgress({
      score,
      roundsPlayed,
      badges,
      correctStreak,
      roundSignature,
    })
  }, [badges, correctStreak, roundSignature, roundsPlayed, score])

  const value = useMemo(() => {
    const awardBadge = (badgeId: string) => {
      setBadges((previous) =>
        previous.includes(badgeId) ? previous : [...previous, badgeId],
      )
    }
    const addPoints = (points: number) => {
      const nextScore = score + points
      setScore(nextScore)
      if (
        getLevel(nextScore, maximumScore).id !==
        getLevel(score, maximumScore).id
      ) {
        setLevelUp(getLevel(nextScore, maximumScore))
      }
    }

    return {
      district,
      currentRoundIndex,
      score,
      roundsPlayed,
      answers,
      decisionBonuses,
      badges,
      levelUp,
      configureRounds: (roundIds: number[]) => {
        const nextSignature = [...roundIds].sort((a, b) => a - b).join(',')
        const nextMaximumScore = Math.max(roundIds.length * 15, 15)
        if (nextSignature === roundSignature) {
          setMaximumScore(nextMaximumScore)
          return
        }
        if (roundSignature) {
          setDistrictState('')
          setCurrentRoundIndex(0)
          setAnswers({})
          setDecisionBonuses({})
          setCorrectStreak(0)
          setSeasonCorrect(0)
          setLevelUp(null)
        }
        setRoundSignature(nextSignature)
        setMaximumScore(nextMaximumScore)
      },
      setDistrict: (nextDistrict: string) => {
        setDistrictState(nextDistrict)
        setCurrentRoundIndex(0)
        setAnswers({})
        setDecisionBonuses({})
        setSeasonCorrect(0)
      },
      submitAnswer: (
        roundId: number,
        answer: Risk,
        correctRisk: Risk,
        isFinalRound = false,
        totalRounds = 0,
      ) => {
        if (answers[roundId]) return
        const correct = answer === correctRisk
        const nextStreak = correct ? correctStreak + 1 : 0
        const nextSeasonCorrect = seasonCorrect + (correct ? 1 : 0)
        setAnswers((previous) => ({ ...previous, [roundId]: answer }))
        setRoundsPlayed((previous) => previous + 1)
        setCorrectStreak(nextStreak)
        setSeasonCorrect(nextSeasonCorrect)
        addPoints(getAnswerPoints(answer, correctRisk))
        if (roundsPlayed === 0) awardBadge('first-round')
        if (nextStreak >= 3) awardBadge('three-correct')
        if (isFinalRound && totalRounds > 0 && nextSeasonCorrect === totalRounds) {
          awardBadge('perfect-season')
        }
      },
      awardDecisionBonus: (roundId: number) => {
        if (decisionBonuses[roundId]) return
        setDecisionBonuses((previous) => ({ ...previous, [roundId]: true }))
        addPoints(5)
      },
      markTrendVisited: () => awardBadge('trend-explorer'),
      advanceRound: () => setCurrentRoundIndex((index) => index + 1),
      dismissLevelUp: () => setLevelUp(null),
    }
  }, [
    answers,
    badges,
    correctStreak,
    currentRoundIndex,
    decisionBonuses,
    district,
    levelUp,
    maximumScore,
    roundsPlayed,
    roundSignature,
    score,
    seasonCorrect,
  ])

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used inside GameProvider')
  }
  return context
}
