export default function RadioGroup({ name, label, options, value, onChange, error, required, disabled }) {
  return (
    <fieldset className="space-y-2" aria-invalid={Boolean(error)}>
      <legend className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </legend>

      <div className="space-y-2 pt-1">
        {options.map((option) => {
          const id = `${name}-${option.value}`
          const selected = value === option.value

          return (
            <label
              key={option.value}
              htmlFor={id}
              className={[
                'flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition',
                selected
                  ? 'border-brand-400 bg-brand-50/60 text-slate-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
                disabled ? 'cursor-not-allowed opacity-60' : '',
              ].join(' ')}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(option.value)}
                className="h-4 w-4 shrink-0 border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>{option.label}</span>
            </label>
          )
        })}
      </div>

      {error && (
        <p className="text-xs font-medium text-rose-600" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  )
}
