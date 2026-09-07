from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas import GeneralizeRequest, GeneralizationResponse, GeneralizationPoint, Demonstration
from ..data.task_loader import task_loader
from ..engine.inference import MultiFamilyInferenceEngine
from ..engine.evaluator import Evaluator

router = APIRouter(prefix="/api/generalize", tags=["generalization"])
inference_engine = MultiFamilyInferenceEngine()
evaluator = Evaluator(inference_engine)

@router.post("", response_model=GeneralizationResponse)
def run_generalization_sweep(req: GeneralizeRequest):
    task = task_loader.get_task_by_id(req.task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task '{req.task_id}' not found.")

    # Combine all available demonstrations
    all_demos: List[Demonstration] = list(task.demonstrations)
    if task.extra_demonstrations:
        all_demos.extend(task.extra_demonstrations)

    points: List[GeneralizationPoint] = []
    max_k = min(len(all_demos), max(req.demonstration_counts) if req.demonstration_counts else len(all_demos))
    k_counts = sorted(list(set([k for k in (req.demonstration_counts or [1, 2, 3, 4]) if 1 <= k <= len(all_demos)])))

    if not k_counts:
        k_counts = list(range(1, len(all_demos) + 1))

    for k in k_counts:
        subset = all_demos[:k]
        infer_res = inference_engine.infer(subset, task.id)

        if infer_res.selected_rule:
            eval_res = evaluator.evaluate(infer_res.selected_rule, task.test_input, task.test_output)
            accuracy = eval_res.cell_accuracy
            is_correct = eval_res.is_correct
            rule_name = infer_res.selected_rule.family
            rule_desc = infer_res.selected_rule.description
        else:
            accuracy = 0.0
            is_correct = False
            rule_name = None
            rule_desc = "No consistent rule found"

        points.append(
            GeneralizationPoint(
                k_demos=k,
                inferred_rule_name=rule_name,
                is_ambiguous=infer_res.is_ambiguous,
                accuracy=accuracy,
                is_correct=is_correct,
                evidence_count=len(infer_res.evidence),
                rule_description=rule_desc
            )
        )

    # Scientific takeaway
    if all(p.is_correct for p in points[1:]):
        takeaway = "Sufficient information in the demonstration stream rapidly collapses the hypothesis space, enabling 100% generalization to unseen inputs without requiring parameter updates."
    elif points and points[-1].is_correct:
        takeaway = f"Increasing demonstrations from k=1 to k={points[-1].k_demos} successfully eliminated underdetermined ambiguity, reaching {points[-1].accuracy:.1f}% generalization accuracy."
    else:
        takeaway = "Demonstrations provide contextual evidence. When transformations are complex or sparse, additional diverse examples are necessary to uniquely constrain the skill."

    summary = f"Evaluated generalization across {len(points)} demonstration regimes (k={', '.join(str(p.k_demos) for p in points)})."

    return GeneralizationResponse(
        task_id=task.id,
        points=points,
        summary=summary,
        scientific_takeaway=takeaway
    )
