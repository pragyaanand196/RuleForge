from fastapi import APIRouter
from ..schemas import ApplyRequest, ApplyResponse
from ..engine.evaluator import Evaluator

router = APIRouter(prefix="/api/apply", tags=["apply"])
evaluator = Evaluator()

@router.post("", response_model=ApplyResponse)
def apply_rule_to_grid(req: ApplyRequest):
    return evaluator.evaluate(req.candidate_rule, req.test_input, req.test_output)
