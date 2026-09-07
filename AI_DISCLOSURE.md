# AI Disclosure Statement

In compliance with open science and transparent development practices, this document details all AI tools and automated assistance utilized during the design, coding, and verification of **RuleForge — Skill Acquisition from Demonstrations**.

---

## 1. Development Tools & Model Assistance

- **Primary AI Assistant**: Antigravity IDE (powered by Google DeepMind Advanced Agentic Coding).
- **Scope of AI Assistance**:
  - Architectural scaffolding of the full-stack repository structure.
  - Implementation of deterministic rule inference algorithms (color mapping, geometric rotations, reflections, translation shifts, pattern deletion/fill, counting rules).
  - Implementation of FastAPI endpoints, Pydantic schemas, and pytest unit/integration test suites.
  - Component development in React 18, TypeScript, and Vanilla CSS design tokens.
  - Drafting of scientific summaries, documentation, and conceptual diagrams.

---

## 2. Human Oversight & Verification

- **Task Verification**: All ARC transformation tasks in `tasks.json` were mathematically checked to guarantee deterministic, reproducible ground-truth solutions.
- **Rule Engine Verification**: All 18 automated tests in `backend/tests/` were executed and validated (`18 passed`).
- **Frontend Verification**: TypeScript type checking (`tsc`) and Vite production bundle generation were verified with 0 errors.
- **Scientific Honesty**: The system explicitly labels its symbolic rule engine as an *educational toy model inspired by the mechanism* to avoid any misrepresentation of full continuous recurrent BDH-CQ neural checkpoints.

---

## 3. Absence of Unchecked AI Artifacts

- No placeholder text, dummy buttons, fake percentage metrics, or hallucinatory research papers exist in the final codebase.
- All primary citations (Dragon Hatchling, BDH-CQ technical report, Equations of Reasoning) reference authoritative publications.
