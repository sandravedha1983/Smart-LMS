import { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';
import { useAuth } from '../contexts/AuthContext';

export default function AchievementDashboardPage() {
  const { profile } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const res = await api.get('/achievements/');
        setAchievements(res.data?.results || res.data || []);
      } catch (err) {
        setError('Failed to load achievements.');
      } finally {
        setLoading(false);
      }
    };
    loadAchievements();
  }, []);

  return (
    <section className="space-y-5 sm:space-y-8">
      <div className="rounded-2xl sm:rounded-[2rem] border border-white/10 bg-white/5 p-4 sm:p-8 shadow-glass backdrop-blur-md">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start justify-between mb-5 sm:mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Achievements</h1>
            <p className="mt-1.5 sm:mt-2 text-sm text-white/60">Track your progress and unlock badges as you earn XP.</p>
          </div>
          <div className="flex flex-col items-center sm:items-end">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-white/40">Total XP</span>
            <span className="text-3xl sm:text-4xl font-extrabold text-sky-400">{profile?.points || 0}</span>
          </div>
        </div>

        {loading ? (
          <Loader label="Loading achievements..." />
        ) : error ? (
          <p className="text-rose-400 text-sm">{error}</p>
        ) : achievements.length === 0 ? (
          <div className="rounded-2xl sm:rounded-3xl border-2 border-dashed border-white/15 p-8 sm:p-12 text-center bg-white/3 space-y-3">
            <p className="text-4xl">🏆</p>
            <p className="font-semibold text-white/80">No achievements yet</p>
            <p className="text-sm text-white/50">Complete lessons and puzzles to earn XP and unlock badges!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 flex flex-col items-center text-center shadow-glass relative overflow-hidden group hover:scale-[1.02] transition-transform backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-sky-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <img
                  src={item.achievement.badge_icon_url || 'https://via.placeholder.com/100'}
                  alt={item.achievement.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 mb-3 sm:mb-4 object-contain drop-shadow-md z-10"
                />
                <h3 className="text-lg sm:text-xl font-bold text-white z-10">{item.achievement.title}</h3>
                <p className="text-xs sm:text-sm text-white/70 mt-1.5 sm:mt-2 flex-1 z-10">{item.achievement.description}</p>
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10 w-full z-10">
                  <span className="text-[10px] sm:text-xs font-semibold text-sky-400 uppercase tracking-widest">Unlocked</span>
                  <p className="text-[10px] sm:text-xs text-white/40 mt-0.5">{new Date(item.unlocked_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
