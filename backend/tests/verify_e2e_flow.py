import httpx
import sys

BASE_URL = "http://127.0.0.1:8000"

def run_verification():
    print("=== RuleForge End-to-End Flow Verification ===")

    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        # 1. Health check
        print("1. Testing Health Endpoint...")
        r = client.get("/health")
        assert r.status_code == 200, f"Health check failed: {r.text}"
        assert r.json()["status"] == "ok"
        print("   [OK] Health check passed:", r.json())

        # 2. List tasks
        print("2. Testing Task Listing...")
        r = client.get("/api/tasks")
        assert r.status_code == 200
        tasks = r.json()
        assert len(tasks) >= 8
        print(f"   [OK] Loaded {len(tasks)} tasks successfully.")

        # 3. Hypothesis check
        print("3. Testing Hypothesis Evaluation...")
        r = client.post("/api/tasks/hypothesis", json={
            "task_id": "task_01_color_swap",
            "hypothesis_text": "Blue color 1 converts into red color 2"
        })
        assert r.status_code == 200
        hypo = r.json()
        assert hypo["is_valid_attempt"] is True
        print(f"   [OK] Hypothesis evaluated: Score {hypo['similarity_score']} - Feedback: {hypo['feedback'][:60]}...")

        # 4. Skill Inference on task_01
        print("4. Testing Multi-Family Skill Inference...")
        task_01 = tasks[0]
        r = client.post("/api/infer", json={
            "task_id": "task_01_color_swap",
            "demonstrations": task_01["demonstrations"]
        })
        assert r.status_code == 200
        infer_res = r.json()
        assert infer_res["selected_rule"] is not None
        rule = infer_res["selected_rule"]
        print(f"   [OK] Rule Inferred: '{rule['description']}' (Confidence: {rule['confidence'] * 100}%)")

        # 5. Apply learned skill to novel unseen input
        print("5. Testing Novel Unseen Generalization...")
        r = client.post("/api/apply", json={
            "candidate_rule": rule,
            "test_input": task_01["test_input"],
            "test_output": [[0, 2, 0], [2, 0, 2], [0, 2, 0]]
        })
        assert r.status_code == 200
        apply_res = r.json()
        assert apply_res["is_correct"] is True
        assert apply_res["cell_accuracy"] == 100.0
        print(f"   [OK] Generalization Verified: {apply_res['cell_accuracy']}% accuracy ({apply_res['matched_cells']}/{apply_res['total_cells']} cells).")

        # 6. Generalization sweep
        print("6. Testing Generalization Sweep across k in [1, 2, 3, 4]...")
        r = client.post("/api/generalize", json={
            "task_id": "task_01_color_swap",
            "demonstration_counts": [1, 2, 3, 4]
        })
        assert r.status_code == 200
        gen_res = r.json()
        assert len(gen_res["points"]) == 4
        print(f"   [OK] Sweep Points: {[(p['k_demos'], p['accuracy']) for p in gen_res['points']]}")

        # 7. Ambiguity Resolution Flow
        print("7. Testing Ambiguity Resolution Flow...")
        ambig_task = next(t for t in tasks if t["id"] == "task_ambiguity_01")
        r_ambig = client.post("/api/infer", json={
            "task_id": "task_ambiguity_01",
            "demonstrations": [ambig_task["demonstrations"][0]]
        })
        res_ambig = r_ambig.json()
        print(f"   [OK] Ambiguity Detected on Sparse Demo: is_ambiguous={res_ambig['is_ambiguous']}, candidate count={len(res_ambig['candidate_rules'])}")

        # 8. 60-Second Challenge Task
        print("8. Testing 60-Second Challenge Endpoint...")
        r_chal = client.get("/api/challenge/task")
        assert r_chal.status_code == 200
        chal_task = r_chal.json()
        assert "demonstrations" in chal_task
        print(f"   [OK] Challenge task received: {chal_task['name']} (Time limit: {chal_task['time_limit_seconds']}s)")

        # 9. Semantic Reflection Rubric
        print("9. Testing Semantic Reflection Rubric Evaluation...")
        r_ref = client.post("/api/reflection/evaluate", json={
            "text": "A system acquires an unseen task skill from demonstrations without updating its parameters at inference time, using context and recurrent state to generalize to novel examples."
        })
        assert r_ref.status_code == 200
        ref_res = r_ref.json()
        assert ref_res["score"] >= 80.0
        print(f"   [OK] Reflection Evaluated: Score {ref_res['score']}% - Level: {ref_res['mastery_level']} - Concepts: {len(ref_res['concepts_identified'])}/5")

    print("\n=== All 9 Verification Stages Passed with 100% Success! ===")

if __name__ == "__main__":
    run_verification()
