import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.data.task_loader import task_loader

client = TestClient(app)

def test_health_check():
    for endpoint in ["/health", "/api/health"]:
        response = client.get(endpoint)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"


def test_list_tasks():
    response = client.get("/api/tasks")
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) >= 5
    for t in tasks:
        assert t["test_output"] is None  # Verify solution hiding

def test_get_task():
    response = client.get("/api/tasks/task_01_color_swap")
    assert response.status_code == 200
    task = response.json()
    assert task["id"] == "task_01_color_swap"
    assert task["test_output"] is None

def test_hypothesis_evaluation():
    payload = {
        "task_id": "task_01_color_swap",
        "hypothesis_text": "Every blue cell 1 transforms into red 2"
    }
    response = client.post("/api/tasks/hypothesis", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid_attempt"] is True
    assert data["similarity_score"] >= 0.7

def test_infer_endpoint():
    payload = {
        "demonstrations": [
            {
                "input_grid": [[1, 0], [0, 1]],
                "output_grid": [[2, 0], [0, 2]]
            }
        ]
    }
    response = client.post("/api/infer", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["candidate_rules"]) > 0

def test_generalization_endpoint():
    payload = {
        "task_id": "task_01_color_swap",
        "demonstration_counts": [1, 2, 3]
    }
    response = client.post("/api/generalize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["points"]) == 3
    assert data["points"][-1]["is_correct"] is True

def test_reflection_endpoint():
    payload = {
        "text": "The machine learns a hidden rule from a small set of input-output demonstrations, adapting in recurrent context without updating its weights, and successfully generalizes to solve a new unseen example."
    }
    response = client.post("/api/reflection/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["score"] >= 80.0
    assert data["mastery_level"] == "Master"

def test_challenge_task_endpoint():
    response = client.get("/api/challenge/task")
    assert response.status_code == 200
    data = response.json()
    assert "demonstrations" in data
    assert "test_input" in data
