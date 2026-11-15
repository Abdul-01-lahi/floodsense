import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { getFarmDecisionOutcome } from '../lib/decisions'
import type { FarmDecision, Round } from '../types'

interface FarmDecisionProps {
  actualOutcome: Round['actual_outcome']
  roundId: number
}

const choices: { value: FarmDecision; label: string; icon: string }[] = [
  { value: 'harvest_early', label: 'Harvest early', icon: '🌾' },
  {
    value: 'move_stored_produce',
    label: 'Move stored produce to higher ground',
    icon: '⬆️',
  },
  { value: 'wait_and_watch', label: 'Wait and watch', icon: '👀' },
]

function FarmDecision({ actualOutcome, roundId }: FarmDecisionProps) {
  const { awardDecisionBonus } = useGame()
  const [selected, setSelected] = useState<FarmDecision | null>(null)
  const outcome = selected
    ? getFarmDecisionOutcome(actualOutcome, selected)
    : null

  const chooseDecision = (decision: FarmDecision) => {
    if (selected) return
    const result = getFarmDecisionOutcome(actualOutcome, decision)
    setSelected(decision)
    if (result.sensible) {
      awardDecisionBonus(roundId)
    }
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100">
      <p className="text-base font-bold uppercase tracking-widest text-emerald-700">
        Farm decision
      </p>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        What would you have done?
      </h2>
      <div className="mt-5 space-y-3">
        {choices.map((choice) => (
          <button
            key={choice.value}
            type="button"
            onClick={() => chooseDecision(choice.value)}
            disabled={selected !== null}
            className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border-2 px-4 text-left text-base font-bold transition-colors ${
              selected === choice.value
                ? 'border-emerald-600 bg-emerald-100 text-emerald-900'
                : 'border-slate-200 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50'
            } disabled:cursor-default`}
          >
            <span className="text-2xl" aria-hidden="true">
              {choice.icon}
            </span>
            {choice.label}
          </button>
        ))}
      </div>
      {outcome && (
        <div
          className={`mt-5 rounded-2xl p-4 text-base font-semibold leading-relaxed ${
            outcome.sensible
              ? 'bg-emerald-50 text-emerald-950'
              : 'bg-amber-50 text-amber-950'
          }`}
          role="status"
        >
          {outcome.message}
          {outcome.sensible && (
            <strong className="mt-2 block">+5 sensible choice bonus</strong>
          )}
        </div>
      )}
    </section>
  )
}

export default FarmDecision
