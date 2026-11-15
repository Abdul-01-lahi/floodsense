interface RainGaugeProps {
  rainfall: number
  maximum: number
}

function RainGauge({ rainfall, maximum }: RainGaugeProps) {
  const safeMaximum = Math.max(maximum, 1)
  const progress = Math.min(Math.max(rainfall, 0) / safeMaximum, 1)
  const circumference = 2 * Math.PI * 44

  return (
    <div className="flex flex-col items-center rounded-3xl bg-sky-50 p-4">
      <svg
        className="-rotate-90"
        width="128"
        height="128"
        viewBox="0 0 100 100"
        role="img"
        aria-label={`${rainfall} millimetres of rainfall in the last 7 days`}
      >
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="#dbeafe"
          strokeWidth="9"
        />
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="#0284c7"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${circumference * progress} ${circumference}`}
        />
      </svg>
      <div className="-mt-20 mb-10 text-center">
        <strong className="block break-words text-2xl text-sky-800">
          {Math.max(rainfall, 0)}
        </strong>
        <span className="text-base font-semibold text-slate-500">mm / 7 days</span>
      </div>
      <p className="text-base font-bold text-slate-700">Recent rainfall</p>
    </div>
  )
}

export default RainGauge
