import React, { useState } from 'react';
import { InferResponse, LearnerHypothesisResponse, HypothesisClassification } from '../types';
import { Sparkles, HelpCircle, Check, AlertTriangle, ShieldCheck, Lightbulb, CheckCircle2, XCircle, Info } from 'lucide-react';

interface HypothesisCardProps {
  taskId?: string;
  onInfer: () => void;
  isLoading: boolean;
  inferResult: InferResponse | null;
  onCheckHypothesis?: (text: string) => Promise<LearnerHypothesisResponse>;
}

export const HypothesisCard: React.FC<HypothesisCardProps> = ({
  taskId,
  onInfer,
  isLoading,
  inferResult,
  onCheckHypothesis,
}) => {
  const [userGuess, setUserGuess] = useState('');
  const [hypothesisFeedback, setHypothesisFeedback] = useState<LearnerHypothesisResponse | null>(null);
  const [isCheckingGuess, setIsCheckingGuess] = useState(false);

  React.useEffect(() => {
    setUserGuess('');
    setHypothesisFeedback(null);
  }, [taskId]);

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

  const getClassificationBadge = (classification: HypothesisClassification) => {
    switch (classification) {
      case 'correct':
        return <span className="badge badge-green"><CheckCircle2 size={12} /> Correct Hypothesis</span>;
      case 'partially_correct':
        return <span className="badge badge-blue"><Info size={12} /> Partial Hypothesis</span>;
      case 'opposite_rule':
        return <span className="badge badge-amber"><AlertTriangle size={12} /> Opposite Orientation</span>;
      case 'wrong_rule':
        return <span className="badge badge-rose"><XCircle size={12} /> Incompatible Rule Family</span>;
      case 'ambiguous':
        return <span className="badge badge-amber"><HelpCircle size={12} /> Ambiguous Observation</span>;
      default:
        return <span className="badge badge-amber"><Info size={12} /> Input Recorded</span>;
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
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Every blue cell (1) turns into red (2)..."
            value={userGuess}
            onChange={(e) => setUserGuess(e.target.value)}
            style={{
              flex: 1,
              minWidth: '240px',
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
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor:
                hypothesisFeedback.classification === 'correct'
                  ? 'var(--accent-emerald-subtle)'
                  : hypothesisFeedback.classification === 'partially_correct'
                  ? 'var(--accent-blue-subtle)'
                  : hypothesisFeedback.classification === 'opposite_rule'
                  ? 'var(--accent-amber-subtle)'
                  : 'var(--bg-surface-elevated)',
              border: '1px solid ' + (
                hypothesisFeedback.classification === 'correct'
                  ? 'rgba(16, 185, 129, 0.4)'
                  : hypothesisFeedback.classification === 'partially_correct'
                  ? 'rgba(59, 130, 246, 0.4)'
                  : 'var(--border-default)'
              ),
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                Hypothesis Assessment
              </div>
              {getClassificationBadge(hypothesisFeedback.classification)}
            </div>

            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {hypothesisFeedback.feedback}
            </p>

            {hypothesisFeedback.educational_guidance && (
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--space-2)',
                  alignItems: 'flex-start',
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px dashed var(--border-subtle)',
                  color: '#93c5fd',
                  fontSize: '0.8rem',
                }}
              >
                <Lightbulb size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong>Guiding Hint:</strong> {hypothesisFeedback.educational_guidance}</span>
              </div>
            )}
          </div>
        )}
      </form>

      {/* Infer Button Action */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Step 2: Systematic Rule Inference</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Search multi-family hypothesis space for candidate rules matching all demonstrations.</div>
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

            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
              {inferResult.hypothesis_space_size !== undefined && (
                <span className="badge badge-blue">
                  {inferResult.hypothesis_space_size} Candidate Rule{inferResult.hypothesis_space_size !== 1 ? 's' : ''}
                </span>
              )}
              {inferResult.selected_rule && (
                <span className={`badge ${inferResult.is_ambiguous ? 'badge-amber' : 'badge-green'}`}>
                  Confidence: {(inferResult.selected_rule.confidence * 100).toFixed(0)}%
                </span>
              )}
            </div>
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
