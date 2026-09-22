import { useLanguage } from '../context/LanguageContext'
import { LANGUAGES } from '../i18n/translations'

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div
      className="flex shrink-0 items-center gap-0.5 rounded-xl border border-white/15 bg-white/10 p-0.5 backdrop-blur-md sm:p-1"
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
              'rounded-lg px-2 py-1 text-[11px] font-semibold transition sm:px-2.5 sm:text-xs',
              active ? 'bg-white text-brand-800 shadow-sm' : 'text-white/70 hover:text-white',
            ].join(' ')}
          >
            {option.short}
          </button>
        )
      })}
    </div>
  )
}
