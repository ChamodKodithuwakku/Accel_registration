export default function FormInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  type = 'text',
  placeholder,
  autoComplete = 'off',
  disabled = false,
  required = false,
}) {
  const invalid = Boolean(error)

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>

      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={[
          'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition',
          'placeholder:text-slate-400 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50',
          invalid
            ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
            : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100',
        ].join(' ')}
      />

      {invalid ? (
        <p id={`${id}-error`} className="flex items-center gap-1 text-xs font-medium text-rose-600">
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
