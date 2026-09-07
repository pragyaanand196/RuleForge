import React, { useState, useEffect } from 'react';
import { Page, Task, InferResponse, ApplyResponse, Demonstration } from '../types';
import { apiClient } from '../services/api';
import { DemoViewer } from '../components/DemoViewer';
import { PredictionViewer } from '../components/PredictionViewer';
import { AlertTriangle, Plus, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AmbiguityPageProps {
  onNavigate: (page: Page) => void;
}

export const AmbiguityPage: React.FC<AmbiguityPageProps> = ({ onNavigate }) => {
  const [task, setTask] = useState<Task | null>(null);
  const [activeDemos, setActiveDemos] = useState<Demonstration[]>([]);
  const [hasAddedDisambiguation, setHasAddedDisambiguation] = useState<boolean>(false);

  const [isInferring, setIsInferring] = useState<boolean>(false);
  const [inferResult, setInferResult] = useState<InferResponse | null>(null);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [applyResult, setApplyResult] = useState<ApplyResponse | null>(null);

  useEffect(() => {
    async function loadAmbiguityTask() {
      try {
        const t = await apiClient.getTask('task_ambiguity_01');
        setTask(t);
        // Start with only the sparse ambiguous demo
        setActiveDemos([t.demonstrations[0]]);
      } catch (err) {
        console.error(err);
      }
    }
    loadAmbiguityTask();
  }, []);

  const handleInfer = async () => {
    if (!task) return;
    setIsInferring(true);
    try {
      const res = await apiClient.inferRule(activeDemos, task.id);
      setInferResult(res);
      setApplyResult(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsInferring(false);
    }
  };

  const handleAddDisambiguatingDemo = async () => {
    if (!task || !task.extra_demonstrations) return;
    const disambiguatingDemo = task.extra_demonstrations[0];
    const newDemoSet = [...activeDemos, disambiguatingDemo];
    setActiveDemos(newDemoSet);
    setHasAddedDisambiguation(true);

    // Automatically re-run inference
    setIsInferring(true);
    try {
      const res = await apiClient.inferRule(newDemoSet, task.id);
      setInferResult(res);
      setApplyResult(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsInferring(false);
    }
  };

  const handleApply = async () => {
    if (!task || !inferResult?.selected_rule) return;
    setIsApplying(true);
    try {
      const res = await apiClient.applyRule(
        inferResult.selected_rule,
        task.test_input,
        task.test_output
      );
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
        <h1 style={{ fontSize: '2rem' }}>Ambiguity & Failure Case</h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
          When demonstrations are sparse, multiple rules can fit the same evidence. Adding a diverse demonstration resolves the ambiguity.
        </p>
      </div>

      {/* Demonstrations View */}
      <div className="card card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>
              {hasAddedDisambiguation ? 'Resolved Demonstrations (k=2)' : 'Ambiguous Demonstration (k=1)'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              {hasAddedDisambiguation
                ? 'Demonstration 2 provides diverse cell coordinates, ruling out alternative spatial shifts.'
                : 'In Demo 1, only the top-left cell (0,0) changes. Is the rule global color mapping, or position-specific?'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            {!hasAddedDisambiguation ? (
              <button className="btn btn-secondary" onClick={handleAddDisambiguatingDemo}>
                <Plus size={16} /> Add Disambiguating Demo
              </button>
            ) : (
              <span className="badge badge-green">
                <CheckCircle2 size={14} /> Disambiguation Added
              </span>
            )}

            <button className="btn btn-primary" onClick={handleInfer} disabled={isInferring}>
              {isInferring ? 'Inferring...' : 'Infer Rule'}
            </button>
          </div>
        </div>

        <DemoViewer demonstrations={activeDemos} title="" cellSize={32} />
      </div>

      {/* Inference Outcome Panel */}
      {inferResult && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {inferResult.is_ambiguous ? (
              <AlertTriangle size={22} color="var(--accent-amber)" />
            ) : (
              <ShieldCheck size={22} color="var(--accent-emerald)" />
            )}
            <h3 style={{ fontSize: '1.15rem', color: inferResult.is_ambiguous ? '#fbbf24' : '#34d399' }}>
              {inferResult.is_ambiguous ? 'Ambiguity Detected: Multiple Rules Fit' : 'Ambiguity Resolved!'}
            </h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            {inferResult.is_ambiguous
              ? 'The single demonstration is consistent with multiple valid hypotheses (e.g. global color replacement vs spatial shift). The system cannot determine the true rule without more evidence.'
              : 'The additional demonstration introduced counter-evidence, uniquely identifying the true color mapping rule!'}
          </p>

          {/* Candidate List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {inferResult.candidate_rules.map((cand) => (
              <div
                key={cand.rule_id}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'var(--bg-main)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                }}
              >
                <span>{cand.description}</span>
                <span className="badge badge-blue">Confidence: {(cand.confidence * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unseen Test Input & Evaluation */}
      {task && (
        <PredictionViewer
          testInput={task.test_input}
          groundTruth={task.test_output}
          candidateRule={inferResult?.selected_rule || null}
          applyResult={applyResult}
          onApply={handleApply}
          isApplying={isApplying}
        />
      )}

      {/* Footer Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', paddingTop: 'var(--space-4)' }}>
        <button className="btn btn-secondary" onClick={() => onNavigate('generalization')}>
          <ArrowLeft size={16} /> Back to Generalization
        </button>
        <button className="btn btn-primary" onClick={() => onNavigate('sandbox')}>
          Next: Open Sandbox <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
