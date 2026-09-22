import { useLanguage } from '../../context/LanguageContext'

/**
 * Hero figure, not a chart. One number is the whole story here, and the form
 * guidance is explicit that a single current value wants a stat tile rather
 * than a one-bar bar chart.
 */
export default function VisitorCountCard({ total, today, loading }) {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{t('charts.visitorsTitle')}</p>
          <p className="mt-0.5 text-xs text-slate-500">{t('charts.visitorsHint')}</p>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 8a7 7 0 1114 0H3z" />
          </svg>
        </span>
      </div>

      <div className="mt-4">
        <p className="text-5xl font-bold leading-none tracking-tight text-slate-900 tabular-nums">
          {loading ? '-' : total}
        </p>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-700">
            +{loading ? 0 : today}
          </span>
          {t('charts.todaySuffix')}
        </p>
      </div>
    </div>
  )
}
