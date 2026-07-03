export default function Sidebar({ title, items }) {
  return (
    <aside className="space-y-4 rounded-2xl sm:rounded-3xl border border-white/10 glass-card p-4 sm:p-6 shadow-glass">
      <h2 className="text-lg sm:text-xl font-semibold text-white">{title}</h2>
      <div className="space-y-3">
        {items?.map((item) => (
          <div key={item.label} className="rounded-xl sm:rounded-2xl bg-white/5 border border-white/8 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-white/50">{item.label}</p>
            <p className="mt-1 text-sm sm:text-base font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
