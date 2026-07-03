import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import MobileDrawer from './MobileDrawer';

export default function Navbar() {
  const { isAuthenticated, logout, profile } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-[rgba(255,255,255,0.04)] bg-[rgba(2,6,23,0.36)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-3 text-white">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold">SL</div>
          <span className="text-lg font-poppins font-semibold">Smart Learning</span>
        </Link>
        <nav className="hidden items-center gap-3 text-[var(--text-secondary)] md:flex">
          <Link className="text-sm font-medium transition hover:text-white" to="/">
            Home
          </Link>
          {isAuthenticated ? (
            <>
              <Link className="rounded-full border border-[rgba(255,255,255,0.06)] px-4 py-2 text-sm font-medium transition hover:bg-white/5" to="/dashboard">
                Dashboard
              </Link>
              <Link className="rounded-full border border-[rgba(255,255,255,0.06)] px-4 py-2 text-sm font-medium transition hover:bg-white/5" to="/achievements">
                Achievements
              </Link>
              <Link className="rounded-full border border-[rgba(255,255,255,0.06)] px-4 py-2 text-sm font-medium transition hover:bg-white/5" to="/puzzles">
                Puzzles
              </Link>
              {profile?.role === 'professor' && (
                <Link className="rounded-full border border-sky-500/25 px-4 py-2 text-sm font-medium text-sky-400 transition hover:bg-sky-500/10" to="/professor">
                  Professor Portal
                </Link>
              )}
              {profile?.role === 'admin' && (
                <Link className="rounded-full border border-sky-500/25 px-4 py-2 text-sm font-medium text-sky-400 transition hover:bg-sky-500/10" to="/admin">
                  Admin Portal
                </Link>
              )}
              <button onClick={logout} className="rounded-full btn-gradient px-4 py-2 text-sm font-medium text-white transition hover:opacity-95">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="rounded-full border border-[rgba(255,255,255,0.06)] px-4 py-2 text-sm font-medium transition hover:bg-white/5" to="/login">
                Login
              </Link>
              <Link className="rounded-full btn-gradient px-4 py-2 text-sm font-medium text-white transition hover:opacity-95" to="/register">
                Register
              </Link>
            </>
          )}
        </nav>
        <div className="md:hidden">
          <button onClick={() => setOpen(true)} className="rounded-full bg-white/6 p-2 text-white">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
      <MobileDrawer open={open} onClose={() => setOpen(false)} isAuthenticated={isAuthenticated} logout={logout} profile={profile} />
    </header>
  );
}
