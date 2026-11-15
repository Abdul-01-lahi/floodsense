import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Trend } from '../types'

interface TrendCardProps {
  trend: Trend
}

const directionDetails = {
  increasing: { icon: '↑', label: 'Increasing', style: 'bg-emerald-100 text-emerald-800' },
  decreasing: { icon: '↓', label: 'Decreasing', style: 'bg-orange-100 text-orange-800' },
  flat: { icon: '→', label: 'Flat', style: 'bg-slate-100 text-slate-700' },
} as const

function TrendCard({ trend }: TrendCardProps) {
  const direction = directionDetails[trend.trend]
  const pValue =
    trend.p_value < 0.001 ? 'p < 0.001' : `p = ${trend.p_value.toFixed(3)}`
  const directionText =
    trend.trend === 'flat' ? 'flat' : trend.trend
  const verdict =
    trend.trend === 'flat'
      ? `${trend.variable} is ${directionText}. ${
          trend.significant
            ? `The ${trend.test} result (${pValue}) is statistically significant, but the overall direction is neutral.`
            : `The ${trend.test} result (${pValue}) is not statistically significant, so this could be normal year-to-year variation.`
        }`
      : `${trend.variable} is ${directionText}. ${
          trend.significant
            ? `This change is statistically significant (${trend.test}, ${pValue}).`
            : `This change is not statistically significant (${trend.test}, ${pValue}) and could be normal year-to-year variation.`
        }`

  return (
    <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-emerald-100">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="break-words text-xl font-bold text-slate-900">
            {trend.variable}
          </h2>
          <p className="mt-1 text-base text-slate-500">Unit: {trend.unit}</p>
        </div>
        <span
          className={`inline-flex min-h-12 items-center gap-1 rounded-full px-3 text-base font-bold ${direction.style}`}
          aria-label={`Trend direction: ${direction.label}`}
        >
          <span className="text-xl leading-none" aria-hidden="true">
            {direction.icon}
          </span>
          {direction.label}
        </span>
      </div>

      <div className="mt-5 h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trend.seasons}
            margin={{
              top: 8,
              right: 8,
              left: 0,
              bottom: trend.seasons.length > 8 ? 32 : 8,
            }}
          >
            <CartesianGrid stroke="#dbeafe" strokeDasharray="3 3" />
            <XAxis
              dataKey="season"
              interval={
                trend.seasons.length > 12
                  ? Math.ceil(trend.seasons.length / 6) - 1
                  : trend.seasons.length > 6
                    ? 1
                    : 0
              }
              angle={trend.seasons.length > 8 ? -35 : 0}
              textAnchor={trend.seasons.length > 8 ? 'end' : 'middle'}
              tick={{ fontSize: 16 }}
              tickMargin={8}
            />
            <YAxis domain={['auto', 'auto']} width={48} tick={{ fontSize: 16 }} />
            <Tooltip
              formatter={(value) => [`${value} ${trend.unit}`, trend.variable]}
            />
            <Line
              type="monotone"
              dataKey="value"
              name={trend.variable}
              stroke="#047857"
              strokeWidth={3}
              dot={{ r: 4, fill: '#047857' }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-4 break-words rounded-2xl bg-emerald-50 p-4 text-base font-semibold leading-relaxed text-emerald-950">
        {verdict}
      </p>
    </article>
  )
}

export default TrendCard
