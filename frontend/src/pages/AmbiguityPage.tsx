import React, { useState, useEffect } from 'react';
import { Page, Task, InferResponse, ApplyResponse, Demonstration } from '../types';
import { apiClient } from '../services/api';
import { DemoViewer } from '../components/DemoViewer';
import { PredictionViewer } from '../components/PredictionViewer';
import { AlertTriangle, Plus, ArrowLeft, ArrowRight, ShieldCheck, RefreshCw, Sparkles, XCircle } from 'lucide-react';

interface AmbiguityPageProps {
  onNavigate: (page: Page) => void;
}

export const AmbiguityPage: React.FC<AmbiguityPageProps> = ({ onNavigate }) => {
  const [activeScenario, setActiveScenario] = useState<'underdetermined' | 'contradictory' | 'unsupported'>('underdetermined');
  const [task, setTask] = useState<Task | null>(null);

  // Scenario 1: Underdetermined state
  const [underDemos, setUnderDemos] = useState<Demonstration[]>([]);
  const [hasAddedDisambiguation, setHasAddedDisambiguation] = useState<boolean>(false);
  const [isInferringUnder, setIsInferringUnder] = useState<boolean>(false);
  const [inferResultUnder, setInferResultUnder] = useState<InferResponse | null>(null);
  const [isApplyingUnder, setIsApplyingUnder] = useState<boolean>(false);
  const [applyResultUnder, setApplyResultUnder] = useState<ApplyResponse | null>(null);

  // Scenario 2: Contradictory demonstrations
  const contradictoryDemos: Demonstration[] = [
    {
      id: 'contra_1',
      label: 'Demonstration 1 (Observation A)',
      input_grid: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
      ],
      output_grid: [
        [2, 0, 0],
        [0, 2, 0],
        [0, 0, 0]
      ]
    },
    {
      id: 'contra_2',
      label: 'Demonstration 2 (Direct Contradiction)',
      input_grid: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
      ],
      output_grid: [
        [3, 0, 0],
        [0, 3, 0],
        [0, 0, 0]
      ]
    }
  ];
  const [inferResultContra, setInferResultContra] = useState<InferResponse | null>(null);
  const [isInferringContra, setIsInferringContra] = useState<boolean>(false);

  // Scenario 3: Unsupported rule (e.g. spiral maze / arbitrary non-isomorphic permutation)
  const unsupportedDemos: Demonstration[] = [
    {
      id: 'unsup_1',
      label: 'Demo 1 (Arbitrary Scatter)',
      input_grid: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ],
      output_grid: [
        [9, 4, 1],
        [2, 8, 3],
        [7, 6, 5]
      ]
    }
  ];
  const [inferResultUnsup, setInferResultUnsup] = useState<InferResponse | null>(null);
  const [isInferringUnsup, setIsInferringUnsup] = useState<boolean>(false);

  useEffect(() => {
    async function loadAmbiguityTask() {
      try {
        const t = await apiClient.getTask('task_ambiguity_01');
        setTask(t);
        setUnderDemos([t.demonstrations[0]]);
      } catch (err) {
        console.error(err);
      }
    }
    loadAmbiguityTask();
  }, []);

  const handleInferUnder = async (demos: Demonstration[]) => {
    if (!task) return;
    setIsInferringUnder(true);
    try {
      const res = await apiClient.inferRule(demos, task.id);
      setInferResultUnder(res);
      setApplyResultUnder(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsInferringUnder(false);
    }
  };

  const handleAddDisambiguatingDemo = async () => {
    if (!task || !task.extra_demonstrations) return;
    const disambiguatingDemo = task.extra_demonstrations[0];
    const newDemoSet = [underDemos[0], disambiguatingDemo];
    setUnderDemos(newDemoSet);
    setHasAddedDisambiguation(true);
    await handleInferUnder(newDemoSet);
  };

  const handleResetUnder = async () => {
    if (!task) return;
    setUnderDemos([task.demonstrations[0]]);
    setHasAddedDisambiguation(false);
    setInferResultUnder(null);
    setApplyResultUnder(null);
  };

  const handleApplyUnder = async () => {
    if (!task || !inferResultUnder?.selected_rule) return;
    setIsApplyingUnder(true);
    try {
      const res = await apiClient.applyRule(
        inferResultUnder.selected_rule,
        task.test_input,
        task.test_output
      );
      setApplyResultUnder(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsApplyingUnder(false);
    }
  };

  const handleInferContra = async () => {
    setIsInferringContra(true);
    try {
      const res = await apiClient.inferRule(contradictoryDemos);
      setInferResultContra(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsInferringContra(false);
    }
  };

  const handleInferUnsup = async () => {
    setIsInferringUnsup(true);
    try {
      const res = await apiClient.inferRule(unsupportedDemos);
      setInferResultUnsup(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsInferringUnsup(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <AlertTriangle size={24} color="var(--accent-amber)" />
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Failure & Ambiguity Laboratory</h1>
        </div>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
          Real-world demonstration streams can be underdetermined, contradictory, or outside the hypothesis space. A principled system must express uncertainty rather than false confidence.
        </p>
      </div>

      {/* Scenario Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeScenario === 'underdetermined' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveScenario('underdetermined')}
        >
          1. Underdetermined Evidence (k=1 → k=2)
        </button>
        <button
          className={`btn ${activeScenario === 'contradictory' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveScenario('contradictory')}
        >
          2. Contradictory Demonstrations
        </button>
        <button
          className={`btn ${activeScenario === 'unsupported' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveScenario('unsupported')}
        >
          3. Out-of-Hypothesis-Space Task
        </button>
      </div>

      {/* Scenario 1: Underdetermined */}
      {activeScenario === 'underdetermined' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="card card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>
                  {hasAddedDisambiguation ? 'Resolved Demonstration Stream (k=2)' : 'Sparse Demonstration (k=1: Underdetermined)'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {hasAddedDisambiguation
                    ? 'Demonstration 2 introduced diverse cell coordinates, eliminating alternative spatial hypotheses.'
                    : 'In Demo 1, only the top-left cell (0,0) changes. Multiple distinct rules fit this single example perfectly.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                {!hasAddedDisambiguation ? (
                  <button className="btn btn-secondary" onClick={handleAddDisambiguatingDemo}>
                    <Plus size={16} /> Add Disambiguating Demo
                  </button>
                ) : (
                  <button className="btn btn-secondary btn-sm" onClick={handleResetUnder}>
                    <RefreshCw size={14} /> Reset to k=1
                  </button>
                )}

                <button
                  className="btn btn-primary"
                  onClick={() => handleInferUnder(underDemos)}
                  disabled={isInferringUnder}
                >
                  <Sparkles size={16} /> {isInferringUnder ? 'Inferring...' : 'Infer Candidates'}
                </button>
              </div>
            </div>

            <DemoViewer demonstrations={underDemos} title="" cellSize={32} />
          </div>

          {/* Inference Outcome Panel */}
          {inferResultUnder && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  {inferResultUnder.is_ambiguous ? (
                    <AlertTriangle size={22} color="var(--accent-amber)" />
                  ) : (
                    <ShieldCheck size={22} color="var(--accent-emerald)" />
                  )}
                  <h3 style={{ fontSize: '1.15rem', color: inferResultUnder.is_ambiguous ? '#fbbf24' : '#34d399', margin: 0 }}>
                    {inferResultUnder.is_ambiguous ? 'Ambiguity Detected: Multiple Hypotheses Fit 100%' : 'Ambiguity Successfully Resolved!'}
                  </h3>
                </div>

                <span className={`badge ${inferResultUnder.is_ambiguous ? 'badge-amber' : 'badge-green'}`}>
                  {inferResultUnder.candidate_rules.length} Consistent Hypotheses
                </span>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                {inferResultUnder.ambiguity_reason || 'Single unique invariant rule identified.'}
              </p>

              {/* Candidate Hypotheses List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Verified Candidate Rules in Hypothesis Space:
                </div>
                {inferResultUnder.candidate_rules.map((cand) => (
                  <div
                    key={cand.rule_id}
                    style={{
                      padding: 'var(--space-3)',
                      backgroundColor: 'var(--bg-main)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.85rem',
                      flexWrap: 'wrap',
                      gap: 'var(--space-2)',
                    }}
                  >
                    <div>
                      <span className="badge badge-blue" style={{ marginRight: 'var(--space-2)' }}>{cand.family}</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{cand.description}</strong>
                    </div>
                    <span className="badge badge-green">100% Demo Match</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Prediction Stage */}
          {task && (
            <PredictionViewer
              testInput={task.test_input}
              groundTruth={task.test_output}
              candidateRule={inferResultUnder?.selected_rule || null}
              applyResult={applyResultUnder}
              onApply={handleApplyUnder}
              isApplying={isApplyingUnder}
            />
          )}
        </div>
      )}

      {/* Scenario 2: Contradictory */}
      {activeScenario === 'contradictory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="card card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>Contradictory Demonstration Pair</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Both demonstrations provide the exact same input grid, but specify mutually conflicting outputs.
                </p>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleInferContra}
                disabled={isInferringContra}
              >
                <Sparkles size={16} /> {isInferringContra ? 'Testing...' : 'Test Contradictory Stream'}
              </button>
            </div>

            <DemoViewer demonstrations={contradictoryDemos} title="" cellSize={32} />
          </div>

          {inferResultContra && (
            <div
              className="card"
              style={{
                backgroundColor: 'var(--accent-rose-subtle)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <XCircle size={22} color="#fb7185" />
                <h3 style={{ fontSize: '1.15rem', color: '#fb7185', margin: 0 }}>
                  Contradiction Detected: Rejection State
                </h3>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>
                {inferResultContra.ambiguity_reason}
              </p>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                🔬 <strong>Scientific Insight:</strong> In-context skill acquisition depends on deterministic consistency across demonstrations. When inputs produce contradictory transitions, an honest inference system rejects the input rather than inventing an ad-hoc hallucination.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scenario 3: Unsupported */}
      {activeScenario === 'unsupported' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="card card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>Arbitrary Non-Isomorphic Transformation</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Demonstrations that cannot be explained by any of the supported rule families (Color, Geometric, Translation, Pattern, Counting).
                </p>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleInferUnsup}
                disabled={isInferringUnsup}
              >
                <Sparkles size={16} /> {isInferringUnsup ? 'Testing...' : 'Infer Hypothesis'}
              </button>
            </div>

            <DemoViewer demonstrations={unsupportedDemos} title="" cellSize={32} />
          </div>

          {inferResultUnsup && (
            <div
              className="card"
              style={{
                backgroundColor: 'var(--accent-amber-subtle)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <AlertTriangle size={22} color="#fbbf24" />
                <h3 style={{ fontSize: '1.15rem', color: '#fbbf24', margin: 0 }}>
                  Out of Supported Hypothesis Space
                </h3>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>
                {inferResultUnsup.ambiguity_reason}
              </p>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                🔬 <strong>Scientific Insight:</strong> Any learner or neural architecture operates within an inductive bias. When the true generation rule lies outside that inductive hypothesis space, the system safely reports that no consistent rule was discovered.
              </div>
            </div>
          )}
        </div>
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
