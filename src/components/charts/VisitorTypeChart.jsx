import { useState } from 'react'
import { INK, MAGNITUDE, MAGNITUDE_SOFT } from './ChartTokens'
import { useLanguage } from '../../context/LanguageContext'

/**
 * Horizontal bars - magnitude comparison across visitor types.
 *
 * One hue, not categorical: the job here is "which type is biggest", and the
 * four categorical hues are reserved for the interest pie so a colour never
 * means two different things across the dashboard.
 *
 * Horizontal because the Sinhala category names are long enough to collide on
 * a vertical axis.
 */
export default function VisitorTypeChart({ data, total, selected, onSelect }) {
  const { t } = useLanguage()
  const [hovered, setHovered] = useState(null)

  const max = Math.max(1, ...data.map((item) => item.count))
  const hasData = total > 0

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">{t('charts.visitorTypeTitle')}</h2>
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
      <p className="mt-0.5 text-xs text-slate-500">{t('charts.visitorTypeHint')}</p>

      {!hasData ? (
        <p className="py-10 text-center text-sm text-slate-400">{t('charts.noData')}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {data.map((item) => {
            const pct = total ? Math.round((item.count / total) * 100) : 0
            const width = (item.count / max) * 100
            const isSelected = selected === item.key
            const dimmed = selected && !isSelected

            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => onSelect(isSelected ? null : item.key)}
                  onMouseEnter={() => setHovered(item.key)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(item.key)}
                  onBlur={() => setHovered(null)}
                  aria-pressed={isSelected}
                  // Hit target spans the full row, not just the bar.
                  className="group relative block w-full rounded-lg px-1 py-1 text-left transition focus:outline-none focus:ring-2 focus:ring-brand-200"
                >
                  <div className="flex items-baseline justify-between gap-3 text-xs">
                    <span
                      className={`truncate font-medium transition ${
                        dimmed ? 'text-slate-400' : 'text-slate-700'
                      }`}
                    >
                      {item.label}
                    </span>
                    {/* Direct label - identity and value never depend on colour alone */}
                    <span className="shrink-0 tabular-nums text-slate-500">
                      <span className="font-semibold text-slate-900">{item.count}</span>
                      <span className="ml-1 text-slate-400">{pct}%</span>
                    </span>
                  </div>

                  <div
                    className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full"
                    style={{ backgroundColor: INK.grid }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(width, item.count > 0 ? 3 : 0)}%`,
                        backgroundColor: dimmed ? MAGNITUDE_SOFT : MAGNITUDE,
                        opacity: hovered === item.key ? 0.85 : 1,
                      }}
                    />
                  </div>

                  {hovered === item.key && (
                    <div
                      role="tooltip"
                      className="pointer-events-none absolute right-1 top-0 z-10 -translate-y-full rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg"
                    >
                      {item.label}: <span className="font-semibold">{item.count}</span> ({pct}%)
                    </div>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
