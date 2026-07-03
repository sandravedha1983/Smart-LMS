import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from '../components/AuthForm';

export default function RegisterPage() {
  const { register, loading, error } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'student' });
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    setSuccess('');
    try {
      await register(form);
      setSuccess('Registration successful. Please log in.');
    } catch (err) {
      setServerError(
        err?.response?.data?.username?.[0] ||
        err?.response?.data?.email?.[0] ||
        err?.response?.data?.password?.[0] ||
        'Registration failed. Please try again.'
      );
    }
  };

  return (
    // Uses global video background from App.jsx
    <div className="relative min-h-screen flex items-center justify-center px-4 pt-20 md:pt-24 pb-8">
      {/* Local darker overlay for readability */}
      <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md py-6">
        <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-glass">
          {/* Brand header */}
          <div className="mb-6 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white text-xl font-bold shadow-glow mb-4">
              SL
            </div>
            <h1 className="text-2xl sm:text-3xl font-poppins font-extrabold text-white">Create account</h1>
            <p className="mt-2 text-sm text-white/60">Join Smart Learning and start your AI-powered journey.</p>
          </div>

          {success && (
            <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {success}
            </div>
          )}

          <AuthForm
            title=""
            description=""
            fields={[
              {
                name: 'username',
                label: 'Username',
                inputProps: { placeholder: 'Choose a username', required: true }
              },
              {
                name: 'email',
                label: 'Email',
                inputProps: { type: 'email', placeholder: 'you@example.com', required: true }
              },
              {
                name: 'password',
                label: 'Password',
                inputProps: { type: 'password', placeholder: 'Create a strong password', required: true }
              },
              {
                name: 'role',
                label: 'Join as',
                type: 'select',
                options: [
                  { value: 'student', label: 'Student (Instant access)' },
                  { value: 'professor', label: 'Professor (Requires admin approval)' }
                ]
              }
            ]}
            formState={form}
            onChange={handleChange}
            onSubmit={handleSubmit}
            buttonLabel={loading ? 'Creating account...' : 'Create Account'}
            errorMessage={serverError || error}
            helperText={
              <span className="text-white/60">
                Already a member?{' '}
                <Link to="/login" className="font-semibold text-sky-400 hover:text-sky-300 hover:underline transition">
                  Sign in
                </Link>
              </span>
            }
          />
        </div>
      </div>
    </div>
  );
}
