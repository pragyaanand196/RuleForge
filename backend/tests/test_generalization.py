import pytest
from app.data.task_loader import task_loader
from app.routes.generalize import run_generalization_sweep
from app.schemas import GeneralizeRequest

def test_generalization_sweep_deterministic_k_counts():
    req = GeneralizeRequest(task_id="task_01_color_swap", demonstration_counts=[1, 2, 3, 4])
    res = run_generalization_sweep(req)
    assert res.task_id == "task_01_color_swap"
    assert len(res.points) == 4
    for idx, p in enumerate(res.points):
        assert p.k_demos == idx + 1
        assert p.accuracy == 100.0
        assert p.is_correct is True
    assert "100.0% zero-shot generalization" in res.scientific_takeaway

def test_generalization_sweep_ambiguity_collapse():
    # task_ambiguity_01 has sparse demo at k=1, then disambiguates at k=2
    req = GeneralizeRequest(task_id="task_ambiguity_01", demonstration_counts=[1, 2, 3])
    res = run_generalization_sweep(req)
    assert res.task_id == "task_ambiguity_01"
    assert len(res.points) == 3

    # At k=1, underdetermined ambiguity
    pt_k1 = res.points[0]
    assert pt_k1.k_demos == 1
    assert pt_k1.is_ambiguous is True
    assert pt_k1.hypothesis_space_size > 1

    # At k=2 and k=3, disambiguated to 100%
    pt_k2 = res.points[1]
    assert pt_k2.k_demos == 2
    assert pt_k2.is_correct is True
    assert pt_k2.is_ambiguous is False
    assert pt_k2.accuracy == 100.0

    assert "underdetermined" in res.scientific_takeaway.lower()
    assert "eliminated alternative hypotheses" in res.scientific_takeaway.lower()
