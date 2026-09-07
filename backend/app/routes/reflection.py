from fastapi import APIRouter
from ..schemas import ReflectionRequest, ReflectionResponse

router = APIRouter(prefix="/api/reflection", tags=["reflection"])

RUBRIC_CONCEPTS = {
    "Demonstrations as Context": [
        "demonstration", "demonstrations", "example", "examples", "input-output", "pairs", "samples", "evidence"
    ],
    "Hypothesis / Rule Inference": [
        "rule", "rules", "hypothesis", "hypotheses", "infer", "inferred", "pattern", "transformation", "skill", "algorithm"
    ],
    "Unseen / Novel Inputs": [
        "unseen", "novel", "new", "test", "fresh", "unobserved", "different input", "new example"
    ],
    "Zero-Shot Generalization": [
        "generalize", "generalization", "apply", "applied", "transfer", "predict", "prediction", "solve"
    ],
    "Fixed Parameters / In-Context Adaptation": [
        "parameter", "parameters", "weight", "weights", "without updating", "no update", "inference time", "recurrent", "state", "context", "in-context", "fixed"
    ]
}

@router.post("/evaluate", response_model=ReflectionResponse)
def evaluate_reflection(req: ReflectionRequest):
    text = req.text.strip().lower()
    if not text:
        return ReflectionResponse(
            score=0.0,
            mastery_level="Needs Input",
            concepts_identified=[],
            missing_concepts=list(RUBRIC_CONCEPTS.keys()),
            feedback="Please write a brief summary in your own words to evaluate your understanding.",
            strengths=[],
            improvement_tips=["Explain what demonstrations provide and how the system applies the rule to unseen examples."]
        )

    identified = []
    missing = []

    for concept, keywords in RUBRIC_CONCEPTS.items():
        if any(kw in text for kw in keywords):
            identified.append(concept)
        else:
            missing.append(concept)

    concept_count = len(identified)
    score = round((concept_count / len(RUBRIC_CONCEPTS)) * 100.0, 1)

    strengths = []
    if "Demonstrations as Context" in identified:
        strengths.append("Clearly recognized that demonstrations supply empirical evidence about the task.")
    if "Hypothesis / Rule Inference" in identified:
        strengths.append("Accurately noted the extraction/inference of underlying transformation rules.")
    if "Unseen / Novel Inputs" in identified:
        strengths.append("Understood that the test example is novel and was not part of the demonstration set.")
    if "Zero-Shot Generalization" in identified:
        strengths.append("Articulated how the acquired skill generalizes to new instances.")
    if "Fixed Parameters / In-Context Adaptation" in identified:
        strengths.append("Highlighted the core principle: skill adaptation occurs through context/state rather than weight gradient updates.")

    improvement_tips = []
    if "Fixed Parameters / In-Context Adaptation" in missing:
        improvement_tips.append("Mention that the model's weights remain fixed during inference—adaptation happens in context or recurrent state.")
    if "Unseen / Novel Inputs" in missing:
        improvement_tips.append("Emphasize that the system is evaluated on a fresh, unseen example to test true generalization.")
    if "Demonstrations as Context" in missing:
        improvement_tips.append("Clarify that a few demonstrations act as input evidence rather than gradient descent training data.")

    if score >= 80:
        mastery = "Master"
        feedback = "Outstanding synthesis! You have captured the key scientific tenets of Skill Acquisition from Demonstrations."
    elif score >= 50:
        mastery = "Proficient"
        feedback = "Solid comprehension! You have explained the core demonstration-to-rule pipeline well."
    else:
        mastery = "Foundational"
        feedback = "Good start! Review the tips below to connect the demonstration evidence directly to parameter-free in-context adaptation."

    return ReflectionResponse(
        score=score,
        mastery_level=mastery,
        concepts_identified=identified,
        missing_concepts=missing,
        feedback=feedback,
        strengths=strengths,
        improvement_tips=improvement_tips
    )
