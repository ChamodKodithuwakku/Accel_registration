import { useState } from 'react'
import { INK, seriesColor } from './ChartTokens'
import { useLanguage } from '../../context/LanguageContext'

const SIZE = 180
const RADIUS = 82
const CENTER = SIZE / 2

function polar(angleDeg, radius) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) }
}

function slicePath(startAngle, endAngle, radius) {
  // A full circle cannot be drawn as a single arc - close it as two halves.
  if (endAngle - startAngle >= 359.99) {
    return [
      `M ${CENTER} ${CENTER - radius}`,
      `A ${radius} ${radius} 0 1 1 ${CENTER} ${CENTER + radius}`,
      `A ${radius} ${radius} 0 1 1 ${CENTER} ${CENTER - radius}`,
      'Z',
    ].join(' ')
  }

  const start = polar(startAngle, radius)
  const end = polar(endAngle, radius)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0

  return [
    `M ${CENTER} ${CENTER}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    'Z',
  ].join(' ')
}

/**
 * Pie - share of interest-area selections.
 *
 * Note this is a share of SELECTIONS, not of visitors: interest area is a
 * multi-select, so one person can land in several slices and the slice counts
 * sum to more than the visitor count. The subtitle says so, and the centre
 * figure reports total selections rather than people.
 */
export default function InterestPieChart({ data, totalSelections, selected, onSelect }) {
  const { t } = useLanguage()
  const [hovered, setHovered] = useState(null)

  const hasData = totalSelections > 0

  let cursor = 0
  const slices = data.map((item, index) => {
    const angle = hasData ? (item.count / totalSelections) * 360 : 0
    const slice = {
      ...item,
      color: seriesColor(index),
      startAngle: cursor,
      endAngle: cursor + angle,
      pct: hasData ? Math.round((item.count / totalSelections) * 100) : 0,
    }
    cursor += angle
    return slice
  })

  const active = hovered || selected

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">{t('charts.interestTitle')}</h2>
        {selected && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="shrink-0 rounded-lg px-2 py-0.5 text-xs font-medium text-brand-600 transition hover:bg-brand-50"
          >
            {t('charts.clearFilter')}
          </button>
        )}
      </div>
      <p className="mt-0.5 text-xs text-slate-500">{t('charts.interestHint')}</p>

      {!hasData ? (
        <p className="py-10 text-center text-sm text-slate-400">{t('charts.noData')}</p>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <svg
              width={SIZE}
              height={SIZE}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              role="img"
              aria-label={t('charts.interestTitle')}
            >
              {slices.map((slice) => {
                const isActive = active === slice.key
                const dimmed = active && !isActive

                return (
                  <path
                    key={slice.key}
                    d={slicePath(slice.startAngle, slice.endAngle, isActive ? RADIUS + 6 : RADIUS)}
                    fill={slice.color}
                    // 2px surface gap between fills
                    stroke={INK.surface}
                    strokeWidth="2"
                    opacity={dimmed ? 0.35 : 1}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHovered(slice.key)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => onSelect(selected === slice.key ? null : slice.key)}
                  />
                )
              })}
            </svg>

            {hovered && (
              <div
                role="tooltip"
                className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg"
              >
                {slices.find((s) => s.key === hovered)?.label}:{' '}
                <span className="font-semibold">{slices.find((s) => s.key === hovered)?.count}</span> (
                {slices.find((s) => s.key === hovered)?.pct}%)
              </div>
            )}
          </div>

          {/* Legend doubles as the direct-label layer and as a second set of hit targets */}
          <ul className="w-full space-y-1.5">
            {slices.map((slice) => {
              const isSelected = selected === slice.key
              const dimmed = selected && !isSelected

              return (
                <li key={slice.key}>
                  <button
                    type="button"
                    onClick={() => onSelect(isSelected ? null : slice.key)}
                    onMouseEnter={() => setHovered(slice.key)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(slice.key)}
                    onBlur={() => setHovered(null)}
                    aria-pressed={isSelected}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-xs transition focus:outline-none focus:ring-2 focus:ring-brand-200 ${
                      isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: slice.color, opacity: dimmed ? 0.35 : 1 }}
                    />
                    <span className={`flex-1 truncate ${dimmed ? 'text-slate-400' : 'text-slate-700'}`}>
                      {slice.label}
                    </span>
                    <span className="shrink-0 tabular-nums">
                      <span className="font-semibold text-slate-900">{slice.count}</span>
                      <span className="ml-1 text-slate-400">{slice.pct}%</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
