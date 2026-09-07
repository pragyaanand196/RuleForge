from typing import List, Dict, Any
from .rule_base import BaseRule, grid_equals, clone_grid
from ..schemas import Grid, Demonstration, CandidateRule

COLOR_NAMES = {
    0: "black/background (0)",
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

        for idx, demo in enumerate(demonstrations):
            in_g = demo.input_grid
            out_g = demo.output_grid

            if len(in_g) != len(out_g) or (len(in_g) > 0 and len(in_g[0]) != len(out_g[0])):
                consistent = False
                break

            demo_changes = []
            for r in range(len(in_g)):
                for c in range(len(in_g[0])):
                    val_in = in_g[r][c]
                    val_out = out_g[r][c]

                    if val_in in global_mapping:
                        if global_mapping[val_in] != val_out:
                            consistent = False
                            break
                    else:
                        global_mapping[val_in] = val_out
                    
                    if val_in != val_out:
                        change_str = f"{val_in} -> {val_out}"
                        if change_str not in demo_changes:
                            demo_changes.append(change_str)
                if not consistent:
                    break
            
            if demo_changes:
                evidence_lines.append(f"Demo {idx + 1}: Changed " + ", ".join(demo_changes))
            else:
                evidence_lines.append(f"Demo {idx + 1}: No color transformations observed")

        if not consistent or not global_mapping:
            return []

        # Check if it actually changes something
        non_identity_maps = {k: v for k, v in global_mapping.items() if k != v}
        if not non_identity_maps:
            # Identity mapping
            return [
                CandidateRule(
                    rule_id="identity_color",
                    family=self.family_name,
                    description="Preserve all cell colors identically without changes.",
                    parameters={"mapping": global_mapping},
                    confidence=0.5,
                    evidence=evidence_lines,
                    is_consistent=True
                )
            ]

        # Verify on all demonstrations
        for demo in demonstrations:
            pred = self.apply_rule(demo.input_grid, {"mapping": global_mapping})
            if not grid_equals(pred, demo.output_grid):
                return []

        readable_changes = [f"replace {color_name(k)} with {color_name(v)}" for k, v in non_identity_maps.items()]
        description = "Global color mapping: " + "; ".join(readable_changes) + "."

        return [
            CandidateRule(
                rule_id=f"color_map_{list(non_identity_maps.keys())[0]}_to_{list(non_identity_maps.values())[0]}",
                family=self.family_name,
                description=description,
                parameters={"mapping": global_mapping},
                confidence=0.98 if len(demonstrations) >= 2 else 0.85,
                evidence=evidence_lines,
                is_consistent=True
            )
        ]

    def apply_rule(self, grid: Grid, parameters: Dict[str, Any]) -> Grid:
        mapping = parameters.get("mapping", {})
        # Note: mapping keys may be serialized as strings in JSON
        int_mapping = {int(k): int(v) for k, v in mapping.items()}
        
        result = clone_grid(grid)
        for r in range(len(result)):
            for c in range(len(result[0])):
                val = result[r][c]
                if val in int_mapping:
                    result[r][c] = int_mapping[val]
        return result
