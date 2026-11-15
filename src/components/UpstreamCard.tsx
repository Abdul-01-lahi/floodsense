interface UpstreamCardProps {
  rainfall: number
  maximum: number
  rainfall30day: number
  maximum30day: number
}

function UpstreamCard({
  rainfall,
  maximum,
  rainfall30day,
  maximum30day,
}: UpstreamCardProps) {
  const upstreamPercentage =
    (Math.min(Math.max(rainfall, 0), maximum) / Math.max(maximum, 1)) * 100
  const monthlyPercentage =
    (Math.min(Math.max(rainfall30day, 0), maximum30day) /
      Math.max(maximum30day, 1)) *
    100

  return (
    <div className="rounded-3xl bg-blue-100 p-5">
      <div className="flex items-center gap-3">
        <span className="text-3xl" aria-hidden="true">
          🌧️
        </span>
        <div className="min-w-0">
          <p className="font-bold text-blue-950">Upstream rainfall</p>
          <p className="break-words text-base text-blue-800">
            {rainfall} mm recorded upstream
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <RainfallBar
          label="Upstream, last 7 days"
          value={rainfall}
          percentage={upstreamPercentage}
        />
        <RainfallBar
          label="District, last 30 days"
          value={rainfall30day}
          percentage={monthlyPercentage}
        />
      </div>
    </div>
  )
}

function RainfallBar({
  label,
  value,
  percentage,
}: {
  label: string
  value: number
  percentage: number
}) {
  return (
    <div>
      <div className="flex flex-wrap justify-between gap-2 text-base text-blue-950">
        <span className="break-words">{label}</span>
        <strong>{value} mm</strong>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-blue-200">
        <div
          className="h-full rounded-full bg-blue-700"
          style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
        />
      </div>
    </div>
  )
}

export default UpstreamCard
