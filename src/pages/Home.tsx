import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import { useGame } from '../context/GameContext'
import useData from '../hooks/useData'
import { filterValid, isRound } from '../lib/validate'
import type { Round } from '../types'

function Home() {
  const navigate = useNavigate()
  const { configureRounds, setDistrict } = useGame()
  const { data: rawRounds, loading, error } = useData<unknown>('rounds.json')
  const rounds = useMemo(
    () => filterValid<Round>(rawRounds, isRound, 'rounds'),
    [rawRounds],
  )
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const districts = useMemo(
    () => [...new Set(rounds?.map((round) => round.district) ?? [])].sort(),
    [rounds],
  )
  useEffect(() => {
    if (!loading && !error && rounds.length > 0) {
      configureRounds(rounds.map((round) => round.round_id))
    }
  }, [configureRounds, error, loading, rounds])
  useEffect(() => {
    if (!loading && !error && districts.length === 1) {
      setDistrict(districts[0])
      navigate('/play')
    }
  }, [districts, error, loading, navigate, setDistrict])

  if (loading) return <LoadingState />
  if (error) return <ErrorState />
  if (rounds.length === 0) {
    return <ErrorState message="We could not find any usable round data." />
  }
  if (districts.length === 1) return <LoadingState />

  const startPlaying = () => {
    if (!selectedDistrict) return
    setDistrict(selectedDistrict)
    navigate('/play')
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100">
        <p className="mb-3 text-base font-bold uppercase tracking-widest text-emerald-700">
          FloodSense
        </p>
        <h1 className="break-words text-3xl font-bold leading-tight text-slate-900">
          Learn to read the signs before the flood
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-slate-600">
          Choose your district and practise spotting changing flood risk.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100">
        <label
          htmlFor="district"
          className="mb-2 block text-lg font-bold text-slate-900"
        >
          Choose your district
        </label>
        <select
          id="district"
          value={selectedDistrict}
          onChange={(event) => setSelectedDistrict(event.target.value)}
          className="min-h-14 w-full rounded-2xl border-2 border-emerald-200 bg-white px-4 text-lg text-slate-800 outline-none focus:border-emerald-600"
        >
          <option value="">Select a district</option>
          {districts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={startPlaying}
        disabled={!selectedDistrict}
        className="min-h-16 w-full rounded-2xl bg-emerald-700 px-6 text-xl font-bold text-white shadow-sm transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Start Playing
      </button>
    </section>
  )
}

export default Home
