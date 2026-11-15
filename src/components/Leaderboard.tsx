import useData from '../hooks/useData'
import type { LeaderboardEntry } from '../types'

interface LeaderboardProps {
  playerScore: number
}

function Leaderboard({ playerScore }: LeaderboardProps) {
  const { data: villages, loading, error } =
    useData<LeaderboardEntry[]>('leaderboard.json')

  if (loading) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100">
        <h2 className="text-xl font-bold text-slate-900">Village leaderboard</h2>
        <p className="mt-3 text-base text-slate-500">Loading village scores...</p>
      </section>
    )
  }

  if (error || !villages) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100">
        <h2 className="text-xl font-bold text-slate-900">Village leaderboard</h2>
        <p className="mt-3 text-base text-slate-600">Village scores are not available yet.</p>
      </section>
    )
  }

  const leaderboard = [...villages, { village: 'You', score: playerScore }].sort(
    (first, second) => second.score - first.score,
  )

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900">Village leaderboard</h2>
        <p className="mt-1 text-base text-slate-600">
          See how your score compares.
        </p>
      </div>
      <ol className="space-y-2" aria-label="Village leaderboard rankings">
        {leaderboard.map((entry, index) => {
          const isPlayer = entry.village === 'You'
          return (
            <li
              key={entry.village}
              className={`flex min-h-14 items-center gap-3 rounded-2xl px-3 ${
                isPlayer ? 'bg-emerald-100 ring-1 ring-emerald-300' : 'bg-slate-50'
              }`}
            >
              <span className="w-7 text-center text-lg font-bold text-slate-500">
                {index + 1}
              </span>
              <span className="flex-1 font-semibold text-slate-900">
                {entry.village}
              </span>
              <span className="font-bold text-emerald-800">{entry.score} pts</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export default Leaderboard
