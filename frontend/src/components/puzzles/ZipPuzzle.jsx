import { useState, useEffect } from 'react';

export default function ZipPuzzle({ config, onSolve, onHintUsed }) {
  const { gridSize = 4, numbers = {}, solution, instructions } = config;
  const [path, setPath] = useState([]); // Array of [r, c]

  // Find start cell coordinates (where value is 1)
  const startCell = Object.entries(numbers).find(([val]) => val === '1')?.[1] || [0, 0];

  useEffect(() => {
    setPath([startCell]);
  }, [JSON.stringify(startCell)]);

  const isAdjacent = (cell1, cell2) => {
    const [r1, c1] = cell1;
    const [r2, c2] = cell2;
    return (Math.abs(r1 - r2) === 1 && c1 === c2) || (Math.abs(c1 - c2) === 1 && r1 === r2);
  };

  const handleCellClick = (r, c) => {
    // If clicking the start cell, reset path to just start
    if (r === startCell[0] && c === startCell[1]) {
      setPath([startCell]);
      return;
    }

    // Check if cell is already in the path
    const pathIdx = path.findIndex(([pr, pc]) => pr === r && pc === c);
    
    if (pathIdx !== -1) {
      // Backtrack: remove all cells after this one
      setPath(path.slice(0, pathIdx + 1));
      return;
    }

    // Extending the path
    const lastCell = path[path.length - 1];
    if (isAdjacent(lastCell, [r, c])) {
      // Check if this cell is a fixed number and if it matches the new step number
      const nextStep = path.length + 1;
      const fixedValueAtCell = Object.entries(numbers).find(
        ([_, coord]) => coord[0] === r && coord[1] === c
      )?.[0];

      if (fixedValueAtCell && parseInt(fixedValueAtCell, 10) !== nextStep) {
        // Step number mismatch with fixed node constraint
        return;
      }

      const newPath = [...path, [r, c]];
      setPath(newPath);

      // Verify if path is complete and correct
      if (newPath.length === gridSize * gridSize) {
        checkSolution(newPath);
      }
    }
  };

  const checkSolution = (p) => {
    // Verify against solution coordinate array
    const isCorrect = p.every((coord, idx) => {
      const solCoord = solution[idx];
      return coord[0] === solCoord[0] && coord[1] === solCoord[1];
    });

    if (isCorrect) {
      onSolve(true);
    }
  };

  const handleHint = () => {
    // Follow the solution array to extend the path by one step
    const nextStepIdx = path.length;
    if (nextStepIdx < solution.length) {
      const nextCoord = solution[nextStepIdx];
      const newPath = solution.slice(0, nextStepIdx + 1);
      setPath(newPath);
      onHintUsed();

      if (newPath.length === gridSize * gridSize) {
        checkSolution(newPath);
      }
    }
  };

  const handleReset = () => {
    setPath([startCell]);
  };

  // Helper to find if cell is in path and get its 1-based order index
  const getCellPathIndex = (r, c) => {
    const idx = path.findIndex(([pr, pc]) => pr === r && pc === c);
    return idx !== -1 ? idx + 1 : null;
  };

  // Helper to find if cell is a fixed/clue cell
  const getFixedCellNumber = (r, c) => {
    return Object.entries(numbers).find(
      ([_, coord]) => coord[0] === r && coord[1] === c
    )?.[0];
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-sky-400 font-bold uppercase tracking-wider">Zip Line Connect</p>
          <span className="text-xs text-white/50 bg-white/5 px-2.5 py-1 rounded-full">
            📍 {path.length} / {gridSize * gridSize} cells connected
          </span>
        </div>
        <p className="mt-1 text-sm text-white/70">{instructions}</p>
      </div>

      {/* Grid */}
      <div className="flex justify-center select-none">
        <div className="grid grid-cols-4 gap-2 border border-white/10 rounded-2xl bg-slate-950/40 p-3 shadow-glass max-w-[320px] w-full aspect-square">
          {Array(gridSize).fill(null).map((_, r) =>
            Array(gridSize).fill(null).map((_, c) => {
              const pathNum = getCellPathIndex(r, c);
              const fixedNum = getFixedCellNumber(r, c);
              const isLast = path.length > 0 && path[path.length - 1][0] === r && path[path.length - 1][1] === c;

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => handleCellClick(r, c)}
                  className={`flex flex-col items-center justify-center rounded-xl border text-sm font-bold transition select-none aspect-square relative ${
                    isLast
                      ? 'bg-sky-500 text-white border-sky-400 shadow-glow ring-2 ring-sky-400/50 scale-105 z-10'
                      : pathNum
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : fixedNum
                      ? 'bg-white/10 text-white/70 border-white/20'
                      : 'bg-white/5 text-transparent border-white/10 hover:bg-white/10'
                  }`}
                >
                  {/* Fixed Guide Badge */}
                  {fixedNum && (
                    <span className="absolute top-1 left-1 text-[9px] font-mono text-white/40 tracking-tighter">
                      Clue
                    </span>
                  )}
                  
                  {/* Main Display Number */}
                  <span className="text-base sm:text-lg">
                    {pathNum || fixedNum || ''}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center max-w-[320px] mx-auto w-full">
        <button
          type="button"
          onClick={handleHint}
          className="flex-1 py-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 transition text-sm active:scale-95"
        >
          💡 Extend Path
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="flex-1 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 transition text-sm active:scale-95"
        >
          Reset Path
        </button>
      </div>
    </div>
  );
}
