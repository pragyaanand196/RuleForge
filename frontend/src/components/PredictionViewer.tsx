import React from 'react';
import { Grid, ApplyResponse, CandidateRule } from '../types';
import { GridView } from './GridView';
import { Play, CheckCircle, XCircle, ArrowRight, RefreshCw } from 'lucide-react';

interface PredictionViewerProps {
  testInput: Grid;
  groundTruth?: Grid | null;
  candidateRule: CandidateRule | null;
  applyResult: ApplyResponse | null;
  onApply: () => void;
  isApplying: boolean;
  onNextExperiment?: () => void;
}

export const PredictionViewer: React.FC<PredictionViewerProps> = ({
  testInput,
  groundTruth,
  candidateRule,
  applyResult,
  onApply,
  isApplying,
  onNextExperiment,
}) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Step 3: Test on Novel Unseen Input</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              This test grid was <strong>never shown</strong> in the demonstration set. We test if the inferred skill generalizes zero-shot without parameter updates.
            </p>
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={onApply}
            disabled={!candidateRule || isApplying}
            style={{ minWidth: 180 }}
          >
            {isApplying ? (
              <>
                <RefreshCw size={18} className="animate-spin" /> Applying...
              </>
            ) : (
              <>
                <Play size={18} /> Apply Learned Skill
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid Comparison Stage */}
      <div className="comparison-stage">
        {/* Unseen Input */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span className="badge badge-blue">1. Unseen Input</span>
          <GridView grid={testInput} cellSize={36} />
        </div>

        <div className="demo-arrow">
          <ArrowRight size={24} />
        </div>

        {/* System Prediction */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span className="badge badge-amber">2. System Prediction</span>
          {applyResult ? (
            <GridView
              grid={applyResult.predicted_grid}
              diffGrid={applyResult.diff_grid}
              cellSize={36}
            />
          ) : (
            <div
              style={{
                width: `${(testInput[0]?.length || 3) * 36 + 12}px`,
                height: `${(testInput.length || 3) * 36 + 12}px`,
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
              Click 'Apply Learned Skill' to compute
            </div>
          )}
        </div>

        {/* Ground Truth Reveal */}
        {applyResult && groundTruth && (
          <>
            <div className="demo-arrow" style={{ color: 'var(--text-muted)' }}>
              <span>vs</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className="badge badge-green">3. Ground Truth</span>
              <GridView grid={groundTruth} cellSize={36} />
            </div>
          </>
        )}
      </div>

      {/* Accuracy & Evaluation Outcome Banner */}
      {applyResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className={`accuracy-banner ${applyResult.is_correct ? 'success' : 'mismatch'}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              {applyResult.is_correct ? (
                <CheckCircle size={28} />
              ) : (
                <XCircle size={28} />
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                  {applyResult.is_correct ? 'Generalization Verified: 100% Correct' : 'Generalization Mismatch'}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                  {applyResult.explanation}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {applyResult.cell_accuracy}%
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                {applyResult.matched_cells} / {applyResult.total_cells} Cells Matched
              </div>
            </div>
          </div>

          {onNextExperiment && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={onNextExperiment}>
                Proceed to Generalization Experiment <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
