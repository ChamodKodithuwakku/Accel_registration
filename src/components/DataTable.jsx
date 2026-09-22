import Spinner from './Spinner'
import { useLanguage } from '../context/LanguageContext'

const columns = [
  { key: 'id', labelKey: 'table.id', sortable: true, className: 'w-14' },
  { key: 'fullName', labelKey: 'table.name', sortable: true },
  { key: 'nic', labelKey: 'table.nic', sortable: true },
  { key: 'phone', labelKey: 'table.mobile', sortable: false },
  { key: 'email', labelKey: 'table.email', sortable: false },
  { key: 'organization', labelKey: 'table.organization', sortable: false },
  { key: 'visitorCategory', labelKey: 'table.category', sortable: true },
  { key: 'interestAreas', labelKey: 'table.interests', sortable: false },
  { key: 'heardFrom', labelKey: 'table.heardFrom', sortable: false },
  { key: 'consent', labelKey: 'table.consent', sortable: false },
  { key: 'createdDate', labelKey: 'table.createdDate', sortable: true },
  { key: 'createdTime', labelKey: 'table.createdTime', sortable: false },
  { key: 'lastUpdated', labelKey: 'table.lastUpdated', sortable: false },
]

const categoryStyles = {
  Student: 'bg-brand-50 text-brand-700',
  SME: 'bg-emerald-50 text-emerald-700',
  Industry: 'bg-amber-50 text-amber-700',
  Other: 'bg-slate-100 text-slate-600',
}

