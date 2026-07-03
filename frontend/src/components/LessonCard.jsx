import { Link } from 'react-router-dom';

export default function LessonCard({ lesson }) {
  return (
    <Link
      to={`/lesson/${lesson.id}`}
      className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glass backdrop-blur-sm transition duration-200 hover:-translate-y-1 hover:border-sky-500/30 hover:bg-white/10 block"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{lesson.title}</h3>
          <p className="mt-2 text-sm text-white/50">Lesson {lesson.lesson_order || lesson.id}</p>
        </div>
        <span className="rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 px-3 py-1 text-sm font-semibold">Open</span>
      </div>
    </Link>
  );
}
