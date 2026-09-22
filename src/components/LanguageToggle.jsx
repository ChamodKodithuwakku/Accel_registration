import { useLanguage } from '../context/LanguageContext'
import { LANGUAGES } from '../i18n/translations'

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div
      className="flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white p-0.5"
      role="group"
      aria-label="Language / භාෂාව"
    >
      {LANGUAGES.map((option) => {
        const active = language === option.code

        return (
          <button
            key={option.code}
            type="button"
            onClick={() => setLanguage(option.code)}
            aria-pressed={active}
            title={option.label}
            className={[
              'rounded-lg px-2.5 py-1 text-xs font-semibold transition',
              active ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800',
            ].join(' ')}
          >
            {option.short}
          </button>
        )
      })}
    </div>
  )
}
