export default function FeatureCard({ icon, title, description }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-soft backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600">{icon}</div>
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-slate-600">{description}</p>
    </div>
  );
}
