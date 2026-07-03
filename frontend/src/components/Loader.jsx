import { motion } from 'framer-motion';

export default function Loader({ label = 'Loading...' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-[200px] items-center justify-center rounded-2xl sm:rounded-3xl border border-white/10 glass-card p-8"
    >
      <div className="flex flex-col items-center gap-4 text-white">
        {/* Animated dolphin spinner */}
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-white/10" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-sky-500 animate-spin" />
          <div className="absolute inset-1 flex items-center justify-center text-lg">🐬</div>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white/80">{label}</p>
          <p className="text-xs text-white/40 mt-0.5">Please wait...</p>
        </div>
      </div>
    </motion.div>
  );
}
