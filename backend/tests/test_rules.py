import pytest
from app.schemas import Demonstration
from app.engine.color_rules import ColorMappingRule
from app.engine.geometric_rules import GeometricRule
from app.engine.translation_rules import TranslationRule
from app.engine.pattern_rules import PatternRule
from app.engine.counting_rules import CountingRule
from app.engine.rule_base import grid_equals

def test_color_mapping_rule():
    rule = ColorMappingRule()
    demos = [
        Demonstration(
            input_grid=[[1, 0], [0, 1]],
            output_grid=[[2, 0], [0, 2]]
        ),
        Demonstration(
            input_grid=[[0, 1], [1, 0]],
            output_grid=[[0, 2], [2, 0]]
        )
    ]
    candidates = rule.infer_from_demonstrations(demos)
    assert len(candidates) == 1
    cand = candidates[0]
    assert cand.family == "color_mapping"
    assert cand.is_consistent is True

    # Test application
    test_in = [[1, 1], [0, 0]]
    test_out = rule.apply_rule(test_in, cand.parameters)
    assert test_out == [[2, 2], [0, 0]]

def test_geometric_rotation_90():
    rule = GeometricRule()
    demos = [
        Demonstration(
            input_grid=[[1, 2], [3, 4]],
            output_grid=[[3, 1], [4, 2]]
        )
    ]
    candidates = rule.infer_from_demonstrations(demos)
    op_names = [c.parameters.get("operation") for c in candidates]
    assert "rotate_90_cw" in op_names

    pred = rule.apply_rule([[1, 0], [0, 0]], {"operation": "rotate_90_cw"})
    assert pred == [[0, 1], [0, 0]]

def test_geometric_reflection_vertical():
    rule = GeometricRule()
    demos = [
        Demonstration(
            input_grid=[[1, 2], [3, 4]],
            output_grid=[[2, 1], [4, 3]]
        )
    ]
    candidates = rule.infer_from_demonstrations(demos)
    op_names = [c.parameters.get("operation") for c in candidates]
    assert "reflect_vertical" in op_names

def test_translation_shift():
    rule = TranslationRule()
    demos = [
        Demonstration(
            input_grid=[[1, 0, 0], [0, 0, 0], [0, 0, 0]],
            output_grid=[[0, 1, 0], [0, 0, 0], [0, 0, 0]]
        )
    ]
    candidates = rule.infer_from_demonstrations(demos)
    shifts = [(c.parameters.get("dr"), c.parameters.get("dc")) for c in candidates if c.parameters.get("type") == "shift"]
    assert (0, 1) in shifts

def test_pattern_color_deletion():
    rule = PatternRule()
    demos = [
        Demonstration(
            input_grid=[[1, 2], [2, 1]],
            output_grid=[[1, 0], [0, 1]]
        )
    ]
    candidates = rule.infer_from_demonstrations(demos)
    del_colors = [c.parameters.get("color") for c in candidates if c.parameters.get("type") == "delete_color"]
    assert 2 in del_colors

def test_counting_majority_fill():
    rule = CountingRule()
    demos = [
        Demonstration(
            input_grid=[[3, 3], [3, 1]],
            output_grid=[[3, 3], [3, 3]]
        )
    ]
    candidates = rule.infer_from_demonstrations(demos)
    assert any(c.parameters.get("type") == "majority_fill" for c in candidates)
