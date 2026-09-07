import React, { useState } from 'react';
import { InferResponse, LearnerHypothesisResponse } from '../types';
import { Sparkles, HelpCircle, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

interface HypothesisCardProps {
  taskId?: string;
  onInfer: () => void;
  isLoading: boolean;
  inferResult: InferResponse | null;
  onCheckHypothesis?: (text: string) => Promise<LearnerHypothesisResponse>;
}

export const HypothesisCard: React.FC<HypothesisCardProps> = ({
  onInfer,
  isLoading,
  inferResult,
  onCheckHypothesis,
}) => {
  const [userGuess, setUserGuess] = useState('');
  const [hypothesisFeedback, setHypothesisFeedback] = useState<LearnerHypothesisResponse | null>(null);
  const [isCheckingGuess, setIsCheckingGuess] = useState(false);

  const handleCheckGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userGuess.trim() || !onCheckHypothesis) return;

    setIsCheckingGuess(true);
    try {
      const res = await onCheckHypothesis(userGuess);
      setHypothesisFeedback(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingGuess(false);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <HelpCircle size={18} color="var(--accent-blue)" />
          <h3 style={{ fontSize: '1.1rem' }}>Step 1: Inspect & Hypothesize</h3>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Examine the demonstration pairs above. What operational rule turns each input into its output?
        </p>
      </div>

      {/* User Hypothesis Input */}
      <form onSubmit={handleCheckGuess} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Every blue cell (1) turns into red (2)..."
            value={userGuess}
            onChange={(e) => setUserGuess(e.target.value)}
            style={{
              flex: 1,
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem 0.9rem',
              color: 'var(--text-primary)',
            }}
          />
          <button
            type="submit"
            className="btn btn-secondary btn-sm"
            disabled={!userGuess.trim() || isCheckingGuess}
          >
            {isCheckingGuess ? 'Checking...' : 'Check My Rule'}
          </button>
        </div>

        {hypothesisFeedback && (
          <div
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: hypothesisFeedback.similarity_score >= 0.6 ? 'var(--accent-emerald-subtle)' : 'var(--bg-surface-elevated)',
              border: '1px solid ' + (hypothesisFeedback.similarity_score >= 0.6 ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-default)'),
              fontSize: '0.85rem',
            }}
          >
            <div style={{ fontWeight: 600, color: hypothesisFeedback.similarity_score >= 0.6 ? '#34d399' : 'var(--text-primary)', marginBottom: 4 }}>
              {hypothesisFeedback.similarity_score >= 0.6 ? 'Intuition Confirmed' : 'Observation Recorded'}
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{hypothesisFeedback.feedback}</p>
          </div>
        )}
      </form>

      {/* Infer Button Action */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Step 2: Systematic Rule Inference</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ask the rule engine to search for transformations consistent with all demonstrations.</div>
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={onInfer}
          disabled={isLoading}
          style={{ minWidth: 160 }}
        >
          <Sparkles size={18} />
          {isLoading ? 'Inferring...' : 'Infer Skill'}
        </button>
      </div>

      {/* Inferred Skill Result Panel */}
      {inferResult && (
        <div className="skill-card">
          <div className="skill-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {inferResult.is_ambiguous ? (
                <AlertTriangle size={20} color="var(--accent-amber)" />
              ) : (
                <ShieldCheck size={20} color="var(--accent-emerald)" />
              )}
              <span style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                {inferResult.is_ambiguous ? 'Underdetermined / Ambiguous Transformation' : 'Inferred Skill Formulation'}
              </span>
            </div>

            {inferResult.selected_rule && (
              <span className={`badge ${inferResult.is_ambiguous ? 'badge-amber' : 'badge-green'}`}>
                Confidence: {(inferResult.selected_rule.confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>

          {inferResult.selected_rule ? (
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 500, color: '#93c5fd', marginBottom: 'var(--space-2)' }}>
                {inferResult.selected_rule.description}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Rule Family: <code style={{ color: '#f1f5f9' }}>{inferResult.selected_rule.family}</code>
              </div>
            </div>
          ) : (
            <div style={{ color: '#fb7185', fontSize: '0.9rem' }}>
              {inferResult.ambiguity_reason || 'No consistent rule found across demonstrations.'}
            </div>
          )}

          {/* Ambiguity Reason */}
          {inferResult.is_ambiguous && inferResult.ambiguity_reason && (
            <div
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-amber-subtle)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#fde68a',
                fontSize: '0.85rem',
              }}
            >
              <strong>Ambiguity Notice:</strong> {inferResult.ambiguity_reason}
            </div>
          )}

          {/* Evidence lines */}
          {inferResult.evidence && inferResult.evidence.length > 0 && (
            <div className="evidence-box">
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                Empirical Evidence Log:
              </div>
              <ul>
                {inferResult.evidence.map((line, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Check size={14} color="var(--accent-emerald)" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
