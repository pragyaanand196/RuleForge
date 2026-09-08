# Sources, Provenance & Licensing Record

**Project:** RuleForge — Skill Acquisition from Demonstrations  
**Artifact Context:** Comprehensive Provenance, Attribution, and Open-Source Compliance Record  

---

## 1. Project-Created Materials

All core application logic, educational modules, algorithmic rule inference routines, test suites, and interactive interfaces in this repository were created specifically for the RuleForge project.

| Asset / Component | Source | Purpose | License | Modification Status | Attribution / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RuleForge Backend Engine** (`backend/app/engine/`) | Project-Created | Deterministic multi-family symbolic hypothesis search, evaluation, and empirical generalization routines. | Project Original | Original Implementation | Implements 5 rule families with MDL ranking and cell-by-cell diff matching. |
| **FastAPI REST API Routes** (`backend/app/routes/`) | Project-Created | Task serving, hypothesis semantic analysis, inference endpoints, generalization sweeps, and reflection evaluation. | Project Original | Original Implementation | Pure Python/FastAPI with Pydantic validation schemas. |
| **Frontend React Pages & Components** (`frontend/src/`) | Project-Created | Interactive grid viewers, grid editors, SVG generalization charts, architectural diagrams, and challenge timers. | Project Original | Original Implementation | React 18, TypeScript, and custom CSS design system. |
| **Verification & Automated Test Suites** (`backend/tests/`) | Project-Created | Unit, integration, edge-case, and end-to-end deterministic test coverage. | Project Original | Original Implementation | 49 passing automated pytest test cases. |
| **Project Documentation & Summaries** | Project-Created | Comprehensive technical audits, research documentation, and educational walkthroughs. | Project Original | Original Implementation | Authored for open science and transparent peer review. |

---

## 2. Third-Party Software Dependencies

All software dependencies are standard, permissive open-source packages declared in `frontend/package.json` and `backend/requirements.txt`.

### 2.1 Backend Dependencies (Python)

