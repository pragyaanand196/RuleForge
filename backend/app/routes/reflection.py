import re
import unicodedata
from fastapi import APIRouter
from typing import List, Dict
from ..schemas import ReflectionRequest, ReflectionResponse

router = APIRouter(prefix="/api/reflection", tags=["reflection"])

def normalize_text(text: str) -> str:
    text = unicodedata.normalize('NFKD', text)
    text = re.sub(r'[\u0300-\u036f]', '', text)
    text = text.lower().strip()
    text = re.sub(r'[\s\-_,;\.\(\)\[\]\{\}\?!/\\\|~`@#\$%\^&\*+=]+', ' ', text)
    return text.strip()

RUBRIC_CONCEPTS = {
    "Demonstrations as Empirical Context": [
        "demonstration", "demonstrations", "example", "examples", "input-output", "input output",
        "pairs", "samples", "evidence", "cases", "data points", "few-shot", "k-shot", "demonstrating", "observed pairs"
    ],
    "Hypothesis / Skill Inference": [
        "rule", "rules", "hypothesis", "hypotheses", "infer", "inferred", "inferring", "inference",
        "pattern", "transformation", "skill", "algorithm", "operator", "logic", "function", "invariant"
    ],
    "Novel Unseen Test Input": [
        "unseen", "novel", "new", "test", "fresh", "unobserved", "different input", "new example",
        "new instance", "unseen input", "held-out", "evaluation input"
    ],
    "Zero-Shot Generalization": [
        "generalize", "generalization", "generalizes", "generalizing", "apply", "applied", "applying",
        "transfer", "predict", "prediction", "predicting", "solve", "solving", "zero-shot", "zero shot"
    ],
    "Fixed Parameters / In-Context Adaptation": [
        "parameter", "parameters", "weight", "weights", "without updating", "no update", "inference time",
        "recurrent", "state", "context", "in-context", "in context", "fixed", "frozen", "no gradient",
        "without gradient", "without training", "without fine-tuning", "hebbian", "memory", "plasticity"
    ]
}

@router.post("/evaluate", response_model=ReflectionResponse)
def evaluate_reflection(req: ReflectionRequest):
    raw_text = req.text.strip()
    cleaned = normalize_text(raw_text)

    if not cleaned or len(cleaned) == 0:
        return ReflectionResponse(
            score=0.0,
            mastery_level="Needs Input",
            concepts_identified=[],
            missing_concepts=list(RUBRIC_CONCEPTS.keys()),
            feedback="Please write a synthesis in your own words explaining how skill acquisition from demonstrations works.",
            strengths=[],
            improvement_tips=["Explain the role of demonstration pairs, rule inference, unseen test evaluation, and parameter-free in-context adaptation."]
        )

    # Check for gibberish
    words = cleaned.split()
    if len(words) >= 5 and len(set(words)) == 1:
        return ReflectionResponse(
            score=0.0,
            mastery_level="Needs Input",
            concepts_identified=[],
            missing_concepts=list(RUBRIC_CONCEPTS.keys()),
            feedback="Please write a meaningful conceptual explanation rather than repeating identical words.",
            strengths=[],
            improvement_tips=["Synthesize the key takeaways from the laboratory experiments."]
        )

    identified = []
    missing = []

    for concept, keywords in RUBRIC_CONCEPTS.items():
        found = False
        for kw in keywords:
            if " " in kw:
                if kw in cleaned:
                    found = True
                    break
            else:
                if re.search(r'\b' + re.escape(kw) + r'\b', cleaned):
                    found = True
                    break
        if found:
            identified.append(concept)
        else:
            missing.append(concept)

    concept_count = len(identified)
    score = round((concept_count / len(RUBRIC_CONCEPTS)) * 100.0, 1)

    strengths = []
    if "Demonstrations as Empirical Context" in identified:
        strengths.append("Clearly articulated that demonstrations provide empirical evidence / context.")
    if "Hypothesis / Skill Inference" in identified:
        strengths.append("Accurately identified the systematic extraction of underlying invariant transformation rules.")
    if "Novel Unseen Test Input" in identified:
        strengths.append("Recognized that evaluation occurs on fresh, novel test inputs not present in the demonstration set.")
    if "Zero-Shot Generalization" in identified:
        strengths.append("Explained zero-shot generalization and how the inferred rule applies to solve new instances.")
    if "Fixed Parameters / In-Context Adaptation" in identified:
        strengths.append("Highlighted the fundamental principle: skill adaptation occurs through context/state rather than weight gradient updates.")

    improvement_tips = []
    if "Fixed Parameters / In-Context Adaptation" in missing:
        improvement_tips.append("Mention that model weights remain fixed during inference—adaptation occurs entirely through context or recurrent state dynamics.")
    if "Novel Unseen Test Input" in missing:
        improvement_tips.append("Emphasize that the system is evaluated on a novel unseen example to test true generalization.")
    if "Demonstrations as Empirical Context" in missing:
        improvement_tips.append("Clarify that input-output demonstrations serve as contextual evidence rather than gradient descent training data.")
    if "Zero-Shot Generalization" in missing:
        improvement_tips.append("Discuss how zero-shot prediction proves the acquired skill generalizes without retraining.")
    if "Hypothesis / Skill Inference" in missing:
        improvement_tips.append("Explain how the system searches the hypothesis space to find the consistent transformation rule.")

    if score >= 80:
        mastery = "Master"
        feedback = "Outstanding synthesis! You have comprehensively captured the scientific foundations of Skill Acquisition from Demonstrations."
    elif score >= 50:
        mastery = "Proficient"
        feedback = "Solid comprehension! You have explained the demonstration-to-rule evaluation pipeline effectively."
    else:
        mastery = "Foundational"
        feedback = "Good start! Review the improvement tips below to connect the demonstration evidence directly to parameter-free in-context adaptation."

    return ReflectionResponse(
        score=score,
        mastery_level=mastery,
        concepts_identified=identified,
        missing_concepts=missing,
        feedback=feedback,
        strengths=strengths,
        improvement_tips=improvement_tips
    )
