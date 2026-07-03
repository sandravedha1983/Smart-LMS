import { useState, useEffect } from 'react';

// Colors for partition patches
const patchColors = [
  'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
  'bg-amber-500/20 border-amber-500/50 text-amber-300',
  'bg-purple-500/20 border-purple-500/50 text-purple-300',
  'bg-sky-500/20 border-sky-500/50 text-sky-300',
];

export default function PatchesPuzzle({ config, onSolve, onHintUsed }) {
  const { gridSize = 4, clues = [], solution, instructions } = config;
  
  // List of placed patches: each patch is { r1, c1, r2, c2, colorIndex }
  const [patches, setPatches] = useState([]);
  const [selectedStart, setSelectedStart] = useState(null); // { r, c }

  useEffect(() => {
    setPatches([]);
    setSelectedStart(null);
  }, [JSON.stringify(clues)]);

  const handleCellClick = (r, c) => {
    // If we click an already created patch, delete it
    const existingPatchIdx = patches.findIndex(
      (p) => r >= p.r1 && r <= p.r2 && c >= p.c1 && c <= p.c2
    );
    if (existingPatchIdx !== -1) {
      setPatches(patches.filter((_, idx) => idx !== existingPatchIdx));
      setSelectedStart(null);
      return;
    }

    if (!selectedStart) {
      // Must start a patch on a clue cell
      const isClue = clues.some(clue => clue.row === r && clue.col === c);
      if (isClue) {
        setSelectedStart({ r, c });
      }
    } else {
      // End the patch
      const r1 = Math.min(selectedStart.r, r);
      const r2 = Math.max(selectedStart.r, r);
      const c1 = Math.min(selectedStart.c, c);
      const c2 = Math.max(selectedStart.c, c);

      // Check if patch overlaps with any existing patch
      const overlaps = patches.some(
        (p) => !(r2 < p.r1 || r1 > p.r2 || c2 < p.c1 || c1 > p.c2)
      );

      if (overlaps) {
        setSelectedStart(null);
        return;
      }

      // Check if patch contains exactly one clue cell
      const cluesInPatch = clues.filter(
        (clue) => clue.row >= r1 && clue.row <= r2 && clue.col >= c1 && clue.col <= c2
      );

      if (cluesInPatch.length !== 1) {
        setSelectedStart(null);
        return;
      }

      // Check if size matches clue value
      const patchSize = (r2 - r1 + 1) * (c2 - c1 + 1);
      if (patchSize !== cluesInPatch[0].value) {
        setSelectedStart(null);
        return;
      }

      // Add patch
      const newPatch = { r1, c1, r2, c2, colorIndex: patches.length % patchColors.length };
      const newPatches = [...patches, newPatch];
      setPatches(newPatches);
      setSelectedStart(null);

      // Check if board is fully covered
      if (getCoveredCellCount(newPatches) === gridSize * gridSize) {
        checkSolution(newPatches);
      }
    }
  };

  const getCoveredCellCount = (pts) => {
    let count = 0;
    pts.forEach((p) => {
      count += (p.r2 - p.r1 + 1) * (p.c2 - p.c1 + 1);
    });
    return count;
  };

  const checkSolution = (pts) => {
    // Check if the current partition configuration matches the solutions
    const isCorrect = pts.every((p) => 
      solution.some((s) => s.r1 === p.r1 && s.c1 === p.c1 && s.r2 === p.r2 && s.c2 === p.c2)
    );
    if (isCorrect) {
      onSolve(true);
    }
  };

  const handleHint = () => {
    // Place one correct patch from the solution list that isn't currently placed
    const unplaced = solution.filter((s) => 
      !patches.some((p) => s.r1 === p.r1 && s.c1 === p.c1 && s.r2 === p.r2 && s.c2 === p.c2)
    );

    if (unplaced.length > 0) {
      const nextSolPatch = unplaced[0];
      
      // Remove any overlapping patches
      const filteredPatches = patches.filter((p) => 
        (p.r2 < nextSolPatch.r1 || p.r1 > nextSolPatch.r2 || p.c2 < nextSolPatch.c1 || p.c1 > nextSolPatch.c2)
      );

      const newPatch = { 
        r1: nextSolPatch.r1, 
        c1: nextSolPatch.c1, 
        r2: nextSolPatch.r2, 
        c2: nextSolPatch.c2, 
        colorIndex: filteredPatches.length % patchColors.length 
      };

      const newPatches = [...filteredPatches, newPatch];
      setPatches(newPatches);
      setSelectedStart(null);
      onHintUsed();

      if (getCoveredCellCount(newPatches) === gridSize * gridSize) {
        checkSolution(newPatches);
      }
    }
  };

  const handleReset = () => {
    setPatches([]);
    setSelectedStart(null);
  };

  // Helper to determine cell background class
  const getCellState = (r, c) => {
    const patchIdx = patches.findIndex(
      (p) => r >= p.r1 && r <= p.r2 && c >= p.c1 && c <= p.c2
    );
    
    if (patchIdx !== -1) {
      return { inPatch: true, colorClass: patchColors[patches[patchIdx].colorIndex] };
    }

    const isPending = selectedStart && 
                      r >= Math.min(selectedStart.r, r) && r <= Math.max(selectedStart.r, r) &&
                      c >= Math.min(selectedStart.c, c) && c <= Math.max(selectedStart.c, c);

    if (isPending) {
      return { pending: true };
    }

    return {};
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-sky-400 font-bold uppercase tracking-wider">Patches Grid partitioner</p>
          <span className="text-xs text-white/50 bg-white/5 px-2.5 py-1 rounded-full">
            🧩 {patches.length} patches created
          </span>
        </div>
        <p className="mt-1 text-sm text-white/70">{instructions}</p>
      </div>

      {/* Grid */}
      <div className="flex justify-center select-none">
        <div className="grid grid-cols-4 gap-2 border border-white/10 rounded-2xl bg-slate-950/40 p-3 shadow-glass max-w-[320px] w-full aspect-square">
          {Array(gridSize).fill(null).map((_, r) =>
            Array(gridSize).fill(null).map((_, c) => {
              const clueCell = clues.find(clue => clue.row === r && clue.col === c);
              const cellState = getCellState(r, c);
              const isSelectedStart = selectedStart && selectedStart.r === r && selectedCell === c;

              let cellStyle = 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10';
              if (cellState.inPatch) {
                cellStyle = `border-2 ${cellState.colorClass}`;
              } else if (cellState.pending) {
                cellStyle = 'bg-sky-500/20 border-dashed border-sky-400/80 text-sky-300 animate-pulse';
              } else if (selectedStart && selectedStart.r === r && selectedStart.c === c) {
                cellStyle = 'bg-sky-500 border-sky-400 shadow-glow text-white ring-2 ring-sky-400/30';
              }

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => handleCellClick(r, c)}
                  className={`flex flex-col items-center justify-center rounded-xl border text-base font-bold transition select-none aspect-square relative ${cellStyle}`}
                >
                  {clueCell && (
                    <span className="text-lg font-extrabold drop-shadow">
                      {clueCell.value}
                    </span>
                  )}
                  {!clueCell && cellState.inPatch && (
                    <span className="text-[10px] opacity-20">●</span>
                  )}
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
          💡 Draw One Patch
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="flex-1 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 transition text-sm active:scale-95"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
