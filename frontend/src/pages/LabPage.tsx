import React, { useState, useEffect } from 'react';
import { Page, Task, InferResponse, ApplyResponse } from '../types';
import { apiClient } from '../services/api';
import { DemoViewer } from '../components/DemoViewer';
import { HypothesisCard } from '../components/HypothesisCard';
import { PredictionViewer } from '../components/PredictionViewer';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';

interface LabPageProps {
  onNavigate: (page: Page) => void;
}

export const LabPage: React.FC<LabPageProps> = ({ onNavigate }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('task_01_color_swap');
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inference & Evaluation State
  const [isInferring, setIsInferring] = useState<boolean>(false);
  const [inferResult, setInferResult] = useState<InferResponse | null>(null);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [applyResult, setApplyResult] = useState<ApplyResponse | null>(null);

  // Load task list on mount
  useEffect(() => {
    async function loadTasks() {
      try {
        const taskList = await apiClient.listTasks();
        setTasks(taskList);
        if (taskList.length > 0) {
          const defaultTask = taskList.find((t) => t.id === 'task_01_color_swap') || taskList[0];
          setSelectedTaskId(defaultTask.id);
          setCurrentTask(defaultTask);
        }
      } catch (err: any) {
        console.error(err);
        setErrorMessage('Unable to reach the rule engine. Please ensure the server is active.');
      }
    }
    loadTasks();
  }, []);

  // Handle task change
  const handleTaskChange = async (taskId: string) => {
    setSelectedTaskId(taskId);
    setInferResult(null);
    setApplyResult(null);
    try {
      const task = await apiClient.getTask(taskId);
      setCurrentTask(task);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Failed to load selected task.`);
    }
  };

  // Run Inference
  const handleInfer = async () => {
    if (!currentTask) return;
    setIsInferring(true);
    setErrorMessage(null);
    try {
      const res = await apiClient.inferRule(currentTask.demonstrations, currentTask.id);
      setInferResult(res);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Rule inference engine encountered an issue.');
    } finally {
      setIsInferring(false);
    }
  };

  // Run Evaluation on Unseen Test Input
  const handleApply = async () => {
    if (!currentTask || !inferResult?.selected_rule) return;
    setIsApplying(true);
    setErrorMessage(null);
    try {
      const res = await apiClient.applyRule(
        inferResult.selected_rule,
        currentTask.test_input,
        currentTask.test_output
      );
      setApplyResult(res);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to apply rule to test input.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Demonstration Laboratory</h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Inspect the demonstrations, infer the hidden rule, and apply it to a new unseen example.
          </p>
        </div>

        {/* Task Selector Dropdown */}
        {tasks.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <label htmlFor="task-select" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Example Task:
            </label>
            <select
              id="task-select"
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

      {/* Error Alert */}
      {errorMessage && (
        <div
          style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--accent-rose-subtle)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            borderRadius: 'var(--radius-md)',
            color: '#fb7185',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: '0.9rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {currentTask && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {/* Demonstrations Pair Viewer */}
          <DemoViewer demonstrations={currentTask.demonstrations} title="Observed Input-Output Demonstrations" cellSize={32} />

          {/* Hypothesis & Systematic Skill Inference Card */}
          <HypothesisCard
            taskId={currentTask.id}
            onInfer={handleInfer}
            isLoading={isInferring}
            inferResult={inferResult}
            onCheckHypothesis={(text) => apiClient.evaluateHypothesis(currentTask.id, text)}
          />

          {/* Novel Unseen Test Evaluation */}
          <PredictionViewer
            testInput={currentTask.test_input}
            groundTruth={currentTask.test_output}
            candidateRule={inferResult?.selected_rule || null}
            applyResult={applyResult}
            onApply={handleApply}
            isApplying={isApplying}
            onNextExperiment={() => onNavigate('generalization')}
          />
        </div>
      )}

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', paddingTop: 'var(--space-4)' }}>
        <button className="btn btn-secondary" onClick={() => onNavigate('learn')}>
          <ArrowLeft size={16} /> Back to Concept
        </button>
        <button className="btn btn-primary" onClick={() => onNavigate('generalization')}>
          Next: Generalization Experiment <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
