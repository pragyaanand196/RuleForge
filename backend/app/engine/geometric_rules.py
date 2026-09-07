from typing import List, Dict, Any
from .rule_base import BaseRule, grid_equals, clone_grid
from ..schemas import Grid, Demonstration, CandidateRule

class GeometricRule(BaseRule):
    family_name = "geometric"

    TRANSFORMS = [
        ("rotate_90_cw", "Rotate grid 90° clockwise", "90° Clockwise Rotation"),
        ("rotate_180", "Rotate grid 180°", "180° Rotation"),
        ("rotate_270_cw", "Rotate grid 270° clockwise (90° counter-clockwise)", "270° Rotation"),
        ("reflect_horizontal", "Reflect grid vertically across horizontal axis (flip top-to-bottom)", "Horizontal Axis Reflection"),
        ("reflect_vertical", "Reflect grid horizontally across vertical axis (flip left-to-right)", "Vertical Axis Reflection"),
        ("reflect_main_diagonal", "Reflect grid across main diagonal (matrix transpose)", "Main Diagonal Reflection"),
        ("reflect_anti_diagonal", "Reflect grid across anti-diagonal", "Anti-Diagonal Reflection"),
    ]

    def _apply_op(self, grid: Grid, op: str) -> Grid:
        if not grid or not grid[0]:
            return grid
        H = len(grid)
        W = len(grid[0])

        if op == "rotate_90_cw":
            return [[grid[H - 1 - r][c] for r in range(H)] for c in range(W)]
        elif op == "rotate_180":
            return [[grid[H - 1 - r][W - 1 - c] for c in range(W)] for r in range(H)]
        elif op == "rotate_270_cw":
            return [[grid[r][W - 1 - c] for r in range(H)] for c in range(W)]
        elif op == "reflect_horizontal":
            return [grid[H - 1 - r][:] for r in range(H)]
        elif op == "reflect_vertical":
            return [grid[r][::-1] for r in range(H)]
        elif op == "reflect_main_diagonal":
            return [[grid[r][c] for r in range(H)] for c in range(W)]
        elif op == "reflect_anti_diagonal":
            return [[grid[H - 1 - c][W - 1 - r] for c in range(H)] for r in range(W)]
        return clone_grid(grid)

    def infer_from_demonstrations(self, demonstrations: List[Demonstration]) -> List[CandidateRule]:
        if not demonstrations:
            return []

        candidates = []

        for op_key, op_desc, op_title in self.TRANSFORMS:
            all_match = True
            evidence = []

            for idx, demo in enumerate(demonstrations):
                pred = self._apply_op(demo.input_grid, op_key)
                if grid_equals(pred, demo.output_grid):
                    evidence.append(f"Demo {idx + 1}: {op_title} perfectly reproduces output")
                else:
                    all_match = False
                    break

            if all_match and evidence:
                # Check if this isn't simply an identity transform on symmetric data
                all_identity = True
                for demo in demonstrations:
                    if not grid_equals(demo.input_grid, demo.output_grid):
                        all_identity = False
                        break
                
                confidence = 0.95 if not all_identity else 0.4
                if len(demonstrations) >= 2:
                    confidence = min(0.99, confidence + 0.04)

                candidates.append(
                    CandidateRule(
                        rule_id=f"geometric_{op_key}",
                        family=self.family_name,
                        description=f"Geometric transformation: {op_desc}.",
                        parameters={"operation": op_key, "title": op_title},
                        confidence=confidence,
                        evidence=evidence,
                        is_consistent=True
                    )
                )

        return candidates

    def apply_rule(self, grid: Grid, parameters: Dict[str, Any]) -> Grid:
        op = parameters.get("operation", "")
        return self._apply_op(grid, op)
