import LessonCard from './LessonCard';

export default function LessonList({ lessons }) {
  if (!lessons || lessons.length === 0) {
    return <p className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/50 shadow-glass backdrop-blur-sm">No lessons found for this course yet.</p>;
  }

  return (
    <div className="grid gap-4">
      {lessons.map((lesson) => (
        <LessonCard key={lesson.id} lesson={lesson} />
      ))}
    </div>
  );
}
