import { motion, AnimatePresence } from 'framer-motion';

export default function ExplainPopup({ open, onClose, aiResult, loading, error, query, onFollowUp }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 sm:p-4 backdrop-blur-sm sm:items-center sm:justify-end">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/30"
          />

          {/* Glassmorphic Explanation Panel */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative z-10 flex h-[75vh] w-full sm:h-[85vh] sm:w-full sm:max-w-xl flex-col rounded-t-3xl sm:rounded-[2rem] border border-white/40 bg-white/75 p-4 sm:p-6 shadow-soft backdrop-blur-2xl overflow-hidden"
          >
            {/* AI background video */}
            <video className="absolute inset-0 h-full w-full object-cover opacity-30" src="/ai-background.mp4" autoPlay muted loop playsInline />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(2,6,23,0.45)]" />
            
            {/* Header */}
            <div className="relative z-10 flex items-start justify-between border-b border-slate-200/50 pb-3 sm:pb-4">
              <div>
                <span className="inline-flex rounded-full bg-sky-500/10 px-2.5 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                  AI Context Assistant
                </span>
                <h2 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Concept doubt solver</h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-95"
              >
                ✕
              </button>
            </div>

            {/* Selected Text Highlight */}
            <div className="relative z-10 my-3 sm:my-4 rounded-2xl bg-sky-50/50 p-3 sm:p-4 border border-sky-100/50">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-sky-600 block mb-1">Highlighted text</span>
              <p className="text-xs sm:text-sm font-medium text-slate-800 italic leading-relaxed line-clamp-3">
                "{query || '—'}"
              </p>
            </div>

            {/* Demo mode badge */}
            {aiResult?._demo_mode && (
              <div className="relative z-10 mb-2 rounded-xl bg-amber-50 border border-amber-200/60 px-3 py-2 text-xs text-amber-700">
                <span className="font-semibold">⚡ Demo Mode</span> — Connect a valid OpenAI API key for real AI explanations.
              </div>
            )}

            {/* Content Body */}
            <div className="relative z-10 flex-1 overflow-y-auto pr-1 space-y-3 sm:space-y-4 scrollbar-thin">
              {loading ? (
                <div className="flex h-48 flex-col items-center justify-center gap-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
                  <p className="text-sm font-medium text-slate-500 animate-pulse">Consulting AI context solver...</p>
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 text-sm text-rose-700">
                  <p className="font-semibold">Request failed</p>
                  <p className="mt-1 text-rose-600">{typeof error === 'string' ? error : JSON.stringify(error)}</p>
                  <p className="mt-2 text-xs text-rose-500">Tip: Check that the backend server is running and your API key is valid.</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {/* Explanation card */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 sm:p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-sky-600">
                      <span className="text-lg">💡</span>
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Beginner-friendly explanation</h3>
                    </div>
                    <p className="mt-2 sm:mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-700">
                      {aiResult?.explanation || 'No explanation available.'}
                    </p>
                  </motion.div>

                  {/* Example card */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 sm:p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-cyan-600">
                      <span className="text-lg">🎯</span>
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Real-world example</h3>
                    </div>
                    <p className="mt-2 sm:mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-700">
                      {aiResult?.example || 'No example available.'}
                    </p>
                  </motion.div>

                  {/* Summary card */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 sm:p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-emerald-600">
                      <span className="text-lg">📝</span>
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Concise summary</h3>
                    </div>
                    <p className="mt-2 sm:mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-700 font-medium">
                      {aiResult?.summary || 'No summary available.'}
                    </p>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Footer banner */}
            <div className="relative z-10 mt-3 sm:mt-4 border-t border-slate-200/50 pt-2 sm:pt-3 text-center">
              <p className="text-[10px] sm:text-xs text-slate-400">You can select another sentence at any time to explain.</p>
              {aiResult?.follow_up_options ? (
                <div className="mt-2 sm:mt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  {aiResult.follow_up_options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => onFollowUp && onFollowUp(opt)}
                      className="rounded-full border border-slate-200 bg-white px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
