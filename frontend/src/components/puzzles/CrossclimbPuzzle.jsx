import { useState, useEffect } from 'react';

export default function CrossclimbPuzzle({ config, onSolve, onHintUsed }) {
  const { ladder, topWord, bottomWord, instructions } = config;
  
  // Middle ladder state (initially jumbled)
  const [middleWords, setMiddleWords] = useState([]);
  const [topInput, setTopInput] = useState('');
  const [bottomInput, setBottomInput] = useState('');
  const [solvedMiddle, setSolvedMiddle] = useState(false);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    // Jumble the middle words initially
    const jumbled = [...ladder].sort(() => Math.random() - 0.5);
    setMiddleWords(jumbled);
    setTopInput('');
    setBottomInput('');
    setSolvedMiddle(false);
    setErrorText('');
  }, [ladder]);

  // Helper to count character differences between two 4-letter words
  const getCharDiffCount = (w1, w2) => {
    if (!w1 || !w2 || w1.length !== w2.length) return 999;
    let diff = 0;
    for (let i = 0; i < w1.length; i++) {
      if (w1[i] !== w2[i]) diff++;
    }
    return diff;
  };

  const handleMoveUp = (idx) => {
    if (idx === 0) return;
    const newWords = [...middleWords];
    const temp = newWords[idx];
    newWords[idx] = newWords[idx - 1];
    newWords[idx - 1] = temp;
    setMiddleWords(newWords);
    checkMiddleLadder(newWords);
  };

  const handleMoveDown = (idx) => {
    if (idx === middleWords.length - 1) return;
    const newWords = [...middleWords];
    const temp = newWords[idx];
    newWords[idx] = newWords[idx + 1];
    newWords[idx + 1] = temp;
    setMiddleWords(newWords);
    checkMiddleLadder(newWords);
  };

  const checkMiddleLadder = (words) => {
    // Check if middle ladder is valid (each consecutive pair differs by 1 letter)
    let valid = true;
    for (let i = 0; i < words.length - 1; i++) {
      if (getCharDiffCount(words[i].answer, words[i + 1].answer) !== 1) {
        valid = false;
        break;
      }
    }
    setSolvedMiddle(valid);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorText('');

    if (!solvedMiddle) {
      setErrorText('Please arrange the middle ladder words first so they connect!');
      return;
    }

    const finalTop = topInput.trim().toUpperCase();
    const finalBottom = bottomInput.trim().toUpperCase();

    // Verify top word differs by 1 from the first ladder word and matches configuration
    const correctTop = finalTop === topWord.answer && getCharDiffCount(finalTop, middleWords[0].answer) === 1;
    
    // Verify bottom word differs by 1 from the last ladder word and matches configuration
    const correctBottom = finalBottom === bottomWord.answer && getCharDiffCount(finalBottom, middleWords[middleWords.length - 1].answer) === 1;

    if (correctTop && correctBottom) {
      onSolve(true);
    } else {
      setErrorText('The top or bottom word is incorrect, or does not connect to the ladder.');
    }
  };

  const handleHint = () => {
    // Solve middle ladder instantly
    setMiddleWords([...ladder]);
    setSolvedMiddle(true);
    
    // Give letters for top or bottom
    if (!topInput || topInput !== topWord.answer) {
      setTopInput(topWord.answer);
    } else {
      setBottomInput(bottomWord.answer);
    }
    
    onHintUsed();
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <p className="text-xs sm:text-sm text-sky-400 font-bold uppercase tracking-wider">Crossclimb Word Ladder</p>
        <p className="mt-1 text-sm text-white/70">{instructions}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-[400px] mx-auto select-none">
        
        {/* Top Word Clue & Input */}
        <div className="rounded-2xl border border-white/10 bg-sky-950/20 p-4 space-y-2">
          <div className="flex justify-between items-center text-xs text-sky-300 font-semibold uppercase">
            <span>Top Clue</span>
            <span>4 Letters</span>
          </div>
          <p className="text-sm font-semibold text-white">"{topWord.clue}"</p>
          <input
            type="text"
            maxLength={4}
            value={topInput}
            onChange={(e) => setTopInput(e.target.value.toUpperCase())}
            placeholder="Type Top Word"
            className="w-full text-center tracking-[0.4em] font-mono rounded-xl border border-white/15 bg-white/10 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-sky-400"
            required
          />
        </div>

        {/* Middle Ladder Rearrangement */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rearrange Ladder (Each connection must differ by 1 letter)</p>
          <div className="space-y-2">
            {middleWords.map((item, idx) => {
              const prevItem = idx > 0 ? middleWords[idx - 1] : null;
              const hasValidLink = prevItem && getCharDiffCount(item.answer, prevItem.answer) === 1;

              return (
                <div key={item.answer} className="flex flex-col">
                  {/* Link indicator */}
                  {idx > 0 && (
                    <div className="flex justify-center -my-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        hasValidLink ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300 animate-pulse'
                      }`}>
                        {hasValidLink ? '🔗 Connected' : '✕ Disconnected'}
                      </span>
                    </div>
                  )}

                  {/* Word Row */}
                  <div className="flex items-center gap-3 bg-white/5 border border-white/8 p-3 rounded-2xl">
                    <div className="flex-1">
                      <span className="font-mono font-extrabold tracking-[0.2em] text-white text-base">{item.answer}</span>
                      <p className="text-xs text-white/50 truncate mt-0.5">{item.clue}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className="px-2.5 py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded disabled:opacity-35 text-xs text-white"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === middleWords.length - 1}
                        className="px-2.5 py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded disabled:opacity-35 text-xs text-white"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Word Clue & Input */}
        <div className="rounded-2xl border border-white/10 bg-indigo-950/20 p-4 space-y-2">
          <div className="flex justify-between items-center text-xs text-indigo-300 font-semibold uppercase">
            <span>Bottom Clue</span>
            <span>4 Letters</span>
          </div>
          <p className="text-sm font-semibold text-white">"{bottomWord.clue}"</p>
          <input
            type="text"
            maxLength={4}
            value={bottomInput}
            onChange={(e) => setBottomInput(e.target.value.toUpperCase())}
            placeholder="Type Bottom Word"
            className="w-full text-center tracking-[0.4em] font-mono rounded-xl border border-white/15 bg-white/10 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-sky-400"
            required
          />
        </div>

        {errorText && <p className="text-sm text-rose-400 text-center font-medium">{errorText}</p>}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleHint}
            className="flex-1 py-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-sm font-bold active:scale-[0.98]"
          >
            💡 Quick Auto-Solve Clues
          </button>
          <button
            type="submit"
            className="flex-1 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold active:scale-[0.98] shadow-glow"
          >
            Verify Ladder
          </button>
        </div>
      </form>
    </div>
  );
}
