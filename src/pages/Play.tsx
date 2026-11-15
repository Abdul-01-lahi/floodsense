import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import CroplandBadge from '../components/CroplandBadge'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import RainGauge from '../components/RainGauge'
import SoilBar from '../components/SoilBar'
import UpstreamCard from '../components/UpstreamCard'
import { useGame } from '../context/GameContext'
import useData from '../hooks/useData'
import { getRainfallLimits } from '../lib/config'
import { filterValid, isRound } from '../lib/validate'
import type { Risk, Round } from '../types'

const riskOptions: { value: Risk; label: string; style: string }[] = [
  { value: 'low', label: 'Low', style: 'bg-emerald-600 hover:bg-emerald-700' },
  { value: 'rising', label: 'Rising', style: 'bg-amber-500 hover:bg-amber-600' },
  { value: 'critical', label: 'Critical', style: 'bg-red-600 hover:bg-red-700' },
]

function Play() {
  const navigate = useNavigate()
  const {
    configureRounds,
    district,
    currentRoundIndex,
    submitAnswer,
  } = useGame()
  const { data: rawRounds, loading, error } = useData<unknown>('rounds.json')
  const rounds = useMemo(
    () => filterValid<Round>(rawRounds, isRound, 'rounds'),
    [rawRounds],
  )
  const districtRounds = useMemo(
    () => rounds?.filter((round) => round.district === district) ?? [],
    [district, rounds],
  )
  const rainfallLimits = useMemo(() => getRainfallLimits(rounds), [rounds])
  const round = districtRounds[currentRoundIndex]
  useEffect(() => {
    if (!loading && !error && rounds.length > 0) {
      configureRounds(rounds.map((item) => item.round_id))
    }
  }, [configureRounds, error, loading, rounds])

  if (loading) return <LoadingState />
  if (error) return <ErrorState />
  if (rounds.length === 0) {
    return <ErrorState message="We could not find any usable round data." />
  }
  if (!district || !round) {
    return <InvalidGameState onReset={() => navigate('/')} />
  }

  const chooseRisk = (answer: Risk) => {
    submitAnswer(
      round.round_id,
      answer,
      round.model_risk,
      currentRoundIndex === districtRounds.length - 1,
      districtRounds.length,
    )
    navigate('/result')
  }

  return (
    <section className="space-y-5">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100">
        <p className="break-words text-base font-bold uppercase tracking-widest text-emerald-700">
          {district}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {round.season}
        </h1>
        <p className="mt-1 text-lg text-slate-600">Week {round.week}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <RainGauge
          rainfall={round.conditions.rainfall_7day_mm}
          maximum={rainfallLimits.rainfall_7day_mm}
        />
        <SoilBar moisture={round.conditions.soil_moisture} />
      </div>
      <UpstreamCard
        rainfall={round.conditions.upstream_rainfall_mm}
        maximum={rainfallLimits.upstream_rainfall_mm}
        rainfall30day={round.conditions.rainfall_30day_mm}
        maximum30day={rainfallLimits.rainfall_30day_mm}
      />
      <CroplandBadge share={round.conditions.cropland_share_pct} />
      <p className="rounded-2xl bg-slate-100 p-4 text-base leading-relaxed text-slate-700">
        Based on district-level satellite data, not exact field predictions
      </p>

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100">
        <h2 className="mb-4 text-xl font-bold text-slate-900">
          What is the current risk?
        </h2>
        <div className="space-y-3">
          {riskOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => chooseRisk(option.value)}
              className={`min-h-16 w-full rounded-2xl px-5 text-xl font-bold text-white transition-colors ${option.style}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function InvalidGameState({ onReset }: { onReset: () => void }) {
  useEffect(() => {
    onReset()
  }, [onReset])

  return null
}

export default Play
