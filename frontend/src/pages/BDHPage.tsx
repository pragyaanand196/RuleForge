import React from 'react';
import { Page } from '../types';
import { BDHDiagram } from '../components/BDHDiagram';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface BDHPageProps {
  onNavigate: (page: Page) => void;
}

export const BDHPage: React.FC<BDHPageProps> = ({ onNavigate }) => {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem' }}>BDH-CQ Research Connection</h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
          Understanding how Skill Acquisition from Demonstrations differs from parameter fine-tuning.
        </p>
      </div>

      {/* Narrative Synthesis */}
      <div className="card card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Connecting the Experiment to the Research</h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
          In the previous laboratory experiments, you provided a few demonstrations. The system used those examples as context to infer the rule and solve an unseen test input—<strong>without updating any model parameters at inference time</strong>.
        </p>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          This illustrates the central principle of <strong>BDH-CQ</strong> (Brain-inspired Deep Hebbian architecture with Context & Query): skill adaptation can occur entirely through contextual / recurrent state dynamics rather than gradient-descent weight updates.
        </p>
      </div>

      {/* Interactive Architectural Comparison Diagram */}
      <BDHDiagram />

      {/* Conceptual Contrast */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <strong style={{ color: 'var(--accent-rose)', fontSize: '0.95rem' }}>Traditional Fine-Tuning</strong>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Modifies model weights (W &larr; W - &eta;&nabla;L) for each new task. Requires backward passes at inference time and risks catastrophic forgetting.
          </p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <strong style={{ color: 'var(--accent-emerald)', fontSize: '0.95rem' }}>In-Context / Recurrent State (BDH-CQ)</strong>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Model weights remain permanently frozen (W_frozen). The demonstration stream updates working state (h_t), enabling instantaneous zero-shot adaptation.
          </p>
        </div>
      </div>

      {/* Footer Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', paddingTop: 'var(--space-4)' }}>
        <button className="btn btn-secondary" onClick={() => onNavigate('sandbox')}>
          <ArrowLeft size={16} /> Back to Sandbox
        </button>
        <button className="btn btn-primary" onClick={() => onNavigate('research')}>
          Next: Primary Sources <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
