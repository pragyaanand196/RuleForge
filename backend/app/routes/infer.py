from fastapi import APIRouter
from ..schemas import InferRequest, InferResponse
from ..engine.inference import MultiFamilyInferenceEngine

router = APIRouter(prefix="/api/infer", tags=["inference"])
engine = MultiFamilyInferenceEngine()

@router.post("", response_model=InferResponse)
def infer_rule(req: InferRequest):
    return engine.infer(req.demonstrations, req.task_id)
