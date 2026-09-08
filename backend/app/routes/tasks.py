import re
import unicodedata
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional, Tuple
from ..schemas import Task, LearnerHypothesisRequest, LearnerHypothesisResponse
from ..data.task_loader import task_loader

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("", response_model=List[Dict[str, Any]])
def list_tasks():
    tasks = task_loader.get_all_tasks()
    return [task_loader.sanitize_task_for_client(t, hide_solution=True) for t in tasks]

@router.get("/{task_id}", response_model=Dict[str, Any])
def get_task(task_id: str):
    task = task_loader.get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found.")
    return task_loader.sanitize_task_for_client(task, hide_solution=True)

# Mapping of color names, synonyms, and ARC numeric tokens
COLOR_SYNONYMS = {
    0: ["0", "black", "background", "empty", "blank", "dark", "zero"],
    1: ["1", "blue", "azure", "navy", "cyan", "one"],
    2: ["2", "red", "crimson", "scarlet", "ruby", "two"],
    3: ["3", "green", "emerald", "lime", "three"],
    4: ["4", "yellow", "gold", "amber", "four"],
    5: ["5", "gray", "grey", "silver", "five"],
    6: ["6", "magenta", "purple", "violet", "pink", "fuchsia", "six"],
    7: ["7", "orange", "tangerine", "seven"],
    8: ["8", "azure", "teal", "sky", "light blue", "eight"],
    9: ["9", "maroon", "burgundy", "brown", "dark red", "nine"]
}

