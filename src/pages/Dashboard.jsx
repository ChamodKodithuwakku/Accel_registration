import { useCallback, useEffect, useMemo, useState } from 'react'
import CheckboxGroup from '../components/CheckboxGroup'
import DataTable from '../components/DataTable'
import FormInput from '../components/FormInput'
import Modal from '../components/Modal'
import RadioGroup from '../components/RadioGroup'
import Spinner from '../components/Spinner'
import Toast from '../components/Toast'
import { useLanguage } from '../context/LanguageContext'
import { INTEREST_AREAS, VISITOR_CATEGORIES } from '../i18n/translations'
import { deleteRecord, getRecords, updateRecord } from '../services/api'
import { FIELD_VALIDATORS, toPayload, validateForm } from '../utils/validation'

function sortValue(record, key) {
  if (key === 'id') return Number(record.id) || 0
  if (key === 'createdDate') return `${record.createdDate || ''} ${record.createdTime || ''}`.trim()
  if (key === 'fullName') {
    return String(record.fullName || `${record.firstName || ''} ${record.lastName || ''}`)
      .trim()
      .toLowerCase()
  }
  return String(record[key] || '').toLowerCase()
}

function StatCard({ label, value, hint, accent = 'brand' }) {
  const accents = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    slate: 'bg-slate-100 text-slate-600',
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accents[accent]}`}>
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 8a7 7 0 1114 0H3z" />
          </svg>
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-1 truncate text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { t } = useLanguage()

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [toast, setToast] = useState(null)

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ key: 'id', direction: 'desc' })

  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [editErrors, setEditErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const [deleting, setDeleting] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const loadRecords = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    setLoadError('')
    try {
      const data = await getRecords()
      setRecords(data)
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  const visibleRecords = useMemo(() => {
    const term = search.trim().toLowerCase()

    const filtered = term
      ? records.filter((record) =>
          [
            record.fullName,
            record.firstName,
            record.lastName,
            record.nic,
            record.phone,
            record.email,
            record.organization,
            String(record.id),
          ]
            .join(' ')
            .toLowerCase()
            .includes(term)
        )
      : records

    return [...filtered].sort((a, b) => {
      const left = sortValue(a, sort.key)
      const right = sortValue(b, sort.key)
      if (left < right) return sort.direction === 'asc' ? -1 : 1
      if (left > right) return sort.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [records, search, sort])

  const todayCount = useMemo(() => {
    const today = new Date()
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`
    return records.filter((record) => record.createdDate === iso).length
  }, [records])

  function handleSortChange(key) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: key === 'id' || key === 'createdDate' ? 'desc' : 'asc' }
    )
  }

  function openEdit(record) {
    setEditing(record)
    setEditForm({
      firstName: record.firstName || '',
      lastName: record.lastName || '',
      nic: record.nic || '',
      email: record.email || '',
      phone: record.phone || '',
      organization: record.organization || '',
      visitorCategory: record.visitorCategory || '',
      interestAreas: Array.isArray(record.interestAreas) ? record.interestAreas : [],
      heardFrom: record.heardFrom || '',
      consent: Boolean(record.consent),
    })
    setEditErrors({})
  }

  function closeEdit() {
    if (saving) return
    setEditing(null)
    setEditForm(null)
  }

  function setEditField(field, value) {
    setEditForm((current) => ({ ...current, [field]: value }))
    if (editErrors[field]) {
      setEditErrors((current) => ({ ...current, [field]: FIELD_VALIDATORS[field]?.(value) || '' }))
    }
  }

  const editErrorFor = (field) => (editErrors[field] ? t(editErrors[field]) : '')

  const displayToast = toast
    ? { type: toast.type, message: toast.key ? t(toast.key) : toast.message }
    : null

  async function handleUpdate(event) {
    event.preventDefault()

    const { errors, isValid } = validateForm(editForm)
    setEditErrors(errors)
    if (!isValid) return

    setSaving(true)
    try {
      await updateRecord({ id: editing.id, ...toPayload(editForm) })
      setEditing(null)
      setEditForm(null)
      setToast({ type: 'success', key: 'dashboard.updated' })
      await loadRecords({ silent: true })
    } catch (error) {
      setToast({ type: 'error', message: error.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    const record = deleting
    setBusyId(record.id)
    try {
      await deleteRecord(record.id)
      setDeleting(null)
      setToast({ type: 'success', key: 'dashboard.deleted' })
      await loadRecords({ silent: true })
    } catch (error) {
      setToast({ type: 'error', message: error.message })
    } finally {
      setBusyId(null)
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {t('dashboard.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{t('dashboard.subtitle')}</p>
        </div>

        <button
          type="button"
          onClick={() => loadRecords()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 sm:self-auto"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M4.5 10a5.5 5.5 0 019.4-3.9l1.1-1.1V8.5h-3.6l1.3-1.3A4 4 0 006 10H4.5zm11 0a5.5 5.5 0 01-9.4 3.9L5 15v-3.5h3.6l-1.3 1.3A4 4 0 0014 10h1.5z"
              clipRule="evenodd"
            />
          </svg>
          {t('dashboard.refresh')}
        </button>
      </div>

      {toast && (
        <div className="mt-5">
          <Toast toast={displayToast} onDismiss={() => setToast(null)} />
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t('dashboard.totalLabel')}
          value={loading ? '-' : records.length}
          hint={t('dashboard.totalHint')}
        />
        <StatCard
          label={t('dashboard.todayLabel')}
          value={loading ? '-' : todayCount}
          hint={t('dashboard.todayHint')}
          accent="emerald"
        />
        <StatCard
          label={t('dashboard.showingLabel')}
          value={loading ? '-' : visibleRecords.length}
          hint={search ? `${t('dashboard.filteredBy')}: ${search}` : t('dashboard.noFilter')}
          accent="slate"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="relative w-full sm:max-w-xs">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 103.4 9.83l3.14 3.13a.75.75 0 101.06-1.06l-3.13-3.14A5.5 5.5 0 009 3.5zM5 9a4 4 0 118 0 4 4 0 01-8 0z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('dashboard.searchPlaceholder')}
              aria-label={t('dashboard.searchLabel')}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-500">
            <span className="whitespace-nowrap">{t('dashboard.sortBy')}</span>
            <select
              value={`${sort.key}:${sort.direction}`}
              onChange={(event) => {
                const [key, direction] = event.target.value.split(':')
                setSort({ key, direction })
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
            >
              <option value="id:desc">{t('dashboard.sortLatest')}</option>
              <option value="id:asc">{t('dashboard.sortOldest')}</option>
              <option value="fullName:asc">{t('dashboard.sortNameAsc')}</option>
              <option value="fullName:desc">{t('dashboard.sortNameDesc')}</option>
              <option value="visitorCategory:asc">{t('dashboard.sortCategory')}</option>
              <option value="createdDate:desc">{t('dashboard.sortCreated')}</option>
            </select>
          </label>
        </div>

        <DataTable
          records={visibleRecords}
          loading={loading}
          error={loadError}
          onRetry={() => loadRecords()}
          onEdit={openEdit}
          onDelete={setDeleting}
          sort={sort}
          onSortChange={handleSortChange}
          busyId={busyId}
          hasFilter={Boolean(search.trim())}
        />
      </div>

      {/* Update modal */}
      <Modal
        open={Boolean(editing && editForm)}
        size="lg"
        title={t('dashboard.updateTitle')}
        description={editing ? `${t('dashboard.editingRecord')} #${editing.id}` : ''}
        onClose={closeEdit}
        footer={
          <>
            <button
              type="button"
              onClick={closeEdit}
              disabled={saving}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {t('dashboard.cancel')}
            </button>
            <button
              type="submit"
              form="edit-record-form"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70"
            >
              {saving ? <Spinner className="h-4 w-4" label={t('dashboard.saving')} /> : t('dashboard.save')}
            </button>
          </>
        }
      >
        {editForm && (
          <form id="edit-record-form" onSubmit={handleUpdate} noValidate className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                id="edit-firstName"
                label={t('fields.firstName')}
                required
                value={editForm.firstName}
                onChange={(value) => setEditField('firstName', value)}
                error={editErrorFor('firstName')}
                disabled={saving}
              />
              <FormInput
                id="edit-lastName"
                label={t('fields.lastName')}
                required
                value={editForm.lastName}
                onChange={(value) => setEditField('lastName', value)}
                error={editErrorFor('lastName')}
                disabled={saving}
              />
            </div>

            <FormInput
              id="edit-nic"
              label={t('fields.nic')}
              required
              value={editForm.nic}
              onChange={(value) => setEditField('nic', value)}
              error={editErrorFor('nic')}
              disabled={saving}
            />

            <FormInput
              id="edit-email"
              label={t('fields.email')}
              type="email"
              value={editForm.email}
              onChange={(value) => setEditField('email', value)}
              error={editErrorFor('email')}
              disabled={saving}
            />

            <FormInput
              id="edit-phone"
              label={t('fields.mobile')}
              required
              type="tel"
              value={editForm.phone}
              onChange={(value) => setEditField('phone', value)}
              error={editErrorFor('phone')}
              disabled={saving}
            />

            <FormInput
              id="edit-organization"
              label={t('fields.organization')}
              value={editForm.organization}
              onChange={(value) => setEditField('organization', value)}
              error={editErrorFor('organization')}
              disabled={saving}
            />

            <RadioGroup
              name="edit-visitorCategory"
              label={t('fields.visitorCategory')}
              required
              options={categoryOptions}
              value={editForm.visitorCategory}
              onChange={(value) => setEditField('visitorCategory', value)}
              error={editErrorFor('visitorCategory')}
              disabled={saving}
            />

            <CheckboxGroup
              name="edit-interestAreas"
              label={t('fields.interestArea')}
              hint={t('fields.interestAreaHint')}
              required
              options={interestOptions}
              values={editForm.interestAreas}
              onChange={(values) => setEditField('interestAreas', values)}
              error={editErrorFor('interestAreas')}
              disabled={saving}
            />

            <FormInput
              id="edit-heardFrom"
              label={t('fields.heardFrom')}
              value={editForm.heardFrom}
              onChange={(value) => setEditField('heardFrom', value)}
              error={editErrorFor('heardFrom')}
              disabled={saving}
            />

            <label
              htmlFor="edit-consent"
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 text-sm text-slate-700"
            >
              <input
                id="edit-consent"
                type="checkbox"
                checked={editForm.consent}
                disabled={saving}
                onChange={(event) => setEditField('consent', event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>{t('fields.consent')}</span>
            </label>
          </form>
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={Boolean(deleting)}
        size="sm"
        title={t('dashboard.deleteTitle')}
        onClose={() => (busyId ? null : setDeleting(null))}
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleting(null)}
              disabled={Boolean(busyId)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {t('dashboard.cancel')}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={Boolean(busyId)}
              className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-70"
            >
              {busyId ? (
                <Spinner className="h-4 w-4" label={t('dashboard.deleting')} />
              ) : (
                t('dashboard.deleteButton')
              )}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          {t('dashboard.deleteWarningBefore')}{' '}
          <span className="font-semibold text-slate-900">
            {deleting?.fullName || `${deleting?.firstName || ''} ${deleting?.lastName || ''}`.trim()}
          </span>{' '}
          ({deleting?.nic}) {t('dashboard.deleteWarningAfter')}
        </p>
      </Modal>
    </div>
  )
}
