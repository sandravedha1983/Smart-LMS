import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CourseCard({ course }) {
  const completion = course.completion_percentage ?? 0;
  const isCompleted = completion >= 100;
  const isInProgress = completion > 0 && completion < 100;

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.22, type: 'spring', stiffness: 300 }}
      className="group overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 glass-card shadow-glass transition-all duration-300 hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)] hover:border-white/20 flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative h-36 sm:h-44 overflow-hidden bg-slate-800/60 shrink-0">
        {course.thumbnail ? (
          <img
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            src={course.thumbnail}
            alt={course.title}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl opacity-40">📚</span>
          </div>
        )}
        {/* Completion badge */}
        {isCompleted && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white shadow">
            ✓ Done
          </div>
        )}
        {isInProgress && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-sky-600/90 px-2.5 py-1 text-[10px] font-bold text-white shadow">
            ▶ In Progress
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <h3 className="text-base sm:text-lg font-semibold text-white leading-snug">{course.title || course.name}</h3>
        <p className="mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-white/55 line-clamp-2">
          {course.description || course.summary || 'No description available.'}
        </p>

        {/* Progress bar */}
        {completion !== undefined && (
          <div className="mt-3 sm:mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold text-white/50">
              <span>Completion</span>
              <span className={isCompleted ? 'text-emerald-400' : 'text-sky-400'}>
                {Math.round(completion)}%
              </span>
            </div>
            <div className="h-1.5 sm:h-2 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completion}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  isCompleted
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-sky-500 to-blue-500'
                }`}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 sm:pt-4 flex items-center justify-between gap-3 border-t border-white/8">
          <span className="rounded-full bg-white/8 border border-white/10 px-2.5 sm:px-3 py-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
            Course
          </span>
          <div className="flex items-center gap-3">
            {isCompleted && (
              <Link
                to={`/certificate/${course.id}`}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
              >
                🎓 Certificate
              </Link>
            )}
            <Link
              to={`/courses/${course.id}`}
              className="text-xs sm:text-sm font-bold text-sky-400 hover:text-sky-300 transition group-hover:underline"
            >
              View lessons →
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
