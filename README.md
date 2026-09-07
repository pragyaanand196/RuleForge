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

RuleForge guides learners through a clean, logical 10-stage scientific discovery workflow:

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
8. **60-Second Challenge (`#challenge`)**:
   - Timed zero-shot skill acquisition challenge with 60-second countdown timer and score assessment.
9. **Conceptual Reflection (`#reflection`)**:
   - Synthesis reflection prompt evaluated against 5-concept scientific rubric for mastery certification.
10. **Primary Sources & Provenance (`#research`)**:
    - Authoritative primary literature citations (2022–2026), asset provenance, and open-source licenses.

---

## 🏗️ System Architecture

```
RuleForge/
├── render.yaml                    # Render Blueprint for 1-click full-stack deployment
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI app with CORS, health monitoring & routes
│   │   ├── schemas.py             # Pydantic validation models
│   │   ├── engine/
│   │   │   ├── rule_base.py       # Abstract BaseRule & Grid utilities
│   │   │   ├── color_rules.py     # Color mapping & replacement
│   │   │   ├── geometric_rules.py # Rotations & Reflections
│   │   │   ├── translation_rules.py # Spatial shifts & gravity
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
│   │       ├── generalize.py      # Demonstration count sweep endpoint
│   │       ├── challenge.py       # 60-second challenge task & evaluation
│   │       └── reflection.py      # Self-explanation rubric evaluation
│   ├── tests/                     # 19 passing pytest unit & integration tests
│   ├── pytest.ini
│   ├── requirements.txt
│   └── run.py                     # Configurable host/port startup
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable accessible UI components
│   │   ├── pages/                 # Full interactive educational pages
│   │   │   ├── HomePage.tsx       # Start overview & visual preview
│   │   │   ├── LearnPage.tsx      # 4-step conceptual foundation & mini-grid
│   │   │   ├── LabPage.tsx        # Main ARC demonstration lab
│   │   │   ├── GeneralizationPage.tsx # Demonstration sweep & empirical curve
│   │   │   ├── AmbiguityPage.tsx  # Intentional underdetermined failure lab
│   │   │   ├── SandboxPage.tsx    # Open custom demonstration creator
│   │   │   ├── BDHPage.tsx        # BDH-CQ research connection & comparison
│   │   │   ├── ChallengePage.tsx  # 60-second challenge mode
│   │   │   ├── ReflectionPage.tsx # Conceptual reflection rubric
│   │   │   └── ResearchPage.tsx   # Primary literature library & provenance
│   │   ├── services/api.ts        # Client API service with VITE_API_URL configuration
│   │   ├── styles/                # Academic laboratory tokens & responsive CSS
│   │   ├── types/index.ts         # TypeScript data types & router pages
│   │   ├── App.tsx                # Hash-synced router & state manager
│   │   └── main.tsx
│   ├── .env.example               # Template environment configuration
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── README.md                      # Comprehensive developer & user documentation
├── AI_DISCLOSURE.md               # Transparent AI tooling disclosure
└── CONCEPT_SUMMARY.md             # One-page research & conceptual briefing
```

---

## 🌐 Live Deployment (Render)

RuleForge is structured for clean two-service deployment on [Render](https://render.com/):

### Service 1: Frontend (Render Static Site)
- **Service Type**: Static Site
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build` (or `npm ci && npm run build`)
- **Publish Directory**: `dist`
- **Routing Rewrite (SPA)**:
  - Source: `/*`
  - Destination: `/index.html`
- **Environment Variables**:
  - `VITE_API_URL`: URL of the deployed backend service (e.g. `https://ruleforge-backend.onrender.com`)

### Service 2: Backend (Render Web Service)
- **Service Type**: Web Service
- **Runtime**: Python 3
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/health`
- **Environment Variables**:
  - `FRONTEND_URL`: URL of the deployed frontend static site (e.g. `https://ruleforge-frontend.onrender.com`)
  - `PYTHON_VERSION`: `3.11.8`

> [!NOTE]
> Vite environment variables (`VITE_API_URL`) are compiled into static assets during build time. If you update `VITE_API_URL` in Render, trigger a manual deploy / rebuild for the frontend static site.

---

### 🚀 1-Click Deployment via Render Blueprint (`render.yaml`)

1. Push your repository to GitHub.
2. In the Render Dashboard, click **New +** $\to$ **Blueprint**.
3. Connect your `RuleForge` repository. Render will automatically parse [`render.yaml`](file:///c:/Users/LENOVO/Desktop/RuleForge/render.yaml) and configure both services.
4. Once deployed:
   - Copy the Backend Web Service URL (e.g. `https://ruleforge-backend.onrender.com`).
   - Set `VITE_API_URL` on the Frontend Static Site to the backend URL and redeploy the frontend.
   - Set `FRONTEND_URL` on the Backend Web Service to the frontend URL.
5. Open the public frontend URL in your browser without any sign-in!

---

## 💻 Local Development Setup

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

---

### Step 1: Start the Backend

1. Open a terminal in the project root:
   ```bash
   cd backend
   python -m venv .venv
   ```
2. Activate virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     .venv\Scripts\activate
     ```
   - **macOS / Linux**:
     ```bash
     source .venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run automated test suite:
   ```bash
   python -m pytest tests -v
   ```
5. Start FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *Health endpoint available at `http://localhost:8000/health` (Swagger UI at `http://localhost:8000/docs`).*

---

### Step 2: Start the Frontend

1. Open a second terminal in the project root:
   ```bash
   cd frontend
   ```
2. Setup local environment file:
   - Copy `frontend/.env.example` to `frontend/.env`:
     ```bash
     cp .env.example .env
     ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser at `http://localhost:5173`.

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

