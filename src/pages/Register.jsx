import { useState } from 'react'
import CheckboxGroup from '../components/CheckboxGroup'
import FormInput from '../components/FormInput'
import RadioGroup from '../components/RadioGroup'
import Spinner from '../components/Spinner'
import Toast from '../components/Toast'
import { useLanguage } from '../context/LanguageContext'
import { INTEREST_AREAS, VISITOR_CATEGORIES } from '../i18n/translations'
import { addRecord } from '../services/api'
import { FIELD_VALIDATORS, toPayload, validateForm } from '../utils/validation'

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  nic: '',
  email: '',
  phone: '',
  organization: '',
  visitorCategory: '',
  interestAreas: [],
  heardFrom: '',
  consent: false,
}

export default function Register() {
  const { t } = useLanguage()

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  // Errors are stored as translation keys, so they follow the language switch.
  const errorFor = (field) => (touched[field] && errors[field] ? t(errors[field]) : '')

  // Same idea for the toast: our own messages are stored as a key and translated
  // at render time. Server errors arrive as plain text and pass through as-is.
  const displayToast = toast
    ? { type: toast.type, message: toast.key ? t(toast.key) : toast.message }
    : null

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: FIELD_VALIDATORS[field]?.(value) || '' }))
    }
  }

  function handleBlur(field) {
    setTouched((current) => ({ ...current, [field]: true }))
    setErrors((current) => ({ ...current, [field]: FIELD_VALIDATORS[field]?.(form[field]) || '' }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setToast(null)

    const { errors: nextErrors, isValid } = validateForm(form)
    setErrors(nextErrors)
    setTouched(Object.keys(FIELD_VALIDATORS).reduce((acc, key) => ({ ...acc, [key]: true }), {}))

    if (!isValid) {
      setToast({ type: 'error', key: 'register.fixErrors' })
      return
    }

    setSubmitting(true)
    try {
      await addRecord(toPayload(form))
      setToast({ type: 'success', key: 'register.success' })
      setForm(EMPTY_FORM)
      setErrors({})
      setTouched({})
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setToast({ type: 'error', message: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  const categoryOptions = VISITOR_CATEGORIES.map((value) => ({
    value,
    label: t(`categories.${value}`),
  }))

  const interestOptions = INTEREST_AREAS.map((value) => ({
    value,
    label: t(`interests.${value}`),
  }))

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          {t('register.badge')}
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {t('register.title')}
        </h1>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        {toast && (
          <div className="mb-5">
            <Toast toast={displayToast} onDismiss={() => setToast(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Full name - two inputs, one logical field */}
          <div className="space-y-1.5">
            <span className="block text-sm font-medium text-slate-700">
              {t('fields.fullName')}
              <span className="ml-0.5 text-rose-500">*</span>
            </span>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                id="firstName"
                label={t('fields.firstName')}
                value={form.firstName}
                onChange={(value) => setField('firstName', value)}
                onBlur={() => handleBlur('firstName')}
                error={errorFor('firstName')}
                autoComplete="given-name"
                disabled={submitting}
              />
              <FormInput
                id="lastName"
                label={t('fields.lastName')}
                value={form.lastName}
                onChange={(value) => setField('lastName', value)}
                onBlur={() => handleBlur('lastName')}
                error={errorFor('lastName')}
                autoComplete="family-name"
                disabled={submitting}
              />
            </div>
          </div>

          <FormInput
            id="nic"
            label={t('fields.nic')}
            required
            value={form.nic}
            onChange={(value) => setField('nic', value)}
            onBlur={() => handleBlur('nic')}
            error={errorFor('nic')}
            hint={t('fields.nicHint')}
            placeholder="200012345678"
            disabled={submitting}
          />

          <FormInput
            id="email"
            label={t('fields.email')}
            type="email"
            value={form.email}
            onChange={(value) => setField('email', value)}
            onBlur={() => handleBlur('email')}
            error={errorFor('email')}
            hint={t('fields.emailHint')}
            placeholder="example@example.com"
            autoComplete="email"
            disabled={submitting}
          />

          <FormInput
            id="phone"
            label={t('fields.mobile')}
            required
            type="tel"
            value={form.phone}
            onChange={(value) => setField('phone', value)}
            onBlur={() => handleBlur('phone')}
            error={errorFor('phone')}
            hint={t('fields.mobileHint')}
            placeholder="0771234567"
            autoComplete="tel"
            disabled={submitting}
          />

          <FormInput
            id="organization"
            label={t('fields.organization')}
            value={form.organization}
            onChange={(value) => setField('organization', value)}
            onBlur={() => handleBlur('organization')}
            error={errorFor('organization')}
            autoComplete="organization"
            disabled={submitting}
          />

          <RadioGroup
            name="visitorCategory"
            label={t('fields.visitorCategory')}
            required
            options={categoryOptions}
            value={form.visitorCategory}
            onChange={(value) => {
              setField('visitorCategory', value)
              setTouched((current) => ({ ...current, visitorCategory: true }))
            }}
            error={errorFor('visitorCategory')}
            disabled={submitting}
          />

          <CheckboxGroup
            name="interestAreas"
            label={t('fields.interestArea')}
            hint={t('fields.interestAreaHint')}
            required
            options={interestOptions}
            values={form.interestAreas}
            onChange={(values) => {
              setField('interestAreas', values)
              setTouched((current) => ({ ...current, interestAreas: true }))
            }}
            error={errorFor('interestAreas')}
            disabled={submitting}
          />

          <FormInput
            id="heardFrom"
            label={t('fields.heardFrom')}
            value={form.heardFrom}
            onChange={(value) => setField('heardFrom', value)}
            onBlur={() => handleBlur('heardFrom')}
            error={errorFor('heardFrom')}
            disabled={submitting}
          />

          <label
            htmlFor="consent"
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 text-sm text-slate-700"
          >
            <input
              id="consent"
              type="checkbox"
              checked={form.consent}
              disabled={submitting}
              onChange={(event) => setField('consent', event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span>{t('fields.consent')}</span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <Spinner className="h-4 w-4" label={t('register.submitting')} />
            ) : (
              t('register.submit')
            )}
          </button>
        </form>
      </div>

    </div>
  )
}
