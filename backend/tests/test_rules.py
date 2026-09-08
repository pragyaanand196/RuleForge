import pytest
from app.schemas import Demonstration
from app.engine.color_rules import ColorMappingRule
from app.engine.geometric_rules import GeometricRule
from app.engine.translation_rules import TranslationRule
from app.engine.pattern_rules import PatternRule
from app.engine.counting_rules import CountingRule
from app.engine.rule_base import grid_equals, is_valid_grid

def test_color_mapping_single_swap():
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

def test_color_mapping_multi_color_swap():
    rule = ColorMappingRule()
    demos = [
        Demonstration(
            input_grid=[[1, 3], [0, 0]],
            output_grid=[[2, 4], [0, 0]]
        ),
        Demonstration(
            input_grid=[[3, 1], [1, 3]],
            output_grid=[[4, 2], [2, 4]]
        )
    ]
    candidates = rule.infer_from_demonstrations(demos)
    assert len(candidates) == 1
    cand = candidates[0]
    pred = rule.apply_rule([[3, 0], [0, 1]], cand.parameters)
    assert pred == [[4, 0], [0, 2]]

def test_geometric_all_seven_transforms():
    rule = GeometricRule()
    
    # 2x3 rectangular grid
    in_grid = [
        [1, 2, 3],
        [4, 5, 6]
    ]

    # Rotate 90 CW: shape 3x2
    r90 = rule.apply_rule(in_grid, {"operation": "rotate_90_cw"})
    assert r90 == [
        [4, 1],
        [5, 2],
        [6, 3]
    ]

    # Rotate 180: shape 2x3
    r180 = rule.apply_rule(in_grid, {"operation": "rotate_180"})
    assert r180 == [
        [6, 5, 4],
        [3, 2, 1]
    ]

    # Rotate 270 CW (90 CCW): shape 3x2
    r270 = rule.apply_rule(in_grid, {"operation": "rotate_270_cw"})
    assert r270 == [
        [3, 6],
        [2, 5],
        [1, 4]
    ]

    # Reflect horizontal (vertical flip, top-to-bottom): shape 2x3
    ref_h = rule.apply_rule(in_grid, {"operation": "reflect_horizontal"})
    assert ref_h == [
        [4, 5, 6],
        [1, 2, 3]
    ]

    # Reflect vertical (horizontal flip, left-to-right): shape 2x3
    ref_v = rule.apply_rule(in_grid, {"operation": "reflect_vertical"})
    assert ref_v == [
        [3, 2, 1],
        [6, 5, 4]
    ]

    # Reflect main diagonal (transpose): shape 3x2
    ref_diag = rule.apply_rule(in_grid, {"operation": "reflect_main_diagonal"})
    assert ref_diag == [
        [1, 4],
        [2, 5],
        [3, 6]
    ]

    # Reflect anti-diagonal: shape 3x2
    ref_anti = rule.apply_rule(in_grid, {"operation": "reflect_anti_diagonal"})
    assert ref_anti == [
        [6, 3],
        [5, 2],
        [4, 1]
    ]

def test_translation_rigid_shifts_and_gravity():
    rule = TranslationRule()

    # Shift right 1
    demos_shift = [
        Demonstration(
            input_grid=[[1, 0, 0], [0, 0, 0]],
            output_grid=[[0, 1, 0], [0, 0, 0]]
        )
    ]
    candidates = rule.infer_from_demonstrations(demos_shift)
    shifts = [(c.parameters.get("dr"), c.parameters.get("dc")) for c in candidates if c.parameters.get("type") == "shift"]
    assert (0, 1) in shifts

    # Gravity drop
    grid_in = [
        [1, 0, 2],
        [0, 0, 0],
        [0, 0, 0]
    ]
    grav_down = rule.apply_rule(grid_in, {"type": "gravity", "direction": "down"})
    assert grav_down == [
        [0, 0, 0],
        [0, 0, 0],
        [1, 0, 2]
    ]

    # Gravity up
    grid_in_up = [
        [0, 0, 0],
        [0, 3, 0],
        [4, 0, 0]
    ]
    grav_up = rule.apply_rule(grid_in_up, {"type": "gravity", "direction": "up"})
    assert grav_up == [
        [4, 3, 0],
        [0, 0, 0],
        [0, 0, 0]
    ]

