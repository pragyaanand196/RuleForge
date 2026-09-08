import React, { useState } from 'react';
import { Page, Grid, Demonstration, InferResponse, ApplyResponse } from '../types';
import { apiClient } from '../services/api';
import { GridEditor } from '../components/GridEditor';
import { GridView } from '../components/GridView';
import { DemoViewer } from '../components/DemoViewer';
import { Plus, Sparkles, Play, Trash2, ArrowLeft, ArrowRight, AlertCircle, Layers, ShieldCheck } from 'lucide-react';

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

  // State
  const [isInferring, setIsInferring] = useState<boolean>(false);
  const [inferResult, setInferResult] = useState<InferResponse | null>(null);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [applyResult, setApplyResult] = useState<ApplyResponse | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAddDemo = () => {
    setValidationError(null);

    // Dimension check
    if (editorInput.length !== editorOutput.length || editorInput[0].length !== editorOutput[0].length) {
      setValidationError('Input grid and output grid must have identical row and column dimensions.');
      return;
    }

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

  const handleRemoveDemo = (idx: number) => {
    const updated = customDemos.filter((_, i) => i !== idx);
    setCustomDemos(updated);
    setInferResult(null);
    setApplyResult(null);
    setValidationError(null);
  };

  const handleClearAllDemos = () => {
    setCustomDemos([]);
    setInferResult(null);
    setApplyResult(null);
    setValidationError(null);
  };

  const handleInfer = async () => {
    if (customDemos.length === 0) {
      setValidationError('Please add at least one demonstration pair before inferring a skill.');
      return;
    }

    setIsInferring(true);
    setValidationError(null);
    try {
      const res = await apiClient.inferRule(customDemos);
      setInferResult(res);
      setApplyResult(null);
    } catch (err: any) {
      console.error(err);
      setValidationError('Skill inference engine encountered an issue.');
    } finally {
      setIsInferring(false);
    }
  };

  const handleApply = async () => {
    if (!inferResult?.selected_rule) {
      setValidationError('Please infer a valid candidate skill before applying to the test input.');
      return;
    }

    setIsApplying(true);
    setValidationError(null);
    try {
      const res = await apiClient.applyRule(inferResult.selected_rule, testInput, null);
      setApplyResult(res);
    } catch (err: any) {
      console.error(err);
      setValidationError('Failed to apply rule to test input.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Layers size={24} color="var(--accent-blue)" />
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Demonstration Sandbox</h1>
        </div>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
          Design custom demonstration pairs, ask the engine to infer the transformation, and apply your learned skill to novel test inputs.
        </p>
      </div>

      {/* Validation Error Alert */}
      {validationError && (
        <div
          style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--accent-rose-subtle)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            borderRadius: 'var(--radius-md)',
            color: '#fb7185',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: '0.9rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{validationError}</span>
        </div>
      )}

      {/* 1. Demonstration Pair Canvas */}
      <div className="card card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>1. Draw Demonstration Pair</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              Select a color palette chip (0-9) and click cells to paint input and output grids.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
          <GridEditor grid={editorInput} onChange={setEditorInput} label="Demo Input Grid" />
          <div className="demo-arrow">
            <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>→</span>
          </div>
          <GridEditor grid={editorOutput} onChange={setEditorOutput} label="Demo Output Grid" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={handleAddDemo}>
            <Plus size={16} /> Add to Demonstrations
          </button>
        </div>
      </div>

      {/* 2. Active Demonstration Stream */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>2. Active Demonstrations ({customDemos.length})</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              The set of input-output pairs the inference engine will analyze.
            </p>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <DemoViewer demonstrations={customDemos} title="" cellSize={28} />
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {customDemos.map((_, idx) => (
                <button
                  key={idx}
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleRemoveDemo(idx)}
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                  <Trash2 size={12} /> Remove Demo {idx + 1}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No demonstrations added yet. Paint grids above and click 'Add to Demonstrations'.
          </div>
        )}

        {/* Inferred Rule Summary */}
        {inferResult && (
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--bg-main)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid ' + (inferResult.selected_rule ? 'rgba(59, 130, 246, 0.4)' : 'rgba(244, 63, 94, 0.4)'),
              fontSize: '0.9rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            {inferResult.selected_rule ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <ShieldCheck size={18} color="var(--accent-emerald)" />
                    <strong style={{ color: '#93c5fd' }}>Inferred Rule: {inferResult.selected_rule.description}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <span className="badge badge-blue">Family: {inferResult.selected_rule.family}</span>
                    <span className="badge badge-green">{(inferResult.selected_rule.confidence * 100).toFixed(0)}% Match</span>
                  </div>
                </div>
                {inferResult.evidence && inferResult.evidence.length > 0 && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                    {inferResult.evidence[0]}
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: '#fb7185', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <AlertCircle size={18} />
                <span>{inferResult.ambiguity_reason || 'Could not infer a unique consistent rule from the provided examples.'}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Novel Test Input & Prediction Canvas */}
      <div className="card card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>3. Test on Novel Unseen Input</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              Paint a novel test input canvas to evaluate zero-shot execution of the inferred skill.
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
              Inferred Prediction
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
