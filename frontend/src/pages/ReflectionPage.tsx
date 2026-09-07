import React, { useState } from 'react';
import { Page, ReflectionResponse } from '../types';
import { apiClient } from '../services/api';
import { BrainCircuit, Sparkles, CheckCircle, AlertTriangle, ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react';


interface ReflectionPageProps {
  onNavigate: (page: Page) => void;
}

export const ReflectionPage: React.FC<ReflectionPageProps> = ({ onNavigate }) => {
  const [reflectionText, setReflectionText] = useState<string>(
    'The model observes a small set of input-output demonstrations, extracts the underlying transformation rule into its context/recurrent state without modifying its weights, and successfully generalizes to solve a novel unseen example zero-shot.'
  );
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<ReflectionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEvaluate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!reflectionText.trim()) return;

    setIsEvaluating(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.evaluateReflection(reflectionText);
      setEvaluation(res);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to evaluate reflection. Please check backend status.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="container container-narrow" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <BrainCircuit size={24} color="var(--accent-blue)" />
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Conceptual Reflection & Synthesis</h1>
        </div>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
          Consolidate your mental model. Synthesize the scientific principles of Skill Acquisition from Demonstrations in your own words.
        </p>
      </div>

      {/* Guiding Question Card */}
      <div className="card card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Reflection Prompt</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
            Explain the complete journey: How does the system use demonstration examples? How does it infer the hidden rule? And how does zero-shot adaptation work without modifying model weights at inference time?
          </p>
        </div>

        <form onSubmit={handleEvaluate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <textarea
            className="input-field"
            rows={5}
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="Write your explanation here..."
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3)',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              lineHeight: 1.5,
              resize: 'vertical',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Evaluated deterministically across 5 core scientific rubric dimensions.
            </span>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!reflectionText.trim() || isEvaluating}
            >
              <Sparkles size={16} />
              {isEvaluating ? 'Evaluating...' : 'Evaluate My Understanding'}
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div
          style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--accent-rose-subtle)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            borderRadius: 'var(--radius-md)',
            color: '#fb7185',
            fontSize: '0.9rem',
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Evaluation Results */}
      {evaluation && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Score & Mastery Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                Mastery Assessment
              </span>
              <h2 style={{ fontSize: '1.4rem', color: evaluation.score >= 80 ? '#34d399' : evaluation.score >= 50 ? '#fbbf24' : '#60a5fa', margin: '2px 0 0 0' }}>
                {evaluation.mastery_level} Comprehension ({evaluation.score}%)
              </h2>
            </div>

            <span className={`badge ${evaluation.score >= 80 ? 'badge-green' : evaluation.score >= 50 ? 'badge-amber' : 'badge-blue'}`}>
              {evaluation.concepts_identified.length} / 5 Rubric Concepts Identified
            </span>
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
            {evaluation.feedback}
          </p>

          {/* Concepts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
            <div style={{ padding: 'var(--space-3)', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: 'var(--space-2)' }}>
                ✓ Identified Concepts:
              </div>
              {evaluation.concepts_identified.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                  {evaluation.concepts_identified.map((concept, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={14} color="var(--accent-emerald)" />
                      <span>{concept}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>None yet</div>
              )}
            </div>

            <div style={{ padding: 'var(--space-3)', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: 'var(--space-2)' }}>
                Suggestions / Missing Dimensions:
              </div>
              {evaluation.missing_concepts.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                  {evaluation.missing_concepts.map((concept, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={14} color="var(--accent-amber)" />
                      <span style={{ color: 'var(--text-secondary)' }}>{concept}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ fontSize: '0.85rem', color: '#34d399' }}>Complete coverage of all 5 core rubric dimensions!</div>
              )}
            </div>
          </div>

          {/* Strengths & Tips */}
          {evaluation.strengths.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Key Strengths:</div>
              <ul style={{ paddingLeft: 'var(--space-4)', margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {evaluation.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {evaluation.improvement_tips.length > 0 && (
            <div style={{ padding: 'var(--space-3)', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
              <Lightbulb size={18} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <strong>Tip to reach 100%:</strong> {evaluation.improvement_tips[0]}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', paddingTop: 'var(--space-4)' }}>
        <button className="btn btn-secondary" onClick={() => onNavigate('challenge')}>
          <ArrowLeft size={16} /> Back to 60s Challenge
        </button>
        <button className="btn btn-primary" onClick={() => onNavigate('research')}>
          Next: Primary Research Sources <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
