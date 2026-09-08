from typing import List, Dict, Any
from .rule_base import BaseRule, grid_equals, clone_grid, is_valid_grid, grid_shape
from ..schemas import Grid, Demonstration, CandidateRule

class GeometricRule(BaseRule):
    family_name = "geometric"

    TRANSFORMS = [
        ("rotate_90_cw", "Rotate grid 90° clockwise", "90° Clockwise Rotation"),
        ("rotate_180", "Rotate grid 180°", "180° Rotation"),
        ("rotate_270_cw", "Rotate grid 270° clockwise (90° counter-clockwise)", "270° Rotation"),
        ("reflect_horizontal", "Reflect grid vertically across horizontal midline (flip top-to-bottom)", "Horizontal Axis Reflection"),
        ("reflect_vertical", "Reflect grid horizontally across vertical midline (flip left-to-right)", "Vertical Axis Reflection"),
        ("reflect_main_diagonal", "Reflect grid across main diagonal (matrix transpose)", "Main Diagonal Reflection"),
        ("reflect_anti_diagonal", "Reflect grid across anti-diagonal", "Anti-Diagonal Reflection"),
    ]

    def _apply_op(self, grid: Grid, op: str) -> Grid:
        if not grid or not grid[0]:
            return grid
        H = len(grid)
        W = len(grid[0])

        if op == "rotate_90_cw":
            # New shape is W x H: new_grid[r_new][c_new] = grid[H - 1 - c_new][r_new]
            return [[grid[H - 1 - c_new][r_new] for c_new in range(H)] for r_new in range(W)]
        elif op == "rotate_180":
            # New shape is H x W
            return [[grid[H - 1 - r][W - 1 - c] for c in range(W)] for r in range(H)]
        elif op == "rotate_270_cw":
            # New shape is W x H: new_grid[r_new][c_new] = grid[c_new][W - 1 - r_new]
            return [[grid[c_new][W - 1 - r_new] for c_new in range(H)] for r_new in range(W)]
        elif op == "reflect_horizontal":
            # New shape is H x W (flip rows top-to-bottom)
            return [grid[H - 1 - r][:] for r in range(H)]
        elif op == "reflect_vertical":
            # New shape is H x W (flip columns left-to-right)
            return [grid[r][::-1] for r in range(H)]
        elif op == "reflect_main_diagonal":
            # New shape is W x H (matrix transpose)
            return [[grid[r][c] for r in range(H)] for c in range(W)]
        elif op == "reflect_anti_diagonal":
            # New shape is W x H
            return [[grid[H - 1 - c_new][W - 1 - r_new] for c_new in range(H)] for r_new in range(W)]
        return clone_grid(grid)

    def infer_from_demonstrations(self, demonstrations: List[Demonstration]) -> List[CandidateRule]:
        if not demonstrations:
            return []

        # Verify all grids are valid
        for demo in demonstrations:
            if not is_valid_grid(demo.input_grid) or not is_valid_grid(demo.output_grid):
                return []

        candidates = []

        for op_key, op_desc, op_title in self.TRANSFORMS:
            all_match = True
            evidence = []
            has_spatial_change = False

            for idx, demo in enumerate(demonstrations):
                pred = self._apply_op(demo.input_grid, op_key)
                if not grid_equals(pred, demo.input_grid):
                    has_spatial_change = True

                if grid_equals(pred, demo.output_grid):
                    evidence.append(f"Demo {idx + 1}: {op_title} reproduces output")
                else:
                    all_match = False
                    break

            if all_match and evidence:
                # If input and output are identical for all demos, it's trivial symmetry/identity
                confidence = 0.96 if has_spatial_change else 0.40
                if len(demonstrations) >= 2 and has_spatial_change:
                    confidence = 0.99
                elif len(demonstrations) == 1 and has_spatial_change:
                    confidence = 0.88

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

    def calculate_complexity(self, parameters: Dict[str, Any]) -> float:
        # Global isometries have a concise description length
        return 1.1
