import React from 'react';
import { Demonstration } from '../types';
import { GridView } from './GridView';
import { ArrowRight } from 'lucide-react';

interface DemoViewerProps {
  demonstrations: Demonstration[];
  title?: string;
  cellSize?: number;
}

export const DemoViewer: React.FC<DemoViewerProps> = ({
  demonstrations,
  title = 'Provided Demonstrations',
  cellSize = 28,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{title}</h3>
          <span className="badge badge-blue">{demonstrations.length} Demonstration{demonstrations.length > 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="demos-grid">
        {demonstrations.map((demo, idx) => (
          <div key={demo.id || idx} className="demo-card">
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', alignSelf: 'flex-start' }}>
              {demo.label || `Demonstration ${idx + 1}`}
            </div>

            <div className="demo-pair">
              <GridView grid={demo.input_grid} label="Input" cellSize={cellSize} />
              <div className="demo-arrow">
                <ArrowRight size={20} />
              </div>
              <GridView grid={demo.output_grid} label="Output" cellSize={cellSize} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
