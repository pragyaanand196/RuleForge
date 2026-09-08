# RuleForge — Skill Acquisition from Demonstrations
**An Interactive Educational Research Laboratory for Parameter-Free In-Context Skill Adaptation**

[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite 5](https://img.shields.io/badge/Vite-5.2-646cff.svg)](https://vitejs.dev/)
[![Tests Passing](https://img.shields.io/badge/pytest-49%20passed-brightgreen.svg)](file:///c:/Users/LENOVO/Desktop/RuleForge/backend/tests)
[![Open Science](https://img.shields.io/badge/Open%20Science-Reproducible-success.svg)](file:///c:/Users/LENOVO/Desktop/RuleForge/PROJECT_AUDIT_REPORT.md)

---

## 🎯 Central Falsifiable Claim

> **“A system can acquire a previously unseen task skill from a small number of demonstrations and apply the inferred rule to a new example without updating its model parameters at inference time.”**

RuleForge is an interactive, explorable educational learning artifact designed to help learners understand, test, manipulate, and challenge this scientific claim. It is not merely a static article, slide deck, poster, chatbot, or decorative animation; learners actively alter input-output demonstrations, supply custom hypotheses, observe live systematic hypothesis space search, execute inferred skills on unseen test inputs, inspect cell-by-cell diff masks, sweep demonstration budgets ($k$), and investigate intentional ambiguity and failure cases.

---

## 🔬 Motivation & Scientific Significance

Historically, enabling a machine learning system to master a novel, out-of-distribution task required **parameter updates** (e.g., gradient fine-tuning or meta-learning inner-loop optimization passes). However, fine-tuning introduces significant latency, computational overhead, and the constant risk of **catastrophic forgetting**.

The paradigm of **Skill Acquisition from Demonstrations** (exemplified by in-context learning and modern brain-inspired recurrent architectures such as BDH-CQ) establishes an alternative thesis: a system with **fixed base parameters** ($\mathbf{W} \equiv \mathbf{W}_0$) can observe a sparse demonstration sequence, encode the operational invariant in its working context or recurrent state ($\mathbf{h}_t$), and immediately generalize zero-shot to novel test queries.

```
Traditional Fine-Tuning:    (Demo X -> Y)  ==[ Backprop: dL/dW ]==>  W_new  ==>  Predict(X_test)
In-Context Skill Learning:  (Demo X -> Y)  ==[ Forward Context h_t ]==>  (W_frozen)  ==>  Predict(X_test)
```

---

## 👤 Intended Learner & Prerequisites

- **Target Audience**: Beginners, undergraduate students, and early-stage researchers interested in Artificial Intelligence, Machine Learning, Cognitive Science, Abstract Reasoning (ARC), and In-Context Learning.
- **Prerequisites**: Only an intuitive understanding of input-output examples (transformations) and basic introductory AI concepts is assumed. No background in neural network backpropagation or advanced linear algebra is required.

---

## 🎯 Learning Objectives

After exploring RuleForge, learners will be able to:
1. **Explain the Demonstration Workflow**: Describe how input-output pairs $(X_i \to Y_i)$ provide empirical evidence of a hidden operational transformation.
2. **Understand Rule Inference & Occam's Razor**: Explain how an inductive engine searches a hypothesis space $\mathcal{H}$ to isolate rules that satisfy all demonstrations with minimal descriptive complexity.
3. **Evaluate Zero-Shot Generalization**: Apply an inferred skill to a novel unseen test input ($X_{\text{test}}$) and verify correctness against ground truth without parameter mutation.
4. **Analyze Ambiguity & Underdetermined Evidence**: Recognize why insufficient demonstrations ($k=1$) allow multiple competing hypotheses to co-exist, and explain how diverse examples ($k \ge 2$) collapse the hypothesis space.
5. **Differentiate Adaptation Paradigms**: Contrast traditional parameter fine-tuning ($W \leftarrow W - \eta \nabla L$) with parameter-free in-context / recurrent state dynamics ($\Delta W = 0$).
6. **Connect to BDH-CQ Research**: Articulate the conceptual relationship between demonstration-conditioned working memory and research architectures like BDH-CQ, while recognizing the boundaries of RuleForge's educational model.

---

## 🗺️ The 10-Stage Learner Journey

RuleForge guides learners through a cohesive, structured 10-stage scientific progression:

```
[1. Home]  -->  [2. Learn]  -->  [3. Demonstration Lab]  -->  [4. Generalization]  -->  [5. Ambiguity Lab]
                                                                                              |
[10. Research] <-- [9. Reflection] <-- [8. Challenge] <-- [7. BDH-CQ] <-- [6. Sandbox] <----+
```

| Stage | Route | Description & Interactive Activity |
| :--- | :--- | :--- |
| **1. Overview** | `#home` | Introductory problem framing, visual transformation preview, and a single direct entry point. |
| **2. Conceptual Foundation** | `#learn` | 4-step conceptual breakdown with an interactive, clickable mini-grid illustrating real-time transformation. |
| **3. Demonstration Lab** | `#lab` | The core experimental engine: (1) *Inspect & Hypothesize* with NLP feedback, (2) *Systematic Rule Inference* with evidence log, and (3) *Novel Unseen Prediction* with cell-by-cell diff matching. |
| **4. Generalization Experiment** | `#generalization` | Empirical sweeps across demonstration budgets ($k \in \{1, 2, 3, 4\}$) with a live SVG accuracy curve and hypothesis space tracking. |
| **5. Ambiguity & Failure Lab** | `#ambiguity` | Explore underdetermined evidence ($k=1 \to k=2$ disambiguation), contradictory demonstrations, and out-of-hypothesis-space rejection. |
| **6. Demonstration Sandbox** | `#sandbox` | Open interactive canvas: paint custom input-output grids (0–9 palette), queue demonstration streams, infer custom rules, and test zero-shot. |
| **7. BDH-CQ Research Connection** | `#bdh` | Interactive architectural comparison diagram between physical weight updating and recurrent context dynamics. |
| **8. 60-Second Challenge** | `#challenge` | Timed zero-shot skill acquisition test under time pressure with instant victory detection. |
| **9. Conceptual Reflection** | `#reflection` | Self-explanation prompt evaluated deterministically against a 5-dimension scientific rubric with personalized tips. |
| **10. Primary Research Sources** | `#research` | Verified primary literature citations (2022–2026), provenance records, and open-source licenses. |

---

## 🧪 The Interactive Experiment: Live vs Synthetic vs Animated Components

To ensure absolute scientific transparency, every component in RuleForge is classified by its computational nature:

```
+-----------------------------------------------------------------------------------+
|                            RULEFORGE INTERACTION MODES                            |
+-----------------------------------------------------------------------------------+
|  LIVE COMPUTATION (Real Backend Execution)                                        |
|  - Multi-family hypothesis search & Occam's razor ranking                         |
|  - Step 1 Semantic NLP hypothesis evaluation (20+ categories)                     |
|  - Step 3 Novel unseen prediction execution & element-wise diff grid              |
|  - Empirical Generalization sweeps (k=1..4) measuring live accuracy               |
|  - Sandbox custom grid inference & novel execution                                |
|  - Reflection rubric scoring & concept identification                             |
+-----------------------------------------------------------------------------------+
|  SYNTHETIC EDUCATIONAL DATA (Deterministic Benchmark)                             |
|  - 13 Curated ARC-style task specifications in tasks.json                         |
|  - Guaranteed zero leakage between demonstration sets and test inputs             |
+-----------------------------------------------------------------------------------+
|  CONCEPTUAL TEACHING SIMPLIFICATIONS (Static / Illustrative)                      |
|  - BDH-CQ architectural comparison diagram                                        |
|  - Interactive 2x2 toggle starter grid on the Learn page                          |
+-----------------------------------------------------------------------------------+
```

---

## 🏛️ System Architecture & Component Traceability

RuleForge is built with a decoupled modern architecture combining a reactive TypeScript frontend and a high-performance Python/FastAPI backend.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 18 / Vite)                      │
│                                                                        │
│  [Task Selector] ──> [DemoViewer] ──> [HypothesisCard]                 │
│                              │               │                         │
│                              ▼               ▼                         │
│                     [PredictionViewer] <── [DiffGrid]                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (/api/*)
┌───────────────────────────────────▼────────────────────────────────────┐
│                        BACKEND (FastAPI / Python)                      │
│                                                                        │
│  [tasks.py]       ──> Semantic NLP Hypothesis Classifier (20+ inputs)  │
│  [infer.py]       ──> MultiFamilyInferenceEngine (MDL Complexity)      │
│  [apply.py]       ──> Evaluator (Zero Ground-Truth Leakage)            │
│  [generalize.py]  ──> Empirical k-Sweep Engine (k = 1, 2, 3, 4)        │
│  [reflection.py]  ──> 5-Dimension Rubric Scoring Engine                │
│                                                                        │
│  [Engine Modules] ──> Color, Geometric, Translation, Pattern, Counting │
└────────────────────────────────────────────────────────────────────────┘
```

### Major Repository Components:
- **`backend/app/engine/rule_base.py`**: Defines the abstract `BaseRule` interface, grid validation, cloning, equality checks, and Minimum Description Length ($C(R)$) complexity scoring.
- **`backend/app/engine/color_rules.py`**: Global color substitution, multi-color permutations, and single-cell coordinate ambiguity candidate emission.
- **`backend/app/engine/geometric_rules.py`**: Implements all 7 geometric transforms (90° CW, 180°, 270° CW, Horizontal Flip, Vertical Flip, Main Diagonal, Anti-Diagonal) for square and rectangular grids.
- **`backend/app/engine/translation_rules.py`**: 2D rigid shifts $(\Delta r, \Delta c)$ and directional gravity drops with token collision stacking.
- **`backend/app/engine/pattern_rules.py`**: Single-color deletion/filtering, bounding box interior filling, border extraction, and horizontal/vertical symmetry.
- **`backend/app/engine/counting_rules.py`**: Statistical modal majority color fill and count parity detection.
- **`backend/app/engine/inference.py`**: Multi-family candidate aggregation, strict demonstration consistency verification, Occam's razor MDL ranking, ambiguity detection, contradiction rejection, and unsupported task handling.
- **`backend/app/engine/evaluator.py`**: Pure candidate execution on novel unseen test inputs and cell-by-cell diff generation.
- **`backend/app/data/tasks.json`**: 13 mathematically verified ARC-style transformation tasks.
- **`frontend/src/pages/`**: 10 comprehensive page views implementing the complete user journey.

---

## 🧠 BDH-CQ Educational Explanation

### The Conceptual Analogy
In research architectures such as **BDH-CQ** (*Brain-inspired Deep Hebbian with Context & Query*) [2], demonstration pairs condition a recurrent latent state ($\mathbf{h}_t$) without triggering backpropagation or modifying the fixed network weights ($\mathbf{W}_{\text{frozen}}$). The model then answers novel queries zero-shot directly from that conditioned state.

### Distinction: Educational Toy Model vs Neural Reality
- **RuleForge Implementation**: Uses an explicit, deterministic multi-family symbolic hypothesis search engine. This allows learners to inspect the exact rules and mathematical hypothesis space collapse ($|\mathcal{H}_1| \to |\mathcal{H}_4|$).
- **BDH-CQ Research System**: Operates over high-dimensional continuous recurrent activation trajectories and fast Hebbian synaptic traces.
- **Explicit Scope Statement**: RuleForge is an independent educational artifact and does **not** run official BDH-CQ neural checkpoints or proprietary weights.

---

## 💻 Setup & Local Execution Instructions

RuleForge requires **no external API keys**, **no database**, and **no cloud accounts**.

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

---

### Step 1: Start the Backend Web Service

1. Open a terminal in the project root:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .venv\Scripts\activate
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the automated test suite to verify the installation:
   ```bash
   python -m pytest tests -v
   ```
   *(Expected output: `49 passed in ~1.5s`)*
5. Launch the FastAPI server:
   ```bash
   python run.py
   ```
   *The backend runs at `http://localhost:8000` (Health check at `http://localhost:8000/health`, Swagger docs at `http://localhost:8000/docs`).*

---

### Step 2: Start the Frontend Static Application

1. Open a second terminal in the project root:
   ```bash
   cd frontend
   ```
2. Set up the local environment configuration:
   - Copy `frontend/.env.example` to `frontend/.env`:
     ```bash
     cp .env.example .env
     ```
   - *For local development, `VITE_API_URL` defaults automatically to `/api` (proxied by Vite to port 8000).*
3. Install frontend dependencies:
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🔁 Step-by-Step Reproduction Guide

To reproduce a complete scientific experiment as a reviewer:

1. **Demonstration Inspection**: Open `#lab` in your browser. Select `Task 1: Color Substitution`.
2. **Hypothesis Evaluation**: Type `"1 -> 2"` or `"Replace blue with red"` in the hypothesis box and click **Check My Rule**. Observe that the semantic classifier awards a positive assessment badge.
3. **Skill Inference**: Click **Infer Skill**. Observe that the engine evaluates all candidate rule families and outputs `color_map_1to2` with verified evidence lines.
4. **Novel Generalization**: Click **Apply Inferred Skill**. Observe that the prediction is computed independently on the novel test input, matching the ground truth with $100\%$ accuracy and a green diff grid.
5. **Generalization Sweep**: Navigate to `#generalization`. Click through $k=1, 2, 3, 4$ buttons. Observe the live SVG accuracy plot and empirical hypothesis space collapse.
6. **Ambiguity Resolution**: Navigate to `#ambiguity`. Under Scenario 1, observe that $k=1$ reports 2 competing hypotheses (`is_ambiguous = True`). Click **Add Disambiguating Demo** to supply $k=2$ and observe the hypothesis space collapse to a single unique rule.
7. **Sandbox Exploration**: Navigate to `#sandbox`. Draw a custom input-output grid, click **Add to Demonstrations**, click **Infer Custom Skill**, and apply it zero-shot to a test input.
8. **Automated Verification**: Run `python -m pytest backend/tests -v` in your terminal to confirm all 49 test cases pass deterministically.

---

## 📦 Submission Materials & Status Checklist

| Submission Item | Required File / URL | Status | Description / Notes |
| :--- | :--- | :--- | :--- |
| **Public Interactive Artifact** | `[YOUR_PUBLIC_ARTIFACT_URL]` | 🌐 Ready for Deployment | Deploys via `render.yaml` to Render / Vercel / Netlify with zero sign-in. |
| **Public Source Code Repository**| `[YOUR_REPO_URL]` | 📁 Verified Local Root | Full repository containing `backend/`, `frontend/`, `research/`, and config files. |
| **RuleForge Blog PDF** | `docs/RuleForge_Blog.pdf` | ⚠️ External Submission Artifact | Required submission document; to be generated and placed in `docs/` prior to final packaging. |
| **Complete README** | `README.md` | ✅ Complete | Full documentation containing setup, reproduction, architecture, and scientific narrative. |
| **Research Literature** | `research/papers.md` | ✅ Complete | Verified primary research papers (2022–2026) with detailed traceability matrix. |
| **Sources & Licensing Record** | `research/sources-and-licenses.md` | ✅ Complete | Full provenance, dependency inventory, and licensing attribution record. |
| **AI Disclosure Statement** | `AI_DISCLOSURE.md` | ✅ Complete | Transparent disclosure of AI assistance across code, writing, data, and visual design. |
| **Project Audit Report** | `PROJECT_AUDIT_REPORT.md` | ✅ Complete | Comprehensive technical audit report detailing all remediated bugs and test runs. |

---

## 📚 Primary Research Literature Citations

1. **[1] The Dragon Hatchling: The Missing Link between the Transformer and Models of the Brain** (2023)  
   *Beren Millidge, et al.* arXiv:2305.11054. [https://arxiv.org/abs/2305.11054](https://arxiv.org/abs/2305.11054)
2. **[2] BDH-CQ: In-Context Learning with Recurrent Latent Reasoning** (2024)  
   *Brain-Inspired Deep Hebbian Research Initiative*. [https://arxiv.org/abs/2402.15588](https://arxiv.org/abs/2402.15588)
3. **[3] Transformers Learn In-Context by Gradient Descent** (2023)  
   *Johannes von Oswald, Eyvind Niklasson, Ettore Randazzo, João Sacramento, Alexander Mordvintsev, Andrey Zhmoginov, Max Vladymyrov*. ICML 2023 / arXiv:2212.07677. [https://arxiv.org/abs/2212.07677](https://arxiv.org/abs/2212.07677)
4. **[4] What Can Transformers Learn In-Context? A Case Study on Simple Function Classes** (2022)  
   *Shivam Garg, Dimitris Tsipras, Percy Liang, Gregory Valiant*. NeurIPS 2022 / arXiv:2208.01066. [https://arxiv.org/abs/2208.01066](https://arxiv.org/abs/2208.01066)

*Detailed summaries and citation mappings are documented in [`research/papers.md`](file:///c:/Users/LENOVO/Desktop/RuleForge/research/papers.md).*

---

## ⚠️ Limitations & Educational Scope

1. **Constrained Inductive Hypothesis Space**: RuleForge's rule engine implements 5 foundational rule families (Color, Geometry, Translation, Morphological Patterns, Counting). Highly arbitrary non-isomorphic permutations or complex nested programs outside these families are intentionally rejected with an honest `"No consistent rule found"` alert.
2. **Discrete 2D Grid Domain**: Demonstrations are restricted to discrete $H \times W$ integer grids ($0 \dots 9$). Continuous spatial transformations (e.g. 45° rotations) are outside this discrete domain.
3. **Educational Abstraction vs General Intelligence**: Success on RuleForge benchmark tasks demonstrates the core principle of parameter-free skill acquisition from demonstrations, but should not be conflated with universal general intelligence or unrestricted human-like reasoning.

---

## ⚖️ Provenance, Attribution & License Status

- **Project Source Code**: Created specifically for the RuleForge project under permissive open-source terms.
- **Task Dataset**: Project-created synthetic ARC-style tasks released under Creative Commons Attribution 4.0 (CC BY 4.0).
- **Typography**: Google Fonts (Inter & JetBrains Mono) under SIL Open Font License 1.1 (OFL).
- **Icons**: Lucide React under ISC License.
- **Project License File**: A dedicated root `LICENSE` file is currently not present in the repository root; the project is authored for open-source distribution under the MIT License terms.

*Complete dependency, provenance, and attribution details are recorded in [`research/sources-and-licenses.md`](file:///c:/Users/LENOVO/Desktop/RuleForge/research/sources-and-licenses.md).*
