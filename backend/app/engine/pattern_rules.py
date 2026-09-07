from typing import List, Dict, Any, Set, Tuple
from .rule_base import BaseRule, grid_equals, clone_grid
from ..schemas import Grid, Demonstration, CandidateRule

class PatternRule(BaseRule):
    family_name = "pattern"

    def _delete_color(self, grid: Grid, color_to_delete: int, bg: int = 0) -> Grid:
        return [[bg if cell == color_to_delete else cell for cell in row] for row in grid]

    def _fill_enclosed_or_bbox(self, grid: Grid, fill_color: int, bg: int = 0) -> Grid:
        H = len(grid)
        W = len(grid[0])
        res = clone_grid(grid)

        # Find bounding box of non-background cells
        min_r, max_r = H, -1
        min_c, max_c = W, -1
        border_colors = set()

        for r in range(H):
            for c in range(W):
                if grid[r][c] != bg:
                    min_r = min(min_r, r)
                    max_r = max(max_r, r)
                    min_c = min(min_c, c)
                    max_c = max(max_c, c)
                    border_colors.add(grid[r][c])

        if max_r > min_r + 1 and max_c > min_c + 1:
            for r in range(min_r + 1, max_r):
                for c in range(min_c + 1, max_c):
                    if grid[r][c] == bg:
                        res[r][c] = fill_color
        return res

    def _extract_border(self, grid: Grid, bg: int = 0) -> Grid:
        H = len(grid)
        W = len(grid[0])
        res = [[bg for _ in range(W)] for _ in range(H)]

        for r in range(H):
            for c in range(W):
                if grid[r][c] != bg:
                    # Check 4-neighbors; if any neighbor is bg or out of bounds, it's a border cell
                    is_border = False
                    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        nr, nc = r + dr, c + dc
                        if nr < 0 or nr >= H or nc < 0 or nc >= W or grid[nr][nc] == bg:
                            is_border = True
                            break
                    if is_border:
                        res[r][c] = grid[r][c]
        return res

    def _symmetrize_horizontal(self, grid: Grid) -> Grid:
        """Reflect top half onto bottom half."""
        H = len(grid)
        W = len(grid[0])
        res = clone_grid(grid)
        for r in range(H // 2, H):
            res[r] = grid[H - 1 - r][:]
        return res

    def _symmetrize_vertical(self, grid: Grid) -> Grid:
        """Reflect left half onto right half."""
        H = len(grid)
        W = len(grid[0])
        res = clone_grid(grid)
        for r in range(H):
            for c in range(W // 2, W):
                res[r][c] = grid[r][W - 1 - c]
        return res

    def infer_from_demonstrations(self, demonstrations: List[Demonstration]) -> List[CandidateRule]:
        if not demonstrations:
            return []

        candidates = []

        # 1. Color deletion: test each color 1-9
        for color in range(1, 10):
            all_match = True
            evidence = []
            has_effect = False
            for idx, demo in enumerate(demonstrations):
                pred = self._delete_color(demo.input_grid, color)
                if not grid_equals(pred, demo.input_grid):
                    has_effect = True
                if grid_equals(pred, demo.output_grid):
                    evidence.append(f"Demo {idx + 1}: Deleting color {color} reproduces output")
                else:
                    all_match = False
                    break
            
            if all_match and has_effect and evidence:
                candidates.append(
                    CandidateRule(
                        rule_id=f"delete_color_{color}",
                        family=self.family_name,
                        description=f"Delete color {color}: remove all cells of color {color} and replace with background (0).",
                        parameters={"type": "delete_color", "color": color},
                        confidence=0.95 if len(demonstrations) >= 2 else 0.83,
                        evidence=evidence,
                        is_consistent=True
                    )
                )

        # 2. Shape fill: test filling interior with color 1-9
        for fill_color in range(1, 10):
            all_match = True
            evidence = []
            has_effect = False
            for idx, demo in enumerate(demonstrations):
                pred = self._fill_enclosed_or_bbox(demo.input_grid, fill_color)
                if not grid_equals(pred, demo.input_grid):
                    has_effect = True
                if grid_equals(pred, demo.output_grid):
                    evidence.append(f"Demo {idx + 1}: Filling interior with color {fill_color} matches")
                else:
                    all_match = False
                    break

            if all_match and has_effect and evidence:
                candidates.append(
                    CandidateRule(
                        rule_id=f"fill_interior_{fill_color}",
                        family=self.family_name,
                        description=f"Shape interior completion: fill hollow enclosure with color {fill_color}.",
                        parameters={"type": "fill_interior", "fill_color": fill_color},
                        confidence=0.93 if len(demonstrations) >= 2 else 0.81,
                        evidence=evidence,
                        is_consistent=True
                    )
                )

        # 3. Border extraction
        all_match_border = True
        evidence_border = []
        has_effect_border = False
        for idx, demo in enumerate(demonstrations):
            pred = self._extract_border(demo.input_grid)
            if not grid_equals(pred, demo.input_grid):
                has_effect_border = True
            if grid_equals(pred, demo.output_grid):
                evidence_border.append(f"Demo {idx + 1}: Extracting outer perimeter outline matches")
            else:
                all_match_border = False
                break

        if all_match_border and has_effect_border and evidence_border:
            candidates.append(
                CandidateRule(
                    rule_id="extract_border",
                    family=self.family_name,
                    description="Border extraction: preserve perimeter outline and hollow out the interior.",
                    parameters={"type": "extract_border"},
                    confidence=0.94 if len(demonstrations) >= 2 else 0.82,
                    evidence=evidence_border,
                    is_consistent=True
                )
            )

        # 4. Symmetrization
        for sym_type, method, desc in [
            ("symmetrize_vertical", self._symmetrize_vertical, "Vertical Symmetrization: mirror left half onto right half"),
            ("symmetrize_horizontal", self._symmetrize_horizontal, "Horizontal Symmetrization: mirror top half onto bottom half")
        ]:
            all_match_sym = True
            evidence_sym = []
            has_effect_sym = False
            for idx, demo in enumerate(demonstrations):
                pred = method(demo.input_grid)
                if not grid_equals(pred, demo.input_grid):
                    has_effect_sym = True
                if grid_equals(pred, demo.output_grid):
                    evidence_sym.append(f"Demo {idx + 1}: {desc} matches output")
                else:
                    all_match_sym = False
                    break

            if all_match_sym and has_effect_sym and evidence_sym:
                candidates.append(
                    CandidateRule(
                        rule_id=f"pattern_{sym_type}",
                        family=self.family_name,
                        description=desc,
                        parameters={"type": sym_type},
                        confidence=0.93 if len(demonstrations) >= 2 else 0.80,
                        evidence=evidence_sym,
                        is_consistent=True
                    )
                )

        return candidates

    def apply_rule(self, grid: Grid, parameters: Dict[str, Any]) -> Grid:
        rule_type = parameters.get("type")
        if rule_type == "delete_color":
            return self._delete_color(grid, parameters.get("color", 0))
        elif rule_type == "fill_interior":
            return self._fill_enclosed_or_bbox(grid, parameters.get("fill_color", 1))
        elif rule_type == "extract_border":
            return self._extract_border(grid)
        elif rule_type == "symmetrize_vertical":
            return self._symmetrize_vertical(grid)
        elif rule_type == "symmetrize_horizontal":
            return self._symmetrize_horizontal(grid)
        return clone_grid(grid)
