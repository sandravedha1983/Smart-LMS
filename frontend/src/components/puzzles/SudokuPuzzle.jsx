import { useState, useEffect } from 'react';

export default function SudokuPuzzle({ config, onSolve, onHintUsed }) {
  const { grid: initialGrid, solution, instructions } = config;
  const [grid, setGrid] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null); // { r, c }

  useEffect(() => {
    // Deep clone the initial grid config
    setGrid(initialGrid.map(row => [...row]));
    setSelectedCell(null);
  }, [initialGrid]);

  const handleCellClick = (r, c) => {
    // Don't edit prefilled cells
    if (initialGrid[r][c] !== 0) return;
    setSelectedCell({ r, c });
  };

  const handleNumberInput = (num) => {
    if (!selectedCell) return;
    const { r, c } = selectedCell;
    const newGrid = grid.map(row => [...row]);
    newGrid[r][c] = num;
    setGrid(newGrid);

    // Auto-check solution if complete
    if (isGridFilled(newGrid)) {
      checkSolution(newGrid);
    }
  };

  const handleClearCell = () => {
    if (!selectedCell) return;
    const { r, c } = selectedCell;
    const newGrid = grid.map(row => [...row]);
    newGrid[r][c] = 0;
    setGrid(newGrid);
  };

  const isGridFilled = (g) => {
    return g.every(row => row.every(cell => cell !== 0));
  };

  const checkSolution = (g) => {
    const isCorrect = g.every((row, r) => 
      row.every((val, c) => val === solution[r][c])
    );
    if (isCorrect) {
      onSolve(true);
    }
  };

  const handleHint = () => {
    // Find all empty or incorrect cells
    const coords = [];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (initialGrid[r][c] === 0 && grid[r][c] !== solution[r][c]) {
          coords.push({ r, c });
        }
      }
    }

    if (coords.length > 0) {
      const randCell = coords[Math.floor(Math.random() * coords.length)];
      const newGrid = grid.map(row => [...row]);
      newGrid[randCell.r][randCell.c] = solution[randCell.r][randCell.c];
      setGrid(newGrid);
      setSelectedCell(randCell);
      onHintUsed();

      if (isGridFilled(newGrid)) {
        checkSolution(newGrid);
      }
    }
  };

  const handleReset = () => {
    setGrid(initialGrid.map(row => [...row]));
    setSelectedCell(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <p className="text-xs sm:text-sm text-sky-400 font-bold uppercase tracking-wider">Mini Sudoku (6x6)</p>
        <p className="mt-1 text-sm text-white/70">{instructions}</p>
      </div>

      {/* 6x6 Sudoku Grid */}
      <div className="flex justify-center">
        <div className="grid grid-cols-6 gap-0.5 border-2 border-white/20 rounded-xl overflow-hidden bg-slate-950 p-1 shadow-glass max-w-[340px] w-full aspect-square">
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isPrefilled = initialGrid[r][c] !== 0;
              const isSelected = selectedCell && selectedCell.r === r && selectedCell.c === c;
              
              // Borders for 2x3 blocks
              const borderBottom = (r === 1 || r === 3) ? 'border-b-2 border-white/20' : '';
              const borderRight = (c === 2) ? 'border-r-2 border-white/20' : '';

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => handleCellClick(r, c)}
                  className={`flex items-center justify-center text-lg sm:text-xl font-bold transition select-none aspect-square ${borderBottom} ${borderRight} ${
                    isPrefilled
                      ? 'bg-white/10 text-white/50 cursor-not-allowed'
                      : isSelected
                      ? 'bg-sky-500 text-white font-extrabold shadow-glow'
                      : cell !== 0
                      ? 'bg-white/5 text-sky-300 hover:bg-white/10'
                      : 'bg-white/5 text-transparent hover:bg-white/10'
                  }`}
                >
                  {cell !== 0 ? cell : ''}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Number Controls */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-2 max-w-[340px] w-full justify-between">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleNumberInput(num)}
              disabled={!selectedCell}
              className="flex-1 py-3 rounded-xl bg-white/10 border border-white/15 hover:bg-white/15 text-white font-bold transition disabled:opacity-40 select-none text-base active:scale-95"
            >
              {num}
            </button>
          ))}
        </div>
        
        <div className="flex gap-3 max-w-[340px] w-full">
          <button
            type="button"
            onClick={handleClearCell}
            disabled={!selectedCell}
            className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 transition text-sm disabled:opacity-40"
          >
            Clear Cell
          </button>
          <button
            type="button"
            onClick={handleHint}
            className="flex-1 py-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 transition text-sm"
          >
            💡 Get Hint
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 transition text-sm"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
