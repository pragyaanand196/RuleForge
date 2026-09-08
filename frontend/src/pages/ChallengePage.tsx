import React, { useState, useEffect, useRef } from 'react';
import { Page, Task, InferResponse, ApplyResponse } from '../types';
import { apiClient } from '../services/api';
import { DemoViewer } from '../components/DemoViewer';
import { HypothesisCard } from '../components/HypothesisCard';
import { PredictionViewer } from '../components/PredictionViewer';
import { Timer, Trophy, RotateCcw, ArrowLeft, ArrowRight, Zap, AlertCircle } from 'lucide-react';

interface ChallengePageProps {
  onNavigate: (page: Page) => void;
}

export const ChallengePage: React.FC<ChallengePageProps> = ({ onNavigate }) => {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoadingTask, setIsLoadingTask] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 60-second timer state
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Inference & Evaluation state
  const [isInferring, setIsInferring] = useState<boolean>(false);
  const [inferResult, setInferResult] = useState<InferResponse | null>(null);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [applyResult, setApplyResult] = useState<ApplyResponse | null>(null);

  // Fetch a fresh challenge task
  const fetchNewChallenge = async () => {
    setIsLoadingTask(true);
    setErrorMessage(null);
    setInferResult(null);
    setApplyResult(null);
    setIsGameOver(false);
    setTimeLeft(60);
    setIsTimerRunning(true);

    try {
      const challengeTask = await apiClient.getChallengeTask();
      setTask(challengeTask);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to load challenge task. Please ensure the backend is reachable.');
      setIsTimerRunning(false);
    } finally {
      setIsLoadingTask(false);
    }
  };

  useEffect(() => {
    fetchNewChallenge();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer interval effect
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setIsGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeLeft]);

  // Handle Infer
  const handleInfer = async () => {
    if (!task) return;
    setIsInferring(true);
    setErrorMessage(null);
    try {
      const res = await apiClient.inferRule(task.demonstrations, task.id);
      setInferResult(res);
    } catch (err) {
      console.error(err);
      setErrorMessage('Rule inference failed.');
    } finally {
      setIsInferring(false);
    }
  };

  // Handle Evaluate Challenge
  const handleApply = async () => {
    if (!task || !inferResult?.selected_rule) return;
    setIsApplying(true);
    setErrorMessage(null);
    try {
      const res = await apiClient.evaluateChallenge(task.id, inferResult.selected_rule);
      setApplyResult(res);
      if (res.is_correct) {
        setIsTimerRunning(false); // Stop timer on victory
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Challenge evaluation failed.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Header with Timer and Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Zap size={24} color="var(--accent-amber)" />
            <h1 style={{ fontSize: '2rem', margin: 0 }}>60-Second Challenge</h1>
          </div>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Test rapid in-context skill acquisition under time pressure. Infer the hidden rule and generalize to the test input!
          </p>
        </div>

        {/* Timer & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div className={`timer-pill ${timeLeft <= 15 && timeLeft > 0 ? 'urgent' : ''}`}>
            <Timer size={20} />
            <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
          </div>

          <button className="btn btn-secondary" onClick={fetchNewChallenge} disabled={isLoadingTask}>
            <RotateCcw size={16} /> New Task
          </button>
        </div>
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

      {/* Victory / Timeout Alerts */}
      {applyResult?.is_correct && (
        <div
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--accent-emerald-subtle)',
            border: '1px solid rgba(16, 185, 129, 0.5)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Trophy size={32} color="#34d399" />
            <div>
              <strong style={{ fontSize: '1.1rem', color: '#34d399' }}>Challenge Solved!</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                You completed the skill acquisition with {timeLeft} seconds remaining. 100% Zero-shot generalization confirmed!
              </div>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('reflection')}>
            Proceed to Reflection <ArrowRight size={14} />
          </button>
        </div>
      )}

      {isGameOver && !applyResult?.is_correct && (
        <div
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--accent-amber-subtle)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
          }}
        >
          <div>
            <strong style={{ fontSize: '1.05rem', color: '#fbbf24' }}>Time's Up!</strong>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Complete your hypothesis and evaluation below, or click 'New Task' to try another speed run.
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchNewChallenge}>
            <RotateCcw size={14} /> Try Another Task
          </button>
        </div>
      )}

      {/* Main Task Stage */}
      {task && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <DemoViewer demonstrations={task.demonstrations} title={`Challenge Task: ${task.name}`} cellSize={32} />

          <HypothesisCard
            taskId={task.id}
            onInfer={handleInfer}
            isLoading={isInferring}
            inferResult={inferResult}
            onCheckHypothesis={(text) => apiClient.evaluateHypothesis(task.id, text)}
          />

          <PredictionViewer
            testInput={task.test_input}
            groundTruth={task.test_output}
            candidateRule={inferResult?.selected_rule || null}
            applyResult={applyResult}
            onApply={handleApply}
            isApplying={isApplying}
            onNextExperiment={() => onNavigate('reflection')}
          />
        </div>
      )}

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', paddingTop: 'var(--space-4)' }}>
        <button className="btn btn-secondary" onClick={() => onNavigate('bdh')}>
          <ArrowLeft size={16} /> Back to BDH-CQ
        </button>
        <button className="btn btn-primary" onClick={() => onNavigate('reflection')}>
          Next: Reflection & Mastery <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
