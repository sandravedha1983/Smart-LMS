import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from '../components/AuthForm';

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [serverError, setServerError] = useState('');

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    try {
      await login(form);
    } catch (err) {
      const errMessage = err?.response?.data?.detail || 
        err?.response?.data?.non_field_errors?.[0] || 
        (err.response ? 'Invalid username or password.' : `Network Error: ${err.message}`);
      setServerError(errMessage);
    }
  };

  return (
    // Takes full viewport — the global video background shows through
    <div className="relative min-h-screen flex items-center justify-center px-4 pt-20 md:pt-24 pb-8">
      {/* Local darker overlay for login for extra readability */}
      <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md py-8">
        <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-glass">
          {/* Logo / Brand */}
          <div className="mb-6 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white text-xl font-bold shadow-glow mb-4">
              SL
            </div>
            <h1 className="text-2xl sm:text-3xl font-poppins font-extrabold text-white">Welcome back</h1>
            <p className="mt-2 text-sm text-white/60">Sign in to continue your learning journey.</p>
          </div>

          <AuthForm
            title=""
            description=""
            fields={[
              {
                name: 'username',
                label: 'Username',
                inputProps: { placeholder: 'Enter your username', required: true }
              },
              {
                name: 'password',
                label: 'Password',
                inputProps: { type: 'password', placeholder: 'Enter your password', required: true }
              }
            ]}
            formState={form}
            onChange={handleChange}
            onSubmit={handleSubmit}
            buttonLabel={loading ? 'Signing in...' : 'Sign in'}
            errorMessage={serverError || error}
            helperText={
              <span className="text-white/60">
                New here?{' '}
                <Link to="/register" className="font-semibold text-sky-400 hover:text-sky-300 hover:underline transition">
                  Create an account
                </Link>
              </span>
            }
          />
        </div>
      </div>
    </div>
  );
}