function SortIcon({ active, direction }) {
  const classes = [
    'h-3.5 w-3.5 transition',
    active ? 'text-brand-600' : 'text-slate-300',
    active && direction === 'asc' ? 'rotate-180' : '',
  ].join(' ')

  return (
    <svg className={classes} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 15a.75.75 0 01-.55-.24l-4.25-4.5a.75.75 0 111.1-1.02L10 13.06l3.7-3.82a.75.75 0 111.1 1.02l-4.25 4.5A.75.75 0 0110 15z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function CategoryBadge({ value, t }) {
  if (!value) return <span className="text-slate-400">-</span>
  const style = categoryStyles[value] || categoryStyles.Other
  return (
    <span className={`whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ${style}`}>
      {t(`categories.${value}`)}
    </span>
  )
}

function InterestTags({ values, t }) {
  if (!values || !values.length) return <span className="text-slate-400">-</span>
  return (
    <div className="flex flex-wrap gap-1">
      {values.map((value) => (
        <span key={value} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
          {t(`interests.${value}`)}
        </span>
      ))}
    </div>
  )
}

function ActionButtons({ record, onEdit, onDelete, busyId, t }) {
  const busy = busyId === record.id

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onEdit(record)}
        disabled={busy}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M13.59 2.59a2 2 0 112.82 2.82l-.71.71-2.82-2.82.71-.71zM11.76 4.42l2.82 2.82-7.3 7.3a1 1 0 01-.45.26l-3.2.86a.5.5 0 01-.61-.61l.86-3.2a1 1 0 01.26-.45l7.62-6.98z" />
        </svg>
        {t('table.update')}
      </button>

      <button
        type="button"
        onClick={() => onDelete(record)}
        disabled={busy}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 shadow-sm transition hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50"
      >
        {busy ? (
          <Spinner className="h-3.5 w-3.5" />
        ) : (
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M8.75 2a.75.75 0 00-.75.75V3.5H4.75a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H12v-.75a.75.75 0 00-.75-.75h-2.5zM5.5 6.5h9l-.63 9.02a1.75 1.75 0 01-1.75 1.63H7.88a1.75 1.75 0 01-1.75-1.63L5.5 6.5z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {t('table.delete')}
      </button>
    </div>
  )
}

export default function DataTable({
  records,
  loading,
  error,
  onEdit,
  onDelete,
  onRetry,
  sort,
  onSortChange,
  busyId,
  hasFilter,
}) {
  const { t } = useLanguage()

  if (loading) {
    return (
      <div className="space-y-3 p-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-10 animate-pulse rounded-lg bg-slate-100" />
        ))}
        <p className="pt-2 text-center text-sm text-slate-500">
          <Spinner className="h-4 w-4 text-brand-600" label={t('states.loading')} />
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-6 py-14 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
          <svg className="h-6 w-6 text-rose-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="mt-3 text-sm font-semibold text-slate-900">{t('states.errorTitle')}</h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          {t('states.retry')}
        </button>
      </div>
    )
  }

  if (!records.length) {
    return (
      <div className="px-6 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <svg className="h-6 w-6 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm3 2.5a.75.75 0 000 1.5h8a.75.75 0 000-1.5H6zm0 3.5a.75.75 0 000 1.5h5a.75.75 0 000-1.5H6z" />
          </svg>
        </div>
        <h3 className="mt-3 text-sm font-semibold text-slate-900">
          {hasFilter ? t('states.noMatchTitle') : t('states.emptyTitle')}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {hasFilter ? t('states.noMatchBody') : t('states.emptyBody')}
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1400px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                    column.className || ''
                  }`}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSortChange(column.key)}
                      className="inline-flex items-center gap-1 transition hover:text-slate-800"
                    >
                      {t(column.labelKey)}
                      <SortIcon active={sort.key === column.key} direction={sort.direction} />
                    </button>
                  ) : (
                    t(column.labelKey)
                  )}
                </th>
              ))}
              <th
                scope="col"
                className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {t('table.actions')}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {records.map((record) => (
              <tr key={record.id} className="transition hover:bg-slate-50/70">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{record.id}</td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                  {record.fullName || `${record.firstName || ''} ${record.lastName || ''}`.trim()}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600">
                  {record.nic || '-'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  <a href={`tel:${record.phone}`} className="transition hover:text-brand-600">
                    {record.phone}
                  </a>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {record.email ? (
                    <a href={`mailto:${record.email}`} className="transition hover:text-brand-600">
                      {record.email}
                    </a>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{record.organization || '-'}</td>
                <td className="px-4 py-3">
                  <CategoryBadge value={record.visitorCategory} t={t} />
                </td>
                <td className="px-4 py-3">
                  <InterestTags values={record.interestAreas} t={t} />
                </td>
                <td className="px-4 py-3 text-slate-600">{record.heardFrom || '-'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                      record.consent ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {record.consent ? t('table.yes') : t('table.no')}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{record.createdDate || '-'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{record.createdTime || '-'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{record.lastUpdated || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <ActionButtons record={record} onEdit={onEdit} onDelete={onDelete} busyId={busyId} t={t} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet cards */}
      <ul className="divide-y divide-slate-100 lg:hidden">
        {records.map((record) => (
          <li key={record.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {record.fullName || `${record.firstName || ''} ${record.lastName || ''}`.trim()}
                </p>
                <p className="mt-0.5 font-mono text-xs text-slate-500">{record.nic}</p>
              </div>
              <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-500">
                #{record.id}
              </span>
            </div>

            <div className="mt-2">
              <CategoryBadge value={record.visitorCategory} t={t} />
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <dt className="text-slate-400">{t('table.mobile')}</dt>
                <dd className="mt-0.5 text-slate-700">{record.phone}</dd>
              </div>
              <div>
                <dt className="text-slate-400">{t('table.email')}</dt>
                <dd className="mt-0.5 truncate text-slate-700">{record.email || '-'}</dd>
              </div>
              <div>
                <dt className="text-slate-400">{t('table.organization')}</dt>
                <dd className="mt-0.5 text-slate-700">{record.organization || '-'}</dd>
              </div>
              <div>
                <dt className="text-slate-400">{t('table.consent')}</dt>
                <dd className="mt-0.5 text-slate-700">
                  {record.consent ? t('table.yes') : t('table.no')}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-slate-400">{t('table.interests')}</dt>
                <dd className="mt-1">
                  <InterestTags values={record.interestAreas} t={t} />
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-slate-400">{t('table.createdDate')}</dt>
                <dd className="mt-0.5 text-slate-700">
                  {record.createdDate || '-'} {record.createdTime}
                </dd>
              </div>
            </dl>

            <div className="mt-3">
              <ActionButtons record={record} onEdit={onEdit} onDelete={onDelete} busyId={busyId} t={t} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
