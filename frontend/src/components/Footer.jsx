import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-10 rounded-2xl sm:rounded-3xl border border-white/10 glass-card p-5 sm:p-8 text-white/70 shadow-glass">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white">SL</div>
            <p className="text-base font-semibold text-white">Smart Learning Portal</p>
          </div>
          <p className="text-sm text-white/50">A complete AI-enhanced LMS for modern learners.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-white/50">
          <Link to="/login" className="hover:text-white transition">Login</Link>
          <Link to="/register" className="hover:text-white transition">Register</Link>
          <Link to="/dashboard" className="hover:text-white transition">Dashboard</Link>
          <Link to="/achievements" className="hover:text-white transition">Achievements</Link>
          <Link to="/puzzles" className="hover:text-white transition">Puzzles</Link>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-white/8 text-xs text-white/30 text-center">
        © {new Date().getFullYear()} Smart Learning Portal. Powered by AI.
      </div>
    </footer>
  );
}