def normalize_text(text: str) -> str:
    """Normalizes input text by preserving semantic transition operators and cleaning noise."""
    text = unicodedata.normalize('NFKD', text)
    text = re.sub(r'[\u0300-\u036f]', '', text)
    text = text.lower().strip()
    # Convert transition arrows to 'to'
    text = re.sub(r'[-=]+>\s*', ' to ', text)
    text = re.sub(r'[_\.,;:\(\)\[\]\{\}\?!/\\\|~`@#\$%\^&\*+=]+', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_colors_mentioned(text: str) -> List[int]:
    """Extracts all ARC color numbers (0-9) mentioned in the text by name or number."""
    found = set()
    words = text.split()
    for color_val, syns in COLOR_SYNONYMS.items():
        for syn in syns:
            if " " in syn:
                if syn in text:
                    found.add(color_val)
            else:
                if syn in words or re.search(r'\b' + re.escape(syn) + r'\b', text):
                    found.add(color_val)
    return sorted(list(found))

def analyze_hypothesis_semantics(text: str, task: Optional[Task]) -> Tuple[str, float, List[str], str, Optional[str]]:
    """
    Evaluates learner hypothesis across semantic categories:
    - 'correct': High accuracy semantic match to the hidden rule.
    - 'partially_correct': Describes part of the transformation or effect without the full operational invariant.
    - 'opposite_rule': Inverts the spatial direction or transformation logic.
    - 'wrong_rule': Describes an incompatible rule family or transformation.
    - 'ambiguous': Plausible intuition but underspecified.
    - 'empty_or_whitespace': Empty or whitespace-only input.
    - 'unrelated': Nonsense, numbers-only, symbols, or irrelevant text.
    """
    raw_stripped = text.strip()
    if not raw_stripped or len(raw_stripped) == 0:
        return (
            "empty_or_whitespace",
            0.0,
            [],
            "Please enter a hypothesis describing the transformation you observed in the demonstrations.",
            "Write a short description, for example: 'Every blue cell becomes red' or 'Rotate the grid 90 degrees'."
        )

    cleaned = normalize_text(text)

    # Check for short transition notation like "1 to 2" or "1 2"
    has_concise_transition = bool(re.search(r'\b(\d)\s+(to|into|becomes)\s+(\d)\b', cleaned))

    # Check for numbers-only without transition intent
    if re.fullmatch(r'[\d\s]+', cleaned) and not has_concise_transition:
        return (
            "unrelated",
            0.05,
            ["Detected numeric input without operational explanation"],
            "Your input consists only of numbers. Please describe what transformation occurs between the input and output grids.",
            "Explain the rule using words, e.g. which colors change or how shapes move."
        )

    words = cleaned.split()
    if len(words) >= 5 and len(set(words)) == 1:
        return (
            "unrelated",
            0.05,
            ["Detected single repeated word"],
            "Please provide a meaningful explanation of the transformation rather than repeated words.",
            "Describe the relationship between the inputs and outputs."
        )

    if not task:
        return (
            "ambiguous",
            0.5,
            ["Recorded custom visual observation"],
            "Recorded your hypothesis. Click 'Infer Skill' to see how the engine systematically tests candidate rules.",
            None
        )

    rule_fam = task.rule_family
    task_id = task.id
    observations = []
    
    # Extract mentioned colors
    colors = extract_colors_mentioned(cleaned)
    if colors:
        color_names = [f"{COLOR_SYNONYMS[c][1]} ({c})" for c in colors]
        observations.append(f"Referenced color tokens: {', '.join(color_names)}")

    # 1. COLOR MAPPING / COLOR DELETION TASKS
    if rule_fam == "color_mapping" or "color" in task.category or "deletion" in task_id:
        is_deletion = "delete" in task_id or "deletion" in task.name.lower() or "07" in task_id
        
        # Check for wrong family (e.g. geometric rotation/shift on color swap)
        has_geom = any(w in cleaned for w in ["rotate", "rotation", "clockwise", "reflect", "reflection", "flip", "transpose", "shift", "gravity"])
        if has_geom and not any(w in cleaned for w in ["color", "turn", "replace", "become", "change", "convert", "swap"]):
            return (
                "wrong_rule",
                0.20,
                ["Identified geometric/spatial terminology for a color transformation task"],
                "Notice that the positions of the colored shapes remain stationary across each demonstration. Look at how the color values themselves change.",
                "Compare the numbers/colors in the input with the numbers/colors in the output at the exact same grid positions."
            )

        if is_deletion:
            has_del_terms = any(w in cleaned for w in ["delete", "remove", "erase", "disappear", "clear", "filter", "drop", "replace with 0", "turn 0"])
            has_red = 2 in colors or "red" in cleaned
            if has_del_terms and has_red:
                return (
                    "correct",
                    0.95,
                    ["Accurately identified color deletion of red (2)"],
                    "Spot on! All red (2) cells are filtered out and replaced with background (0). Click 'Infer Skill' to verify the candidate rule.",
                    None
                )
            elif has_del_terms and not has_red:
                return (
                    "partially_correct",
                    0.60,
                    ["Identified deletion operation but did not specify the target color"],
                    "Good observation that cells are being deleted or removed. Which specific color disappears across all examples?",
                    "Check which color is present in the input but absent in the output."
                )
            elif has_red and not has_del_terms:
                return (
                    "partially_correct",
                    0.55,
                    ["Identified red (2) but not the deletion operation"],
                    "You correctly identified red cells (2). What happens to them in the output?",
                    "Notice whether red cells remain or turn into background (0)."
                )

        else:
            # Color swap: 1 -> 2 (blue to red)
            has_swap_terms = any(w in cleaned for w in ["turn", "change", "replace", "convert", "swap", "become", "becomes", "to", "transform"])
            has_blue = 1 in colors or "blue" in cleaned or "azure" in cleaned
            has_red = 2 in colors or "red" in cleaned

            # Check opposite swap (red to blue)
            if re.search(r'\b(red|2)\s+(to|into|becomes|swap with)\s+(blue|1)\b', cleaned):
                return (
                    "opposite_rule",
                    0.35,
                    ["Identified reverse color swap (Red -> Blue instead of Blue -> Red)"],
                    "You noticed the color substitution between Blue and Red, but in reverse! Look at the input: does Blue turn into Red, or Red into Blue?",
                    "Check the input grid (left) versus the output grid (right)."
                )

            if (has_blue and has_red and has_swap_terms) or re.search(r'\b1\s+to\s+2\b', cleaned) or "blue to red" in cleaned:
                return (
                    "correct",
                    0.98,
                    ["Accurately identified global color replacement: Blue (1) -> Red (2)"],
                    "Excellent hypothesis! You precisely captured the invariant transformation (Blue/1 becomes Red/2). Click 'Infer Skill' to let the engine formulate and verify the rule.",
                    None
                )
            elif has_blue and not has_red:
                return (
                    "partially_correct",
                    0.60,
                    ["Identified source color Blue (1) but did not specify target color Red (2)"],
                    "You correctly noted that Blue (1) cells change. What new color do they become in the output?",
                    "Look at what color replaces the blue cells in each output."
                )
            elif has_red and not has_blue:
                return (
                    "partially_correct",
                    0.55,
                    ["Identified target color Red (2) but did not specify original source color"],
                    "You correctly noted the presence of Red (2) in the output. Which color from the input was transformed into red?",
                    "Check what color occupied those coordinates in the input."
                )
            elif has_swap_terms:
                return (
                    "ambiguous",
                    0.50,
                    ["Noticed color change but did not specify the exact color mapping"],
                    "You correctly recognized that cell colors are being swapped or transformed. Which specific color values change?",
                    "Name the input color and the output color."
                )

    # 2. GEOMETRIC TASKS (Rotation 90, 180, Reflection)
    elif rule_fam == "geometric":
        has_rot = any(w in cleaned for w in ["rotate", "rotation", "spin", "turn"])
        has_ref = any(w in cleaned for w in ["reflect", "reflection", "flip", "mirror", "invert", "upside down", "transpose"])

        if any(w in cleaned for w in ["color", "replace", "swap"]) and not (has_rot or has_ref):
            return (
                "wrong_rule",
                0.20,
                ["Identified color change for a geometric spatial transformation"],
                "Notice that the individual cell colors (values) do not change into new colors; rather, the overall spatial orientation of the shape is transformed.",
                "Track how the shape rotates or flips across the grid."
            )

        if "rotation_90" in task_id or "90" in task.name:
            # Check counter-clockwise / CCW first
            is_ccw = bool(re.search(r'\b(counter|anti|ccw|counterclockwise|counter clockwise)\b', cleaned))
            is_cw = bool(re.search(r'\b(clockwise|cw)\b', cleaned)) and not is_ccw
            is_90 = "90" in cleaned or "quarter" in cleaned or is_cw

            if is_ccw:
                return (
                    "opposite_rule",
                    0.35,
                    ["Identified counter-clockwise orientation instead of clockwise"],
                    "You correctly recognized a 90° rotation, but check the direction of rotation. Is it clockwise (to the right) or counter-clockwise (to the left)?",
                    "Track where the top row moves in the output."
                )
            elif (is_90 and has_rot) or is_cw:
                return (
                    "correct",
                    0.96,
                    ["Accurately identified 90° Clockwise Rotation"],
                    "Outstanding! The grid is rotated 90° clockwise. Click 'Infer Skill' to see the engine's verified hypothesis.",
                    None
                )
            elif has_rot:
                return (
                    "partially_correct",
                    0.65,
                    ["Identified rotation but did not specify angle or direction (90° CW)"],
                    "You correctly spotted that the grid rotates. By how many degrees (90°, 180°, 270°) and in which direction (clockwise or counter-clockwise)?",
                    "Look at where the top-right corner moves."
                )

        elif "reflection_h" in task_id or "reflection" in task_id or "vertical flip" in task.name.lower():
            is_v_flip = any(w in cleaned for w in ["vertical", "top to bottom", "upside down", "horizontal axis", "invert rows", "swap top and bottom", "flip"])
            is_h_flip = any(w in cleaned for w in ["left to right", "horizontal flip", "vertical axis", "mirror left right"])

            if is_h_flip and not ("vertical" in cleaned or "top" in cleaned or "bottom" in cleaned):
                return (
                    "opposite_rule",
                    0.35,
                    ["Identified horizontal flip (left-to-right) instead of vertical flip (top-to-bottom)"],
                    "You correctly identified a reflection, but check the axis! Do the left and right columns swap, or do the top and bottom rows swap?",
                    "Check if the leftmost column changes position."
                )
            elif is_v_flip and has_ref:
                return (
                    "correct",
                    0.95,
                    ["Accurately identified Vertical Reflection (flip across horizontal axis)"],
                    "Great insight! The grid is reflected vertically (top row swaps with bottom row). Click 'Infer Skill' to execute inference.",
                    None
                )
            elif has_ref:
                return (
                    "partially_correct",
                    0.65,
                    ["Identified reflection/flip but did not specify axis"],
                    "You noticed that the grid is flipped/reflected. Is it flipped vertically (top to bottom) or horizontally (left to right)?",
                    "Compare the top row and bottom row."
                )

        elif "180" in task_id or "180" in task.name:
            if "180" in cleaned or "upside down" in cleaned or "half turn" in cleaned:
                return (
                    "correct",
                    0.96,
                    ["Accurately identified 180° rotation / inversion"],
                    "Spot on! The entire canvas is rotated 180 degrees. Click 'Infer Skill' to verify.",
                    None
                )
            elif has_rot:
                return (
                    "partially_correct",
                    0.65,
                    ["Identified rotation but missing 180 degree angle"],
                    "You noticed rotation. Check how far the shape rotated—is it a 90° or 180° turn?",
                    "Notice that top-left moves all the way to bottom-right."
                )

    # 3. TRANSLATION TASKS (Shift, Gravity)
    elif rule_fam == "translation":
        has_trans = any(w in cleaned for w in ["shift", "move", "translate", "slide", "gravity", "drop", "fall"])

        if "shift" in task_id or "translate right" in task.name.lower():
            is_right = any(w in cleaned for w in ["right", "east", "1 col right", "one right", "1 right", "right 1"])
            is_left = any(w in cleaned for w in ["left", "west", "1 col left", "one left", "1 left", "left 1"])

            if is_left and not is_right:
                return (
                    "opposite_rule",
                    0.35,
                    ["Identified shift left instead of shift right"],
                    "You spotted the spatial shift, but check the direction! Does the shape shift to the right or to the left?",
                    "Compare the column indices between input and output."
                )
            elif is_right and has_trans:
                return (
                    "correct",
                    0.96,
                    ["Accurately identified rigid spatial translation: Shift 1 column Right"],
                    "Excellent! All foreground objects are shifted 1 cell to the right. Click 'Infer Skill' to proceed.",
                    None
                )
            elif has_trans:
                return (
                    "partially_correct",
                    0.60,
                    ["Identified spatial movement but did not specify direction/offset (1 right)"],
                    "You correctly identified that the objects move/shift. In which direction (left, right, up, down) and by how many cells?",
                    "Count how many columns each colored cell offsets."
                )

        elif "gravity" in task_id or "gravity" in task.name.lower():
            is_down = any(w in cleaned for w in ["down", "bottom", "floor", "fall", "drop", "downward"])
            is_up = any(w in cleaned for w in ["up", "top", "ceiling", "float", "rise"])

            if is_up and not is_down:
                return (
                    "opposite_rule",
                    0.35,
                    ["Identified upward floating instead of downward gravity"],
                    "You noticed vertical physics, but in reverse! Do elements fall to the floor or float to the ceiling?",
                    "Look at the bottom row of the output."
                )
            elif is_down and (has_trans or "gravity" in cleaned or "fall" in cleaned or "drop" in cleaned):
                return (
                    "correct",
                    0.98,
                    ["Accurately identified Downward Gravity physics"],
                    "Brilliant! All colored blocks settle to the lowest available rows in their columns. Click 'Infer Skill' to formalize.",
                    None
                )
            elif has_trans:
                return (
                    "partially_correct",
                    0.60,
                    ["Identified vertical movement but missing gravity settling concept"],
                    "You noticed elements moving downward. Notice how multiple floating elements in the same column stack up at the bottom (gravity).",
                    "Check column alignment and stacking order."
                )

    # 4. PATTERN / TOPOLOGY TASKS (Interior Fill, Border, Symmetry)
    elif rule_fam == "pattern":
        if "fill" in task_id or "interior" in task.name.lower():
            has_fill = any(w in cleaned for w in ["fill", "inside", "interior", "center", "middle", "enclose", "enclosure", "hollow", "box"])
            has_yellow = 4 in colors or "yellow" in cleaned
            if has_fill and has_yellow:
                return (
                    "correct",
                    0.96,
                    ["Accurately identified shape interior completion with Yellow (4)"],
                    "Perfect observation! The hollow interior of the enclosed box is filled with yellow (4). Click 'Infer Skill' to verify.",
                    None
                )
            elif has_fill:
                return (
                    "partially_correct",
                    0.65,
                    ["Identified interior filling but did not name the fill color (yellow/4)"],
                    "You correctly noticed that the enclosed interior is being filled. What color is used for the fill?",
                    "Check the color of the newly added center cells."
                )

        elif "border" in task_id or "border" in task.name.lower():
            if any(w in cleaned for w in ["border", "outline", "perimeter", "hollow", "edge"]):
                return (
                    "correct",
                    0.95,
                    ["Accurately identified perimeter border extraction"],
                    "Great observation! The outer perimeter outline is preserved while interior cells are hollowed out.",
                    None
                )

        elif "symmetri" in task_id or "symmetri" in task.name.lower():
            if any(w in cleaned for w in ["symmetri", "mirror", "reflect half"]):
                return (
                    "correct",
                    0.95,
                    ["Accurately identified symmetry pattern generation"],
                    "Well done! The pattern is mirrored across the axis to enforce bilateral symmetry.",
                    None
                )

    # 5. COUNTING / PARITY TASKS
    elif rule_fam == "counting":
        if "majority" in task_id or "majority" in task.name.lower():
            if any(w in cleaned for w in ["majority", "most common", "most frequent", "dominant", "most"]):
                return (
                    "correct",
                    0.96,
                    ["Accurately identified Majority Color Dominance fill"],
                    "Spot on! The entire canvas is filled with the most frequent foreground color. Click 'Infer Skill' to run inference.",
                    None
                )
            else:
                return (
                    "partially_correct",
                    0.55,
                    ["Noticed uniform color fill but missed majority count rule"],
                    "You noticed the output is a single solid color. How does the system choose which color to use from the input?",
                    "Count how many cells of each color exist in the input."
                )

        elif "parity" in task_id or "parity" in task.name.lower():
            if any(w in cleaned for w in ["even", "odd", "parity", "count"]):
                return (
                    "correct",
                    0.95,
                    ["Accurately identified count parity detection"],
                    "Excellent! The output color depends on whether the non-background count is even or odd.",
                    None
                )

    if any(w in cleaned for w in ["change", "turn", "transform", "rule", "pattern", "input", "output", "grid"]):
        return (
            "ambiguous",
            0.45,
            ["General transformation intent recognized"],
            "You noted that a transformation occurs between the input and output. Can you be more specific about the exact colors, directions, or shapes involved?",
            "State specifically what changes and what stays invariant."
        )

    return (
        "unrelated",
        0.15,
        ["Input does not correspond to visual demonstration evidence"],
        "Your hypothesis does not seem to match the visual patterns in the demonstration pairs. Inspect the input and output grids carefully.",
        "Look at individual cell colors, positions, or overall orientation."
    )

@router.post("/hypothesis", response_model=LearnerHypothesisResponse)
def evaluate_hypothesis(req: LearnerHypothesisRequest):
    task = task_loader.get_task_by_id(req.task_id) if req.task_id else None
    
    classification, score, observations, feedback, guidance = analyze_hypothesis_semantics(
        req.hypothesis_text,
        task
    )

    is_valid = classification not in ["empty_or_whitespace", "unrelated"]

    return LearnerHypothesisResponse(
        is_valid_attempt=is_valid,
        feedback=feedback,
        key_observations=observations if observations else ["Observation recorded"],
        similarity_score=round(score, 2),
        classification=classification,
        educational_guidance=guidance
    )
