import { useState, useEffect } from 'react';

// Region styles mapped by index
const regionStyles = [
  'bg-rose-500/30 border-rose-500/40 text-rose-300 hover:bg-rose-500/40',
  'bg-amber-500/30 border-amber-500/40 text-amber-300 hover:bg-amber-500/40',
  'bg-emerald-500/30 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/40',
  'bg-sky-500/30 border-sky-500/40 text-sky-300 hover:bg-sky-500/40',
  'bg-indigo-500/30 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/40',
  'bg-purple-500/30 border-purple-500/40 text-purple-300 hover:bg-purple-500/40',
];

export default function QueensPuzzle({ config, onSolve, onHintUsed }) {
  const { gridSize = 6, regions, solution, instructions } = config;
  const [board, setBoard] = useState([]); // gridSize x gridSize grid of strings: '', 'x', 'queen'

  useEffect(() => {
    // Initialize empty board
    const initial = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
    setBoard(initial);
  }, [gridSize]);

  const handleCellClick = (r, c) => {
    const newBoard = board.map(row => [...row]);
    const current = newBoard[r][c];
    
    // Toggle state: '' -> 'x' -> 'queen' -> ''
    if (current === '') {
      newBoard[r][c] = 'x';
    } else if (current === 'x') {
      newBoard[r][c] = 'queen';
    } else {
      newBoard[r][c] = '';
    }

    setBoard(newBoard);
    checkSolution(newBoard);
  };

  const getQueenCount = (b) => {
    let count = 0;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (b[r][c] === 'queen') count++;
      }
    }
    return count;
  };

  const checkSolution = (b) => {
    const placedQueens = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (b[r][c] === 'queen') {
          placedQueens.push([r, c]);
        }
      }
    }

    if (placedQueens.length !== gridSize) return;

    // Validate 1 queen per row
    const rows = new Set(placedQueens.map(([r]) => r));
    if (rows.size !== gridSize) return;

    // Validate 1 queen per col
    const cols = new Set(placedQueens.map(([_, c]) => c));
    if (cols.size !== gridSize) return;

    // Validate 1 queen per region
    const queenRegions = new Set(placedQueens.map(([r, c]) => regions[r][c]));
    if (queenRegions.size !== gridSize) return;

    // Validate adjacency (no two queens touch even diagonally)
    for (let i = 0; i < placedQueens.length; i++) {
      const [r1, c1] = placedQueens[i];
      for (let j = i + 1; j < placedQueens.length; j++) {
        const [r2, c2] = placedQueens[j];
        if (Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1) {
          // Touching!
          return;
        }
      }
    }

    // Passed all validations!
    onSolve(true);
  };

  const handleHint = () => {
    // Find a solution coordinate that does not currently have a queen placed
    const unplaced = solution.filter(([sr, sc]) => board[sr][sc] !== 'queen');
    if (unplaced.length > 0) {
      const [hr, hc] = unplaced[Math.floor(Math.random() * unplaced.length)];
      
      const newBoard = board.map((row, r) =>
        row.map((cell, c) => {
          // Clear any conflicting queen in the same row, col, or region
          if (r === hr || c === hc || regions[r][c] === regions[hr][hc]) {
            if (cell === 'queen') return '';
          }
          return cell;
        })
      );
      
      newBoard[hr][hc] = 'queen';
      setBoard(newBoard);
      onHintUsed();
      checkSolution(newBoard);
    }
  };

  const handleReset = () => {
    setBoard(Array(gridSize).fill(null).map(() => Array(gridSize).fill('')));
  };

  const queenCount = getQueenCount(board);

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-sky-400 font-bold uppercase tracking-wider">Queens Garden</p>
          <span className="text-xs text-white/50 bg-white/5 px-2.5 py-1 rounded-full">
            👑 {queenCount} / {gridSize} placed
          </span>
        </div>
        <p className="mt-1 text-sm text-white/70">{instructions}</p>
      </div>

      {/* Grid container */}
      <div className="flex justify-center">
        <div className="grid grid-cols-6 gap-1 border border-white/10 rounded-2xl overflow-hidden bg-slate-950/40 p-2 shadow-glass max-w-[340px] w-full aspect-square">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const regionIdx = regions[r][c] % regionStyles.length;
              const style = regionStyles[regionIdx];

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => handleCellClick(r, c)}
                  className={`flex items-center justify-center border text-base font-bold transition select-none aspect-square rounded-lg ${style} ${
                    cell === 'queen' 
                      ? 'shadow-glow ring-2 ring-sky-400 border-sky-400 bg-sky-500/20'
                      : ''
                  }`}
                >
                  {cell === 'queen' ? (
                    <span className="text-lg drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">👑</span>
                  ) : cell === 'x' ? (
                    <span className="text-xs text-white/30 font-extrabold select-none">✕</span>
                  ) : (
                    ''
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center max-w-[340px] mx-auto w-full">
        <button
          type="button"
          onClick={handleHint}
          className="flex-1 py-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 transition text-sm active:scale-95"
        >
          💡 Hint Queen
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="flex-1 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 transition text-sm active:scale-95"
        >
          Reset Board
        </button>
      </div>
    </div>
  );
}
