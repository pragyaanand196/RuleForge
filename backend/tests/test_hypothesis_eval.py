import pytest
from app.data.task_loader import task_loader
from app.routes.tasks import analyze_hypothesis_semantics

def test_hypothesis_eval_exact_correct():
    task = task_loader.get_task_by_id("task_01_color_swap")
    classification, score, obs, fb, guide = analyze_hypothesis_semantics(
        "Every blue cell (1) transforms into red (2)", task
    )
    assert classification == "correct"
    assert score >= 0.90

def test_hypothesis_eval_synonyms_and_different_words():
    task = task_loader.get_task_by_id("task_01_color_swap")
    classification, score, obs, fb, guide = analyze_hypothesis_semantics(
        "Replace azure color 1 with crimson 2", task
    )
    assert classification == "correct"
    assert score >= 0.85

def test_hypothesis_eval_capitalization_and_extra_spaces():
    task = task_loader.get_task_by_id("task_01_color_swap")
    classification, score, obs, fb, guide = analyze_hypothesis_semantics(
        "   BLUE (1)   BECOMES   RED (2) !!!  ", task
    )
    assert classification == "correct"
    assert score >= 0.90

def test_hypothesis_eval_short_correct():
    task = task_loader.get_task_by_id("task_01_color_swap")
    classification, score, obs, fb, guide = analyze_hypothesis_semantics(
        "1 -> 2", task
    )
    assert classification == "correct"
    assert score >= 0.90

def test_hypothesis_eval_detailed_correct():
    task = task_loader.get_task_by_id("task_01_color_swap")
    classification, score, obs, fb, guide = analyze_hypothesis_semantics(
        "Across all demonstrations, every cell that is initially colored blue with value 1 is replaced by color 2 red while background zeros remain unchanged.",
        task
    )
    assert classification == "correct"
    assert score >= 0.90

def test_hypothesis_eval_partial_only_source_color():
    task = task_loader.get_task_by_id("task_01_color_swap")
    classification, score, obs, fb, guide = analyze_hypothesis_semantics(
        "All the blue cells are changed", task
    )
    assert classification == "partially_correct"
    assert 0.50 <= score < 0.85
    assert guide is not None

def test_hypothesis_eval_partial_only_target_color():
    task = task_loader.get_task_by_id("task_01_color_swap")
    classification, score, obs, fb, guide = analyze_hypothesis_semantics(
        "The output has red cells", task
    )
    assert classification == "partially_correct"
    assert 0.50 <= score < 0.85

def test_hypothesis_eval_opposite_color_swap():
    task = task_loader.get_task_by_id("task_01_color_swap")
    classification, score, obs, fb, guide = analyze_hypothesis_semantics(
        "Red 2 becomes blue 1", task
    )
    assert classification == "opposite_rule"
    assert score <= 0.40

def test_hypothesis_eval_wrong_rule_family():
    task = task_loader.get_task_by_id("task_01_color_swap")
    classification, score, obs, fb, guide = analyze_hypothesis_semantics(
        "The grid rotates 90 degrees clockwise", task
    )
    assert classification == "wrong_rule"
    assert score <= 0.30

def test_hypothesis_eval_geometric_rotation_correct():
    task = task_loader.get_task_by_id("task_02_rotation_90")
    classification, score, obs, fb, guide = analyze_hypothesis_semantics(
        "Rotate grid 90 degrees clockwise", task
    )
    assert classification == "correct"
    assert score >= 0.90

def test_hypothesis_eval_geometric_rotation_opposite():
    task = task_loader.get_task_by_id("task_02_rotation_90")
    classification, score, obs, fb, guide = analyze_hypothesis_semantics(
        "Rotate 90 degrees counter-clockwise ccw", task
    )
    assert classification == "opposite_rule"
    assert score <= 0.40

def test_hypothesis_eval_translation_shift_correct():
    task = task_loader.get_task_by_id("task_04_translation_shift")
    classification, score, obs, fb, guide = analyze_hypothesis_semantics(
        "Shift objects 1 column to the right", task
    )
    assert classification == "correct"
    assert score >= 0.90

def test_hypothesis_eval_translation_shift_opposite():
    task = task_loader.get_task_by_id("task_04_translation_shift")
    classification, score, obs, fb, guide = analyze_hypothesis_semantics(
        "Shift 1 column left", task
    )
    assert classification == "opposite_rule"
    assert score <= 0.40

def test_hypothesis_eval_gravity_correct():
    task = task_loader.get_task_by_id("task_05_gravity_drop")
    classification, score, obs, fb, guide = analyze_hypothesis_semantics(
        "Downward gravity: all colored cells fall to the floor", task
    )
    assert classification == "correct"
    assert score >= 0.90

def test_hypothesis_eval_empty_and_whitespace():
    task = task_loader.get_task_by_id("task_01_color_swap")
    classification, score, obs, fb, guide = analyze_hypothesis_semantics("   \n\t ", task)
    assert classification == "empty_or_whitespace"
    assert score == 0.0

def test_hypothesis_eval_numbers_only():
    task = task_loader.get_task_by_id("task_01_color_swap")
    classification, score, obs, fb, guide = analyze_hypothesis_semantics("12345 6789", task)
    assert classification == "unrelated"
    assert score <= 0.10

def test_hypothesis_eval_repeated_words():
    task = task_loader.get_task_by_id("task_01_color_swap")
    classification, score, obs, fb, guide = analyze_hypothesis_semantics("blue blue blue blue blue blue", task)
    assert classification == "unrelated"
    assert score <= 0.10

def test_hypothesis_eval_completely_unrelated():
    task = task_loader.get_task_by_id("task_01_color_swap")
    classification, score, obs, fb, guide = analyze_hypothesis_semantics("apple banana strawberry chocolate", task)
    assert classification == "unrelated"
    assert score <= 0.20

def test_hypothesis_eval_spelling_mistakes():
    task = task_loader.get_task_by_id("task_01_color_swap")
    classification, score, obs, fb, guide = analyze_hypothesis_semantics("blu trnsforms to red colr", task)
    assert classification in ["correct", "partially_correct"]
    assert score >= 0.50

def test_hypothesis_eval_symbols_only():
    task = task_loader.get_task_by_id("task_01_color_swap")
    classification, score, obs, fb, guide = analyze_hypothesis_semantics("@#$%^&*()_+", task)
    assert classification in ["empty_or_whitespace", "unrelated"]
    assert score <= 0.20

def test_hypothesis_eval_extremely_long_text():
    task = task_loader.get_task_by_id("task_01_color_swap")
    long_text = "blue to red " * 100
    classification, score, obs, fb, guide = analyze_hypothesis_semantics(long_text, task)
    assert classification in ["correct", "unrelated", "partially_correct"]

def test_hypothesis_eval_effect_only():
    task = task_loader.get_task_by_id("task_01_color_swap")
    classification, score, obs, fb, guide = analyze_hypothesis_semantics("the output has only red and no blue left", task)
    assert classification in ["correct", "partially_correct", "ambiguous"]
    assert score >= 0.40

