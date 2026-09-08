from typing import List, Dict, Any
from collections import Counter
from .rule_base import BaseRule, grid_equals, clone_grid, is_valid_grid, grid_shape
from ..schemas import Grid, Demonstration, CandidateRule

COLOR_NAMES = {
    0: "background (0)",
    1: "blue (1)",
    2: "red (2)",
    3: "green (3)",
    4: "yellow (4)",
    5: "gray (5)",
    6: "magenta (6)",
    7: "orange (7)",
    8: "azure (8)",
    9: "maroon (9)"
}

class CountingRule(BaseRule):
    family_name = "counting"

    def _majority_color(self, grid: Grid, bg: int = 0) -> int:
        counts = Counter(cell for row in grid for cell in row if cell != bg)
        if not counts:
            return bg
        return counts.most_common(1)[0][0]

    def _count_non_bg(self, grid: Grid, bg: int = 0) -> int:
        return sum(1 for row in grid for cell in row if cell != bg)

    def _fill_grid_with_color(self, grid: Grid, color: int) -> Grid:
        H = len(grid)
        W = len(grid[0])
        return [[color for _ in range(W)] for _ in range(H)]

    def infer_from_demonstrations(self, demonstrations: List[Demonstration]) -> List[CandidateRule]:
        if not demonstrations:
            return []

        for demo in demonstrations:
            if not is_valid_grid(demo.input_grid) or not is_valid_grid(demo.output_grid):
                return []
            if grid_shape(demo.input_grid) != grid_shape(demo.output_grid):
                return []

        candidates = []

        # 1. Majority color fill rule: entire output grid filled with the majority non-zero color of input
        all_majority = True
        evidence_majority = []
        has_non_trivial_majority = False

        for idx, demo in enumerate(demonstrations):
            maj = self._majority_color(demo.input_grid)
            pred = self._fill_grid_with_color(demo.output_grid, maj)
            if not grid_equals(pred, demo.input_grid):
                has_non_trivial_majority = True

            if grid_equals(pred, demo.output_grid):
                evidence_majority.append(f"Demo {idx + 1}: Majority color {COLOR_NAMES.get(maj, f'color {maj}')} fills the entire output")
            else:
                all_majority = False
                break

        if all_majority and has_non_trivial_majority and evidence_majority:
            candidates.append(
                CandidateRule(
                    rule_id="majority_color_fill",
                    family=self.family_name,
                    description="Majority color dominance: Fill the entire output canvas with the input's most frequent foreground color.",
                    parameters={"type": "majority_fill"},
                    confidence=0.94 if len(demonstrations) >= 2 else 0.80,
                    evidence=evidence_majority,
                    is_consistent=True
                )
            )

        # 2. Parity rule: if count of non-zero items is even -> Color E, odd -> Color O
        even_colors = set()
        odd_colors = set()
        parity_consistent = True

        for idx, demo in enumerate(demonstrations):
            cnt = self._count_non_bg(demo.input_grid)
            first_val = demo.output_grid[0][0]
            all_same = all(c == first_val for row in demo.output_grid for c in row)
            if not all_same:
                parity_consistent = False
                break
            
            if cnt % 2 == 0:
                even_colors.add(first_val)
            else:
                odd_colors.add(first_val)

        if parity_consistent and (even_colors or odd_colors) and len(even_colors) <= 1 and len(odd_colors) <= 1:
            e_col = list(even_colors)[0] if even_colors else 3
            o_col = list(odd_colors)[0] if odd_colors else 2
            
            if e_col != o_col:
                candidates.append(
                    CandidateRule(
                        rule_id=f"parity_color_even_{e_col}_odd_{o_col}",
                        family=self.family_name,
                        description=f"Object parity detection: Even count -> Fill with {COLOR_NAMES.get(e_col, f'color {e_col}')}, Odd count -> Fill with {COLOR_NAMES.get(o_col, f'color {o_col}')}.",
                        parameters={"type": "parity", "even_color": e_col, "odd_color": o_col},
                        confidence=0.93 if len(demonstrations) >= 2 else 0.78,
                        evidence=[f"Demo {i+1}: Count {self._count_non_bg(d.input_grid)} -> Fill with {COLOR_NAMES.get(d.output_grid[0][0], f'color {d.output_grid[0][0]}')}" for i, d in enumerate(demonstrations)],
                        is_consistent=True
                    )
                )

        return candidates

    def apply_rule(self, grid: Grid, parameters: Dict[str, Any]) -> Grid:
        rule_type = parameters.get("type")
        if rule_type == "majority_fill":
            maj = self._majority_color(grid)
            return self._fill_grid_with_color(grid, maj)
        elif rule_type == "parity":
            cnt = self._count_non_bg(grid)
            col = parameters.get("even_color", 3) if cnt % 2 == 0 else parameters.get("odd_color", 2)
            return self._fill_grid_with_color(grid, col)
        return clone_grid(grid)

    def calculate_complexity(self, parameters: Dict[str, Any]) -> float:
        return 1.5
