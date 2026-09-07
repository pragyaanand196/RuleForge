from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from ..schemas import ChallengeTaskResponse, ApplyRequest, ApplyResponse
from ..data.task_loader import task_loader
from ..engine.evaluator import Evaluator

router = APIRouter(prefix="/api/challenge", tags=["challenge"])
evaluator = Evaluator()

@router.get("/task", response_model=Dict[str, Any])
def get_challenge_task():
    task = task_loader.get_random_challenge_task()
    if not task:
        raise HTTPException(status_code=404, detail="No challenge tasks available.")
    sanitized = task_loader.sanitize_task_for_client(task, hide_solution=True)
    sanitized["time_limit_seconds"] = 60
    return sanitized

@router.post("/evaluate/{task_id}", response_model=ApplyResponse)
def evaluate_challenge_task(task_id: str, req: ApplyRequest):
    task = task_loader.get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found.")
    return evaluator.evaluate(req.candidate_rule, task.test_input, task.test_output)
