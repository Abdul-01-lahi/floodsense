import { motion } from 'motion/react'
import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ErrorState from '../components/ErrorState'
import FarmDecision from '../components/FarmDecision'
import LoadingState from '../components/LoadingState'
import { getAnswerPoints, useGame } from '../context/GameContext'
import useData from '../hooks/useData'
import { filterValid, isRound } from '../lib/validate'
import type { Round } from '../types'

function Result() {
  const navigate = useNavigate()
  const {
    configureRounds,
    district,
    currentRoundIndex,
    answers,
    score,
    advanceRound,
  } =
    useGame()
  const { data: rawRounds, loading, error } = useData<unknown>('rounds.json')
  const rounds = useMemo(
    () => filterValid<Round>(rawRounds, isRound, 'rounds'),
    [rawRounds],
  )
  const districtRounds = useMemo(
    () => rounds?.filter((round) => round.district === district) ?? [],
    [district, rounds],
  )
  const round = districtRounds[currentRoundIndex]
  const answer = round ? answers[round.round_id] : undefined
  const points = round && answer ? getAnswerPoints(answer, round.model_risk) : 0
  const hasNextRound = currentRoundIndex < districtRounds.length - 1
  useEffect(() => {
    if (!loading && !error && rounds.length > 0) {
      configureRounds(rounds.map((item) => item.round_id))
    }
  }, [configureRounds, error, loading, rounds])

  useEffect(() => {
    if (!loading && (!round || !answer)) {
      navigate('/')
    }
  }, [answer, loading, navigate, round])

  if (loading) return <LoadingState />
  if (error) return <ErrorState />
  if (rounds.length === 0) {
    return <ErrorState message="We could not find any usable round data." />
  }
  if (!round || !answer) {
    return null
  }

  const isCorrect = answer === round.model_risk
  const continueGame = () => {
    if (hasNextRound) {
      advanceRound()
      navigate('/play')
    } else {
      navigate('/progress')
    }
  }

  return (
    <section className="space-y-5">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.7 }}
        className={`rounded-3xl p-6 text-center shadow-sm ${
          isCorrect
            ? 'bg-emerald-100 text-emerald-900'
            : 'bg-red-100 text-red-900'
        }`}
      >
        <div className="text-6xl" aria-hidden="true">
          {isCorrect ? '✓' : '✕'}
        </div>
        <h1 className="mt-3 text-3xl font-bold">
          {isCorrect ? 'Great call!' : 'Not quite'}
        </h1>
        <p className="mt-2 text-lg">
          The model marked this round as <strong>{round.model_risk}</strong>.
        </p>
        <p className="mt-4 text-2xl font-bold">+{points} points</p>
      </motion.div>

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100">
        <p className="text-base font-bold uppercase tracking-widest text-emerald-700">
          What happened?
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          {round.actual_outcome === 'flood'
            ? 'A flood happened'
            : 'No flood happened'}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          {round.explanation}
        </p>
      </div>

      <FarmDecision
        actualOutcome={round.actual_outcome}
        roundId={round.round_id}
      />

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Top factors</h2>
        <div className="flex flex-wrap gap-2">
          {round.top_factors.map((factor) => (
            <span
              key={factor}
              className="rounded-full bg-sky-100 px-4 py-2 text-base font-semibold text-sky-900"
            >
              {factor}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-emerald-800 p-6 text-white">
        <p className="text-base font-semibold uppercase tracking-widest text-emerald-200">
          Total score
        </p>
        <p className="mt-1 text-4xl font-bold">{score}</p>
      </div>

      <button
        type="button"
        onClick={continueGame}
        className="min-h-16 w-full rounded-2xl bg-emerald-700 px-6 text-xl font-bold text-white transition-colors hover:bg-emerald-800"
      >
        {hasNextRound ? 'Next Round' : 'Finish'}
      </button>
    </section>
  )
}

export default Result
