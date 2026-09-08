from typing import List, Dict, Any
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

def color_name(c: int) -> str:
    return COLOR_NAMES.get(c, f"color {c}")

class ColorMappingRule(BaseRule):
    family_name = "color_mapping"

    def infer_from_demonstrations(self, demonstrations: List[Demonstration]) -> List[CandidateRule]:
        if not demonstrations:
            return []

        # Find global color mapping: each input color maps to a unique output color
        global_mapping: Dict[int, int] = {}
        consistent = True
        evidence_lines = []
        total_non_bg_cells = 0

        for idx, demo in enumerate(demonstrations):
            in_g = demo.input_grid
            out_g = demo.output_grid

            if not is_valid_grid(in_g) or not is_valid_grid(out_g):
                return []

            if grid_shape(in_g) != grid_shape(out_g):
                # Color mapping preserves grid dimensions
                return []

            demo_changes = {}
            for r in range(len(in_g)):
                for c in range(len(in_g[0])):
                    val_in = in_g[r][c]
                    val_out = out_g[r][c]
                    if val_in != 0:
                        total_non_bg_cells += 1

                    if val_in in global_mapping:
                        if global_mapping[val_in] != val_out:
                            consistent = False
                            break
                    else:
                        global_mapping[val_in] = val_out
                    
                    if val_in != val_out:
                        demo_changes[val_in] = val_out
                if not consistent:
                    break
            
            if not consistent:
                break

            if demo_changes:
                change_strs = [f"{color_name(k)} -> {color_name(v)}" for k, v in demo_changes.items()]
                evidence_lines.append(f"Demo {idx + 1}: Replaced {', '.join(change_strs)}")
            else:
                evidence_lines.append(f"Demo {idx + 1}: Cell colors preserved identically")

        if not consistent or not global_mapping:
            return []

        # Verify on all demonstrations
        for demo in demonstrations:
            pred = self.apply_rule(demo.input_grid, {"mapping": global_mapping})
            if not grid_equals(pred, demo.output_grid):
                return []

        non_identity_maps = {k: v for k, v in global_mapping.items() if k != v}
        
        if not non_identity_maps:
            # Complete identity mapping
            return [
                CandidateRule(
                    rule_id="identity_color_preservation",
                    family=self.family_name,
                    description="Identity: Preserve all cell colors and values without changes.",
                    parameters={"mapping": global_mapping},
                    confidence=0.5 if len(demonstrations) >= 2 else 0.35,
                    evidence=evidence_lines,
                    is_consistent=True
                )
            ]

        readable_changes = [f"{color_name(k)} becomes {color_name(v)}" for k, v in sorted(non_identity_maps.items())]
        description = "Global color mapping: " + "; ".join(readable_changes) + "."
        
        # Build deterministic rule_id
        keys_str = "_".join(f"{k}to{v}" for k, v in sorted(non_identity_maps.items()))
        rule_id = f"color_map_{keys_str}"

        confidence = 0.98 if len(demonstrations) >= 2 else 0.85

        candidates = [
            CandidateRule(
                rule_id=rule_id,
                family=self.family_name,
                description=description,
                parameters={"mapping": global_mapping},
                confidence=confidence,
                evidence=evidence_lines,
                is_consistent=True
            )
        ]

        # If there is exactly 1 demonstration and exactly 1 cell changed in that demonstration,
        # emit a position-specific candidate rule as an ambiguous alternative
        if len(demonstrations) == 1 and len(non_identity_maps) == 1:
            in_g = demonstrations[0].input_grid
            out_g = demonstrations[0].output_grid
            changed_coords = []
            for r in range(len(in_g)):
                for c in range(len(in_g[0])):
                    if in_g[r][c] != out_g[r][c]:
                        changed_coords.append((r, c, in_g[r][c], out_g[r][c]))
            if len(changed_coords) == 1:
                r_pos, c_pos, old_v, new_v = changed_coords[0]
                pos_cand = CandidateRule(
                    rule_id=f"position_specific_{r_pos}_{c_pos}_{new_v}",
                    family=self.family_name,
                    description=f"Position-specific override: only replace cell at coordinates (row {r_pos}, col {c_pos}) with {color_name(new_v)}.",
                    parameters={"type": "pos_specific", "r": r_pos, "c": c_pos, "val": new_v},
                    confidence=0.75,
                    evidence=[f"Demo 1: Coordinate ({r_pos}, {c_pos}) changed from {color_name(old_v)} to {color_name(new_v)}"],
                    is_consistent=True
                )
                candidates.append(pos_cand)

        return candidates

    def apply_rule(self, grid: Grid, parameters: Dict[str, Any]) -> Grid:
        if parameters.get("type") == "pos_specific":
            res = clone_grid(grid)
            r = parameters.get("r", 0)
            c = parameters.get("c", 0)
            val = parameters.get("val", 0)
            if 0 <= r < len(res) and 0 <= c < len(res[0]):
                res[r][c] = val
            return res

        mapping = parameters.get("mapping", {})
        int_mapping = {int(k): int(v) for k, v in mapping.items()}
        
        result = clone_grid(grid)
        for r in range(len(result)):
            for c in range(len(result[0])):
                val = result[r][c]
                if val in int_mapping:
                    result[r][c] = int_mapping[val]
        return result

    def calculate_complexity(self, parameters: Dict[str, Any]) -> float:
        if parameters.get("type") == "pos_specific":
            return 2.5
        mapping = parameters.get("mapping", {})
        non_id = sum(1 for k, v in mapping.items() if int(k) != int(v))
        return 1.0 + (0.2 * non_id)
