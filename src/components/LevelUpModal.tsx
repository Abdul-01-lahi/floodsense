import { motion } from 'motion/react'
import type { Level } from '../lib/levels'

interface LevelUpModalProps {
  level: Level
  onClose: () => void
}

function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/40 p-5">
      <motion.div
        initial={{ scale: 0.75, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.45, duration: 0.65 }}
        className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="level-up-title"
      >
        <div className="text-5xl" aria-hidden="true">
          🌊
        </div>
        <p className="mt-4 text-base font-bold uppercase tracking-widest text-emerald-700">
          Level up
        </p>
        <h2 id="level-up-title" className="mt-2 text-3xl font-bold text-slate-900">
          {level.name}
        </h2>
        <p className="mt-3 text-lg leading-relaxed text-slate-600">
          Your flood-reading skills are growing.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 min-h-14 w-full rounded-2xl bg-emerald-700 px-5 text-lg font-bold text-white transition-colors hover:bg-emerald-800"
        >
          Keep learning
        </button>
      </motion.div>
    </div>
  )
}

export default LevelUpModal
