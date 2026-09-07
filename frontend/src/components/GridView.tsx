import React from 'react';
import { Grid } from '../types';

interface GridViewProps {
  grid: Grid;
  label?: string;
  diffGrid?: boolean[][];
  interactive?: boolean;
  onCellClick?: (r: number, c: number) => void;
  showNumbers?: boolean;
  cellSize?: number;
}

const COLOR_NAMES: Record<number, string> = {
  0: 'Background (0)',
  1: 'Blue (1)',
  2: 'Red (2)',
  3: 'Green (3)',
  4: 'Yellow (4)',
  5: 'Gray (5)',
  6: 'Magenta (6)',
  7: 'Orange (7)',
  8: 'Azure (8)',
  9: 'Maroon (9)',
};

export const GridView: React.FC<GridViewProps> = ({
  grid,
  label,
  diffGrid,
  interactive = false,
  onCellClick,
  showNumbers = true,
  cellSize = 32,
}) => {
  if (!grid || grid.length === 0) {
    return (
      <div className="grid-container">
        {label && <span className="grid-label">{label}</span>}
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Empty grid</div>
      </div>
    );
  }

  const rows = grid.length;
  const cols = grid[0].length;

  return (
    <div className="grid-container">
      {label && <span className="grid-label">{label}</span>}
      <div
        className="grid-canvas"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
        role="grid"
        aria-label={label || 'Transformation grid'}
      >
        {grid.map((row, rIdx) =>
          row.map((cellVal, cIdx) => {
            const hasDiff = diffGrid && diffGrid[rIdx] && diffGrid[rIdx][cIdx] !== undefined;
            const isMatch = hasDiff ? diffGrid[rIdx][cIdx] : null;

            let diffClass = '';
            if (isMatch === true) diffClass = 'cell-diff-match';
            else if (isMatch === false) diffClass = 'cell-diff-mismatch';

            return (
              <div
                key={`${rIdx}-${cIdx}`}
                className={`grid-cell c-${cellVal} ${interactive ? 'interactive' : ''} ${diffClass}`}
                style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                onClick={() => interactive && onCellClick && onCellClick(rIdx, cIdx)}
                title={`Row ${rIdx + 1}, Col ${cIdx + 1}: ${COLOR_NAMES[cellVal] || cellVal}`}
                role={interactive ? 'button' : 'gridcell'}
                tabIndex={interactive ? 0 : undefined}
                onKeyDown={(e) => {
                  if (interactive && onCellClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onCellClick(rIdx, cIdx);
                  }
                }}
              >
                {showNumbers && cellVal !== 0 ? cellVal : ''}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
