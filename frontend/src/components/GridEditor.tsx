import React, { useState } from 'react';
import { Grid } from '../types';
import { GridView } from './GridView';
import { RotateCcw, Paintbrush } from 'lucide-react';

interface GridEditorProps {
  grid: Grid;
  onChange: (newGrid: Grid) => void;
  label?: string;
  maxSize?: number;
}

const PALETTE = [
  { val: 0, label: '0 (Dark)' },
  { val: 1, label: '1 (Blue)' },
  { val: 2, label: '2 (Red)' },
  { val: 3, label: '3 (Green)' },
  { val: 4, label: '4 (Yellow)' },
  { val: 5, label: '5 (Gray)' },
  { val: 6, label: '6 (Magenta)' },
  { val: 7, label: '7 (Orange)' },
  { val: 8, label: '8 (Azure)' },
  { val: 9, label: '9 (Maroon)' },
];

export const GridEditor: React.FC<GridEditorProps> = ({
  grid,
  onChange,
  label = 'Custom Canvas',
}) => {
  const [selectedColor, setSelectedColor] = useState<number>(1);

  const handleCellClick = (r: number, c: number) => {
    const updated = grid.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === r && cIdx === c ? selectedColor : cell))
    );
    onChange(updated);
  };

  const handleClear = () => {
    const rows = grid.length;
    const cols = grid[0].length;
    const empty = Array.from({ length: rows }, () => Array(cols).fill(0));
    onChange(empty);
  };

  const handleResize = (newSize: number) => {
    const newGrid: Grid = Array.from({ length: newSize }, (_, r) =>
      Array.from({ length: newSize }, (_, c) =>
        grid[r] && grid[r][c] !== undefined ? grid[r][c] : 0
      )
    );
    onChange(newGrid);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', alignItems: 'center' }}>
      {/* Palette Selector */}
      <div className="palette-bar" role="toolbar" aria-label="Color Palette">
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: 'var(--space-2)' }}>
          <Paintbrush size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          Color:
        </span>
        {PALETTE.map((item) => (
          <button
            key={item.val}
            className={`palette-chip c-${item.val} ${selectedColor === item.val ? 'active' : ''}`}
            onClick={() => setSelectedColor(item.val)}
            title={item.label}
            aria-label={`Select ${item.label}`}
            aria-pressed={selectedColor === item.val}
          >
            {item.val}
          </button>
        ))}
      </div>

      {/* Grid Canvas */}
      <GridView
        grid={grid}
        label={label}
        interactive={true}
        onCellClick={handleCellClick}
        cellSize={36}
      />

      {/* Action Controls */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <button className="btn btn-secondary btn-sm" onClick={handleClear} title="Clear Grid">
          <RotateCcw size={14} /> Clear
        </button>

        <div style={{ display: 'flex', gap: '4px', marginLeft: 'var(--space-2)' }}>
          {[3, 4, 5].map((sz) => (
            <button
              key={sz}
              className={`btn btn-sm ${grid.length === sz ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleResize(sz)}
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
            >
              {sz}×{sz}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
