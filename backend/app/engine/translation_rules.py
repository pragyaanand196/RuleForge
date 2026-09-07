from typing import List, Dict, Any
from .rule_base import BaseRule, grid_equals, clone_grid
from ..schemas import Grid, Demonstration, CandidateRule

class TranslationRule(BaseRule):
    family_name = "translation"

    def _shift(self, grid: Grid, dr: int, dc: int, wrap: bool = False, bg: int = 0) -> Grid:
        H = len(grid)
        W = len(grid[0])
        res = [[bg for _ in range(W)] for _ in range(H)]

        for r in range(H):
            for c in range(W):
                val = grid[r][c]
                if val != bg:
                    nr = r + dr
                    nc = c + dc
                    if wrap:
                        nr %= H
                        nc %= W
                        res[nr][nc] = val
                    else:
                        if 0 <= nr < H and 0 <= nc < W:
                            res[nr][nc] = val
        return res

    def _gravity(self, grid: Grid, direction: str, bg: int = 0) -> Grid:
        H = len(grid)
        W = len(grid[0])
        res = [[bg for _ in range(W)] for _ in range(H)]

        if direction == "down":
            for c in range(W):
                # collect all non-bg items from bottom to top
                items = [grid[r][c] for r in range(H) if grid[r][c] != bg]
                for i, val in enumerate(reversed(items)):
                    res[H - 1 - i][c] = val
        elif direction == "up":
            for c in range(W):
                items = [grid[r][c] for r in range(H) if grid[r][c] != bg]
                for i, val in enumerate(items):
                    res[i][c] = val
        elif direction == "right":
            for r in range(H):
                items = [grid[r][c] for c in range(W) if grid[r][c] != bg]
                for i, val in enumerate(reversed(items)):
                    res[r][W - 1 - i] = val
        elif direction == "left":
            for r in range(H):
                items = [grid[r][c] for c in range(W) if grid[r][c] != bg]
                for i, val in enumerate(items):
                    res[r][i] = val
        return res

    def infer_from_demonstrations(self, demonstrations: List[Demonstration]) -> List[CandidateRule]:
        if not demonstrations:
            return []

        candidates = []

        # 1. Test discrete rigid shifts: dr in [-2, -1, 0, 1, 2], dc in [-2, -1, 0, 1, 2]
        shift_directions = {
            (0, 1): "Shift foreground objects 1 cell right",
            (0, -1): "Shift foreground objects 1 cell left",
            (1, 0): "Shift foreground objects 1 cell down",
            (-1, 0): "Shift foreground objects 1 cell up",
            (1, 1): "Shift foreground objects 1 cell down-right",
            (-1, 1): "Shift foreground objects 1 cell up-right",
            (1, -1): "Shift foreground objects 1 cell down-left",
            (-1, -1): "Shift foreground objects 1 cell up-left",
            (0, 2): "Shift foreground objects 2 cells right",
            (2, 0): "Shift foreground objects 2 cells down",
        }

        for (dr, dc), desc in shift_directions.items():
            all_match = True
            evidence = []
            for idx, demo in enumerate(demonstrations):
                pred = self._shift(demo.input_grid, dr, dc)
                if grid_equals(pred, demo.output_grid):
                    evidence.append(f"Demo {idx + 1}: Spatial shift ({dr:+d} row, {dc:+d} col) matches")
                else:
                    all_match = False
                    break
            
            if all_match and evidence:
                candidates.append(
                    CandidateRule(
                        rule_id=f"shift_{dr}_{dc}",
                        family=self.family_name,
                        description=desc,
                        parameters={"type": "shift", "dr": dr, "dc": dc},
                        confidence=0.92 if len(demonstrations) >= 2 else 0.80,
                        evidence=evidence,
                        is_consistent=True
                    )
                )

        # 2. Test Gravity directions
        gravity_dirs = [
            ("down", "Gravity: drop all non-zero cells to the bottom floor"),
            ("up", "Gravity: float all non-zero cells to the top ceiling"),
            ("right", "Gravity: slide all non-zero cells to the right wall"),
            ("left", "Gravity: slide all non-zero cells to the left wall"),
        ]

        for direction, desc in gravity_dirs:
            all_match = True
            evidence = []
            for idx, demo in enumerate(demonstrations):
                pred = self._gravity(demo.input_grid, direction)
                if grid_equals(pred, demo.output_grid):
                    evidence.append(f"Demo {idx + 1}: {desc} matches output")
                else:
                    all_match = False
                    break

            if all_match and evidence:
                candidates.append(
                    CandidateRule(
                        rule_id=f"gravity_{direction}",
                        family=self.family_name,
                        description=desc,
                        parameters={"type": "gravity", "direction": direction},
                        confidence=0.94 if len(demonstrations) >= 2 else 0.82,
                        evidence=evidence,
                        is_consistent=True
                    )
                )

        return candidates

    def apply_rule(self, grid: Grid, parameters: Dict[str, Any]) -> Grid:
        rule_type = parameters.get("type", "shift")
        if rule_type == "gravity":
            return self._gravity(grid, parameters.get("direction", "down"))
        else:
            return self._shift(grid, parameters.get("dr", 0), parameters.get("dc", 0))
