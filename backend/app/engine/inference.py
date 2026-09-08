from typing import List, Optional, Tuple, Dict
from .rule_base import BaseRule, grid_equals, is_valid_grid
from .color_rules import ColorMappingRule
from .geometric_rules import GeometricRule
from .translation_rules import TranslationRule
from .pattern_rules import PatternRule
from .counting_rules import CountingRule
from ..schemas import Demonstration, CandidateRule, InferResponse, Grid

class MultiFamilyInferenceEngine:
    def __init__(self):
        self.rule_families: List[BaseRule] = [
            ColorMappingRule(),
            GeometricRule(),
            TranslationRule(),
            PatternRule(),
            CountingRule()
        ]

    def infer(self, demonstrations: List[Demonstration], task_id: Optional[str] = None) -> InferResponse:
        if not demonstrations:
            return InferResponse(
                task_id=task_id,
                candidate_rules=[],
                selected_rule=None,
                is_ambiguous=False,
                ambiguity_reason="No demonstrations provided.",
                evidence=["Please provide at least one input-output demonstration."],
                demonstration_count=0
            )

        # Validate that all demonstrations contain valid, non-empty 2D integer grids
        for idx, demo in enumerate(demonstrations):
            if not is_valid_grid(demo.input_grid) or not is_valid_grid(demo.output_grid):
                return InferResponse(
                    task_id=task_id,
                    candidate_rules=[],
                    selected_rule=None,
                    is_ambiguous=False,
                    ambiguity_reason=f"Demonstration {idx + 1} contains an invalid or malformed grid.",
                    evidence=[f"Error: Demonstration {idx + 1} input/output grids must be rectangular 2D arrays of visual tokens (0-9)."],
                    demonstration_count=len(demonstrations)
                )

        # Check for direct input contradictions (identical inputs with different outputs)
        for i in range(len(demonstrations)):
            for j in range(i + 1, len(demonstrations)):
                if grid_equals(demonstrations[i].input_grid, demonstrations[j].input_grid):
                    if not grid_equals(demonstrations[i].output_grid, demonstrations[j].output_grid):
                        return InferResponse(
                            task_id=task_id,
                            candidate_rules=[],
                            selected_rule=None,
                            is_ambiguous=False,
                            ambiguity_reason=f"Contradictory evidence: Demonstration {i + 1} and Demonstration {j + 1} share identical inputs but have conflicting outputs.",
                            evidence=[f"Contradiction detected between Demo {i + 1} and Demo {j + 1}: identical input produced different outputs."],
                            demonstration_count=len(demonstrations)
                        )

        all_candidates: List[CandidateRule] = []
        for family in self.rule_families:
            found = family.infer_from_demonstrations(demonstrations)
            all_candidates.extend(found)

        # Filter candidates that strictly reproduce all demonstration outputs
        verified_candidates: List[CandidateRule] = []
        for cand in all_candidates:
            all_pass = True
            for demo in demonstrations:
                pred = self.apply_candidate(cand, demo.input_grid)
                if not grid_equals(pred, demo.output_grid):
                    all_pass = False
                    break
            if all_pass:
                verified_candidates.append(cand)

        # De-duplicate candidates with identical rule_id
        seen_ids = set()
        unique_candidates: List[CandidateRule] = []
        for cand in verified_candidates:
            if cand.rule_id not in seen_ids:
                seen_ids.add(cand.rule_id)
                unique_candidates.append(cand)

        if not unique_candidates:
            return InferResponse(
                task_id=task_id,
                candidate_rules=[],
                selected_rule=None,
                is_ambiguous=False,
                ambiguity_reason="No consistent rule found: None of the supported rule families (Color, Geometric, Translation, Pattern, Counting) could uniquely explain the demonstrations without contradictions.",
                evidence=["Evidence: Input-output transitions do not match any supported single transformation family."],
                demonstration_count=len(demonstrations)
            )

        # Sort candidates using Occam's Razor / Minimum Description Length (MDL)
        def score_candidate(cand: CandidateRule) -> float:
            # Look up family complexity
            comp = 1.0
            for f in self.rule_families:
                if f.family_name == cand.family:
                    comp = f.calculate_complexity(cand.parameters)
                    break
            return cand.confidence - (0.04 * comp)

        unique_candidates.sort(key=lambda c: (score_candidate(c), c.confidence, c.rule_id), reverse=True)

        # Check for ambiguity:
        # If multiple candidates exist across distinct families or distinct transformation operations
        is_ambiguous = False
        ambiguity_reason = None
        selected_rule = unique_candidates[0]

        if len(unique_candidates) == 1:
            is_ambiguous = False
        else:
            # Check if candidates represent genuinely distinct operational rules
            distinct_descriptions = list(set(c.description for c in unique_candidates))
            if len(distinct_descriptions) > 1:
                is_ambiguous = True
                cand_names = [f"'{c.description}' ({c.family})" for c in unique_candidates[:3]]
                ambiguity_reason = (
                    f"Underdetermined Evidence: {len(unique_candidates)} distinct hypotheses explain all {len(demonstrations)} demonstration(s) with 100% consistency: "
                    + "; ".join(cand_names)
                    + ". Adding an additional diverse demonstration will rule out competing hypotheses and isolate the true rule."
                )

        # Aggregate evidence
        combined_evidence = []
        for cand in unique_candidates[:3]:
            combined_evidence.extend([f"[{cand.family.upper()}] {e}" for e in cand.evidence])

        return InferResponse(
            task_id=task_id,
            candidate_rules=unique_candidates,
            selected_rule=selected_rule,
            is_ambiguous=is_ambiguous,
            ambiguity_reason=ambiguity_reason,
            evidence=combined_evidence,
            demonstration_count=len(demonstrations),
            hypothesis_space_size=len(unique_candidates),
            competing_hypotheses=[c.description for c in unique_candidates]
        )

    def apply_candidate(self, candidate_rule: CandidateRule, grid: Grid) -> Grid:
        for family in self.rule_families:
            if family.family_name == candidate_rule.family:
                return family.apply_rule(grid, candidate_rule.parameters)
        return grid

