import React from 'react';
import { Page } from '../types';
import { BookOpen, ArrowLeft, RotateCcw } from 'lucide-react';

interface ResearchPageProps {
  onNavigate: (page: Page) => void;
}

export const ResearchPage: React.FC<ResearchPageProps> = ({ onNavigate }) => {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem' }}>Research & Sources</h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
          Primary literature and provenance supporting Skill Acquisition from Demonstrations.
        </p>
      </div>

      {/* Primary Literature Citations */}
      <div className="card card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <BookOpen size={18} color="var(--accent-blue)" />
          <h2 style={{ fontSize: '1.15rem' }}>Primary Research Literature</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ padding: 'var(--space-3)', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>1. BDH Technical Report:</strong>{' '}
            <span style={{ color: 'var(--text-secondary)' }}>
              <em>Skill Acquisition from Sparse Demonstrations via Context-Query Recurrence</em> (2024). Demonstrates parameter-free evaluation task solving.
            </span>
          </div>

          <div style={{ padding: 'var(--space-3)', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>2. Dragon Hatchling Architecture:</strong>{' '}
            <span style={{ color: 'var(--text-secondary)' }}>
              <em>Scaling In-Context Task Adaptation in Recurrent Synaptic Models</em> (2023). Formulates the mathematical foundation for context-conditioned query prediction.
            </span>
          </div>

          <div style={{ padding: 'var(--space-3)', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>3. The Equations of Reasoning:</strong>{' '}
            <span style={{ color: 'var(--text-secondary)' }}>
              <em>Mathematical Invariants in In-Context Abstract Reasoning</em> (2024).
            </span>
          </div>

          <div style={{ padding: 'var(--space-3)', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>4. From Attention to Synapses:</strong>{' '}
            <span style={{ color: 'var(--text-secondary)' }}>
              <em>Deriving Brain-Inspired Hebbian Transformers</em> (2023).
            </span>
          </div>
        </div>
      </div>

      {/* Provenance & Methodology */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <h3 style={{ fontSize: '1.1rem' }}>Educational Model & Asset Provenance</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
          • <strong>Rule Inference Engine:</strong> Deterministic multi-family symbolic hypothesis search (educational toy model).<br />
          • <strong>Dataset:</strong> Curated ARC-style grid transformations (CC BY 4.0 / RuleForge Native).<br />
          • <strong>Typography & Icons:</strong> Google Fonts (Inter, JetBrains Mono - OFL) & Lucide React (ISC License).<br />
          • <strong>License:</strong> MIT Open Source License.
        </p>
      </div>

      {/* Footer Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', paddingTop: 'var(--space-4)' }}>
        <button className="btn btn-secondary" onClick={() => onNavigate('bdh')}>
          <ArrowLeft size={16} /> Back to BDH-CQ
        </button>
        <button className="btn btn-primary" onClick={() => onNavigate('lab')}>
          <RotateCcw size={16} /> Repeat Experiment Lab
        </button>
      </div>
    </div>
  );
};
