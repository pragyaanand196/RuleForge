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
                rule_description=rule_desc,
                hypothesis_space_size=max(1, len(infer_res.candidate_rules)),
                competing_count=len(infer_res.candidate_rules)
            )
        )

    # Dynamically generate empirical scientific takeaway
    first_pt = points[0] if points else None
    last_pt = points[-1] if points else None

    if first_pt and last_pt and first_pt.is_ambiguous and last_pt.is_correct and not last_pt.is_ambiguous:
        takeaway = (
            f"Empirical Finding: At k=1, the demonstration evidence was underdetermined ({first_pt.hypothesis_space_size} competing hypotheses). "
            f"Adding demonstrations from k=1 to k={last_pt.k_demos} successfully eliminated alternative hypotheses, achieving {last_pt.accuracy:.1f}% generalization accuracy without parameter updates."
        )
    elif all(p.is_correct for p in points):
        takeaway = (
            f"Empirical Finding: The demonstration stream provided sufficient invariant constraints, enabling 100.0% zero-shot generalization to the novel unseen example across all evaluated demonstration counts (k={', '.join(str(p.k_demos) for p in points)})."
        )
    elif last_pt and last_pt.is_correct:
        takeaway = (
            f"Empirical Finding: Generalization accuracy improved from {first_pt.accuracy:.1f}% at k={first_pt.k_demos} to {last_pt.accuracy:.1f}% at k={last_pt.k_demos} as additional demonstrations narrowed down the candidate skill."
        )
    else:
        takeaway = (
            "Empirical Finding: Demonstrations provide empirical constraints on the hypothesis space. When transformations are complex or sparse, additional diverse examples are required to isolate the unique invariant rule."
        )

    summary = f"Evaluated generalization across {len(points)} demonstration regimes (k={', '.join(str(p.k_demos) for p in points)})."

    return GeneralizationResponse(
        task_id=task.id,
        points=points,
        summary=summary,
        scientific_takeaway=takeaway
    )
