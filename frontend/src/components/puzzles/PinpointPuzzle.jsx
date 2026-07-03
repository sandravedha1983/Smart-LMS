import { useState } from 'react';

export default function PinpointPuzzle({ config, onSolve, onHintUsed }) {
  const { clues, category, synonyms = [], instructions } = config;
  const [revealedCount, setRevealedCount] = useState(1);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [errorState, setErrorState] = useState(false);

  const handleRevealClue = () => {
    if (revealedCount < clues.length) {
      setRevealedCount(revealedCount + 1);
      onHintUsed(); // Treat revealing next clue as using a hint to calculate final performance score
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorState(false);
    setMessage('');

    const cleanGuess = guess.trim().toLowerCase();
    if (!cleanGuess) return;

    // Check guess against database answer or synonyms list
    const isCorrect = synonyms.some(syn => syn.toLowerCase().trim() === cleanGuess) || 
                      cleanGuess === category.toLowerCase().trim();

    if (isCorrect) {
      // Trigger win
      onSolve(true);
    } else {
      setErrorState(true);
      setMessage('Incorrect guess. Look closely at the clues and try again!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <p className="text-xs sm:text-sm text-sky-400 font-bold uppercase tracking-wider">Pinpoint Clues</p>
        <p className="mt-1 text-sm text-white/70">{instructions}</p>
      </div>

      {/* Clues board */}
      <div className="space-y-3 max-w-[400px] mx-auto">
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 space-y-2 shadow-glass">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-semibold mb-3">Revealed Clues</p>
          {clues.slice(0, revealedCount).map((clue, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-white/5 border border-white/5 px-4 py-3 rounded-xl text-base font-semibold text-white transition-all duration-300 animate-slide-in"
            >
              <span>{clue}</span>
              <span className="text-xs text-white/30 font-mono">Clue {idx + 1}</span>
            </div>
          ))}
          {clues.slice(revealedCount).map((_, idx) => (
            <div
              key={idx + revealedCount}
              className="flex items-center justify-center bg-white/2 border border-dashed border-white/10 px-4 py-3.5 rounded-xl text-xs text-white/20 select-none"
            >
              🔒 Locked Clue
            </div>
          ))}
        </div>

        {/* Reveal button */}
        {revealedCount < clues.length && (
          <button
            type="button"
            onClick={handleRevealClue}
            className="w-full py-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 transition text-sm font-semibold active:scale-[0.98]"
          >
            ➕ Reveal Next Clue ({clues.length - revealedCount} remaining)
          </button>
        )}
      </div>

      {/* Guess Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3 max-w-[400px] mx-auto">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            What binds these clues together?
          </label>
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Type your category guess..."
            className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:bg-white/12 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 transition"
            required
            autoFocus
          />
        </div>

        {message && (
          <p className={`text-xs sm:text-sm font-medium ${errorState ? 'text-rose-400' : 'text-emerald-400'}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold transition active:scale-[0.98] shadow-glow"
        >
          Submit Guess
        </button>
      </form>
    </div>
  );
}
