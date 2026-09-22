import { NavLink } from 'react-router-dom'
import AnimatedLogo from './AnimatedLogo'
import LanguageToggle from './LanguageToggle'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function Navbar() {
  const { t } = useLanguage()
  const { isAuthenticated, logout } = useAuth()

  const links = [
    { to: '/', label: t('nav.register'), end: true },
    { to: '/dashboard', label: t('nav.dashboard') },
  ]

  return (
    <header className="brand-gradient sticky top-0 z-30 shadow-lg shadow-brand-900/10">
      {/* Soft light source behind the logo, so the glow has something to sit in */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -left-10 top-1/2 h-40 w-64 -translate-y-1/2 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute right-1/4 top-0 h-32 w-56 rounded-full bg-emerald-300/10 blur-3xl" />
      </div>

      <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:h-[4.5rem] sm:gap-3 sm:px-6">
        <NavLink to="/" className="group flex min-w-0 items-center" aria-label="ACCEL 7.0">
          <AnimatedLogo className="h-6 sm:h-9 md:h-10" />
        </NavLink>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-0.5 rounded-xl border border-white/15 bg-white/10 p-0.5 backdrop-blur-md sm:gap-1 sm:p-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  [
                    'rounded-lg px-2 py-1.5 text-xs font-medium transition sm:px-4 sm:text-sm',
                    isActive
                      ? 'bg-white text-brand-800 shadow-sm'
                      : 'text-white/75 hover:bg-white/10 hover:text-white',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <LanguageToggle />

          {isAuthenticated && (
            <button
              type="button"
              onClick={logout}
              title={t('login.logout')}
              aria-label={t('login.logout')}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-2 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md transition hover:bg-white/20 hover:text-white sm:px-3"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M3 4.75A1.75 1.75 0 014.75 3h5a.75.75 0 010 1.5h-5a.25.25 0 00-.25.25v10.5c0 .14.11.25.25.25h5a.75.75 0 010 1.5h-5A1.75 1.75 0 013 15.25V4.75zm10.72 1.97a.75.75 0 011.06 0l2.75 2.75a.75.75 0 010 1.06l-2.75 2.75a.75.75 0 11-1.06-1.06l1.47-1.47H8.75a.75.75 0 010-1.5h6.44l-1.47-1.47a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="hidden sm:inline">{t('login.logout')}</span>
            </button>
          )}
        </div>
      </nav>

      <div className="edge-fade h-px w-full" aria-hidden="true" />
    </header>
  )
}
