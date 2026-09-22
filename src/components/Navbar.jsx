import { NavLink } from 'react-router-dom'
import LanguageToggle from './LanguageToggle'
import { useLanguage } from '../context/LanguageContext'

export default function Navbar() {
  const { t } = useLanguage()

  const links = [
    { to: '/', label: t('nav.register'), end: true },
    { to: '/dashboard', label: t('nav.dashboard') },
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <NavLink to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
            A
          </span>
          <span className="hidden text-base font-semibold tracking-tight text-slate-900 sm:block">
            {t('appName')} <span className="font-normal text-slate-500">{t('appNameSuffix')}</span>
          </span>
        </NavLink>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  [
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition sm:px-4',
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <LanguageToggle />
        </div>
      </nav>
    </header>
  )
}
