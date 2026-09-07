import React, { useState } from 'react';
import { Cpu, Brain } from 'lucide-react';

export const BDHDiagram: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compare' | 'recurrent' | 'weights'>('compare');

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header & Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem' }}>Mechanistic Comparison: Adaptation Architectures</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            How novel skill acquisition happens without inference-time weight modifications.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-main)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
          <button
            className={`btn btn-sm ${activeTab === 'compare' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('compare')}
          >
            Side-by-Side
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'recurrent' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('recurrent')}
          >
            BDH-CQ Recurrent State
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'weights' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('weights')}
          >
            Gradient Updating
          </button>
        </div>
      </div>

      {/* Visual Diagram Canvas */}
      <div className="diagram-container" style={{ display: 'grid', gridTemplateColumns: activeTab === 'compare' ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr', gap: 'var(--space-6)' }}>
        {/* Panel 1: Parameter Update Paradigm */}
        {(activeTab === 'compare' || activeTab === 'weights') && (
          <div
            style={{
              padding: 'var(--space-5)',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Cpu size={20} color="var(--accent-rose)" />
              <h4 style={{ fontSize: '1.05rem', color: '#fb7185' }}>1. Parameter Update Paradigm (Fine-Tuning)</h4>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              Learns by modifying the model's physical synaptic weights (W) via iterative backpropagation.
            </p>

            {/* Step Flow Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', background: 'var(--bg-main)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.85rem' }}>
                <span className="badge badge-rose">Step 1</span>
                <span>Demonstrations treated as mini-batch training dataset: {"{(X_i, Y_i)}"}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.85rem' }}>
                <span className="badge badge-rose">Step 2</span>
                <span>Calculate loss L and compute gradient ∇_W(L)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.85rem' }}>
                <span className="badge badge-rose">Step 3</span>
                <span style={{ color: '#fb7185', fontWeight: 600 }}>Weight Update: W ← W - η ∇ L (Modifies model)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.85rem' }}>
                <span className="badge badge-rose">Step 4</span>
                <span>Run inference on unseen X_test with new weights W_new</span>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ⚠️ <em>Downsides:</em> High compute latency, risk of catastrophic forgetting, requires backpropagation infrastructure at inference time.
            </div>
          </div>
        )}

        {/* Panel 2: Recurrent State Adaptation Paradigm (BDH-CQ / In-Context) */}
        {(activeTab === 'compare' || activeTab === 'recurrent') && (
          <div
            style={{
              padding: 'var(--space-5)',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Brain size={20} color="var(--accent-blue)" />
              <h4 style={{ fontSize: '1.05rem', color: '#93c5fd' }}>2. In-Context / Recurrent State Paradigm (BDH-CQ)</h4>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              Learns entirely through dynamic state evolution (h_t) while keeping all model parameters (W) strictly <strong>frozen</strong>.
            </p>

            {/* Step Flow Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', background: 'var(--bg-main)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.85rem' }}>
                <span className="badge badge-blue">Step 1</span>
                <span>Demonstrations stream into recurrent working memory: (X_1, Y_1) ... (X_k, Y_k)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.85rem' }}>
                <span className="badge badge-blue">Step 2</span>
                <span>Recurrent State Update: h_t = f(h_(t-1), x_t; W_frozen)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.85rem' }}>
                <span className="badge badge-green">Step 3</span>
                <span style={{ color: '#34d399', fontWeight: 600 }}>Zero Weight Modification: ΔW = 0 (W ≡ W_0)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.85rem' }}>
                <span className="badge badge-blue">Step 4</span>
                <span>Solve novel X_test conditioning on contextual state: Y_hat = g(X_test, h_T; W)</span>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#6ee7b7' }}>
              ✨ <em>Advantages:</em> Instantaneous zero-shot adaptation, zero catastrophic forgetting, biologically inspired recurrent synaptic dynamics.
            </div>
          </div>
        )}
      </div>

      {/* Educational Model vs Research Disclaimer */}
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
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          🔬 Scientific Context & Educational Toy Model Distinction:
        </div>
        <p style={{ margin: 0 }}>
          RuleForge implements a deterministic, symbolic hypothesis search engine as an <strong>educational toy model</strong> to teach the core principle of Skill Acquisition from Demonstrations. In research systems such as <strong>BDH-CQ</strong> (Brain-inspired Deep Hebbian architecture with Context & Query), the transformation rule is not stored as symbolic if-else statements, but is instead encoded continuously in the recurrent neural activation and short-term synaptic memory dynamics without modifying core pretrained network weights.
        </p>
      </div>
    </div>
  );
};
