import { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';

export default function AdminDashboardPage() {
  const [requests, setRequests] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [reqRes, statRes] = await Promise.all([
          api.get('/auth/professor-requests/'),
          api.get('/admin/analytics/')
        ]);
        setRequests(reqRes.data || []);
        setAnalytics(statRes.data || null);
      } catch (err) {
        setError('Unable to load admin data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const approveProfessor = async (profileId) => {
    try {
      await api.post(`/auth/professor-requests/${profileId}/approve/`);
      setRequests((current) => current.filter((item) => item.id !== profileId));
    } catch (err) {
      setError('Unable to approve the professor request at this time.');
    }
  };

  return (
    <section className="space-y-8">
      <div className="rounded-2xl sm:rounded-[2rem] glass-card p-4 sm:p-8 shadow-glass">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="mt-2 text-white/60">Monitor platform health, AI usage, and approve professors.</p>
        </div>

        {analytics && (
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Users', value: analytics.total_users },
              { label: 'Total Courses', value: analytics.total_courses },
              { label: 'Total Lessons', value: analytics.total_lessons },
              { label: 'Quizzes Built', value: analytics.total_quizzes },
              { label: 'AI Interactions', value: analytics.total_ai_interactions },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
                <p className="text-2xl font-bold text-indigo-400">{stat.value}</p>
                <p className="text-xs uppercase tracking-wider text-white/50 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white">Professor approval queue</h2>
          {loading ? (
            <Loader label="Loading approval queue..." />
          ) : error ? (
            <p className="mt-4 text-rose-400">{error}</p>
          ) : !requests.length ? (
            <p className="mt-4 text-white/60">No pending professor requests at the moment.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {requests.map((item) => (
                <div key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">{item.username || 'Professor Request'}</p>
                      <p className="text-sm text-white/50">{item.email} | Language: {item.preferred_language}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => approveProfessor(item.id)}
                      className="rounded-3xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 active:scale-95"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
