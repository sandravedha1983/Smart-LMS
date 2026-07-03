import { useState, useEffect } from 'react';

export default function TangoPuzzle({ config, onSolve, onHintUsed }) {
  const { gridSize = 6, initial, rowConstraints = [], colConstraints = [], solution, instructions } = config;
  const [board, setBoard] = useState([]);

  useEffect(() => {
    // Deep clone initial state
    setBoard(initial.map(row => row.map(cell => cell || '')));
  }, [initial]);

  const handleCellClick = (r, c) => {
    // Cannot change prefilled cells
    if (initial[r][c] !== null) return;

    const newBoard = board.map(row => [...row]);
    const current = newBoard[r][c];

    // Cycle: '' -> 'sun' -> 'moon' -> ''
    if (current === '') {
      newBoard[r][c] = 'sun';
    } else if (current === 'sun') {
      newBoard[r][c] = 'moon';
    } else {
      newBoard[r][c] = '';
    }

    setBoard(newBoard);
    checkSolution(newBoard);
  };

  const isBoardFilled = (b) => {
    return b.every(row => row.every(cell => cell !== ''));
  };

  const checkSolution = (b) => {
    const isCorrect = b.every((row, r) =>
      row.every((val, c) => val === solution[r][c])
    );
    if (isCorrect) {
      onSolve(true);
    }
  };

  const handleHint = () => {
    const coords = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (initial[r][c] === null && board[r][c] !== solution[r][c]) {
          coords.push({ r, c });
        }
      }
    }

    if (coords.length > 0) {
      const { r, c } = coords[Math.floor(Math.random() * coords.length)];
      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = solution[r][c];
      setBoard(newBoard);
      onHintUsed();
      checkSolution(newBoard);
    }
  };

  const handleReset = () => {
    setBoard(initial.map(row => row.map(cell => cell || '')));
  };

  // Check if a constraint exists between two cells
  const getRowConstraint = (r, c1, c2) => {
    return rowConstraints.find(
      (rc) => rc.row === r && ((rc.col1 === c1 && rc.col2 === c2) || (rc.col1 === c2 && rc.col2 === c1))
    );
  };

  const getColConstraint = (c, r1, r2) => {
    return colConstraints.find(
      (cc) => cc.col === c && ((cc.row1 === r1 && cc.row2 === r2) || (cc.row1 === r2 && cc.row2 === r1))
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <p className="text-xs sm:text-sm text-sky-400 font-bold uppercase tracking-wider">Tango Balance</p>
        <p className="mt-1 text-sm text-white/70">{instructions}</p>
      </div>

      {/* Grid container with relative sizing for overlaps */}
      <div className="flex justify-center select-none">
        <div className="relative border border-white/10 rounded-2xl bg-slate-950/40 p-3 shadow-glass max-w-[340px] w-full aspect-square flex flex-col justify-between">
          <div className="grid grid-cols-6 gap-2 h-full w-full">
            {board.map((row, r) =>
              row.map((cell, c) => {
                const isPrefilled = initial[r][c] !== null;
                
                // Get constraints for rendering lines/badges
                const rightConstraint = c < gridSize - 1 ? getRowConstraint(r, c, c + 1) : null;
                const bottomConstraint = r < gridSize - 1 ? getColConstraint(c, r, r + 1) : null;

                return (
                  <div key={`${r}-${c}`} className="relative flex items-center justify-center aspect-square">
                    {/* Cell Button */}
                    <button
                      type="button"
                      onClick={() => handleCellClick(r, c)}
                      className={`w-full h-full rounded-lg border flex items-center justify-center text-lg sm:text-xl transition ${
                        isPrefilled
                          ? 'bg-white/10 border-white/15 text-white/50 cursor-not-allowed'
                          : cell === 'sun'
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : cell === 'moon'
                          ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                          : 'bg-white/5 border-white/10 hover:bg-white/8'
                      }`}
                    >
                      {cell === 'sun' ? '☀️' : cell === 'moon' ? '🌙' : ''}
                    </button>

                    {/* Horizontal Constraint Marker (Right of cell) */}
                    {rightConstraint && (
                      <div className="absolute right-[-7px] z-10 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 border border-white/20 text-[9px] font-extrabold text-white pointer-events-none select-none">
                        {rightConstraint.type === '=' ? '=' : '×'}
                      </div>
                    )}

                    {/* Vertical Constraint Marker (Bottom of cell) */}
                    {bottomConstraint && (
                      <div className="absolute bottom-[-7px] z-10 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 border border-white/20 text-[9px] font-extrabold text-white pointer-events-none select-none">
                        {bottomConstraint.type === '=' ? '=' : '×'}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center max-w-[340px] mx-auto w-full">
        <button
          type="button"
          onClick={handleHint}
          className="flex-1 py-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 transition text-sm active:scale-95"
        >
          💡 Hint cell
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
