import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import FormInput from '../components/FormInput'
import Spinner from '../components/Spinner'
import Toast from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function Login() {
  const { t } = useLanguage()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [failed, setFailed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Send the visitor back to whatever they were trying to reach.
  const destination = location.state?.from || '/dashboard'

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: '' }))
    if (failed) setFailed(false)
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {
      username: form.username.trim() ? '' : t('login.usernameRequired'),
      password: form.password ? '' : t('login.passwordRequired'),
    }
    setErrors(nextErrors)
    if (nextErrors.username || nextErrors.password) return

    setSubmitting(true)
    setFailed(false)

    // Small delay so the button state is perceptible rather than a flicker.
    setTimeout(() => {
      const ok = login(form.username, form.password)
      setSubmitting(false)

      if (ok) navigate(destination, { replace: true })
      else {
        setFailed(true)
        setForm((current) => ({ ...current, password: '' }))
      }
    }, 300)
  }

  return (
    <div className="relative">
      <div className="brand-gradient absolute inset-x-0 top-0 h-64" aria-hidden="true">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-16 top-4 h-48 w-72 animate-glow-drift rounded-full bg-sky-400/25 blur-3xl" />
          <div
            className="absolute -right-10 top-10 h-44 w-72 animate-glow-drift rounded-full bg-emerald-300/20 blur-3xl"
            style={{ animationDelay: '2.5s' }}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-slate-50/0 to-slate-50" />
      </div>

      <div className="relative mx-auto max-w-md px-4 pb-20 pt-12 sm:px-6 sm:pt-16">
        <div className="animate-rise-in text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md">
            <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M10 1a4 4 0 00-4 4v2H5a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2h-1V5a4 4 0 00-4-4zm2.5 6V5a2.5 2.5 0 10-5 0v2h5zM10 11a1.25 1.25 0 01.75 2.25V15a.75.75 0 01-1.5 0v-1.75A1.25 1.25 0 0110 11z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {t('login.title')}
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-white/75">{t('login.subtitle')}</p>
        </div>

        <div
          className="glass-card mt-8 animate-rise-in rounded-2xl p-6 sm:p-8"
          style={{ animationDelay: '0.1s' }}
        >
          {failed && (
            <div className="mb-5">
              <Toast
                toast={{ type: 'error', message: t('login.invalid') }}
                onDismiss={() => setFailed(false)}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <FormInput
              id="username"
              label={t('login.username')}
              required
              value={form.username}
              onChange={(value) => setField('username', value)}
              error={errors.username}
              autoComplete="username"
              disabled={submitting}
            />

            <div className="relative">
              <FormInput
                id="password"
                label={t('login.password')}
                required
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(value) => setField('password', value)}
                error={errors.password}
                autoComplete="current-password"
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                className="absolute right-3 top-[2.1rem] rounded-md p-1 text-slate-400 transition hover:text-slate-600"
              >
                {showPassword ? (
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M3.28 2.22a.75.75 0 10-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.75-1.75A9.7 9.7 0 0019 10s-3-6-9-6a8.5 8.5 0 00-3.7.85L3.28 2.22zM10 14a4 4 0 01-3.6-5.75l1.2 1.2a2.5 2.5 0 003.35 3.35l1.2 1.2A4 4 0 0110 14z" />
                    <path d="M1 10s3 6 9 6c.34 0 .67-.02 1-.06L3.2 7.14A10.9 10.9 0 001 10z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M10 4C4 4 1 10 1 10s3 6 9 6 9-6 9-6-3-6-9-6zm0 10a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <Spinner className="h-4 w-4" label={t('login.signingIn')} />
              ) : (
                t('login.submit')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
