import { useState } from 'react'

interface OnboardingProps {
  onComplete: () => void
}

const cards = [
  {
    icon: '🌧️',
    title: 'Read the signs',
    text: 'Use rainfall, soil moisture, and upstream rain to spot changing risk.',
  },
  {
    icon: '🧠',
    title: 'Make a call',
    text: 'Choose Low, Rising, or Critical before you see what really happened.',
  },
  {
    icon: '🌱',
    title: 'Build your skills',
    text: 'Earn points and badges as you learn to prepare your village.',
  },
]

function Onboarding({ onComplete }: OnboardingProps) {
  const [activeCard, setActiveCard] = useState(0)
  const card = cards[activeCard]
  const isLastCard = activeCard === cards.length - 1

  const continueOnboarding = () => {
    if (isLastCard) {
      try {
        window.localStorage.setItem('floodsense-onboarding-seen', 'true')
      } catch {
        // The app can still continue when browser storage is unavailable.
      }
      onComplete()
      return
    }
    setActiveCard((current) => current + 1)
  }

  return (
    <div className="fixed inset-0 z-30 flex min-h-svh items-center justify-center bg-sky-50 p-5">
      <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl ring-1 ring-emerald-100">
        <p className="text-base font-bold uppercase tracking-widest text-emerald-700">
          Welcome to FloodSense
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900">
          Learn before the water rises
        </h1>
        <div className="mt-8 min-h-52 rounded-3xl bg-emerald-50 p-6">
          <div className="text-5xl" aria-hidden="true">
            {card.icon}
          </div>
          <h2 className="mt-5 text-2xl font-bold text-emerald-950">
            {card.title}
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-emerald-900">
            {card.text}
          </p>
        </div>
        <div className="mt-5 flex justify-center gap-2" aria-label="Onboarding progress">
          {cards.map((item, index) => (
            <span
              key={item.title}
              className={`h-3 w-3 rounded-full ${
                index === activeCard ? 'bg-emerald-700' : 'bg-emerald-200'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={continueOnboarding}
          className="mt-6 min-h-14 w-full rounded-2xl bg-emerald-700 px-5 text-lg font-bold text-white transition-colors hover:bg-emerald-800"
        >
          {isLastCard ? 'Start learning' : 'Next'}
        </button>
      </section>
    </div>
  )
}

export default Onboarding
