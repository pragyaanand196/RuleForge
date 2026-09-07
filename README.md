# RuleForge — Skill Acquisition from Demonstrations
**An Interactive Educational Research Laboratory for parameter-free skill adaptation**

[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 Central Falsifiable Claim

> **“A system can acquire a previously unseen task skill from a small number of demonstrations and apply the inferred rule to a new example without updating its model parameters at inference time.”**

RuleForge teaches, demonstrates, tests, and challenges this scientific claim through a hands-on, accessible interactive laboratory rather than generic text explanations or marketing dashboards.

---

## 🔬 Educational Journey & Workflow

RuleForge guides learners through a clean, logical 8-stage scientific discovery workflow:

1. **Start & Overview (`#home`)**:
   - Concise 2-sentence explanation with live input $\to$ output grid preview and a single clear *"Start Experiment"* action.
2. **Conceptual Foundation (`#learn`)**:
   - 4-step breakdown of demonstrations, hidden rule inference, unseen test inputs, and zero-shot generalization with an interactive starter mini-grid.
3. **Demonstration Laboratory (`#lab`)**:
   - ARC-style visual transformation tasks (color replacement, 90°/180° rotation, reflection, spatial shifts, gravity drops, interior fills, and color deletion).
   - "Inspect & Hypothesize": Learner enters hypothesis and receives instant deterministic feedback.
   - "Infer Skill": Backend analyzes demonstrations, identifies consistent invariants, and displays rule + evidence log.
   - "Apply Learned Skill": Applies rule to novel unseen input and compares prediction against ground truth with cell-by-cell diff matching and accuracy percentage.
4. **Generalization Experiment (`#generalization`)**:
   - Vary demonstration count ($k \in \{1, 2, 3, 4\}$).
   - Live SVG chart plotting empirical generalization accuracy vs demonstration count.
5. **Ambiguity & Failure Lab (`#ambiguity`)**:
   - Underdetermined single demonstration compatible with multiple valid hypotheses.
   - System reports ambiguity alert $\to$ learner adds a disambiguating demonstration $\to$ system eliminates erroneous hypotheses and confirms unique rule.
6. **Demonstration Sandbox (`#sandbox`)**:
   - Interactive cell palette editor (colors 0–9, grid resizing 3x3 to 5x5).
   - Draw custom demonstration pairs, queue them into the demonstration stream, infer custom skills, and test on novel custom canvases.
7. **BDH-CQ Research Connection (`#bdh`)**:
   - Architectural comparison between traditional Gradient Weight Updating ($W \leftarrow W - \eta \nabla L$) and In-Context / Recurrent State Adaptation ($h_t = f(h_{t-1}, x_t; W_{\text{frozen}})$).
   - Explicit distinction between RuleForge's educational toy model and continuous neural recurrent architectures.
8. **Primary Sources & Provenance (`#research`)**:
   - Authoritative primary literature citations (2022–2026), asset provenance, and open-source licenses.

---

## 🏗️ System Architecture

```
RuleForge/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI application with CORS & health monitoring
│   │   ├── schemas.py             # Pydantic validation models
│   │   ├── engine/
│   │   │   ├── rule_base.py       # Abstract BaseRule & Grid utilities
│   │   │   ├── color_rules.py     # Color mapping & replacement
│   │   │   ├── geometric_rules.py # Rotations (90°, 180°, 270°) & Reflections (H, V, Diag)
│   │   │   ├── translation_rules.py # Spatial shifts (dx, dy) & directional gravity
│   │   │   ├── pattern_rules.py   # Deletion, interior fill, border extraction, symmetry
│   │   │   ├── counting_rules.py  # Majority color & parity rules
│   │   │   ├── inference.py       # Multi-family hypothesis search & ambiguity detection
│   │   │   └── evaluator.py       # Cell-level diff matching & accuracy computation
│   │   ├── data/
│   │   │   ├── task_loader.py     # Dataset manager & client sanitizer
│   │   │   └── tasks.json         # Curated verified ARC-style transformation tasks
│   │   └── routes/
│   │       ├── tasks.py           # Task browsing & learner hypothesis evaluation
│   │       ├── infer.py           # Skill inference endpoint
│   │       ├── apply.py           # Novel test input evaluation endpoint
│   │       └── generalize.py      # Demonstration count sweep endpoint
│   ├── tests/                     # 19 passing pytest unit & integration tests
│   ├── pytest.ini
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable accessible UI components
│   │   │   ├── Header.tsx         # Navigation & progress pills
│   │   │   ├── GridView.tsx       # ARC grid renderer with diff highlights
│   │   │   ├── GridEditor.tsx     # Interactive canvas drawing & palette
│   │   │   ├── DemoViewer.tsx     # Side-by-side demonstration pair cards
│   │   │   ├── HypothesisCard.tsx # Learner hypothesis check & inferred skill
│   │   │   ├── PredictionViewer.tsx # Novel unseen input vs ground truth comparison
│   │   │   ├── GeneralizationChart.tsx # Live SVG empirical curve
│   │   │   └── BDHDiagram.tsx     # Parameter Update vs In-Context diagram
│   │   ├── pages/                 # Full interactive educational pages
│   │   │   ├── HomePage.tsx       # Start overview & visual preview
│   │   │   ├── LearnPage.tsx      # 4-step conceptual foundation & mini-grid
│   │   │   ├── LabPage.tsx        # Main ARC demonstration lab
│   │   │   ├── GeneralizationPage.tsx # Demonstration sweep & empirical curve
│   │   │   ├── AmbiguityPage.tsx  # Intentional underdetermined failure lab
│   │   │   ├── SandboxPage.tsx    # Open custom demonstration creator
│   │   │   ├── BDHPage.tsx        # BDH-CQ research connection & comparison
│   │   │   └── ResearchPage.tsx   # Primary literature library & provenance
│   │   ├── services/api.ts        # Client API communication
│   │   ├── styles/                # Clean academic laboratory tokens & CSS
│   │   ├── types/index.ts         # TypeScript data types
│   │   ├── App.tsx                # Hash-synced router & state manager
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── README.md                      # Comprehensive developer & user documentation
├── AI_DISCLOSURE.md               # Transparent AI tooling disclosure
└── CONCEPT_SUMMARY.md             # One-page research & conceptual briefing
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

---

### Step 1: Start the Backend API

1. Open a terminal in the project root:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run backend tests:
   ```bash
   python -m pytest tests -v
   ```
4. Start the FastAPI server:
   ```bash
   python run.py
   ```
   *Backend runs on `http://127.0.0.1:8000` (API documentation at `http://127.0.0.1:8000/docs`).*

---

### Step 2: Start the Frontend Application

1. Open a second terminal in the project root:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 📚 Academic Literature & Citations

1. **BDH Technical Report & Counterexample (2024)**: *Skill Acquisition from Sparse Demonstrations via Context-Query Recurrence*.
2. **Dragon Hatchling Architecture (2023)**: *Scaling In-Context Task Adaptation in Recurrent Synaptic Models*.
3. **The Equations of Reasoning (2024)**: *Mathematical Invariants in In-Context Abstract Reasoning*.
4. **From Attention to Synapses: Deriving BDH (2023)**: *Bridging Transformer Self-Attention and Biological Recurrent Synaptic State*.

---

## ⚖️ Scientific Integrity & Provenance

- **Educational Model Distinction**: RuleForge uses a deterministic multi-family symbolic hypothesis search engine as an accessible educational model to illustrate the principle of in-context skill acquisition. In neural research systems like BDH-CQ, the skill invariant is encoded continuously in recurrent hidden activations.
- **Licenses**:
  - Code: MIT License
  - Educational Dataset: CC BY 4.0
  - Typography: Google Fonts (Inter, JetBrains Mono) - SIL Open Font License
  - Icons: Lucide React - ISC License
