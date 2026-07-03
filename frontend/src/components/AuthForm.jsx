export default function AuthForm({ title, description, fields, formState, onChange, onSubmit, buttonLabel, errorMessage, helperText }) {
  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        {title ? <h1 className="text-2xl font-poppins font-extrabold text-white">{title}</h1> : null}
        {description ? <p className="mt-2 text-sm text-white/60">{description}</p> : null}
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="mb-2 block text-sm font-semibold text-white/80">{field.label}</label>
            {field.type === 'select' ? (
              <select
                name={field.name}
                value={formState[field.name] ?? ''}
                onChange={onChange}
                className="w-full rounded-2xl border border-white/15 bg-slate-900/90 px-4 py-3 text-white transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/20 backdrop-blur-sm cursor-pointer"
              >
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                {...field.inputProps}
                name={field.name}
                value={formState[field.name] ?? ''}
                onChange={onChange}
                className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 transition focus:border-sky-400/70 focus:bg-white/12 focus:ring-2 focus:ring-sky-400/20 backdrop-blur-sm"
              />
            )}
          </div>
        ))}
        {errorMessage ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {errorMessage}
          </div>
        ) : null}
        <button
          type="submit"
          className="mt-2 w-full rounded-2xl px-5 py-3 text-white font-semibold btn-gradient transition-transform hover:-translate-y-0.5 active:scale-95 shadow-glow"
        >
          {buttonLabel}
        </button>
      </form>
      {helperText ? (
        <p className="mt-5 text-center text-sm text-white/60">{helperText}</p>
      ) : null}
    </div>
  );
}
