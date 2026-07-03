import { useEffect, useState, useMemo } from 'react';
import { getCourses } from '../services/courseService';
import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';

export default function DashboardPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getCourses(debouncedSearch);
        setCourses(data || []);
      } catch (err) {
        setError('Unable to load courses. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [debouncedSearch]);

  const stats = useMemo(() => {
    const courseArray = courses ?? [];
    if (!courseArray.length) return { total: 0, completed: 0, active: 0 };
    const total = courseArray.length;
    const completed = courseArray.filter(c => c?.completion_percentage === 100).length;
    const active = courseArray.filter(c => c?.completion_percentage > 0 && c?.completion_percentage < 100).length;
    return { total, completed, active };
  }, [courses]);

  return (
    <section className="space-y-5 sm:space-y-8">
      {/* Premium Dashboard Banner — glassmorphic over global video */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] glass-card px-4 sm:px-6 py-6 sm:py-10 text-white shadow-glass md:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.18),_transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(6,182,212,0.12),_transparent_40%)]" />
        
        <div className="relative flex flex-col gap-5 sm:gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex rounded-full bg-sky-500/20 px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
              Welcome back
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight lg:text-4xl text-white">Student Dashboard</h1>
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
              Track your course progress, watch lessons, and clear doubts in real-time with our context-aware AI learning companion.
            </p>
          </div>
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-2 sm:p-4 text-center backdrop-blur-md">
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-sky-400">{stats.total}</p>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/50 mt-1 font-semibold">Courses</p>
            </div>
            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-2 sm:p-4 text-center backdrop-blur-md">
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-400">{stats.completed}</p>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/50 mt-1 font-semibold">Completed</p>
            </div>
            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-2 sm:p-4 text-center backdrop-blur-md">
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-amber-400">{stats.active}</p>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/50 mt-1 font-semibold">In Progress</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search courses by title or description..."
            className="w-full rounded-xl sm:rounded-2xl border border-white/10 bg-white/8 py-2.5 sm:py-3 pl-10 sm:pl-12 pr-4 text-xs sm:text-sm text-white placeholder:text-white/40 outline-none transition focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20 backdrop-blur-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Loader label="Fetching courses..." />
      ) : error ? (
        <div className="rounded-2xl sm:rounded-3xl border border-rose-500/30 bg-rose-500/10 p-4 sm:p-6 text-rose-300 backdrop-blur-sm">{error}</div>
      ) : !courses?.length ? (
        <div className="rounded-2xl sm:rounded-3xl border border-white/10 glass-card p-6 sm:p-10 text-center">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-white/80 font-semibold">No courses yet</p>
          <p className="text-white/50 text-sm mt-1">Check back later or ask your professor to add courses.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {courses?.map((course) => (
            <CourseCard key={course?.id} course={course} />
          ))}
        </div>
      )}
    </section>
  );
}
