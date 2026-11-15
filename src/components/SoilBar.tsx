interface SoilBarProps {
  moisture: number
}

function SoilBar({ moisture }: SoilBarProps) {
  const percentage = Math.round(Math.min(Math.max(moisture, 0), 1) * 100)

  return (
    <div className="rounded-3xl bg-emerald-50 p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-bold text-emerald-900">Soil moisture</p>
        <strong className="text-lg text-emerald-800">{percentage}%</strong>
      </div>
      <div
        className="h-4 overflow-hidden rounded-full bg-emerald-100"
        role="progressbar"
        aria-label="Soil moisture"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
      >
        <div
          className="h-full rounded-full bg-emerald-600"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default SoilBar
