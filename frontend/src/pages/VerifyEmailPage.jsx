import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function VerifyEmailPage() {
  const { uid, token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${uid}/${token}/`);
        setMessage(res.data?.detail || 'Email verified successfully!');
        setStatus('success');
      } catch (err) {
        const detail = err?.response?.data?.detail;
        setMessage(detail || 'This verification link is invalid or has expired. Please register again.');
        setStatus('error');
      }
    };
    verify();
  }, [uid, token]);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />
      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card rounded-2xl sm:rounded-3xl p-8 shadow-glass text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse text-3xl">
                ✉️
              </div>
              <h1 className="text-2xl font-poppins font-bold text-white">Verifying your email…</h1>
              <p className="mt-2 text-sm text-white/60">Please wait a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl">
                ✅
              </div>
              <h1 className="text-2xl font-poppins font-bold text-white">Email Verified!</h1>
              <p className="mt-3 text-sm text-emerald-300">{message}</p>
              <Link
                to="/login"
                className="mt-6 inline-block rounded-full btn-gradient px-8 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Log In Now
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-3xl">
                ❌
              </div>
              <h1 className="text-2xl font-poppins font-bold text-white">Verification Failed</h1>
              <p className="mt-3 text-sm text-rose-300">{message}</p>
              <Link
                to="/register"
                className="mt-6 inline-block rounded-full btn-gradient px-8 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Register Again
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
