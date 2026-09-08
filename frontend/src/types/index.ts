export type Grid = number[][];

export interface Demonstration {
  id?: string;
  label?: string;
  input_grid: Grid;
  output_grid: Grid;
}

export interface Task {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  description: string;
  rule_family: string;
  hidden_rule_description: string;
  hint?: string;
  is_ambiguous?: boolean;
  ambiguity_notes?: string;
  demonstrations: Demonstration[];
  extra_demonstrations?: Demonstration[];
  test_input: Grid;
  test_output?: Grid | null;
}

export interface CandidateRule {
  rule_id: string;
  family: string;
  description: string;
  parameters: Record<string, any>;
  confidence: number;
  evidence: string[];
  is_consistent: boolean;
}

export interface InferResponse {
  task_id?: string;
  candidate_rules: CandidateRule[];
  selected_rule: CandidateRule | null;
  is_ambiguous: boolean;
  ambiguity_reason?: string | null;
  evidence: string[];
  demonstration_count: number;
  hypothesis_space_size?: number;
  competing_hypotheses?: string[];
}

export interface ApplyResponse {
  predicted_grid: Grid;
  ground_truth_grid?: Grid | null;
  is_correct: boolean;
  cell_accuracy: number;
  matched_cells: number;
  total_cells: number;
  diff_grid: boolean[][];
  explanation: string;
}

export interface GeneralizationPoint {
  k_demos: number;
  inferred_rule_name?: string | null;
  is_ambiguous: boolean;
  accuracy: number;
  is_correct: boolean;
  evidence_count: number;
  rule_description: string;
  hypothesis_space_size?: number;
  competing_count?: number;
}

export interface GeneralizationResponse {
  task_id: string;
  points: GeneralizationPoint[];
  summary: string;
  scientific_takeaway: string;
}

export type HypothesisClassification =
  | 'correct'
  | 'partially_correct'
  | 'opposite_rule'
  | 'wrong_rule'
  | 'ambiguous'
  | 'empty_or_whitespace'
  | 'unrelated';

export interface LearnerHypothesisResponse {
  is_valid_attempt: boolean;
  feedback: string;
  key_observations: string[];
  similarity_score: number;
  classification: HypothesisClassification;
  educational_guidance?: string | null;
}

export interface ReflectionResponse {
  score: number;
  mastery_level: string;
  concepts_identified: string[];
  missing_concepts: string[];
  feedback: string;
  strengths: string[];
  improvement_tips: string[];
}

export type Page = 
  | 'home'
  | 'learn'
  | 'lab'
  | 'generalization'
  | 'ambiguity'
  | 'sandbox'
  | 'bdh'
  | 'challenge'
  | 'reflection'
  | 'research';
