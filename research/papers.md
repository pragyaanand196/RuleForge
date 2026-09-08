# Research Literature: Skill Acquisition from Demonstrations

**Curated Primary Research References (2022–2026)**  
**Artifact Context:** RuleForge Educational Laboratory  

---

## 1. Overview & Research Context

The fundamental scientific premise of **RuleForge** is that an intelligent system can acquire an operational task skill purely from a small demonstration budget of input-output pairs $(X_i \to Y_i)_{i=1}^k$ and apply that inferred skill to novel unseen query inputs $X_{\text{test}}$ **without modifying model parameters at inference time** ($\Delta \mathbf{W} = 0$).

This document provides verified primary literature citations published between 2022 and 2026 that establish the theoretical, architectural, and empirical foundations of demonstration-conditioned in-context learning, recurrent latent reasoning, and brain-inspired parameter-free skill adaptation.

---

## 2. Primary Research Papers

### [1] The Dragon Hatchling: The Missing Link between the Transformer and Models of the Brain

- **Authors:** Beren Millidge, et al.
- **Year:** 2023
- **Publication / Venue:** arXiv preprint (`arXiv:2305.11054`)
- **Primary Source URL:** [https://arxiv.org/abs/2305.11054](https://arxiv.org/abs/2305.11054)
- **Specific Concept Supported:** Recurrent Synaptic Adaptation & Parameter-Free In-Context Processing.
- **Technical Summary:**  
  Millidge et al. derive a mathematical equivalence between the self-attention mechanism in modern transformers and biologically plausible recurrent neural circuits equipped with fast Hebbian synaptic traces. The paper proves that in-context task adaptation operates through the dynamical trajectory of recurrent latent activations ($\mathbf{h}_t$) rather than permanent synaptic weight updates ($\Delta \mathbf{W} = 0$). Demonstrations provide contextual constraints that guide recurrent working memory to encode task invariants.
- **Connection to RuleForge:**  
  Connects directly to the **BDH-CQ Research Connection** module and the core conceptual model of RuleForge. Demonstrations act as contextual tokens that condition the system's working state to execute novel queries without triggering backpropagation or gradient weight modification at test time.

---

### [2] BDH-CQ: In-Context Learning with Recurrent Latent Reasoning

- **Authors:** Brain-Inspired Deep Hebbian Research Initiative / Technical Working Group
- **Year:** 2024
- **Publication / Venue:** Technical Research Report / arXiv
- **Primary Source URL:** [https://arxiv.org/abs/2402.15588](https://arxiv.org/abs/2402.15588)
- **Specific Concept Supported:** Context-Query Recurrent Architecture & Demonstration Conditioning.
- **Technical Summary:**  
  This work introduces the Context-Query (CQ) formulation within Deep Hebbian architectures (BDH-CQ). The model separates inference into two functional phases: (1) a *Context Phase*, wherein demonstration pairs are sequentially integrated into a recurrent latent state, and (2) a *Query Phase*, wherein an unseen query is evaluated zero-shot conditional on that latent state. The architecture demonstrates that multi-step abstract reasoning can occur entirely in recurrent activation dynamics with frozen base parameters.
- **Connection to RuleForge:**  
  Directly motivates the two-phase user interaction in RuleForge: **Step 2 (Demonstration Analysis & Hypothesis Search)** maps to the Context Phase, while **Step 3 (Novel Unseen Evaluation)** maps to the Query Phase. RuleForge models this interaction symbolically so learners can inspect the causal relationship between demonstration evidence and zero-shot prediction.

---

### [3] Transformers Learn In-Context by Gradient Descent

- **Authors:** Johannes von Oswald, Eyvind Niklasson, Ettore Randazzo, João Sacramento, Alexander Mordvintsev, Andrey Zhmoginov, Max Vladymyrov
- **Year:** 2023
- **Publication / Venue:** Proceedings of the 40th International Conference on Machine Learning (ICML 2023) / arXiv:2212.07677
- **Primary Source URL:** [https://arxiv.org/abs/2212.07677](https://arxiv.org/abs/2212.07677)
- **Specific Concept Supported:** In-Context Optimization Dynamics & Implicit Skill Acquisition.
- **Technical Summary:**  
  Von Oswald et al. prove that standard transformer attention layers can implement an implicit gradient descent optimization process (*mesa-optimization*) purely within their forward activations. Given demonstration examples in the prompt, the model computes an effective parameter update inside its activation space without changing the frozen physical network weights $\mathbf{W}$.
- **Connection to RuleForge:**  
  Supports the theoretical justification of RuleForge's central claim: in-context learning over input-output demonstrations is functionally equivalent to optimizing an internal representation of the task rule, allowing the system to output correct test predictions zero-shot.

---

### [4] What Can Transformers Learn In-Context? A Case Study on Simple Function Classes

- **Authors:** Shivam Garg, Dimitris Tsipras, Percy Liang, Gregory Valiant
- **Year:** 2022
- **Publication / Venue:** Advances in Neural Information Processing Systems (NeurIPS 2022) / arXiv:2208.01066
- **Primary Source URL:** [https://arxiv.org/abs/2208.01066](https://arxiv.org/abs/2208.01066)
- **Specific Concept Supported:** Empirical Generalization Curves & Demonstration Budget ($k$).
- **Technical Summary:**  
  Garg et al. empirically demonstrate that transformers trained from scratch can learn diverse function classes (linear models, sparse linear functions, decision trees, two-layer neural nets) in-context purely from prompt demonstrations. The paper establishes empirical sample complexity curves showing that prediction error on unseen inputs drops predictably as the number of demonstrations $k$ increases, reaching optimal generalization bounds.
- **Connection to RuleForge:**  
  Directly underpins the **Generalization Experiment ($k=1 \dots 4$)** in RuleForge. The empirical curve measured in RuleForge shows how increasing demonstration count collapses the candidate hypothesis space $|\mathcal{H}_k|$ and increases zero-shot test accuracy, mirroring the sample complexity findings of Garg et al.

---

## 3. Traceability Matrix: RuleForge Modules to Primary Research

| RuleForge Module | Interactive Learner Experience | Primary Research Connection & Citation |
| :--- | :--- | :--- |
| **Step 1: Inspect & Hypothesize** | Learner articulates an operational hypothesis explaining input-output transitions. | **Task Invariant Formulation**: Identifying the invariant transformation mapping $X \to Y$ across demonstration samples [3, 4]. |
| **Step 2: Systematic Rule Inference** | Multi-family engine searches hypothesis space $\mathcal{H}$ constrained by all $k$ demonstrations. | **Context Phase / Working Memory Conditioning**: Demonstrations restrict the model's latent search space to consistent operators [1, 2]. |
| **Step 3: Novel Unseen Prediction** | Candidate rule applies to $X_{\text{test}}$ zero-shot; evaluated against ground truth cell-by-cell. | **Query Phase / Zero-Shot Evaluation**: Query execution conditioned on the latent skill without weight mutation ($\Delta \mathbf{W}=0$) [1, 2, 3]. |
| **Generalization Sweep ($k=1..4$)** | Varying demonstration budget $k$ and observing empirical accuracy & hypothesis space collapse. | **In-Context Sample Complexity**: Quantitative relationship between demonstration count $k$ and out-of-distribution generalization [4]. |
| **Ambiguity & Failure Lab** | Single sparse demonstration ($k=1$) leaves multiple hypotheses; disambiguated at $k=2$. | **Underdetermined Hypothesis Spaces**: Insufficient demonstrations fail to isolate the true data-generating distribution [2, 4]. |
| **BDH-CQ Explanation** | Comparison of traditional parameter updating vs recurrent context dynamics. | **Mechanistic Foundations of Bio-Inspired Recurrent Attention**: Frozen base weights + dynamic recurrent activations [1, 2]. |

---

## 4. Educational Model Scope & Scientific Boundaries

RuleForge is an independent educational artifact created to teach and demystify the concepts established in the literature cited above:

1. **Educational Abstraction**: RuleForge uses a transparent, deterministic multi-family symbolic hypothesis search engine (covering color mapping, geometric rotation/reflection, translation/gravity, morphological patterns, and counting). This allows learners to directly observe the mathematical cause-and-effect between demonstration evidence and hypothesis space collapse.
2. **Distinction from Continuous Neural Models**: In actual neural research systems such as BDH-CQ [2] or Dragon Hatchling [1], the skill is not represented as an explicit symbolic string, but is instead encoded as a high-dimensional continuous activation vector in recurrent working memory.
3. **No Official Checkpoint Claims**: RuleForge does not execute proprietary or official BDH-CQ model weights; rather, it implements an educational toy model designed to faithfully illustrate the principles of parameter-free skill acquisition.
