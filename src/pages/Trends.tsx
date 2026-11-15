import { useEffect, useMemo } from 'react'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import TrendCard from '../components/TrendCard'
import useData from '../hooks/useData'
import { useGame } from '../context/GameContext'
import { filterValid, isTrend } from '../lib/validate'
import type { Trend } from '../types'

function Trends() {
  const { markTrendVisited } = useGame()
  const { data: rawTrends, loading, error } = useData<unknown>('trends.json')
  const trends = useMemo(
    () => filterValid<Trend>(rawTrends, isTrend, 'trends'),
    [rawTrends],
  )

  useEffect(() => {
    markTrendVisited()
  }, [markTrendVisited])

  if (loading) return <LoadingState />
  if (error) return <ErrorState />
  if (trends.length === 0) {
    return <ErrorState message="We could not find any usable trend data." />
  }

  return (
    <section className="space-y-5">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100">
        <p className="text-base font-bold uppercase tracking-widest text-emerald-700">
          FloodSense
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Trends</h1>
        <p className="mt-2 text-lg leading-relaxed text-slate-600">
          See how flood warning signals have changed across recent seasons.
        </p>
      </header>
      <div className="space-y-5">
        {trends.map((trend) => (
          <TrendCard key={trend.variable} trend={trend} />
        ))}
      </div>
      <footer className="rounded-2xl bg-slate-100 p-4 text-base text-slate-700">
        Data: NASA GPM IMERG, SMAP, MODIS, MERRA-2
      </footer>
    </section>
  )
}

export default Trends
