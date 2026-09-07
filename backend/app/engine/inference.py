from typing import List, Optional, Tuple
from .rule_base import BaseRule, grid_equals
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
        unique_candidates = []
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
                ambiguity_reason="None of the supported rule families (Color, Geometric, Translation, Pattern, Counting) could uniquely explain the input-output transformations without contradictions.",
                evidence=["Evidence: Input-output transitions do not match any known single transformation family."],
                demonstration_count=len(demonstrations)
            )

        # Check for ambiguity:
        # If multiple candidate rules exist that do fundamentally different things
        is_ambiguous = False
        ambiguity_reason = None
        selected_rule = None

        if len(unique_candidates) == 1:
            selected_rule = unique_candidates[0]
            is_ambiguous = False
        else:
            # Check if candidates produce different outputs on a synthetic test probe
            # Or if there are distinct hypotheses across different operations
            is_ambiguous = True
            cand_names = [f"'{c.description}' (family: {c.family})" for c in unique_candidates[:3]]
            ambiguity_reason = (
                f"Underdetermined Demonstration Set: {len(unique_candidates)} distinct hypotheses explain all {len(demonstrations)} demonstration(s) with 100% consistency: "
                + "; ".join(cand_names)
                + ". Adding further demonstrations is necessary to disambiguate the true underlying skill."
            )
            # Pick highest confidence as default preview candidate
            selected_rule = max(unique_candidates, key=lambda c: c.confidence)

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
            demonstration_count=len(demonstrations)
        )

    def apply_candidate(self, candidate_rule: CandidateRule, grid: Grid) -> Grid:
        for family in self.rule_families:
            if family.family_name == candidate_rule.family:
                return family.apply_rule(grid, candidate_rule.parameters)
        return grid
