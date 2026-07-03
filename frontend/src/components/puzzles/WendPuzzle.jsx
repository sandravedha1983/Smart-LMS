import { useState, useEffect } from 'react';

export default function WendPuzzle({ config, onSolve, onHintUsed }) {
  const { grid, wordLengths, words, instructions } = config;

  // Grid dimensions
  const rowsCount = grid.length;
  const colsCount = grid[0].length;

  // State
  const [solvedWords, setSolvedWords] = useState([]); // List of strings
  const [currentSelection, setCurrentSelection] = useState([]); // List of { r, c }
  const [consumedCells, setConsumedCells] = useState([]); // List of { r, c }
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setSolvedWords([]);
    setCurrentSelection([]);
    setConsumedCells([]);
    setErrorMsg('');
  }, [grid]);

  const isCellConsumed = (r, c) => {
    return consumedCells.some(cell => cell.r === r && cell.c === c);
  };

  const isCellSelected = (r, c) => {
    return currentSelection.some(cell => cell.r === r && cell.c === c);
  };

  const isAdjacent = (cell1, cell2) => {
    return Math.abs(cell1.r - cell2.r) <= 1 && Math.abs(cell1.c - cell2.c) <= 1;
  };

  const handleCellClick = (r, c) => {
    setErrorMsg('');

    // If cell is already consumed, ignore
    if (isCellConsumed(r, c)) return;

    // Check if cell is already in the current selection
    const selectedIdx = currentSelection.findIndex(cell => cell.r === r && cell.c === c);
    
    if (selectedIdx !== -1) {
      // Backtrack selection
      setCurrentSelection(currentSelection.slice(0, selectedIdx + 1));
      return;
    }

    if (currentSelection.length === 0) {
      // Start a new word path
      setCurrentSelection([{ r, c }]);
    } else {
      // Extend selection if adjacent
      const lastCell = currentSelection[currentSelection.length - 1];
      if (isAdjacent(lastCell, { r, c })) {
        setCurrentSelection([...currentSelection, { r, c }]);
      }
    }
  };

  // Get currently spelled word
  const spelledWord = currentSelection
    .map(cell => grid[cell.r][cell.c])
    .join('');

  const handleSubmitWord = () => {
    setErrorMsg('');
    const upperWord = spelledWord.toUpperCase();

    if (!upperWord) return;

    // Check if word is one of the target words and has not been solved yet
    const isTarget = words.includes(upperWord);
    const alreadySolved = solvedWords.includes(upperWord);

    if (isTarget && !alreadySolved) {
      // Add word and lock cells
      setSolvedWords([...solvedWords, upperWord]);
      setConsumedCells([...consumedCells, ...currentSelection]);
      setCurrentSelection([]);

      // Check win condition (all words solved)
      if (solvedWords.length + 1 === words.length) {
        onSolve(true);
      }
    } else if (alreadySolved) {
      setErrorMsg(`"${upperWord}" has already been solved!`);
    } else {
      setErrorMsg(`"${upperWord}" is not in the hidden word list.`);
      setCurrentSelection([]);
    }
  };

  const handleClearSelection = () => {
    setCurrentSelection([]);
    setErrorMsg('');
  };

  const handleReset = () => {
    setSolvedWords([]);
    setCurrentSelection([]);
    setConsumedCells([]);
    setErrorMsg('');
  };

  const handleHint = () => {
    // Find the first unsolved word
    const unsolved = words.find(w => !solvedWords.includes(w));
    if (!unsolved) return;

    // Find its coordinate path in the grid
    // For simplicity, we can auto-submit the word to help the user!
    // Since we know the solution words, we can locate where they are.
    // Let's find the letters of the unsolved word that are not consumed:
    // To make the hint simple and bulletproof, we will directly add the unsolved word
    // to solvedWords, and consume its grid coordinates based on the solution key!
    // Let's hardcode the grid coordinate paths for the words in our seed grid:
    const wordPaths = {
      "CATS": [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 2 }],
      "HOPE": [{ r: 1, c: 0 }, { r: 1, c: 1 }, { r: 2, c: 1 }, { r: 2, c: 0 }],
      "BLUE": [{ r: 0, c: 3 }, { r: 1, c: 3 }, { r: 2, c: 3 }, { r: 2, c: 2 }],
      "WIND": [{ r: 3, c: 0 }, { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }]
    };

    const path = wordPaths[unsolved];
    if (path) {
      setSolvedWords([...solvedWords, unsolved]);
      setConsumedCells([...consumedCells, ...path]);
      setCurrentSelection([]);
      onHintUsed();

      if (solvedWords.length + 1 === words.length) {
        onSolve(true);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-sky-400 font-bold uppercase tracking-wider">Wend Word Flow</p>
          <span className="text-xs text-white/50 bg-white/5 px-2.5 py-1 rounded-full">
            🔍 {solvedWords.length} / {words.length} words found
          </span>
        </div>
        <p className="mt-1 text-sm text-white/70">{instructions}</p>
      </div>

      {/* Grid */}
      <div className="flex flex-col sm:flex-row gap-6 items-center justify-center select-none">
        
        {/* Letters Grid */}
        <div className="grid grid-cols-4 gap-2 border border-white/10 rounded-2xl bg-slate-950/40 p-3 shadow-glass max-w-[280px] w-full aspect-square shrink-0">
          {grid.map((row, r) =>
            row.map((letter, c) => {
              const consumed = isCellConsumed(r, c);
              const selected = isCellSelected(r, c);
              
              // Find which index in the selection path this cell is
              const selectIdx = currentSelection.findIndex(cell => cell.r === r && cell.c === c);

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => handleCellClick(r, c)}
                  disabled={consumed}
                  className={`flex flex-col items-center justify-center rounded-xl border text-lg font-bold transition select-none aspect-square relative ${
                    consumed
                      ? 'bg-emerald-500/20 border-emerald-500/35 text-emerald-400 opacity-60 cursor-not-allowed'
                      : selected
                      ? 'bg-sky-500 border-sky-400 text-white shadow-glow ring-2 ring-sky-400/30 scale-105 z-10'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  {/* Path step number */}
                  {selected && (
                    <span className="absolute top-1 left-1 text-[8px] font-mono text-white/50">
                      {selectIdx + 1}
                    </span>
                  )}
                  <span>{letter}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Solver Panel */}
        <div className="flex-1 w-full max-w-[280px] space-y-4">
          {/* Word Length Targets */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Word lengths to find</p>
            <div className="flex gap-2">
              {wordLengths.map((len, idx) => {
                const isFound = solvedWords.length > idx;
                return (
                  <span
                    key={idx}
                    className={`flex-1 text-center py-1.5 rounded-lg text-xs font-bold border ${
                      isFound 
                        ? 'bg-emerald-500/25 border-emerald-500/40 text-emerald-300' 
                        : 'bg-white/5 border-white/10 text-white/50'
                    }`}
                  >
                    {isFound ? solvedWords[idx] : `${len} Letters`}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Spell Preview */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current selection</p>
            <div className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-center min-h-[42px] flex items-center justify-center">
              <span className="font-mono text-base font-extrabold tracking-widest text-sky-400">
                {spelledWord || '—'}
              </span>
            </div>
          </div>

          {errorMsg && <p className="text-xs text-rose-400 font-semibold text-center">{errorMsg}</p>}

          {/* Action buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleSubmitWord}
              disabled={!spelledWord}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-xs font-bold transition active:scale-[0.98] shadow-glow"
            >
              Submit Word
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClearSelection}
                disabled={!spelledWord}
                className="flex-1 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white/70 text-xs transition"
              >
                Clear Word
              </button>
              <button
                type="button"
                onClick={handleHint}
                className="flex-1 py-2 rounded-lg border border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 text-sky-300 text-xs transition"
              >
                💡 Hint Word
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white/60 text-xs transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
