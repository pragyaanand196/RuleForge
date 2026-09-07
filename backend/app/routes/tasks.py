from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from ..schemas import Task, LearnerHypothesisRequest, LearnerHypothesisResponse
from ..data.task_loader import task_loader

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("", response_model=List[Dict[str, Any]])
def list_tasks():
    tasks = task_loader.get_all_tasks()
    return [task_loader.sanitize_task_for_client(t, hide_solution=True) for t in tasks]

@router.get("/{task_id}", response_model=Dict[str, Any])
def get_task(task_id: str):
    task = task_loader.get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found.")
    return task_loader.sanitize_task_for_client(task, hide_solution=True)

@router.post("/hypothesis", response_model=LearnerHypothesisResponse)
def evaluate_hypothesis(req: LearnerHypothesisRequest):
    text = req.hypothesis_text.strip().lower()
    if not text:
        return LearnerHypothesisResponse(
            is_valid_attempt=False,
            feedback="Please write a hypothesis explaining what transformation you observed.",
            key_observations=[],
            similarity_score=0.0
        )

    task = task_loader.get_task_by_id(req.task_id) if req.task_id else None
    
    observations = []
    score = 0.3  # Base score for providing an attempt

    # Domain keywords detection
    color_keywords = ["color", "change", "turn", "replace", "blue", "red", "1", "2", "swap", "convert", "becomes", "azure"]
    geom_keywords = ["rotate", "turn", "clockwise", "90", "180", "270", "reflect", "flip", "mirror", "angle", "degree"]
    trans_keywords = ["shift", "move", "right", "left", "down", "up", "gravity", "fall", "drop", "slide", "translate"]
    pattern_keywords = ["fill", "inside", "center", "border", "delete", "remove", "erase", "hollow", "box", "surround"]
    
    found_color = [k for k in color_keywords if k in text]
    found_geom = [k for k in geom_keywords if k in text]
    found_trans = [k for k in trans_keywords if k in text]
    found_pattern = [k for k in pattern_keywords if k in text]

    if found_color:
        observations.append(f"Identified color transformation terms: {', '.join(found_color)}")
    if found_geom:
        observations.append(f"Identified geometric spatial terms: {', '.join(found_geom)}")
    if found_trans:
        observations.append(f"Identified translation/movement terms: {', '.join(found_trans)}")
    if found_pattern:
        observations.append(f"Identified pattern/topological terms: {', '.join(found_pattern)}")

    if task:
        rule_family = task.rule_family
        if rule_family == "color_mapping" and found_color:
            score += 0.5
        elif rule_family == "geometric" and found_geom:
            score += 0.5
        elif rule_family == "translation" and found_trans:
            score += 0.5
        elif rule_family == "pattern" and found_pattern:
            score += 0.5
        else:
            score += 0.2
    else:
        score = min(0.9, score + 0.1 * len(observations))

    score = min(1.0, score)

    if score >= 0.7:
        feedback = "Excellent observation! Your hypothesis accurately targets the operational transformation. Now click 'Infer Skill' to see how the system deterministically infers the exact rule."
    elif score >= 0.4:
        feedback = "Good intuition! You noticed the general nature of the change. Click 'Infer Skill' to formalize the candidate rule and verify evidence."
    else:
        feedback = "Thanks for your hypothesis. Click 'Infer Skill' to examine the systematic transformation detected across the demonstrations."

    return LearnerHypothesisResponse(
        is_valid_attempt=True,
        feedback=feedback,
        key_observations=observations if observations else ["Observed custom visual transformation pattern"],
        similarity_score=round(score, 2)
    )
