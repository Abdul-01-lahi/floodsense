import { motion } from 'motion/react'
import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ErrorState from '../components/ErrorState'
import Leaderboard from '../components/Leaderboard'
import LevelUpModal from '../components/LevelUpModal'
import LoadingState from '../components/LoadingState'
import { useGame } from '../context/GameContext'
import useData from '../hooks/useData'
import { filterValid, isRound } from '../lib/validate'
import { getLevel, getNextLevel } from '../lib/levels'
import { BADGES } from '../lib/badges'
import type { Round } from '../types'

function Progress() {
  const navigate = useNavigate()
  const {
    configureRounds,
    district,
    score,
    roundsPlayed,
    badges,
    levelUp,
    dismissLevelUp,
    setDistrict,
  } = useGame()
  const { data: rawRounds, loading, error } = useData<unknown>('rounds.json')
  const rounds = useMemo(
    () => filterValid<Round>(rawRounds, isRound, 'rounds'),
    [rawRounds],
  )
  const maximumScore = rounds.length * 15
  const level = getLevel(score, maximumScore)
  const nextLevel = getNextLevel(score, maximumScore)
  const progress = nextLevel
    ? ((score - level.minScore) / (nextLevel.minScore - level.minScore)) * 100
    : 100
  const visibleBadges = BADGES.filter(
    (badge) => badge.id !== 'three-correct' || rounds.length >= 3,
  )

  useEffect(() => {
    if (!loading && !error && rounds.length > 0) {
      configureRounds(rounds.map((round) => round.round_id))
    }
  }, [configureRounds, error, loading, rounds])

  if (loading) return <LoadingState />
  if (error) return <ErrorState />
  if (rounds.length === 0) {
    return <ErrorState message="We could not find any usable round data." />
  }

  const playAgain = () => {
    if (district) {
      setDistrict(district)
      navigate('/play')
    } else {
      navigate('/')
    }
  }

  return (
    <>
      <section className="space-y-5">
        <header className="rounded-3xl bg-emerald-800 p-6 text-white shadow-sm">
          <p className="text-base font-bold uppercase tracking-widest text-emerald-200">
            Your progress
          </p>
          <h1 className="mt-2 text-3xl font-bold">{level.name}</h1>
          <p className="mt-2 text-lg text-emerald-100">
            {score} points · {roundsPlayed} rounds played
          </p>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900">
              {nextLevel ? `Next: ${nextLevel.name}` : 'Top level reached'}
            </h2>
            <span className="font-bold text-emerald-700">
              {nextLevel ? `${Math.round(progress)}%` : 'Complete'}
            </span>
          </div>
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-emerald-100">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: Math.min(progress / 100, 1) }}
              transition={{ duration: 0.7 }}
              className="h-full origin-left rounded-full bg-emerald-600"
            />
          </div>
          {nextLevel && (
            <p className="mt-3 text-base text-slate-600">
              {nextLevel.minScore - score} more points to reach {nextLevel.name}.
            </p>
          )}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Badges</h2>
          <div className="grid grid-cols-2 gap-3">
            {visibleBadges.map((badge) => {
              const earned = badges.includes(badge.id)
              return (
                <div
                  key={badge.id}
                  className={`rounded-2xl p-4 ${
                    earned ? 'bg-amber-50' : 'bg-slate-100 opacity-50'
                  }`}
                >
                  <div className="text-3xl" aria-hidden="true">
                    {badge.icon}
                  </div>
                  <h3 className="mt-2 font-bold text-slate-900">{badge.name}</h3>
                  <p className="mt-1 text-base leading-relaxed text-slate-600">
                    {badge.description}
                  </p>
                </div>
              )
            })}
          </div>
        </section>
        <Leaderboard playerScore={score} />
        <button
          type="button"
          onClick={playAgain}
          className="min-h-16 w-full rounded-2xl bg-emerald-700 px-6 text-xl font-bold text-white transition-colors hover:bg-emerald-800"
        >
          Play Again
        </button>
      </section>
      {levelUp && <LevelUpModal level={levelUp} onClose={dismissLevelUp} />}
    </>
  )
}

export default Progress
