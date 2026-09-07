import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_learner_workflow():
    # 1. Health check
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"

    # 2. List tasks
    r = client.get("/api/tasks")
    assert r.status_code == 200
    tasks = r.json()
    assert len(tasks) >= 8

    # 3. Hypothesis evaluation
    r = client.post("/api/tasks/hypothesis", json={
        "task_id": "task_01_color_swap",
        "hypothesis_text": "Blue color 1 converts into red color 2"
    })
    assert r.status_code == 200
    hypo = r.json()
    assert hypo["is_valid_attempt"] is True
    assert hypo["similarity_score"] >= 0.7

    # 4. Multi-family skill inference
    task_01 = tasks[0]
    r = client.post("/api/infer", json={
        "task_id": "task_01_color_swap",
        "demonstrations": task_01["demonstrations"]
    })
    assert r.status_code == 200
    infer_res = r.json()
    assert infer_res["selected_rule"] is not None
    rule = infer_res["selected_rule"]
    assert rule["family"] == "color_mapping"

    # 5. Apply learned skill to novel unseen input
    r = client.post("/api/apply", json={
        "candidate_rule": rule,
        "test_input": task_01["test_input"],
        "test_output": [[0, 2, 0], [2, 0, 2], [0, 2, 0]]
    })
    assert r.status_code == 200
    apply_res = r.json()
    assert apply_res["is_correct"] is True
    assert apply_res["cell_accuracy"] == 100.0

    # 6. Generalization sweep
    r = client.post("/api/generalize", json={
        "task_id": "task_01_color_swap",
        "demonstration_counts": [1, 2, 3, 4]
    })
    assert r.status_code == 200
    gen_res = r.json()
    assert len(gen_res["points"]) == 4

    # 7. Ambiguity detection
    ambig_task = next(t for t in tasks if t["id"] == "task_ambiguity_01")
    r_ambig = client.post("/api/infer", json={
        "task_id": "task_ambiguity_01",
        "demonstrations": [ambig_task["demonstrations"][0]]
    })
    assert r_ambig.status_code == 200
    res_ambig = r_ambig.json()
    assert len(res_ambig["candidate_rules"]) > 0

    # 8. 60-Second challenge
    r_chal = client.get("/api/challenge/task")
    assert r_chal.status_code == 200
    chal_task = r_chal.json()
    assert "demonstrations" in chal_task

    # 9. Semantic reflection rubric
    r_ref = client.post("/api/reflection/evaluate", json={
        "text": "A system acquires an unseen task skill from demonstrations without updating its parameters at inference time, using context and recurrent state to generalize to novel examples."
    })
    assert r_ref.status_code == 200
    ref_res = r_ref.json()
    assert ref_res["score"] >= 80.0
    assert ref_res["mastery_level"] == "Master"
