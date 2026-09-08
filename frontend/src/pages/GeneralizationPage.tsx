import React, { useState, useEffect } from 'react';
import { Page, Task, GeneralizationResponse } from '../types';
import { apiClient } from '../services/api';
import { GeneralizationChart } from '../components/GeneralizationChart';
import { DemoViewer } from '../components/DemoViewer';
import { ArrowLeft, ArrowRight, Info, TrendingUp, Layers, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface GeneralizationPageProps {
  onNavigate: (page: Page) => void;
}

export const GeneralizationPage: React.FC<GeneralizationPageProps> = ({ onNavigate }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('task_01_color_swap');
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [generalizationData, setGeneralizationData] = useState<GeneralizationResponse | null>(null);
  const [selectedK, setSelectedK] = useState<number>(3);
  const [isLoadingSweep, setIsLoadingSweep] = useState<boolean>(false);

  useEffect(() => {
    async function init() {
      try {
        const taskList = await apiClient.listTasks();
        setTasks(taskList);
        const task = taskList.find((t) => t.id === selectedTaskId) || taskList[0];
        if (task) {
          setCurrentTask(task);
          await runSweep(task.id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, []);

  const runSweep = async (taskId: string) => {
    setIsLoadingSweep(true);
    try {
      const data = await apiClient.runGeneralizationSweep(taskId, [1, 2, 3, 4]);
      setGeneralizationData(data);
      if (data.points.length > 0) {
        setSelectedK(data.points[data.points.length - 1].k_demos);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSweep(false);
    }
  };

  const handleTaskChange = async (taskId: string) => {
    setSelectedTaskId(taskId);
    const task = tasks.find((t) => t.id === taskId) || null;
    setCurrentTask(task);
    await runSweep(taskId);
  };

  // Compute active demonstrations subset based on selectedK
  const allDemos = currentTask
    ? [...currentTask.demonstrations, ...(currentTask.extra_demonstrations || [])]
    : [];
  const activeSubset = allDemos.slice(0, selectedK);

  const activePoint = generalizationData?.points.find((p) => p.k_demos === selectedK) || null;

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <TrendingUp size={24} color="var(--accent-blue)" />
            <h1 style={{ fontSize: '2rem', margin: 0 }}>Generalization Experiment</h1>
          </div>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Vary the demonstration budget ($k$) to observe empirical hypothesis space collapse and zero-shot test accuracy.
          </p>
        </div>

        {tasks.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <label htmlFor="gen-task-select" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Task:
            </label>
            <select
              id="gen-task-select"
              value={selectedTaskId}
              onChange={(e) => handleTaskChange(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '0.45rem 0.75rem',
                fontSize: '0.85rem',
              }}
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Demonstration Selector Slider & Measured Curve */}
      <div className="card card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>Demonstration Budget ($k$)</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              Select how many input-output demonstration pairs the inference engine receives.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {(generalizationData?.points.map((p) => p.k_demos) || [1, 2, 3, 4]).map((k) => (
              <button
                key={k}
                className={`btn ${selectedK === k ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedK(k)}
                disabled={isLoadingSweep}
              >
                k = {k}
              </button>
            ))}
          </div>
        </div>

        {/* Real Empirical SVG Chart */}
        {generalizationData && (
          <GeneralizationChart
            points={generalizationData.points}
            selectedK={selectedK}
            onSelectPoint={(p) => setSelectedK(p.k_demos)}
          />
        )}

        {/* Scientific Takeaway Banner */}
        {generalizationData && (
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              display: 'flex',
              gap: 'var(--space-2)',
              alignItems: 'center',
            }}
          >
            <Info size={18} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
            <span>
              <strong>Empirical Takeaway:</strong> {generalizationData.scientific_takeaway}
            </span>
          </div>
        )}
      </div>

      {/* Active Demonstration Stream at selectedK */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Layers size={18} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Demonstrations Provided to Engine (k = {selectedK})</h3>
          </div>
          {activePoint && (
            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
              <span className="badge badge-blue">
                {activePoint.hypothesis_space_size || 1} Candidate Hypotheses
              </span>
              <span className={`badge ${activePoint.is_correct ? 'badge-green' : 'badge-amber'}`}>
                {activePoint.is_correct ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                Test Accuracy: {activePoint.accuracy}%
              </span>
            </div>
          )}
        </div>

        <DemoViewer demonstrations={activeSubset} title="" cellSize={28} />
      </div>

      {/* Footer Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', paddingTop: 'var(--space-4)' }}>
        <button className="btn btn-secondary" onClick={() => onNavigate('lab')}>
          <ArrowLeft size={16} /> Back to Experiment
        </button>
        <button className="btn btn-primary" onClick={() => onNavigate('ambiguity')}>
          Next: Failure & Ambiguity Case <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
