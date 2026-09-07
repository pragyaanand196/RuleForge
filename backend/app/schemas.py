from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# Grid representation: 2D matrix of integers (0-9 for ARC-style visual colors)
Grid = List[List[int]]

class Demonstration(BaseModel):
    input_grid: Grid
    output_grid: Grid
    id: Optional[str] = None
    label: Optional[str] = None

class Task(BaseModel):
    id: str
    name: str
    category: str  # color, geometric, translation, pattern, counting, ambiguous
    difficulty: str  # Beginner, Intermediate, Advanced
    description: str
    rule_family: str
    hidden_rule_description: str
    demonstrations: List[Demonstration]
    test_input: Grid
    test_output: Grid  # Kept internal/hidden until evaluation
    extra_demonstrations: Optional[List[Demonstration]] = None  # For generalization/ambiguity resolution sweeps
    hint: Optional[str] = None
    is_ambiguous: bool = False
    ambiguity_notes: Optional[str] = None

class LearnerHypothesisRequest(BaseModel):
    task_id: Optional[str] = None
    hypothesis_text: str

class LearnerHypothesisResponse(BaseModel):
    is_valid_attempt: bool
    feedback: str
    key_observations: List[str]
    similarity_score: float

class CandidateRule(BaseModel):
    rule_id: str
    family: str  # 'color_mapping', 'rotation', 'reflection', 'translation', 'pattern', 'counting'
    description: str
    parameters: Dict[str, Any]
    confidence: float
    evidence: List[str]
    is_consistent: bool

class InferRequest(BaseModel):
    task_id: Optional[str] = None
    demonstrations: List[Demonstration]
    learner_hypothesis: Optional[str] = None

class InferResponse(BaseModel):
    task_id: Optional[str] = None
    candidate_rules: List[CandidateRule]
    selected_rule: Optional[CandidateRule] = None
    is_ambiguous: bool
    ambiguity_reason: Optional[str] = None
    evidence: List[str]
    demonstration_count: int

class ApplyRequest(BaseModel):
    candidate_rule: CandidateRule
    test_input: Grid
    test_output: Optional[Grid] = None

class ApplyResponse(BaseModel):
    predicted_grid: Grid
    ground_truth_grid: Optional[Grid] = None
    is_correct: bool
    cell_accuracy: float
    matched_cells: int
    total_cells: int
    diff_grid: List[List[bool]]  # True where prediction == ground truth
    explanation: str

class GeneralizeRequest(BaseModel):
    task_id: str
    demonstration_counts: Optional[List[int]] = Field(default=[1, 2, 3, 4])

class GeneralizationPoint(BaseModel):
    k_demos: int
    inferred_rule_name: Optional[str]
    is_ambiguous: bool
    accuracy: float
    is_correct: bool
    evidence_count: int
    rule_description: str

class GeneralizationResponse(BaseModel):
    task_id: str
    points: List[GeneralizationPoint]
    summary: str
    scientific_takeaway: str

class ReflectionRequest(BaseModel):
    text: str

class ReflectionResponse(BaseModel):
    score: float
    mastery_level: str  # 'Foundational', 'Proficient', 'Master'
    concepts_identified: List[str]
    missing_concepts: List[str]
    feedback: str
    strengths: List[str]
    improvement_tips: List[str]

class ChallengeTaskResponse(BaseModel):
    task: Task
    time_limit_seconds: int = 60
