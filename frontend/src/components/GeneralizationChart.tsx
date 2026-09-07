import React, { useState } from 'react';
import { GeneralizationPoint } from '../types';

interface GeneralizationChartProps {
  points: GeneralizationPoint[];
  onSelectPoint?: (point: GeneralizationPoint) => void;
  selectedK?: number;
}

export const GeneralizationChart: React.FC<GeneralizationChartProps> = ({
  points,
  onSelectPoint,
  selectedK,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<GeneralizationPoint | null>(null);

  if (!points || points.length === 0) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
        No generalization data points available. Run the demonstration sweep to generate measured points.
      </div>
    );
  }

  // Chart dimensions
  const svgWidth = 520;
  const svgHeight = 220;
  const padding = { top: 25, right: 35, bottom: 45, left: 55 };

  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  const minK = Math.min(...points.map((p) => p.k_demos));
  const maxK = Math.max(...points.map((p) => p.k_demos));
  const kRange = maxK - minK || 1;

  const getX = (k: number) => padding.left + ((k - minK) / kRange) * plotWidth;
  const getY = (acc: number) => padding.top + plotHeight - (acc / 100) * plotHeight;

  // Build path string for line
  const sortedPoints = [...points].sort((a, b) => a.k_demos - b.k_demos);
  const pathD = sortedPoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.k_demos)} ${getY(p.accuracy)}`)
    .join(' ');

  const activePoint = hoveredPoint || points.find((p) => p.k_demos === selectedK) || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill="var(--text-muted)"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  textAnchor="end"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={svgHeight - padding.bottom}
            stroke="var(--border-default)"
            strokeWidth="1.5"
          />
          <line
            x1={padding.left}
            y1={svgHeight - padding.bottom}
            x2={svgWidth - padding.right}
            y2={svgHeight - padding.bottom}
            stroke="var(--border-default)"
            strokeWidth="1.5"
          />

          {/* X Axis Labels */}
          {sortedPoints.map((p) => {
            const x = getX(p.k_demos);
            return (
              <g key={p.k_demos}>
                <line
                  x1={x}
                  y1={svgHeight - padding.bottom}
                  x2={x}
                  y2={svgHeight - padding.bottom + 5}
                  stroke="var(--border-default)"
                />
                <text
                  x={x}
                  y={svgHeight - padding.bottom + 18}
                  fill={p.k_demos === selectedK ? 'var(--accent-blue)' : 'var(--text-secondary)'}
                  fontSize="11"
                  fontWeight={p.k_demos === selectedK ? '700' : '500'}
                  fontFamily="var(--font-mono)"
                  textAnchor="middle"
                >
                  k={p.k_demos}
                </text>
              </g>
            );
          })}

          {/* X Axis Title */}
          <text
            x={padding.left + plotWidth / 2}
            y={svgHeight - 10}
            fill="var(--text-muted)"
            fontSize="11"
            fontWeight="600"
            textAnchor="middle"
          >
            Number of Demonstrations (k)
          </text>

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--accent-blue)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {sortedPoints.map((p) => {
            const cx = getX(p.k_demos);
            const cy = getY(p.accuracy);
            const isSelected = p.k_demos === selectedK;
            const isAmbiguous = p.is_ambiguous;

            return (
              <g
                key={p.k_demos}
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectPoint && onSelectPoint(p)}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 7 : 5}
                  fill={isAmbiguous ? 'var(--accent-amber)' : 'var(--accent-blue)'}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected / Hovered Point Detail Card */}
      {activePoint && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            fontSize: '0.85rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
          }}
        >
          <div>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              Evaluation with k={activePoint.k_demos} Demonstration{activePoint.k_demos > 1 ? 's' : ''}:
            </span>{' '}
            <span style={{ color: activePoint.is_ambiguous ? '#fbbf24' : '#93c5fd' }}>
              {activePoint.rule_description}
            </span>
          </div>
          <div>
            <span className={`badge ${activePoint.is_correct ? 'badge-green' : 'badge-amber'}`}>
              Accuracy: {activePoint.accuracy}% {activePoint.is_ambiguous && '(Ambiguous)'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
