import React from 'react';
import { Page } from '../types';
import { BDHDiagram } from '../components/BDHDiagram';
import { ArrowLeft, ArrowRight, BrainCircuit, BookOpen } from 'lucide-react';

interface BDHPageProps {
  onNavigate: (page: Page) => void;
}

export const BDHPage: React.FC<BDHPageProps> = ({ onNavigate }) => {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <BrainCircuit size={24} color="var(--accent-blue)" />
          <h1 style={{ fontSize: '2rem', margin: 0 }}>BDH-CQ Research Connection</h1>
        </div>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
          Understanding how Skill Acquisition from Demonstrations differs mechanistically from gradient-descent fine-tuning.
        </p>
      </div>

      {/* Narrative Synthesis */}
      <div className="card card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Connecting the Experiment to the Research</h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
          In the previous laboratory experiments, you provided a few demonstrations. The system analyzed those examples as empirical context to infer the rule and solve an unseen test input—<strong>without updating any model weights or parameters at inference time</strong>.
        </p>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          This illustrates the central premise of <strong>BDH-CQ</strong> (Brain-inspired Deep Hebbian architecture with Context & Query): skill adaptation can occur entirely through contextual and recurrent state dynamics rather than gradient-descent weight modification.
        </p>
      </div>

      {/* Interactive Architectural Comparison Diagram */}
      <BDHDiagram />

      {/* Conceptual Contrast Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', borderTop: '3px solid var(--accent-rose)' }}>
          <strong style={{ color: '#fb7185', fontSize: '1rem' }}>Traditional Parameter Fine-Tuning</strong>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            • Modifies physical synaptic weights ($W \leftarrow W - \eta \nabla L$) for each new task.<br />
            • Requires backpropagation compute infrastructure at inference time.<br />
            • Vulnerable to catastrophic forgetting when switching tasks.<br />
            • High compute latency per demonstration.
          </p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', borderTop: '3px solid var(--accent-emerald)' }}>
          <strong style={{ color: '#34d399', fontSize: '1rem' }}>Recurrent Context Dynamics (BDH-CQ)</strong>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            • Core model weights remain permanently frozen ($\Delta W = 0$).<br />
            • Demonstrations update short-term recurrent activation memory ($h_t$).<br />
            • Instantaneous zero-shot execution on novel query inputs.<br />
            • Biologically plausible synaptic plasticity mechanism.
          </p>
        </div>
      </div>

      {/* Scientific Distinction Banner */}
      <div
        style={{
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-main)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <BookOpen size={16} color="var(--accent-blue)" />
          <span>Educational Implementation Note:</span>
        </div>
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          RuleForge implements a deterministic multi-family symbolic hypothesis search engine as an <strong>educational model</strong> to clarify the input-to-skill pipeline. In actual research architectures like <strong>BDH-CQ</strong>, the transformation is not represented as explicit symbolic strings, but is instead encoded continuously in recurrent neural states and Hebbian trace activations without modifying frozen base weights.
        </p>
      </div>

      {/* Footer Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', paddingTop: 'var(--space-4)' }}>
        <button className="btn btn-secondary" onClick={() => onNavigate('sandbox')}>
          <ArrowLeft size={16} /> Back to Sandbox
        </button>
        <button className="btn btn-primary" onClick={() => onNavigate('challenge')}>
          Next: 60s Challenge <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
