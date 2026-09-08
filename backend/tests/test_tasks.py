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

def test_externalized_data_files_integrity():
    import os, json
    # Verify top-level data/ files exist
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data"))
    if not os.path.exists(base_dir):
        base_dir = os.path.abspath("data")
    
    tasks_path = os.path.join(base_dir, "tasks.json")
    challenge_path = os.path.join(base_dir, "challenge_tasks.json")
    failure_path = os.path.join(base_dir, "failure_cases.json")

    assert os.path.exists(tasks_path), f"Missing {tasks_path}"
    assert os.path.exists(challenge_path), f"Missing {challenge_path}"
    assert os.path.exists(failure_path), f"Missing {failure_path}"

    tasks = json.load(open(tasks_path, "r", encoding="utf-8"))
    challenges = json.load(open(challenge_path, "r", encoding="utf-8"))
    failures = json.load(open(failure_path, "r", encoding="utf-8"))

    assert len(tasks) == 10
    assert len(challenges) == 2
    assert len(failures) == 3

    # Ensure no duplicate task IDs
    all_ids = [t["id"] for t in tasks] + [c["id"] for c in challenges]
    assert len(all_ids) == len(set(all_ids))

def test_challenge_tasks_solve():
    engine = MultiFamilyInferenceEngine()
    evaluator = Evaluator(engine)

    c1 = task_loader.get_task_by_id("task_challenge_01")
    assert c1 is not None
    res1 = engine.infer(c1.demonstrations, c1.id)
    assert res1.selected_rule is not None
    eval1 = evaluator.evaluate(res1.selected_rule, c1.test_input, c1.test_output)
    assert eval1.is_correct is True
    assert eval1.cell_accuracy == 100.0

    c2 = task_loader.get_task_by_id("task_challenge_02")
    assert c2 is not None
    res2 = engine.infer(c2.demonstrations, c2.id)
    assert res2.selected_rule is not None
    eval2 = evaluator.evaluate(res2.selected_rule, c2.test_input, c2.test_output)
    assert eval2.is_correct is True
    assert eval2.cell_accuracy == 100.0

