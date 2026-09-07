import pytest
from app.data.task_loader import task_loader
from app.engine.inference import MultiFamilyInferenceEngine
from app.engine.evaluator import Evaluator

def test_all_tasks_load_and_validate():
    tasks = task_loader.get_all_tasks()
    assert len(tasks) >= 8

    engine = MultiFamilyInferenceEngine()
    evaluator = Evaluator(engine)

    for task in tasks:
        # Check basic structure
        assert len(task.demonstrations) >= 1
        assert len(task.test_input) > 0
        assert len(task.test_output) > 0

        # Check grid rectangularity
        for demo in task.demonstrations:
            assert len(demo.input_grid) > 0
            assert len(demo.output_grid) > 0
            assert len(demo.input_grid[0]) > 0
            assert len(demo.output_grid[0]) > 0

        # Run inference with all demonstrations
        all_demos = list(task.demonstrations)
        if task.extra_demonstrations:
            all_demos.extend(task.extra_demonstrations)

        infer_res = engine.infer(all_demos, task.id)
        if not task.is_ambiguous:
            assert infer_res.selected_rule is not None, f"Task {task.id} failed to infer a rule with all demos"
            eval_res = evaluator.evaluate(infer_res.selected_rule, task.test_input, task.test_output)
            assert eval_res.is_correct is True, f"Task {task.id} failed ground-truth generalization: {eval_res.explanation}"
            assert eval_res.cell_accuracy == 100.0
