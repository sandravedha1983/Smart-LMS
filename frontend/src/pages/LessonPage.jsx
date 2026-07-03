import { useEffect, useMemo, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { getLessonById, retryLessonTranscription } from '../services/courseService';
import { explainText } from '../services/aiService';
import { recordProgress } from '../services/progressService';
import { submitQuizAttempt } from '../services/quizService';
import Loader from '../components/Loader';
import TranscriptViewer from '../components/TranscriptViewer';
import ExplainPopup from '../components/ExplainPopup';
import VideoPlayer from '../components/VideoPlayer';
import Sidebar from '../components/Sidebar';
import ProgressBar from '../components/ProgressBar';
import QuizCard from '../components/QuizCard';

export default function LessonPage() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const { profile } = useAuth();
  const [language, setLanguage] = useState(profile?.preferred_language || 'English');
  const [difficulty, setDifficulty] = useState(profile?.preferred_difficulty || 'Beginner');
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizAttemptResult, setQuizAttemptResult] = useState(null);
  const [bestQuizScore, setBestQuizScore] = useState(null);
  const lastSavedProgressRef = useRef(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [retryLoading, setRetryLoading] = useState(false);
  const [seekToTime, setSeekToTime] = useState(null);

  const handleTimestampClick = (seconds) => {
    setSeekToTime({ seconds, trigger: Date.now() });
  };

  useEffect(() => {
    let isMounted = true;
    let pollInterval = null;

    const fetchLesson = async (showLoading = true) => {
      if (showLoading) setLoading(true);
      setError('');
      try {
        const data = await getLessonById(id);
        if (!isMounted) return;
        setLesson(data);
        const watchedPct = data.user_progress?.watched_percentage || 0;
        const isComp = data.user_progress?.completed || false;
        setProgress(watchedPct);
        setCompleted(isComp);
        if (data.best_quiz_score) {
          setBestQuizScore(data.best_quiz_score);
        }
        lastSavedProgressRef.current = watchedPct;

        // Poll for updates if transcription is running
        const status = data.transcription_status;
        if (status === 'PENDING' || status === 'PROCESSING') {
          if (!pollInterval) {
            pollInterval = setInterval(() => {
              fetchLesson(false);
            }, 4000);
          }
        } else {
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
        }
      } catch (err) {
        if (isMounted) setError('Unable to load lesson data.');
      } finally {
        if (isMounted && showLoading) setLoading(false);
      }
    };

    fetchLesson(true);

    return () => {
      isMounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [id]);

  const handleRetryTranscription = async () => {
    if (!lesson) return;
    setRetryLoading(true);
    try {
      const data = await retryLessonTranscription(lesson.id);
      setLesson(data);
    } catch (err) {
      console.error("Failed to retry transcription:", err);
    } finally {
      setRetryLoading(false);
    }
  };

  const transcript = useMemo(() => {
    return lesson?.transcript || lesson?.transcription || lesson?.content || '';
  }, [lesson]);

  const handleSelection = (text) => {
    setSelectedText(text);
  };

  const handleExplain = async () => {
    if (!selectedText) {
      setAiError('Select some transcript text before requesting an explanation.');
      setPopupOpen(true);
      return;
    }
    setAiLoading(true);
    setAiError('');
    setAiResult(null);
    setPopupOpen(true);
    try {
      const buildContext = (full, selected) => {
        if (!full || !selected) return '';
        const idx = full.indexOf(selected);
        if (idx === -1) {
          const start = Math.max(0, full.indexOf(selected.slice(0, 10)) - 150);
          return full.slice(start, start + 600);
        }
        const start = Math.max(0, idx - 300);
        const end = Math.min(full.length, idx + selected.length + 300);
        const before = full.lastIndexOf('.', start) + 1 || start;
        const afterDot = full.indexOf('.', end);
        const after = afterDot === -1 ? end : afterDot + 1;
        return full.slice(before, after).trim();
      };

      const contextSnippet = buildContext(transcript, selectedText);

      const response = await explainText({
        text: selectedText,
        lesson_title: lesson?.title,
        course_title: lesson?.course?.title || lesson?.course_title,
        context: contextSnippet,
        lesson_id: lesson?.id,
        language,
        difficulty,
      });
      setAiResult(response);
    } catch (err) {
      setAiError(
        err?.response?.data?.detail
          || err?.response?.data?.error
          || 'AI request failed. Please try again.'
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleFollowUp = async (action) => {
    if (!selectedText) return;
    setAiLoading(true);
    setAiError('');
    try {
      const contextSnippet = transcript ? transcript.slice(0, 1200) : '';
      const response = await explainText({
        text: selectedText,
        lesson_title: lesson?.title,
        course_title: lesson?.course?.title || lesson?.course_title,
        context: contextSnippet,
        lesson_id: lesson?.id,
        language,
        difficulty,
        follow_up_action: action,
      });
      setAiResult(response);
    } catch (err) {
      setAiError('Follow-up request failed.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleVideoProgress = async (progressState) => {
    if (!lesson) return;
    setCurrentTime(progressState.playedSeconds || 0);
    const currentPercent = Math.round(progressState.played * 100);
    
    if (currentPercent >= lastSavedProgressRef.current + 10 && currentPercent < 95) {
      lastSavedProgressRef.current = currentPercent;
      setProgress(currentPercent);
      try {
        await recordProgress({ lesson: lesson.id, watched_percentage: currentPercent, completed: false });
      } catch (err) {
        console.error('Failed to auto-save progress:', err);
      }
    }
  };

  const handleVideoEnded = async () => {
    if (!lesson) return;
    lastSavedProgressRef.current = 100;
    setProgress(100);
    setCompleted(true);
    try {
      await recordProgress({ lesson: lesson.id, watched_percentage: 100, completed: true });
    } catch (err) {
      console.error('Failed to auto-save completed progress:', err);
    }
  };

  const handleMarkComplete = async () => {
    try {
      await recordProgress({ lesson: lesson.id, watched_percentage: 100, completed: true });
      setProgress(100);
      setCompleted(true);
      lastSavedProgressRef.current = 100;
    } catch (_) {
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setQuizAnswers((current) => ({ ...current, [questionId]: answer }));
  };

  const handleQuizSubmit = async () => {
    if (!lesson?.quiz_questions?.length) return;

    const score = lesson.quiz_questions.reduce((acc, question) => {
      const answer = quizAnswers[question.id];
      if (answer === question.correct_answer) {
        return acc + 1;
      }
      return acc;
    }, 0);

    setQuizScore(score);
    
    if (lesson.quiz_id) {
      try {
        const attempt = await submitQuizAttempt(lesson.quiz_id, {
          score,
          total_questions: lesson.quiz_questions.length
        });
        setQuizAttemptResult(attempt);
        if (!bestQuizScore || attempt.score > bestQuizScore.score) {
          setBestQuizScore({
            score: attempt.score,
            total_questions: attempt.total_questions,
            passed: attempt.passed
          });
        }
      } catch (err) {
        console.error('Failed to save quiz attempt', err);
      }
    }

    setQuizSubmitted(true);
  };

  return (
    <section className="space-y-4 sm:space-y-6">
      {loading ? (
        <Loader label="Loading lesson content..." />
      ) : error ? (
        <div className="rounded-2xl sm:rounded-3xl border border-rose-500/30 bg-rose-500/10 p-4 sm:p-6 text-rose-300 backdrop-blur-sm">{error}</div>
      ) : lesson ? (
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Main Content Column */}
          <div className="space-y-4 sm:space-y-6 min-w-0">
            <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 glass-card shadow-glass">
              <div className="bg-slate-950/70 px-4 sm:px-6 py-4 sm:py-5 text-white border-b border-white/10">
                <p className="text-xs sm:text-sm uppercase tracking-[0.24em] text-sky-400">{lesson.course ? `Course id ${lesson.course}` : 'Course lesson'}</p>
                <h1 className="mt-2 sm:mt-3 text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight text-white">{lesson.title || 'Lesson title'}</h1>
              </div>
                <div className="p-4 sm:p-6">
                <VideoPlayer
                  url={lesson.video_url}
                  thumbnail={lesson.course?.thumbnail || ''}
                  onProgress={handleVideoProgress}
                  onDuration={(d) => setDuration(d)}
                  onEnded={handleVideoEnded}
                  seekToTime={seekToTime}
                />
                <div className="mt-4 sm:mt-5 flex flex-col gap-3">
                  <div>
                    <p className="text-xs sm:text-sm text-white/60">Highlight transcript text to request an AI explanation instantly.</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <label className="text-xs text-white/50">Language:</label>
                      <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-full border border-white/15 bg-white/8 px-2.5 sm:px-3 py-1 text-xs sm:text-sm text-white backdrop-blur-sm">
                        <option className="bg-slate-900">English</option>
                        <option className="bg-slate-900">Telugu</option>
                        <option className="bg-slate-900">Hindi</option>
                        <option className="bg-slate-900">Tamil</option>
                        <option className="bg-slate-900">Kannada</option>
                      </select>
                      <label className="text-xs text-white/50">Level:</label>
                      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="rounded-full border border-white/15 bg-white/8 px-2.5 sm:px-3 py-1 text-xs sm:text-sm text-white backdrop-blur-sm">
                        <option className="bg-slate-900">Beginner</option>
                        <option className="bg-slate-900">Intermediate</option>
                        <option className="bg-slate-900">Advanced</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleExplain}
                    className="inline-flex items-center justify-center rounded-2xl sm:rounded-3xl bg-sky-600 px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-semibold text-white transition hover:bg-sky-500 active:scale-[0.98] self-start shadow-md"
                  >
                    🧠 Explain current selection
                  </button>
                </div>
                <div className="mt-4 sm:mt-5 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                  <div className="rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 p-3 sm:p-4">
                    <h4 className="text-sm font-semibold text-white">Lesson progress</h4>
                    <ProgressBar percentage={progress} />
                    <p className="mt-2 text-xs sm:text-sm text-white/60">{completed ? '✓ Completed' : `${progress}% complete`}</p>
                  </div>
                  <div className="rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 p-3 sm:p-4">
                    <h4 className="text-sm font-semibold text-white">Keep learning</h4>
                    <button
                      type="button"
                      onClick={handleMarkComplete}
                      className="mt-2 sm:mt-3 inline-flex w-full items-center justify-center rounded-2xl sm:rounded-3xl bg-sky-600 px-4 py-2.5 sm:py-3 text-sm font-semibold text-white transition hover:bg-sky-500 active:scale-[0.98]"
                    >
                      Mark lesson complete
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <TranscriptViewer
              transcript={transcript}
              selectedText={selectedText}
              onSelection={handleSelection}
              onExplain={handleExplain}
              currentTime={currentTime}
              duration={duration}
              transcriptionStatus={lesson?.transcription_status}
              transcriptionError={lesson?.transcription_error}
              onRetry={handleRetryTranscription}
              isRetryLoading={retryLoading}
              onTimestampClick={handleTimestampClick}
            />
          </div>

          {/* Sidebar Column */}
          <aside className="space-y-4 sm:space-y-6">
            <Sidebar
              title="Lesson details"
              items={[
                { label: 'Course', value: lesson.course?.title || 'Unknown course' },
                { label: 'Duration', value: lesson.duration || 'Auto' },
                { label: 'Transcript', value: transcript ? 'Available' : 'Missing' }
              ]}
            />

            {/* Quiz Section */}
            {lesson.quiz_questions?.length ? (
              <div className="rounded-2xl sm:rounded-[1.75rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-soft space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">Practice Quiz</h3>
                    <p className="text-xs sm:text-sm text-slate-500">Self-assessment to test your knowledge.</p>
                  </div>
                  {bestQuizScore ? (
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Your Best Score</p>
                      <p className={`text-base sm:text-lg font-bold ${bestQuizScore.passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {bestQuizScore.score} / {bestQuizScore.total_questions}
                      </p>
                    </div>
                  ) : null}
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {lesson.quiz_questions.map((question) => (
                    <QuizCard
                      key={question.id}
                      question={question.question}
                      options={Array.isArray(question.options) ? question.options : []}
                      value={quizAnswers[question.id]}
                      onChange={(answer) => handleAnswerChange(question.id, answer)}
                      correctAnswer={question.correct_answer}
                      explanation={question.explanation}
                      submitted={quizSubmitted}
                    />
                  ))}
                </div>
                {!quizSubmitted ? (
                  <button
                    type="button"
                    onClick={handleQuizSubmit}
                    className="mt-3 sm:mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 py-2.5 sm:py-3 text-sm font-semibold text-white shadow-md hover:bg-sky-700 transition duration-200 active:scale-[0.98]"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <div className={`mt-3 sm:mt-4 rounded-2xl p-3 sm:p-4 border text-sm space-y-2 ${quizAttemptResult?.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-sky-50 border-sky-100 text-slate-800'}`}>
                    <p className="font-bold text-base sm:text-lg">
                      {quizAttemptResult?.passed ? '🎉 Passed!' : 'Quiz Submitted'}
                    </p>
                    <p>
                      You scored <strong>{quizScore}</strong> out of{' '}
                      <strong>{lesson.quiz_questions.length}</strong> correct (
                      {Math.round((quizScore / lesson.quiz_questions.length) * 100)}%).
                    </p>
                    {quizAttemptResult?.passed && (
                      <p className="text-xs font-medium text-emerald-700">Great job! Your result has been saved.</p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setQuizSubmitted(false);
                        setQuizAnswers({});
                        setQuizScore(null);
                        setQuizAttemptResult(null);
                      }}
                      className="mt-2 text-xs font-semibold hover:underline"
                    >
                      Retake Quiz
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            {/* Selected Text Panel */}
            <div className="rounded-2xl sm:rounded-3xl border border-white/10 glass-card p-4 sm:p-6 shadow-glass">
              <h3 className="text-base sm:text-lg font-semibold text-white">Selected highlight</h3>
              <p className="mt-2 sm:mt-3 min-h-[60px] sm:min-h-[80px] rounded-xl sm:rounded-2xl bg-white/5 border border-white/8 px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm leading-6 text-white/70 italic">
                {selectedText || 'Highlight text from the transcript to enable the AI prompt.'}
              </p>
            </div>
          </aside>
        </div>
      ) : (
        <div className="rounded-2xl sm:rounded-3xl border border-white/10 glass-card p-4 sm:p-6 shadow-glass text-white/60">No lesson data available.</div>
      )}
      <ExplainPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        aiResult={aiResult}
        loading={aiLoading}
        error={aiError}
        query={selectedText}
        onFollowUp={handleFollowUp}
      />
    </section>
  );
}
