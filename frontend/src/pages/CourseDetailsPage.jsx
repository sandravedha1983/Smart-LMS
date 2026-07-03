import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCourseById } from '../services/courseService';
import Loader from '../components/Loader';
import LessonList from '../components/LessonList';

export default function CourseDetailsPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getCourseById(id);
        setCourse(data);
      } catch (err) {
        setError('Unable to load course details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  return (
    <section className="space-y-4 sm:space-y-6">
      {loading ? (
        <Loader label="Loading course details..." />
      ) : error ? (
        <div className="rounded-2xl sm:rounded-3xl border border-rose-500/30 bg-rose-500/10 p-4 sm:p-6 text-rose-300">{error}</div>
      ) : course ? (
        <>
          <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 shadow-glass backdrop-blur-md">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.5fr_1fr]">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-white leading-tight">{course.title || course.name}</h1>
                <p className="mt-3 sm:mt-4 text-sm text-white/70">{course.description || course.summary || 'Your course content is ready. Please select a lesson to continue.'}</p>
              </div>
              <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur-sm">
                <p className="text-xs sm:text-sm uppercase tracking-[0.24em] text-white/40">Lessons</p>
                <p className="mt-2 sm:mt-3 text-xl sm:text-2xl font-semibold text-white">{course.lessons?.length ?? course.lesson_set?.length ?? 0}</p>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-white/60">Follow each lesson to keep learning on track.</p>
              </div>
            </div>
          </div>
          <LessonList lessons={course.lessons || course.lesson_set || []} />
        </>
      ) : (
        <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 shadow-glass text-white/60">Course not found.</div>
      )}
    </section>
  );
}
