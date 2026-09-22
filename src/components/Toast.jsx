import { useEffect } from 'react'

const styles = {
  success: {
    wrap: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    icon: 'text-emerald-500',
    path: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.58 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z',
  },
  error: {
    wrap: 'border-rose-200 bg-rose-50 text-rose-800',
    icon: 'text-rose-500',
    path: 'M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z',
  },
  info: {
    wrap: 'border-brand-200 bg-brand-50 text-brand-800',
    icon: 'text-brand-500',
    path: 'M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 11-2 0 1 1 0 012 0zm-2 3a1 1 0 012 0v4a1 1 0 11-2 0v-4z',
  },
}

export default function Toast({ toast, onDismiss, autoHideMs = 4500 }) {
  useEffect(() => {
    if (!toast || toast.type === 'error') return undefined
    const timer = setTimeout(() => onDismiss?.(), autoHideMs)
    return () => clearTimeout(timer)
  }, [toast, onDismiss, autoHideMs])

  if (!toast) return null

  const style = styles[toast.type] || styles.info

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex animate-slide-in items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm ${style.wrap}`}
    >
      <svg className={`mt-0.5 h-5 w-5 shrink-0 ${style.icon}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d={style.path} clipRule="evenodd" />
      </svg>
      <p className="flex-1 font-medium">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="-mr-1 shrink-0 rounded-md p-1 opacity-60 transition hover:opacity-100"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  )
}
