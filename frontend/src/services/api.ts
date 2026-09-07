import {
  Task,
  Demonstration,
  Grid,
  CandidateRule,
  InferResponse,
  ApplyResponse,
  GeneralizationResponse,
  LearnerHypothesisResponse,
  ReflectionResponse
} from '../types';

const API_BASE = '/api';

export const apiClient = {
  async listTasks(): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/tasks`);
    if (!res.ok) throw new Error('Failed to load tasks from server');
    return res.json();
  },

  async getTask(taskId: string): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`);
    if (!res.ok) throw new Error(`Failed to load task ${taskId}`);
    return res.json();
  },

  async evaluateHypothesis(taskId: string, text: string): Promise<LearnerHypothesisResponse> {
    const res = await fetch(`${API_BASE}/tasks/hypothesis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId, hypothesis_text: text }),
    });
    if (!res.ok) throw new Error('Hypothesis evaluation failed');
    return res.json();
  },

  async inferRule(demonstrations: Demonstration[], taskId?: string): Promise<InferResponse> {
    const res = await fetch(`${API_BASE}/infer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demonstrations, task_id: taskId }),
    });
    if (!res.ok) throw new Error('Skill inference failed');
    return res.json();
  },

  async applyRule(
    candidateRule: CandidateRule,
    testInput: Grid,
    testOutput?: Grid | null
  ): Promise<ApplyResponse> {
    const res = await fetch(`${API_BASE}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate_rule: candidateRule,
        test_input: testInput,
        test_output: testOutput,
      }),
    });
    if (!res.ok) throw new Error('Rule application failed');
    return res.json();
  },

  async runGeneralizationSweep(taskId: string, counts: number[] = [1, 2, 3, 4]): Promise<GeneralizationResponse> {
    const res = await fetch(`${API_BASE}/generalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId, demonstration_counts: counts }),
    });
    if (!res.ok) throw new Error('Generalization sweep failed');
    return res.json();
  },

  async evaluateReflection(text: string): Promise<ReflectionResponse> {
    const res = await fetch(`${API_BASE}/reflection/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error('Reflection evaluation failed');
    return res.json();
  },

  async getChallengeTask(): Promise<Task> {
    const res = await fetch(`${API_BASE}/challenge/task`);
    if (!res.ok) throw new Error('Failed to fetch challenge task');
    return res.json();
  },

  async evaluateChallenge(taskId: string, candidateRule: CandidateRule): Promise<ApplyResponse> {
    const res = await fetch(`${API_BASE}/challenge/evaluate/${taskId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate_rule: candidateRule,
        test_input: [], // backend extracts test_input from stored task
      }),
    });
    if (!res.ok) throw new Error('Challenge evaluation failed');
    return res.json();
  }
};
