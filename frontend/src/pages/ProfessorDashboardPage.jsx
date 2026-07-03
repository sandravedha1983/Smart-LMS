import { useEffect, useState, useCallback } from 'react';
import Loader from '../components/Loader';
import {
  getOwnedCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonQuiz,
} from '../services/courseService';
import {
  addQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
} from '../services/quizService';

// ─── tiny helpers ──────────────────────────────────────────────
const inputCls =
  'w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white/12 backdrop-blur-sm transition';

const btnPrimary =
  'inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 transition active:scale-[0.98] shadow-glow';

const btnDanger =
  'inline-flex items-center justify-center rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 transition active:scale-[0.98]';

const btnGhost =
  'inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition active:scale-[0.98]';

// ─── MODAL WRAPPER ─────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-white/15 shadow-2xl p-5 sm:p-8 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto scrollbar-thin text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── QUIZ MANAGER ──────────────────────────────────────────────
function QuizManager({ lesson, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLessonQuiz(lesson.id);
      setQuestions(Array.isArray(data) ? data : data.results ?? []);
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [lesson.id]);

  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  const resetForm = () => {
    setForm({ question: '', options: ['', '', '', ''], correct_answer: '', explanation: '' });
    setEditingId(null);
    setError('');
  };

  const startEdit = (q) => {
    setEditingId(q.id);
    setForm({
      question: q.question,
      options: q.options.length === 4 ? q.options : [...q.options, '', '', '', ''].slice(0, 4),
      correct_answer: q.correct_answer,
      explanation: q.explanation || '',
    });
  };

  const handleOptionChange = (idx, val) => {
    setForm((f) => {
      const opts = [...f.options];
      opts[idx] = val;
      return { ...f, options: opts };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.correct_answer) {
      setError('Please set the correct answer to one of the option values.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        question: form.question,
        options: form.options.filter(Boolean),
        correct_answer: form.correct_answer,
        explanation: form.explanation,
      };
      if (editingId) {
        const updated = await updateQuizQuestion(editingId, payload);
        setQuestions((qs) => qs.map((q) => (q.id === editingId ? updated : q)));
      } else {
        const created = await addQuizQuestion(lesson.id, payload);
        setQuestions((qs) => [...qs, created]);
      }
      resetForm();
    } catch {
      setError('Failed to save question. Please check your values.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    await deleteQuizQuestion(id);
    setQuestions((qs) => qs.filter((q) => q.id !== id));
  };

  return (
    <Modal title={`Quiz · ${lesson.title}`} onClose={onClose}>
      {loading ? (
        <Loader label="Loading questions…" />
      ) : (
        <div className="space-y-4">
          {questions.length === 0 && (
            <p className="text-sm text-white/50">No questions yet. Add your first one below.</p>
          )}
          {questions.map((q, i) => (
            <div key={q.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1">
              <p className="text-sm font-semibold text-white">Q{i + 1}. {q.question}</p>
              <ul className="pl-4 text-xs text-white/70 space-y-0.5">
                {q.options.map((o, oi) => (
                  <li key={oi} className={o === q.correct_answer ? 'font-bold text-emerald-400' : ''}>
                    {o === q.correct_answer ? '✓ ' : '• '}{o}
                  </li>
                ))}
              </ul>
              {q.explanation && <p className="text-xs text-white/50 italic">{q.explanation}</p>}
              <div className="flex gap-2 pt-1">
                <button onClick={() => startEdit(q)} className={btnGhost + ' text-xs px-3 py-1'}>Edit</button>
                <button onClick={() => handleDelete(q.id)} className={btnDanger + ' text-xs px-3 py-1'}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <hr className="border-white/10" />
      <h3 className="font-semibold text-white">{editingId ? 'Edit Question' : 'Add Question'}</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className={inputCls}
          placeholder="Question text"
          value={form.question}
          onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
          required
        />
        <div className="space-y-2">
          {form.options.map((opt, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                className={inputCls}
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
              />
              <button
                type="button"
                title="Set as correct answer"
                onClick={() => setForm((f) => ({ ...f, correct_answer: opt }))}
                className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition ${
                  form.correct_answer === opt && opt
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/5 text-white/50 hover:bg-emerald-500/20 hover:text-emerald-300'
                }`}
              >
                ✓
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/40">Click ✓ next to an option to mark it as the correct answer.</p>
        <input
          className={inputCls}
          placeholder="Explanation (optional)"
          value={form.explanation}
          onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
        />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" className={btnPrimary} disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Update Question' : 'Add Question'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className={btnGhost}>Cancel</button>
          )}
        </div>
      </form>
    </Modal>
  );
}

// ─── LESSON FORM ───────────────────────────────────────────────
function LessonModal({ lesson, courseId, onSave, onClose }) {
  const [form, setForm] = useState({
    title: lesson?.title || '',
    video_url: lesson?.video_url || '',
    transcript: lesson?.transcript || '',
    lesson_order: lesson?.lesson_order || 1,
  });
  const [videoFile, setVideoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('lesson_order', form.lesson_order);
      if (form.video_url) formData.append('video_url', form.video_url);
      if (form.transcript) formData.append('transcript', form.transcript);
      if (videoFile) formData.append('video_file', videoFile);

      let result;
      if (lesson?.id) {
        result = await updateLesson(lesson.id, formData);
      } else {
        formData.append('course', courseId);
        result = await createLesson(formData);
      }
      onSave(result);
    } catch {
      setError('Failed to save lesson. Check all required fields.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={lesson?.id ? 'Edit Lesson' : 'Add New Lesson'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Lesson Title *</label>
          <input
            className={inputCls + ' mt-1'}
            placeholder="e.g. Introduction to Hooks"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Lesson Order *</label>
          <input
            type="number"
            min={1}
            className={inputCls + ' mt-1'}
            value={form.lesson_order}
            onChange={(e) => setForm((f) => ({ ...f, lesson_order: parseInt(e.target.value) || 1 }))}
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Video Upload (File)</label>
          <input
            type="file"
            accept="video/*"
            className={inputCls + ' mt-1'}
            onChange={(e) => setVideoFile(e.target.files[0])}
          />
          {lesson?.video_file && <p className="mt-1 text-xs text-sky-400">Current file: {lesson.video_file.split('/').pop()}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Video URL (Fallback)</label>
          <input
            className={inputCls + ' mt-1'}
            placeholder="https://example.com/lesson.mp4"
            value={form.video_url}
            onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))}
          />
          <p className="mt-1 text-xs text-white/40">Use URL if you aren't uploading a file.</p>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Transcript</label>
          <textarea
            rows={5}
            className={inputCls + ' mt-1 resize-none'}
            placeholder="Paste or type the lesson transcript here…"
            value={form.transcript}
            onChange={(e) => setForm((f) => ({ ...f, transcript: e.target.value }))}
          />
        </div>
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="submit" className={btnPrimary} disabled={saving}>
            {saving ? 'Saving…' : lesson?.id ? 'Update Lesson' : 'Create Lesson'}
          </button>
          <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── COURSE FORM ───────────────────────────────────────────────
function CourseFormModal({ course, onSave, onClose }) {
  const [form, setForm] = useState({
    title: course?.title || '',
    description: course?.description || '',
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      if (thumbnail) formData.append('thumbnail', thumbnail);

      let result;
      if (course?.id) {
        result = await updateCourse(course.id, formData);
      } else {
        result = await createCourse(formData);
      }
      onSave(result);
    } catch {
      setError('Failed to save course. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={course?.id ? 'Edit Course' : 'Create New Course'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Course Title *</label>
          <input
            className={inputCls + ' mt-1'}
            placeholder="e.g. Fundamentals of Python"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Description *</label>
          <textarea
            rows={4}
            className={inputCls + ' mt-1 resize-none'}
            placeholder="What will students learn in this course?"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Course Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            className={inputCls + ' mt-1'}
            onChange={(e) => setThumbnail(e.target.files[0])}
          />
          {course?.thumbnail && <img src={course.thumbnail} alt="preview" className="mt-2 h-16 rounded-xl border border-white/10" />}
        </div>
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="submit" className={btnPrimary} disabled={saving}>
            {saving ? 'Saving…' : course?.id ? 'Update Course' : 'Create Course'}
          </button>
          <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── COURSE MANAGER PANEL ──────────────────────────────────────
function CourseManager({ course, onCourseUpdated, onBack }) {
  const [lessons, setLessons] = useState(course.lessons || []);
  const [lessonModal, setLessonModal] = useState(null); // null | 'new' | lesson-object
  const [quizLesson, setQuizLesson] = useState(null);
  const [editCourse, setEditCourse] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLessonSave = (savedLesson) => {
    setLessons((ls) => {
      const idx = ls.findIndex((l) => l.id === savedLesson.id);
      if (idx >= 0) {
        const updated = [...ls];
        updated[idx] = savedLesson;
        return updated;
      }
      return [...ls, savedLesson];
    });
    setLessonModal(null);
  };

  const handleDeleteLesson = async (id) => {
    if (!window.confirm('Delete this lesson and all its quizzes?')) return;
    await deleteLesson(id);
    setLessons((ls) => ls.filter((l) => l.id !== id));
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm(`Permanently delete "${course.title}" and all its content?`)) return;
    setDeleting(true);
    try {
      await deleteCourse(course.id);
      onBack(course.id); // signal parent to remove from list
    } catch {
      setDeleting(false);
    }
  };

  const sortedLessons = [...lessons].sort((a, b) => a.lesson_order - b.lesson_order);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => onBack(null)} className={btnGhost + ' text-xs'}>
          ← All Courses
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-white truncate">{course.title}</h2>
          <p className="mt-0.5 text-sm text-white/60 line-clamp-2">{course.description}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setEditCourse(true)} className={btnGhost + ' text-xs'}>Edit Course</button>
          <button onClick={handleDeleteCourse} disabled={deleting} className={btnDanger + ' text-xs'}>
            {deleting ? 'Deleting…' : 'Delete Course'}
          </button>
        </div>
      </div>

      {/* Lessons */}
      <div className="rounded-3xl border border-white/10 bg-white/5 shadow-glass p-6 space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Lessons ({sortedLessons.length})</h3>
          <button onClick={() => setLessonModal('new')} className={btnPrimary + ' text-xs'}>+ Add Lesson</button>
        </div>

        {sortedLessons.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-white/10 p-8 text-center text-white/50 text-sm bg-white/2">
            No lessons yet. Click "Add Lesson" to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="rounded-2xl border border-white/8 bg-white/5 p-4 flex flex-wrap items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    Lesson {lesson.lesson_order}
                  </p>
                  <h4 className="text-base font-semibold text-white mt-0.5">{lesson.title}</h4>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-white/60">
                    {lesson.video_url && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5">
                        🎬 Video URL
                      </span>
                    )}
                    {lesson.transcript && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5">
                        📄 Transcript
                      </span>
                    )}
                    {lesson.quiz_questions?.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5">
                        ✓ {lesson.quiz_questions.length} quiz question{lesson.quiz_questions.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                  <button onClick={() => setQuizLesson(lesson)} className={btnGhost + ' text-xs w-full sm:w-auto'}>
                    Manage Quiz
                  </button>
                  <button onClick={() => setLessonModal(lesson)} className={btnGhost + ' text-xs w-full sm:w-auto'}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteLesson(lesson.id)} className={btnDanger + ' text-xs w-full sm:w-auto'}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Publish hint */}
      <div className="rounded-3xl bg-gradient-to-br from-sky-950 to-slate-900 p-6 text-white space-y-2">
        <h4 className="font-semibold">Publish Checklist</h4>
        <ul className="text-sm text-slate-300 space-y-1.5">
          <li className={sortedLessons.length > 0 ? 'text-emerald-400' : ''}>
            {sortedLessons.length > 0 ? '✓' : '○'} At least one lesson created
          </li>
          <li className={sortedLessons.some((l) => l.video_url) ? 'text-emerald-400' : ''}>
            {sortedLessons.some((l) => l.video_url) ? '✓' : '○'} At least one lesson has a video
          </li>
          <li className={sortedLessons.some((l) => l.transcript) ? 'text-emerald-400' : ''}>
            {sortedLessons.some((l) => l.transcript) ? '✓' : '○'} At least one lesson has a transcript
          </li>
          <li className={sortedLessons.some((l) => l.quiz_questions?.length > 0) ? 'text-emerald-400' : ''}>
            {sortedLessons.some((l) => l.quiz_questions?.length > 0) ? '✓' : '○'} At least one quiz added
          </li>
        </ul>
        {sortedLessons.length > 0 &&
          sortedLessons.some((l) => l.video_url) &&
          sortedLessons.some((l) => l.transcript) &&
          sortedLessons.some((l) => l.quiz_questions?.length > 0) && (
            <p className="mt-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-4 py-2 text-emerald-300 text-sm font-semibold">
              🎉 Course is ready for students!
            </p>
          )}
      </div>

      {/* Modals */}
      {(lessonModal === 'new' || (lessonModal && lessonModal.id)) && (
        <LessonModal
          lesson={lessonModal === 'new' ? null : lessonModal}
          courseId={course.id}
          onSave={handleLessonSave}
          onClose={() => setLessonModal(null)}
        />
      )}
      {quizLesson && (
        <QuizManager lesson={quizLesson} onClose={() => setQuizLesson(null)} />
      )}
      {editCourse && (
        <CourseFormModal
          course={course}
          onSave={(updated) => {
            onCourseUpdated(updated);
            setEditCourse(false);
          }}
          onClose={() => setEditCourse(false)}
        />
      )}
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────
export default function ProfessorDashboardPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [managingCourse, setManagingCourse] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getOwnedCourses();
      setCourses(data);
    } catch {
      setError('Unable to load your courses. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  const handleCourseCreated = (course) => {
    setCourses((cs) => [course, ...cs]);
    setShowCreateModal(false);
    setManagingCourse(course);
  };

  const handleCourseUpdated = (updated) => {
    setCourses((cs) => cs.map((c) => (c.id === updated.id ? updated : c)));
    setManagingCourse(updated);
  };

  // Called when "back" is pressed from CourseManager
  // If courseId is provided, it was deleted → remove from list
  const handleBack = (deletedCourseId) => {
    if (deletedCourseId) {
      setCourses((cs) => cs.filter((c) => c.id !== deletedCourseId));
    }
    setManagingCourse(null);
  };

  // ── Managing a specific course ──
  if (managingCourse) {
    return (
      <section className="space-y-8">
        <div className="rounded-2xl sm:rounded-[2rem] glass-card p-4 sm:p-8 shadow-glass">
          <CourseManager
            course={managingCourse}
            onCourseUpdated={handleCourseUpdated}
            onBack={handleBack}
          />
        </div>
      </section>
    );
  }

  // ── Course List View ──
  return (
    <section className="space-y-8">
      <div className="rounded-2xl sm:rounded-[2rem] glass-card p-4 sm:p-8 shadow-glass">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4 mb-5 sm:mb-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Professor Dashboard</h1>
            <p className="mt-1 text-sm text-white/60">
              Create and manage your courses, lessons, transcripts, and quizzes from one place.
            </p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className={btnPrimary + ' w-full sm:w-auto justify-center'}>
            + New Course
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-8">
          {[
            { label: 'Courses', value: courses.length },
            {
              label: 'Total Lessons',
              value: courses.reduce((sum, c) => sum + (c.lessons?.length ?? 0), 0),
            },
            {
              label: 'With Quizzes',
              value: courses.reduce(
                (sum, c) =>
                  sum + (c.lessons?.filter((l) => l.quiz_questions?.length > 0).length ?? 0),
                0
              ),
            },
            { label: 'Published', value: courses.length },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
              <p className="text-3xl font-bold text-sky-400">{stat.value}</p>
              <p className="text-xs uppercase tracking-wider text-white/50 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Course Cards */}
        {loading ? (
          <Loader label="Loading your courses…" />
        ) : error ? (
          <p className="text-rose-600 text-sm">{error}</p>
        ) : courses.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-white/15 p-12 text-center bg-white/3 space-y-3">
            <p className="text-4xl">📚</p>
            <p className="font-semibold text-white/80">No courses yet</p>
            <p className="text-sm text-white/50">Click "New Course" to create your first course.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => {
              const lessonCount = course.lessons?.length ?? 0;
              const quizCount = course.lessons?.filter((l) => l.quiz_questions?.length > 0).length ?? 0;
              const hasTranscript = course.lessons?.some((l) => l.transcript) ?? false;
              const hasVideo = course.lessons?.some((l) => l.video_url) ?? false;
              const isReady = lessonCount > 0 && hasVideo && hasTranscript && quizCount > 0;

              return (
                <div
                  key={course.id}
                  className="rounded-3xl border border-white/10 bg-white/5 shadow-glass hover:bg-white/10 transition-all duration-200 p-5 flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-white leading-snug">{course.title}</h3>
                      <p className="mt-1 text-sm text-white/60 line-clamp-2">{course.description}</p>
                    </div>
                    {isReady && (
                      <span className="shrink-0 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-2.5 py-1">
                        Ready
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <span className="rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2.5 py-0.5 font-medium">
                      {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
                    </span>
                    {hasVideo && (
                      <span className="rounded-full bg-white/10 text-white/80 px-2.5 py-0.5">🎬 Video</span>
                    )}
                    {hasTranscript && (
                      <span className="rounded-full bg-white/10 text-white/80 px-2.5 py-0.5">📄 Transcript</span>
                    )}
                    {quizCount > 0 && (
                      <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5">
                        ✓ Quiz
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setManagingCourse(course)}
                    className={btnPrimary + ' w-full justify-center'}
                  >
                    Manage Course →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CourseFormModal
          course={null}
          onSave={handleCourseCreated}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </section>
  );
}
