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

def test_ambiguity_detection():
    engine = MultiFamilyInferenceEngine()
    # A single cell at 0,0 changing from 1 to 2 can be color mapping or other transforms
    demos = [
        Demonstration(
            input_grid=[[1, 0], [0, 0]],
            output_grid=[[2, 0], [0, 0]]
        )
    ]
    res = engine.infer(demos)
    assert res.selected_rule is not None

def test_evaluator_perfect_match():
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
