import React, { useState } from 'react';
import { Page, Grid } from '../types';
import { GridView } from '../components/GridView';
import { ArrowRight, Play, ArrowLeft } from 'lucide-react';

interface LearnPageProps {
  onNavigate: (page: Page) => void;
}

export const LearnPage: React.FC<LearnPageProps> = ({ onNavigate }) => {
  // Interactive mini-grid state
  const [miniGrid, setMiniGrid] = useState<Grid>([
    [1, 0],
    [0, 1]
  ]);

  const toggleMiniCell = (r: number, c: number) => {
    const updated = miniGrid.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === r && cIdx === c ? (cell === 1 ? 0 : 1) : cell))
    );
    setMiniGrid(updated);
  };

  // Rule: 1 -> 2 (blue to red), 0 -> 0
  const miniOutput: Grid = miniGrid.map((row) =>
    row.map((cell) => (cell === 1 ? 2 : cell))
  );

  return (
    <div className="container container-narrow" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem' }}>How It Works in 4 Steps</h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
          The core mechanism behind Skill Acquisition from Demonstrations.
        </p>
      </div>

      {/* 4 Crisp Steps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <strong style={{ color: 'var(--accent-blue)', fontSize: '0.95rem' }}>1. Demonstrations</strong>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Input-output pairs $(X \to Y)$ show what the task does and provide evidence about the hidden rule.
          </p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <strong style={{ color: 'var(--accent-amber)', fontSize: '0.95rem' }}>2. Hidden Rule Inference</strong>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            The system analyzes the demonstrations to infer the unique invariant rule explaining all examples.
          </p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <strong style={{ color: 'var(--accent-emerald)', fontSize: '0.95rem' }}>3. Unseen Test Input</strong>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            The inferred rule is applied to a new example that was never part of the demonstrations.
          </p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <strong style={{ color: '#38bdf8', fontSize: '0.95rem' }}>4. Zero-Shot Generalization</strong>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Comparing the prediction against ground truth proves whether the skill generalized without retraining.
          </p>
        </div>
      </div>

      {/* Interactive Starter Mini-Grid */}
      <div className="card card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <h3 style={{ fontSize: '1.1rem' }}>Interactive Mini-Example</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
          Click any cell in the Input grid to toggle it between 0 and 1. Watch how the inferred rule (<code style={{ color: '#93c5fd' }}>1 (Blue) → 2 (Red)</code>) instantly transforms the output.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-6)', padding: 'var(--space-3) 0' }}>
          <GridView
            grid={miniGrid}
            label="Clickable Input"
            interactive={true}
            onCellClick={toggleMiniCell}
            cellSize={40}
          />
          <div className="demo-arrow">
            <ArrowRight size={24} />
          </div>
          <GridView
            grid={miniOutput}
            label="Output Prediction"
            cellSize={40}
          />
        </div>
      </div>

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <button className="btn btn-secondary" onClick={() => onNavigate('home')}>
          <ArrowLeft size={16} /> Back to Start
        </button>
        <button className="btn btn-primary btn-lg" onClick={() => onNavigate('lab')}>
          <Play size={18} /> Enter Experiment Lab <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
