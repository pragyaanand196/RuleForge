import React, { useState } from 'react';
import { Page, Grid, Demonstration, InferResponse, ApplyResponse } from '../types';
import { apiClient } from '../services/api';
import { GridEditor } from '../components/GridEditor';
import { GridView } from '../components/GridView';
import { DemoViewer } from '../components/DemoViewer';
import { Plus, Sparkles, Play, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';

interface SandboxPageProps {
  onNavigate: (page: Page) => void;
}

export const SandboxPage: React.FC<SandboxPageProps> = ({ onNavigate }) => {
  // Demonstration creator grids
  const [editorInput, setEditorInput] = useState<Grid>([
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]);
  const [editorOutput, setEditorOutput] = useState<Grid>([
    [3, 0, 0],
    [0, 3, 0],
    [0, 0, 3],
  ]);

  // Demonstration stream
  const [customDemos, setCustomDemos] = useState<Demonstration[]>([
    {
      id: 'custom_1',
      label: 'Demonstration 1',
      input_grid: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
      output_grid: [
        [3, 0, 0],
        [0, 3, 0],
        [0, 0, 3],
      ],
    },
  ]);

  // Test input grid
  const [testInput, setTestInput] = useState<Grid>([
    [0, 1, 0],
    [1, 0, 1],
    [0, 1, 0],
  ]);

  // Inference and prediction state
  const [isInferring, setIsInferring] = useState<boolean>(false);
  const [inferResult, setInferResult] = useState<InferResponse | null>(null);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [applyResult, setApplyResult] = useState<ApplyResponse | null>(null);

  const handleAddDemo = () => {
    const newDemo: Demonstration = {
      id: `custom_${customDemos.length + 1}`,
      label: `Demonstration ${customDemos.length + 1}`,
      input_grid: editorInput.map((row) => [...row]),
      output_grid: editorOutput.map((row) => [...row]),
    };
    setCustomDemos([...customDemos, newDemo]);
    setInferResult(null);
    setApplyResult(null);
  };

  const handleClearAllDemos = () => {
    setCustomDemos([]);
    setInferResult(null);
    setApplyResult(null);
  };

  const handleInfer = async () => {
    if (customDemos.length === 0) return;
    setIsInferring(true);
    try {
      const res = await apiClient.inferRule(customDemos);
      setInferResult(res);
      setApplyResult(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsInferring(false);
    }
  };

  const handleApply = async () => {
    if (!inferResult?.selected_rule) return;
    setIsApplying(true);
    try {
      const res = await apiClient.applyRule(inferResult.selected_rule, testInput, null);
      setApplyResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem' }}>Demonstration Sandbox</h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
          Create custom demonstration pairs, ask the engine to infer your rule, and test it on a new canvas.
        </p>
      </div>

      {/* Editor Section */}
      <div className="card card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem' }}>1. Draw Demonstration Pair</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Select a color and click cells on the input and output grids.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
          <GridEditor grid={editorInput} onChange={setEditorInput} label="Input Grid" />
          <div className="demo-arrow">
            <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>→</span>
          </div>
          <GridEditor grid={editorOutput} onChange={setEditorOutput} label="Output Grid" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={handleAddDemo}>
            <Plus size={16} /> Add to Demonstrations
          </button>
        </div>
      </div>

      {/* Demonstration Stream */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>2. Active Demonstrations ({customDemos.length})</h3>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {customDemos.length > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={handleClearAllDemos}>
                <Trash2 size={14} /> Clear All
              </button>
            )}

            <button
              className="btn btn-primary"
              onClick={handleInfer}
              disabled={customDemos.length === 0 || isInferring}
            >
              <Sparkles size={16} /> {isInferring ? 'Inferring...' : 'Infer Custom Skill'}
            </button>
          </div>
        </div>

        {customDemos.length > 0 ? (
          <DemoViewer demonstrations={customDemos} title="" cellSize={28} />
        ) : (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No demonstrations added yet. Use the editor above to draw an input-output pair.
          </div>
        )}

        {/* Inferred Rule Summary */}
        {inferResult && (
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--bg-main)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid ' + (inferResult.selected_rule ? 'rgba(59, 130, 246, 0.4)' : 'rgba(244, 63, 94, 0.4)'),
              fontSize: '0.9rem',
            }}
          >
            {inferResult.selected_rule ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#93c5fd' }}>Inferred Rule: {inferResult.selected_rule.description}</strong>
                <span className="badge badge-green">{(inferResult.selected_rule.confidence * 100).toFixed(0)}% Match</span>
              </div>
            ) : (
              <div style={{ color: '#fb7185' }}>
                {inferResult.ambiguity_reason || 'Could not infer a unique consistent rule from the provided examples.'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Test Canvas */}
      <div className="card card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>3. Test on Novel Unseen Input</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              Draw a new test input and see the inferred rule's prediction.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleApply}
            disabled={!inferResult?.selected_rule || isApplying}
          >
            <Play size={16} /> {isApplying ? 'Applying...' : 'Apply Inferred Skill'}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
          <GridEditor grid={testInput} onChange={setTestInput} label="Test Input Grid" />
          <div className="demo-arrow">
            <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>→</span>
          </div>
          <div>
            <span className="badge badge-amber" style={{ marginBottom: 'var(--space-2)', display: 'block', textAlign: 'center' }}>
              Prediction
            </span>
            {applyResult ? (
              <GridView grid={applyResult.predicted_grid} cellSize={36} />
            ) : (
              <div
                style={{
                  width: `${testInput[0].length * 36 + 12}px`,
                  height: `${testInput.length * 36 + 12}px`,
                  border: '2px dashed var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  padding: 'var(--space-2)',
                }}
              >
                Inferred prediction appears here
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', paddingTop: 'var(--space-4)' }}>
        <button className="btn btn-secondary" onClick={() => onNavigate('ambiguity')}>
          <ArrowLeft size={16} /> Back to Ambiguity Case
        </button>
        <button className="btn btn-primary" onClick={() => onNavigate('bdh')}>
          Next: BDH-CQ Research Connection <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
