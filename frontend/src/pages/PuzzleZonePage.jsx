import { useEffect, useState, useMemo, useRef } from 'react';
import { getPuzzles, submitPuzzleAnswer } from '../services/puzzleService';
import Loader from '../components/Loader';
import { useAuth } from '../contexts/AuthContext';

// Game Components
import SudokuPuzzle from '../components/puzzles/SudokuPuzzle';
import QueensPuzzle from '../components/puzzles/QueensPuzzle';
import TangoPuzzle from '../components/puzzles/TangoPuzzle';
import ZipPuzzle from '../components/puzzles/ZipPuzzle';
import PinpointPuzzle from '../components/puzzles/PinpointPuzzle';
import CrossclimbPuzzle from '../components/puzzles/CrossclimbPuzzle';
import PatchesPuzzle from '../components/puzzles/PatchesPuzzle';
import WendPuzzle from '../components/puzzles/WendPuzzle';

export default function PuzzleZonePage() {
  const { profile } = useAuth();
  const [puzzle, setPuzzle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Game Play States
  const [solved, setSolved] = useState(false);
  const [solveTime, setSolveTime] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState(1);
  const [answerText, setAnswerText] = useState('');
  const [solveResult, setSolveResult] = useState(null);
  const [streak, setStreak] = useState(profile?.puzzle_streak || 0);

  const timerRef = useRef(null);

  // Load Daily Puzzle
  useEffect(() => {
    const loadPuzzle = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getPuzzles({ daily: true });
        const p = Array.isArray(response) ? response[0] : response;
        setPuzzle(p);
        
        // If there's an existing completion progress for today, we can check, 
        // but for now, we start fresh.
        setSolved(false);
        setSolveTime(0);
        setHintsUsed(0);
        setAttempts(1);
        setSolveResult(null);
      } catch (err) {
        setError('Unable to fetch the daily brain challenge.');
      } finally {
        setLoading(false);
      }
    };
    loadPuzzle();
  }, []);

  // Timer Effect: runs while puzzle is active and unsolved
  useEffect(() => {
    if (puzzle && !solved && !loading) {
      timerRef.current = setInterval(() => {
        setSolveTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [puzzle, solved, loading]);

  // Parse prompt JSON
  const puzzleConfig = useMemo(() => {
    if (!puzzle) return null;
    try {
      return JSON.parse(puzzle.prompt);
    } catch (e) {
      // Return null to trigger fallback text input
      return null;
    }
  }, [puzzle]);

  // Format seconds to mm:ss
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSolve = async (correctState, customAnswer = 'correct') => {
    if (!puzzle) return;
    setSolved(true);
    try {
      const response = await submitPuzzleAnswer({
        puzzleId: puzzle.id,
        answer: customAnswer,
        correct: correctState,
        solve_time_seconds: solveTime,
        hints_used: hintsUsed,
        attempts_count: attempts
      });
      setSolveResult(response);
      if (response.puzzle_streak) {
        setStreak(response.puzzle_streak);
      }
    } catch (err) {
      setError('Unable to save your progress.');
    }
  };

  const handleHintUsed = () => {
    setHintsUsed(prev => prev + 1);
  };

  // Fallback submit for unstructured/text puzzles
  const handleFallbackSubmit = (e) => {
    e.preventDefault();
    if (!answerText.trim()) return;
    setAttempts(prev => prev + 1);
    handleSolve(true, answerText.trim());
  };

  return (
    <section className="space-y-6 sm:space-y-8 select-none">
      <div className="rounded-2xl sm:rounded-[2rem] border border-white/10 bg-slate-950/20 p-4 sm:p-8 shadow-glass backdrop-blur-md">
        
        {/* Main Header */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Brain Boost Zone 🧠
            </h1>
            <p className="mt-1 text-sm text-white/50">
              Refresh your mind and boost your focus with fun, LinkedIn-style daily logic games.
            </p>
          </div>
          {/* Daily Streak Indicator */}
          <div className="self-center sm:self-auto flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-2 text-amber-300 shadow-glow">
            <span className="text-xl">🔥</span>
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Daily Streak</p>
              <p className="text-sm font-extrabold leading-none">{streak} Day{streak !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Puzzle Card Container */}
        <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
          {loading ? (
            <Loader label="Preparing today's daily challenge..." />
          ) : error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300 text-sm text-center">
              <p className="font-bold">Error Loading Game</p>
              <p className="mt-1 text-xs text-rose-300/80">{error}</p>
            </div>
          ) : !puzzle ? (
            <p className="text-white/50 text-sm text-center py-10">No daily puzzle is available right now. Check back later!</p>
          ) : solved && solveResult ? (
            
            // Celebrating Solution / MASCOT Summary Screen
            <div className="space-y-6 max-w-[500px] mx-auto text-center py-6 animate-scale-up">
              <div className="space-y-2">
                <span className="inline-flex rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 shadow-glow">
                  ✓ Puzzle Solved
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{puzzle.title}</h2>
                <p className="text-sm text-white/50 uppercase tracking-widest font-mono">Category: {puzzle.category}</p>
              </div>

              {/* Stats panel */}
              <div className="grid grid-cols-3 gap-3 bg-white/5 border border-white/8 rounded-2xl p-4">
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Solve Time</p>
                  <p className="text-lg font-extrabold text-sky-400 mt-1">{formatTimer(solveTime)}</p>
                </div>
                <div className="text-center border-x border-white/5">
                  <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Hints Used</p>
                  <p className="text-lg font-extrabold text-amber-400 mt-1">{hintsUsed}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">XP Awarded</p>
                  <p className="text-lg font-extrabold text-emerald-400 mt-1">+{solveResult.points_awarded || puzzle.points} XP</p>
                </div>
              </div>

              {/* Dolphy mascot cognitive feedback */}
              {solveResult.ai_feedback && (
                <div className="relative rounded-2xl border border-sky-500/20 bg-sky-500/10 p-5 text-left shadow-glass">
                  <div className="absolute top-[-14px] left-5 flex items-center gap-1.5 rounded-full bg-sky-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow">
                    <span>🐬</span>
                    <span>Dolphy AI Mascot</span>
                  </div>
                  <p className="mt-1 text-sm text-sky-200 leading-relaxed font-medium italic">
                    "{solveResult.ai_feedback}"
                  </p>
                </div>
              )}

              {/* Celebrate Achievements unlocked */}
              {solveResult.unlocked_achievements && solveResult.unlocked_achievements.length > 0 && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-center space-y-3">
                  <p className="text-xs uppercase font-extrabold tracking-widest text-amber-300">🏆 Badges Unlocked! 🏆</p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {solveResult.unlocked_achievements.map((ach) => (
                      <span
                        key={ach}
                        className="rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1"
                      >
                        🥇 {ach}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-white/40">Awesome work! Your brain is now primed and ready for learning. Head over to courses to begin.</p>
            </div>
          ) : (
            
            // Active Game Screen
            <div className="space-y-6 max-w-lg mx-auto">
              
              {/* Game Status Strip */}
              <div className="flex flex-wrap items-center justify-between border-b border-white/5 pb-4 gap-3 text-xs sm:text-sm font-semibold text-white/70">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-sky-500/20 px-3 py-1 text-sky-300 uppercase tracking-widest text-[10px]">
                    {puzzleConfig?.difficulty || 'Daily'}
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-300">
                    +{puzzle.points} XP
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="font-mono text-base text-sky-400">
                    ⏱️ {formatTimer(solveTime)}
                  </span>
                  <span>
                    💡 Hints: {hintsUsed}
                  </span>
                </div>
              </div>

              {/* Game Router */}
              {puzzleConfig ? (
                <div className="p-2 animate-scale-up">
                  {puzzleConfig.type === 'sudoku' && (
                    <SudokuPuzzle config={puzzleConfig} onSolve={handleSolve} onHintUsed={handleHintUsed} />
                  )}
                  {puzzleConfig.type === 'queens' && (
                    <QueensPuzzle config={puzzleConfig} onSolve={handleSolve} onHintUsed={handleHintUsed} />
                  )}
                  {puzzleConfig.type === 'tango' && (
                    <TangoPuzzle config={puzzleConfig} onSolve={handleSolve} onHintUsed={handleHintUsed} />
                  )}
                  {puzzleConfig.type === 'zip' && (
                    <ZipPuzzle config={puzzleConfig} onSolve={handleSolve} onHintUsed={handleHintUsed} />
                  )}
                  {puzzleConfig.type === 'pinpoint' && (
                    <PinpointPuzzle config={puzzleConfig} onSolve={handleSolve} onHintUsed={handleHintUsed} />
                  )}
                  {puzzleConfig.type === 'crossclimb' && (
                    <CrossclimbPuzzle config={puzzleConfig} onSolve={handleSolve} onHintUsed={handleHintUsed} />
                  )}
                  {puzzleConfig.type === 'patches' && (
                    <PatchesPuzzle config={puzzleConfig} onSolve={handleSolve} onHintUsed={handleHintUsed} />
                  )}
                  {puzzleConfig.type === 'wend' && (
                    <WendPuzzle config={puzzleConfig} onSolve={handleSolve} onHintUsed={handleHintUsed} />
                  )}
                </div>
              ) : (
                
                // Fallback Text Input Puzzle
                <div className="space-y-4 animate-scale-up">
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-white">{puzzle.title}</h2>
                    <p className="mt-1 text-xs text-white/40">Category: {puzzle.category}</p>
                    <p className="mt-4 text-sm text-white/80 leading-relaxed">{puzzle.prompt}</p>
                  </div>

                  <form onSubmit={handleFallbackSubmit} className="space-y-3">
                    <input
                      type="text"
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 focus:bg-white/12 focus:border-sky-400 focus:outline-none transition"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition active:scale-95 shadow-glow"
                    >
                      Submit Answer
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
