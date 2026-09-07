import React from 'react';
import { Page, Grid } from '../types';
import { GridView } from '../components/GridView';
import { ArrowRight, Play, BookOpen } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  // Demonstration preview grid
  const sampleInput: Grid = [
    [1, 0, 1],
    [0, 1, 0],
    [1, 0, 1],
  ];
  const sampleOutput: Grid = [
    [2, 0, 2],
    [0, 2, 0],
    [2, 0, 2],
  ];

  return (
    <div className="container container-narrow" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-5)', paddingTop: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '2.4rem', maxWidth: '720px', lineHeight: 1.25 }}>
          Can a machine learn a new skill just by watching a few examples?
        </h1>

        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: 1.6, margin: 0 }}>
          RuleForge demonstrates how a system infers a hidden transformation rule from a few demonstrations and applies it to an unseen example without updating its parameters at inference time.
        </p>

        {/* Live Visual Demonstration Hook */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-6)',
            padding: 'var(--space-6) var(--space-8)',
            backgroundColor: 'var(--bg-surface-elevated)',
            margin: 'var(--space-2) 0',
          }}
        >
          <GridView grid={sampleInput} label="Input Grid" cellSize={32} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--accent-blue)' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Hidden Rule</span>
            <ArrowRight size={24} />
          </div>
          <GridView grid={sampleOutput} label="Output Grid" cellSize={32} />
        </div>

        {/* Primary Call to Action */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn btn-primary btn-lg" onClick={() => onNavigate('lab')}>
            <Play size={18} />
            Start Experiment
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => onNavigate('learn')}>
            <BookOpen size={18} />
            How It Works
          </button>
        </div>
      </section>

      {/* Core Scientific Principle Card */}
      <section className="card card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>The Central Scientific Claim</h2>
        <blockquote
          style={{
            borderLeft: '3px solid var(--accent-blue)',
            paddingLeft: 'var(--space-4)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            fontStyle: 'italic',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          “A system can acquire a previously unseen task skill from a small number of demonstrations and apply the inferred rule to a new example without updating its model parameters at inference time.”
        </blockquote>
      </section>
    </div>
  );
};