def test_pattern_deletion_fill_border_symmetry():
    rule = PatternRule()

    # 1. Color deletion
    demo_del = [
        Demonstration(
            input_grid=[[1, 2], [2, 1]],
            output_grid=[[1, 0], [0, 1]]
        )
    ]
    cand_del = rule.infer_from_demonstrations(demo_del)
    assert any(c.parameters.get("type") == "delete_color" and c.parameters.get("color") == 2 for c in cand_del)

    # 2. Shape fill
    grid_box = [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1]
    ]
    filled = rule.apply_rule(grid_box, {"type": "fill_interior", "fill_color": 4})
    assert filled == [
        [1, 1, 1],
        [1, 4, 1],
        [1, 1, 1]
    ]

    # 3. Border extraction
    grid_solid = [
        [2, 2, 2],
        [2, 2, 2],
        [2, 2, 2]
    ]
    bordered = rule.apply_rule(grid_solid, {"type": "extract_border"})
    assert bordered == [
        [2, 2, 2],
        [2, 0, 2],
        [2, 2, 2]
    ]

    # 4. Vertical symmetrization (left half mirrored onto right)
    grid_left = [
        [1, 2, 0, 0],
        [3, 0, 0, 0]
    ]
    sym = rule.apply_rule(grid_left, {"type": "symmetrize_vertical"})
    assert sym == [
        [1, 2, 2, 1],
        [3, 0, 0, 3]
    ]

def test_counting_majority_and_parity():
    rule = CountingRule()

    # Majority fill
    grid_maj = [
        [1, 2, 2],
        [2, 2, 0],
        [0, 0, 0]
    ]
    out_maj = rule.apply_rule(grid_maj, {"type": "majority_fill"})
    assert out_maj == [
        [2, 2, 2],
        [2, 2, 2],
        [2, 2, 2]
    ]

    # Parity (even count = 3, odd count = 2)
    grid_even = [[1, 1], [0, 0]]  # count = 2 (even)
    grid_odd = [[1, 0], [0, 0]]   # count = 1 (odd)
    assert rule.apply_rule(grid_even, {"type": "parity", "even_color": 3, "odd_color": 2}) == [[3, 3], [3, 3]]
    assert rule.apply_rule(grid_odd, {"type": "parity", "even_color": 3, "odd_color": 2}) == [[2, 2], [2, 2]]

def test_1x1_and_boundary_grids():
    color_rule = ColorMappingRule()
    demo_1x1 = [
        Demonstration(input_grid=[[1]], output_grid=[[2]])
    ]
    cand = color_rule.infer_from_demonstrations(demo_1x1)
    assert len(cand) >= 1
    pred = color_rule.apply_rule([[1]], cand[0].parameters)
    assert pred == [[2]]

def test_evaluator_partial_accuracy():
    from app.engine.inference import MultiFamilyInferenceEngine
    from app.engine.evaluator import Evaluator
    engine = MultiFamilyInferenceEngine()
    evaluator = Evaluator(engine)
    
    # 4-cell grid where 3 cells match and 1 cell differs
    rule = ColorMappingRule()
    cand = rule.infer_from_demonstrations([
        Demonstration(input_grid=[[1, 0], [0, 1]], output_grid=[[2, 0], [0, 2]])
    ])[0]

    test_in = [[1, 0], [0, 1]]
    ground_truth_imperfect = [[2, 0], [0, 9]] # 1 cell intentionally wrong
    eval_res = evaluator.evaluate(cand, test_in, ground_truth_imperfect)
    assert eval_res.is_correct is False
    assert eval_res.cell_accuracy == 75.0
    assert eval_res.matched_cells == 3
    assert eval_res.total_cells == 4
    assert eval_res.diff_grid == [[True, True], [True, False]]