| Asset / Component | Source | Purpose | License | Modification Status | Attribution / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FastAPI** (`fastapi>=0.110.0`) | [GitHub / PyPI](https://github.com/tiangolo/fastapi) | Web API framework for high-performance async routing and schema validation. | MIT License | Unmodified Dependency | Copyright (c) Sebastián Ramírez |
| **Uvicorn** (`uvicorn>=0.28.0`) | [GitHub / PyPI](https://github.com/encode/uvicorn) | Lightning-fast ASGI server implementation. | BSD-3-Clause License | Unmodified Dependency | Copyright (c) Encode OSS |
| **Pydantic** (`pydantic>=2.6.0`) | [GitHub / PyPI](https://github.com/pydantic/pydantic) | Data validation and settings management using Python type annotations. | MIT License | Unmodified Dependency | Copyright (c) Samuel Colvin & Pydantic team |
| **Pytest** (`pytest>=8.0.0`) | [GitHub / PyPI](https://github.com/pytest-dev/pytest) | Automated testing framework for unit and integration verification. | MIT License | Unmodified Dependency | Copyright (c) Holger Krekel and pytest contributors |
| **HTTPX** (`httpx>=0.27.0`) | [GitHub / PyPI](https://github.com/encode/httpx) | Async HTTP client used in API integration test fixtures. | BSD-3-Clause License | Unmodified Dependency | Copyright (c) Encode OSS |
| **NumPy** (`numpy>=1.26.0`) | [GitHub / PyPI](https://github.com/numpy/numpy) | High-performance matrix operations and dimensional array utilities. | BSD-3-Clause License | Unmodified Dependency | Copyright (c) NumPy Developers |

### 2.2 Frontend Dependencies (JavaScript / TypeScript)

| Asset / Component | Source | Purpose | License | Modification Status | Attribution / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **React** (`react^18.3.1`) | [GitHub / npm](https://github.com/facebook/react) | UI component library for reactive state rendering. | MIT License | Unmodified Dependency | Copyright (c) Meta Platforms, Inc. |
| **React-DOM** (`react-dom^18.3.1`) | [GitHub / npm](https://github.com/facebook/react) | DOM rendering entry point for React. | MIT License | Unmodified Dependency | Copyright (c) Meta Platforms, Inc. |
| **Lucide React** (`lucide-react^0.344.0`) | [GitHub / npm](https://lucide.dev/) | Consistent, clean SVG iconography library. | ISC License | Unmodified Dependency | Copyright (c) Lucide Contributors |
| **Vite** (`vite^5.2.11`) | [GitHub / npm](https://vitejs.dev/) | Modern frontend build tool and hot-module dev server. | MIT License | Unmodified Tooling | Copyright (c) Yuxi (Evan) You & Vite Contributors |
| **TypeScript** (`typescript^5.4.5`) | [GitHub / npm](https://www.typescriptlang.org/) | Static type system for JavaScript. | Apache-2.0 License | Unmodified Tooling | Copyright (c) Microsoft Corporation |
| **@vitejs/plugin-react** (`^4.2.1`) | [GitHub / npm](https://github.com/vitejs/vite-plugin-react) | Official Vite plugin for React JSX Fast Refresh. | MIT License | Unmodified Tooling | Copyright (c) Vite Contributors |

---

## 3. Data & Synthetic Task Sets

| Asset / Component | Source | Purpose | License | Modification Status | Attribution / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RuleForge Task Dataset** (`backend/app/data/tasks.json`) | Project-Created Synthetic Dataset | 13 ARC-style visual grid reasoning tasks covering color, rotation, reflection, translation, pattern, counting, and ambiguity scenarios. | CC BY 4.0 | Original Synthetic Data | Authored specifically for educational demonstration; guaranteed zero test leakage and mutual mathematical consistency. |

---

## 4. Typography, Icons & Visual Assets

| Asset / Component | Source | Purpose | License | Modification Status | Attribution / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Inter Font Family** | [Google Fonts](https://fonts.google.com/specimen/Inter) | Clean, legible primary UI typography. | SIL Open Font License 1.1 (OFL) | Loaded via Google Fonts CDN | Designed by Rasmus Andersson |
| **JetBrains Mono Font Family** | [Google Fonts](https://fonts.google.com/specimen/JetBrains+Mono) | Monospace font for grid coordinates, matrices, and code snippets. | SIL Open Font License 1.1 (OFL) | Loaded via Google Fonts CDN | Designed by JetBrains |
| **Lucide SVG Icons** | [Lucide](https://lucide.dev/) | Accessible UI iconography (arrows, badges, playback controls, alert markers). | ISC License | Integrated via `lucide-react` | Permissive open-source license |
| **Custom SVG Diagrams & Grid Renderers** | Project-Created | Dynamic interactive 2D grid canvases, live generalization SVG curves, and architectural diagrams. | Project Original | Original Implementation | Rendered natively using HTML5 Canvas / SVG / Vanilla CSS |

---

## 5. Research References (Attribution vs Asset Reuse)

Research literature cited throughout RuleForge and in `research/papers.md` serves as **academic reference and conceptual foundation only**. No proprietary figures, copyrighted diagrams, or proprietary code from these publications were extracted or directly reused.

| Research Work | Reference Citation | Conceptual Contribution | Asset Reuse Status |
| :--- | :--- | :--- | :--- |
| **The Dragon Hatchling** | Millidge et al., arXiv:2305.11054 (2023) | Theoretical equivalence of self-attention and recurrent synaptic activations. | **Citation Only** (No text or figures reused) |
| **BDH-CQ Technical Report** | BDH Research Initiative (2024) | Context-Query separation and parameter-free demonstration conditioning. | **Citation Only** (No text or figures reused) |
| **Transformers Learn In-Context by Gradient Descent** | von Oswald et al., ICML (2023) | Implicit mesa-optimization in forward activation trajectories. | **Citation Only** (No text or figures reused) |
| **What Can Transformers Learn In-Context?** | Garg et al., NeurIPS (2022) | Sample complexity and empirical generalization curves over demonstration budgets $k$. | **Citation Only** (No text or figures reused) |

---

## 6. Categories & Assets Explicitly Not Used

To ensure complete transparency during peer review and submission auditing:

- **External Model Weights / Checkpoints:** **No external model weights or neural network checkpoints are used.** All inference is executed by a lightweight, deterministic symbolic rule engine.
- **External Raster Images / Stock Photos:** **No external PNG/JPEG/WebP images are used.** All visual interfaces are rendered using responsive CSS and SVG elements.
- **External Databases:** **No SQL, NoSQL, or Vector databases are used.** Task definitions are loaded directly from validated JSON files.
- **External Cloud AI APIs / Proprietary LLM Services:** **No external LLM or API keys are required or invoked during runtime.** All computation executes locally and deterministically.
- **User Authentication / Tracking / Cookies:** **No user tracking, third-party analytics, authentication gates, or user account systems are used.**

---

## 7. Project Licensing Status

- **Root License File Status:** A dedicated root `LICENSE` file is currently not present in the repository root.
- **Intended Open-Source Terms:** The RuleForge codebase is intended for distribution under the permissive **MIT License**, with synthetic educational task data released under **Creative Commons Attribution 4.0 International (CC BY 4.0)**. All third-party libraries and fonts referenced above are used in strict compliance with their respective permissive licenses.
