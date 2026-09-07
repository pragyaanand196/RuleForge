# Concept Summary: Skill Acquisition from Demonstrations
*A Research & Conceptual Briefing*

---

## 1. The Core Scientific Claim

> **“A system can acquire a previously unseen task skill from a small number of demonstrations and apply the inferred rule to a new example without updating its model parameters at inference time.”**

Historically, enabling a machine learning model to solve a novel, out-of-distribution task required **parameter updates** (e.g., fine-tuning or meta-learning inner-loop gradient steps). The paradigm of **Skill Acquisition from Demonstrations** proves an alternative thesis: a system with **fixed parameters** ($\mathbf{W} \equiv \mathbf{W}_0$) can parse a stream of input-output demonstrations, encode the latent operational invariant in its dynamic context or recurrent state ($\mathbf{h}_t$), and immediately generalize to unseen query inputs.

---

## 2. Mechanistic Comparison: Gradient Updates vs In-Context Adaptation

| Dimension | Conventional Fine-Tuning | In-Context / Recurrent State (BDH-CQ) |
| :--- | :--- | :--- |
| **Adaptation Mechanism** | Modifies physical weights: $\mathbf{W} \leftarrow \mathbf{W} - \eta \nabla_{\mathbf{W}} \mathcal{L}$ | Modifies working state: $\mathbf{h}_t = f(\mathbf{h}_{t-1}, x_t; \mathbf{W}_{\text{frozen}})$ |
| **Inference-Time Weights** | **Mutable** (parameter update per task) | **Strictly Frozen** ($\Delta \mathbf{W} = 0$) |
| **Inference Latency** | High (multiple gradient backprop passes) | Instantaneous ($O(1)$ single forward pass) |
| **Memory Interference** | High risk of **catastrophic forgetting** | Zero interference; prior knowledge preserved |
| **Data Requirement** | Tens to thousands of examples | **Sparse demonstrations** ($k \in [1, 4]$) |

---

## 3. The Information Economics of Sparse Demonstrations

Demonstrations function as empirical constraints that collapse the model's candidate hypothesis space:

1. **Underdetermined Ambiguity ($k=1$):** A single demonstration often accommodates multiple mutually exclusive transformation hypotheses (e.g., global color substitution vs coordinate-specific shifting). Fitting the demonstration does not guarantee acquiring the true general skill.
2. **Disambiguation via Diverse Coverage ($k \ge 2$):** Providing diverse input coordinates introduces counter-evidence that eliminates erroneous hypotheses, causing the hypothesis space to rapidly collapse to the unique underlying invariant.
3. **Generalization Saturation:** Once the hypothesis space is uniquely constrained, additional demonstrations provide diminishing returns.

---

## 4. Representative Architectures & Primary Literature

1. **BDH-CQ (Brain-Inspired Deep Hebbian with Context & Query)**:
   - Evaluates tasks without backpropagation at inference time. Working memory acts as temporary synaptic activation, conditioning the query prediction (*BDH Technical Report*, 2024).
2. **Dragon Hatchling**:
   - Formulates the mathematical foundation of recurrent synaptic state updates, establishing that transformer in-context learning is functionally equivalent to recurrent working memory (*Dragon Hatchling Paper*, 2023).
3. **Equations of Reasoning**:
   - Proves how continuous invariant discovery operates across ARC-style visual abstractions (*The Equations of Reasoning*, 2024).
4. **Attention to Synapses**:
   - Derives biologically plausible Hebbian plasticity from generalized self-attention (*From Attention to Synapses*, 2023).

---

## 5. Educational Toy Model vs Research Systems

- **RuleForge Engine (Educational Abstraction)**: Uses a deterministic, multi-family symbolic hypothesis search engine over color, geometry, translation, pattern, and counting rules to make the hypothesis collapse visually and causally obvious to learners.
- **BDH-CQ Research System (Neural Reality)**: Encodes invariants implicitly in high-dimensional continuous recurrent activation trajectories and short-term synaptic dynamics without symbolic parsers.

---

## 6. Authoritative Primary Citations

- *Skill Acquisition from Sparse Demonstrations via Context-Query Recurrence*, BDH Technical Report, 2024.
- *Scaling In-Context Task Adaptation in Recurrent Synaptic Models*, Dragon Hatchling, 2023.
- *Mathematical Invariants in In-Context Abstract Reasoning*, The Equations of Reasoning, 2024.
- *From Attention to Synapses: Deriving Brain-Inspired Hebbian Transformers*, 2023.
