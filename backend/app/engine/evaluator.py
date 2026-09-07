from typing import Optional, Tuple
from ..schemas import Grid, CandidateRule, ApplyResponse
from .inference import MultiFamilyInferenceEngine

class Evaluator:
    def __init__(self, inference_engine: Optional[MultiFamilyInferenceEngine] = None):
        self.engine = inference_engine or MultiFamilyInferenceEngine()

    def evaluate(self, candidate_rule: CandidateRule, test_input: Grid, ground_truth: Optional[Grid] = None) -> ApplyResponse:
        predicted = self.engine.apply_candidate(candidate_rule, test_input)

        if ground_truth is None:
            total_cells = len(predicted) * len(predicted[0]) if predicted and predicted[0] else 0
            diff_grid = [[True for _ in row] for row in predicted]
            return ApplyResponse(
                predicted_grid=predicted,
                ground_truth_grid=None,
                is_correct=True,
                cell_accuracy=100.0,
                matched_cells=total_cells,
                total_cells=total_cells,
                diff_grid=diff_grid,
                explanation="Applied inferred rule to unseen input canvas."
            )

        H_pred, W_pred = len(predicted), len(predicted[0]) if predicted else 0
        H_gt, W_gt = len(ground_truth), len(ground_truth[0]) if ground_truth else 0

        if H_pred != H_gt or W_pred != W_gt:
            # Dimension mismatch
            diff_grid = [[False for _ in range(W_pred)] for _ in range(H_pred)]
            return ApplyResponse(
                predicted_grid=predicted,
                ground_truth_grid=ground_truth,
                is_correct=False,
                cell_accuracy=0.0,
                matched_cells=0,
                total_cells=H_gt * W_gt,
                diff_grid=diff_grid,
                explanation=f"Dimension mismatch: Prediction is {H_pred}x{W_pred}, but ground truth is {H_gt}x{W_gt}."
            )

        matched_cells = 0
        total_cells = H_gt * W_gt
        diff_grid = []

        for r in range(H_gt):
            row_diff = []
            for c in range(W_gt):
                matches = (predicted[r][c] == ground_truth[r][c])
                row_diff.append(matches)
                if matches:
                    matched_cells += 1
            diff_grid.append(row_diff)

        cell_accuracy = (matched_cells / total_cells * 100.0) if total_cells > 0 else 0.0
        is_correct = (matched_cells == total_cells)

        if is_correct:
            explanation = f"Generalization Success! Prediction perfectly matches ground truth ({matched_cells}/{total_cells} cells, 100.0% accuracy). The inferred skill generalized to the new unseen test example."
        else:
            mismatched = total_cells - matched_cells
            explanation = f"Generalization Mismatch: {mismatched} of {total_cells} cells differed ({cell_accuracy:.1f}% accuracy). The inferred candidate rule ('{candidate_rule.description}') did not fully account for the ground truth transformation."

        return ApplyResponse(
            predicted_grid=predicted,
            ground_truth_grid=ground_truth,
            is_correct=is_correct,
            cell_accuracy=round(cell_accuracy, 2),
            matched_cells=matched_cells,
            total_cells=total_cells,
            diff_grid=diff_grid,
            explanation=explanation
        )
