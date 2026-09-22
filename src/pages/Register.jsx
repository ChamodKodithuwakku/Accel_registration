import { useState } from 'react'
import { Link } from 'react-router-dom'
import FormInput from '../components/FormInput'
import Spinner from '../components/Spinner'
import Toast from '../components/Toast'
import { addRecord } from '../services/api'
import { normalizePhone, validateForm, validateName, validatePhone, validateStudentId } from '../utils/validation'

const EMPTY_FORM = { name: '', studentId: '', phone: '' }
const FIELD_VALIDATORS = {
  name: validateName,
  studentId: validateStudentId,
  phone: validatePhone,
}

export default function Register() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    // Clear an error as soon as the user fixes the field.
    if (errors[field]) {
      const message = FIELD_VALIDATORS[field](value)
      setErrors((current) => ({ ...current, [field]: message }))
    }
  }

  function handleBlur(field) {
    setTouched((current) => ({ ...current, [field]: true }))
    setErrors((current) => ({ ...current, [field]: FIELD_VALIDATORS[field](form[field]) }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setToast(null)

    const { errors: nextErrors, isValid } = validateForm(form)
    setErrors(nextErrors)
    setTouched({ name: true, studentId: true, phone: true })

    if (!isValid) {
      setToast({ type: 'error', message: 'Please fix the highlighted fields before submitting.' })
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name: form.name.trim(),
        studentId: form.studentId.trim().toUpperCase(),
        phone: normalizePhone(form.phone),
      }
      const result = await addRecord(payload)

      setToast({ type: 'success', message: result.message || 'Registration submitted successfully.' })
      setForm(EMPTY_FORM)
      setErrors({})
      setTouched({})
    } catch (error) {
      setToast({ type: 'error', message: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          Registrations are open
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Registration Form</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Fill in your details below. Everything is saved straight into our Google Sheet.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        {toast && (
          <div className="mb-5">
            <Toast toast={toast} onDismiss={() => setToast(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <FormInput
            id="name"
            label="Name"
            required
            value={form.name}
            onChange={(value) => setField('name', value)}
            onBlur={() => handleBlur('name')}
            error={touched.name ? errors.name : ''}
            placeholder="Nimal Perera"
            autoComplete="name"
            disabled={submitting}
          />

          <FormInput
            id="studentId"
            label="Student ID"
            required
            value={form.studentId}
            onChange={(value) => setField('studentId', value)}
            onBlur={() => handleBlur('studentId')}
            error={touched.studentId ? errors.studentId : ''}
            hint="Your university or institute ID, e.g. IT001"
            placeholder="IT001"
            disabled={submitting}
          />

          <FormInput
            id="phone"
            label="Phone Number"
            required
            type="tel"
            value={form.phone}
            onChange={(value) => setField('phone', value)}
            onBlur={() => handleBlur('phone')}
            error={touched.phone ? errors.phone : ''}
            hint="Sri Lankan number, e.g. 0771234567 or +94771234567"
            placeholder="0771234567"
            autoComplete="tel"
            disabled={submitting}
          />

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? <Spinner className="h-4 w-4" label="Submitting..." /> : 'Submit'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Managing registrations?{' '}
        <Link to="/dashboard" className="font-medium text-brand-600 transition hover:text-brand-700">
          Open the dashboard
        </Link>
      </p>
    </div>
  )
}
