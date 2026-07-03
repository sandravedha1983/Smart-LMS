import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function MobileDrawer({ open, onClose, isAuthenticated, logout, profile }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50">
          <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="absolute right-0 top-0 h-full w-full max-w-xs bg-[rgba(2,6,23,0.96)] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold">SL</div>
                <div className="text-lg font-poppins font-semibold text-white">Smart Learning</div>
              </div>
              <button onClick={onClose} className="text-white">✕</button>
            </div>

            <nav className="mt-8 flex flex-col gap-4">
              <Link to="/" onClick={onClose} className="text-white font-medium hover:text-sky-400 transition">Home</Link>
              {isAuthenticated && (
                <>
                  <Link to="/dashboard" onClick={onClose} className="text-white font-medium hover:text-sky-400 transition">Dashboard</Link>
                  <Link to="/achievements" onClick={onClose} className="text-white font-medium hover:text-sky-400 transition">Achievements</Link>
                  <Link to="/puzzles" onClick={onClose} className="text-white font-medium hover:text-sky-400 transition">Puzzle Zone</Link>
                  {profile?.role === 'professor' && (
                    <Link to="/professor" onClick={onClose} className="text-sky-400 font-medium hover:text-sky-300 transition">Professor Portal</Link>
                  )}
                  {profile?.role === 'admin' && (
                    <Link to="/admin" onClick={onClose} className="text-sky-400 font-medium hover:text-sky-300 transition">Admin Portal</Link>
                  )}
                </>
              )}
            </nav>

            <div className="mt-8 border-t border-white/6 pt-6">
              {isAuthenticated ? (
                <>
                  <button onClick={() => { logout(); onClose(); }} className="w-full rounded-full btn-gradient px-4 py-3 text-white">Logout</button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/login" onClick={onClose} className="w-full rounded-full border border-[rgba(255,255,255,0.06)] px-4 py-3 text-center text-white">Login</Link>
                  <Link to="/register" onClick={onClose} className="w-full rounded-full btn-gradient px-4 py-3 text-center text-white">Register</Link>
                </div>
              )}
            </div>

            <p className="mt-6 text-sm text-[var(--text-secondary)]">Dolphy AI — Tap the mascot to get contextual help in lessons.</p>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
