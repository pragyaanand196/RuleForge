import pytest
from app.schemas import Demonstration
from app.engine.inference import MultiFamilyInferenceEngine
from app.engine.evaluator import Evaluator

def test_multi_family_inference_single_rule():
    engine = MultiFamilyInferenceEngine()
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
    res = engine.infer(demos)
    assert res.selected_rule is not None
    assert res.selected_rule.family == "color_mapping"
    assert len(res.evidence) > 0
    assert res.hypothesis_space_size >= 1

def test_ambiguity_detection_sparse_demo():
    engine = MultiFamilyInferenceEngine()
    # A single cell at 0,0 changing from 1 to 2 can be color mapping, shift, gravity, pattern, etc.
    sparse_demos = [
        Demonstration(
            input_grid=[[1, 0, 0], [0, 0, 0], [0, 0, 0]],
            output_grid=[[2, 0, 0], [0, 0, 0], [0, 0, 0]]
        )
    ]
    res = engine.infer(sparse_demos)
    assert len(res.candidate_rules) > 1
    assert res.is_ambiguous is True
    assert res.ambiguity_reason is not None
    assert "Underdetermined Evidence" in res.ambiguity_reason

def test_disambiguation_with_second_demo():
    engine = MultiFamilyInferenceEngine()
    # Demo 1 is sparse
    demo1 = Demonstration(
        input_grid=[[1, 0, 0], [0, 0, 0], [0, 0, 0]],
        output_grid=[[2, 0, 0], [0, 0, 0], [0, 0, 0]]
    )
    # Demo 2 provides off-diagonal coordinates: (2,0), (1,1), (0,2)
    demo2 = Demonstration(
        input_grid=[[0, 0, 1], [0, 1, 0], [1, 0, 0]],
        output_grid=[[0, 0, 2], [0, 2, 0], [2, 0, 0]]
    )
    
    # At k=1, ambiguous
    res_k1 = engine.infer([demo1])
    assert res_k1.is_ambiguous is True

    # At k=2, resolved
    res_k2 = engine.infer([demo1, demo2])
    assert res_k2.selected_rule is not None
    assert res_k2.selected_rule.family == "color_mapping"
    assert res_k2.is_ambiguous is False

def test_contradictory_demonstrations_rejection():
    engine = MultiFamilyInferenceEngine()
    demos = [
        Demonstration(
            input_grid=[[1, 0], [0, 1]],
            output_grid=[[2, 0], [0, 2]]
        ),
        Demonstration(
            input_grid=[[1, 0], [0, 1]],  # Identical input
            output_grid=[[3, 0], [0, 3]]   # Conflicting output
        )
    ]
    res = engine.infer(demos)
    assert res.selected_rule is None
    assert res.is_ambiguous is False
    assert "Contradictory evidence" in (res.ambiguity_reason or "")

def test_unsupported_transformation():
    engine = MultiFamilyInferenceEngine()
    demos = [
        Demonstration(
            input_grid=[[1, 1, 2], [3, 4, 5], [6, 7, 8]],
            output_grid=[[9, 4, 1], [2, 8, 3], [7, 6, 5]]
        )
    ]
    res = engine.infer(demos)
    assert res.selected_rule is None
    assert len(res.candidate_rules) == 0
    assert "No consistent rule found" in (res.ambiguity_reason or "")

def test_invalid_grid_handling():
    engine = MultiFamilyInferenceEngine()
    demos = [
        Demonstration(
            input_grid=[],  # Empty
            output_grid=[[1, 2]]
        )
    ]
    res = engine.infer(demos)
    assert res.selected_rule is None
    assert "invalid" in (res.ambiguity_reason or "").lower()

def test_evaluator_prediction_and_diff():
    engine = MultiFamilyInferenceEngine()
    evaluator = Evaluator(engine)

    demos = [
        Demonstration(
            input_grid=[[1, 0], [0, 1]],
            output_grid=[[2, 0], [0, 2]]
        )
    ]
    infer_res = engine.infer(demos)
    assert infer_res.selected_rule is not None

    test_in = [[0, 1], [1, 0]]
    ground_truth = [[0, 2], [2, 0]]
    eval_res = evaluator.evaluate(infer_res.selected_rule, test_in, ground_truth)
    assert eval_res.is_correct is True
    assert eval_res.cell_accuracy == 100.0
    assert eval_res.matched_cells == 4
    assert eval_res.diff_grid == [[True, True], [True, True]]
