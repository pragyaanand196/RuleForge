from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from ..schemas import Grid, Demonstration, CandidateRule

def grid_equals(g1: Grid, g2: Grid) -> bool:
    if len(g1) != len(g2):
        return False
    for r1, r2 in zip(g1, g2):
        if len(r1) != len(r2) or r1 != r2:
            return False
    return True

def clone_grid(grid: Grid) -> Grid:
    return [row[:] for row in grid]

class BaseRule(ABC):
    family_name: str = "base"

    @abstractmethod
    def infer_from_demonstrations(self, demonstrations: List[Demonstration]) -> List[CandidateRule]:
        """Examines demonstration pairs and returns valid candidate hypotheses."""
        pass

    @abstractmethod
    def apply_rule(self, grid: Grid, parameters: Dict[str, Any]) -> Grid:
        """Applies the rule parameters to transform the input grid."""
        pass
