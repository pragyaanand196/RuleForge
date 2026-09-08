# AI Disclosure Statement

In compliance with open science, academic integrity, and transparent development practices, this document details all AI tools and automated assistance utilized during the design, implementation, evaluation, and verification of **RuleForge — Skill Acquisition from Demonstrations**.

---

## 1. Development Tools & Model Assistance

- **Primary AI Assistant**: Antigravity IDE (powered by Google DeepMind Advanced Agentic Coding).
- **Scope of AI Assistance**:
  1. **AI-Assisted Code Generation & Refinement**:
     - Scaffolding of the full-stack repository structure (`backend/` and `frontend/`).
     - Implementation of deterministic rule inference algorithms across 5 rule families (color mapping, geometric rotations/reflections, translation shifts/gravity, pattern deletion/fill/border/symmetry, counting majority/parity).
     - Construction of FastAPI endpoints, Pydantic validation schemas, and 49 deterministic pytest unit, integration, and edge-case test cases.
     - Construction of React 18 / TypeScript components, custom CSS tokens, and SVG visualization charts.
  2. **AI-Assisted Written Content & Educational Workflow Design**:
     - Drafting the 10-stage educational learning progression (Home, Concept, Lab, Generalization, Ambiguity, Sandbox, BDH-CQ, Challenge, Reflection, Research).
     - Articulating the distinction between traditional parameter updates ($W \leftarrow W - \eta \nabla L$) and parameter-free recurrent context dynamics ($\Delta W = 0$).
  3. **AI-Assisted Task Data Generation**:
     - Synthesizing 13 ARC-style 2D visual transformation task specifications in `backend/app/data/tasks.json` with mathematically verified ground-truth solutions and zero test leakage.
  4. **AI-Assisted Visual Asset Design**:
     - Generating CSS grid styling, responsive flex/grid layouts, SVG generalization charts, and architectural comparison diagrams. No external generative image models or raster stock photos were used.
  5. **AI-Assisted Source & License Verification**:
     - Assisting in the organization of dependency metadata, license verification for npm and PyPI packages, and primary literature citation tracking.

---

## 2. Human & Automated Verification Standards

All AI-generated or AI-assisted material was systematically reviewed, tested, corrected, and integrated:

- **Mathematical Consistency**: Every task in `tasks.json` was mathematically checked to ensure that the ground-truth hidden rule transforms all demonstration inputs into their outputs and correctly transforms the unseen test input into its stored ground truth.
- **Independent Execution Verification**: Verified that Step 3 novel predictions are computed purely from candidate rule execution on test inputs without reading ground-truth labels.
- **Automated Test Validation**: All 49 automated test cases in `backend/tests/` pass with a 100% deterministic success rate (`49 passed in 1.48s`).
- **Frontend Type Safety**: Executed `tsc && vite build` with zero TypeScript errors and zero bundle warnings.
- **Scientific Honesty**: Verified that RuleForge explicitly labels its engine as a simplified educational toy model, clearly separating it from the high-dimensional continuous recurrent neural dynamics of research architectures such as BDH-CQ and Dragon Hatchling.

---

## 3. Absence of Unchecked AI Artifacts

- No placeholder text, simulated percentages, hard-coded accuracies, or unverified research papers exist in the final codebase.
- All primary citations (Millidge et al., 2023; BDH Research Initiative, 2024; von Oswald et al., 2023; Garg et al., 2022) reference real, authoritative peer-reviewed or preprint literature.
