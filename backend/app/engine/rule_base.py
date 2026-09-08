from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, Tuple
from ..schemas import Grid, Demonstration, CandidateRule

def is_valid_grid(g: Any) -> bool:
    """Verifies that g is a non-empty 2D list of integers with consistent row dimensions."""
    if not isinstance(g, list) or len(g) == 0:
        return False
    row_len = None
    for row in g:
        if not isinstance(row, list) or len(row) == 0:
            return False
        if row_len is None:
            row_len = len(row)
        elif len(row) != row_len:
            return False
        for cell in row:
            if not isinstance(cell, int) or cell < 0 or cell > 9:
                return False
    return True

def grid_equals(g1: Optional[Grid], g2: Optional[Grid]) -> bool:
    """Safely checks whether two 2D grids have identical dimensions and values."""
    if g1 is None or g2 is None:
        return g1 is g2
    if len(g1) != len(g2):
        return False
    for r1, r2 in zip(g1, g2):
        if len(r1) != len(r2) or r1 != r2:
            return False
    return True

def clone_grid(grid: Grid) -> Grid:
    """Returns a deep copy of a 2D integer grid."""
    return [row[:] for row in grid]

def grid_shape(grid: Grid) -> Tuple[int, int]:
    """Returns (height, width) of the grid."""
    if not grid or not grid[0]:
        return 0, 0
    return len(grid), len(grid[0])

def is_identity_transform(demonstrations: List[Demonstration]) -> bool:
    """Returns True if every demonstration's input grid is identical to its output grid."""
    if not demonstrations:
        return False
    return all(grid_equals(d.input_grid, d.output_grid) for d in demonstrations)

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

    def calculate_complexity(self, parameters: Dict[str, Any]) -> float:
        """Returns a complexity penalty score for Minimum Description Length (MDL) ranking."""
        return 1.0
