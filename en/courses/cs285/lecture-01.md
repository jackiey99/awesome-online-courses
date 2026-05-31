---
lecture: 1
title: "Introduction: What is Deep Reinforcement Learning?"
course: CS285 Deep Reinforcement Learning
instructor: Sergey Levine
institute: UC Berkeley
year: Fall 2023
videos:
  - https://www.youtube.com/watch?v=SupFHGbytvA
  - https://www.youtube.com/watch?v=BYh36cb92JQ
  - https://www.youtube.com/watch?v=Ufww5pzc_N0
slides: https://rail.eecs.berkeley.edu/deeprlcourse/static/slides/lec-1.pdf
lang: en
---

# Lecture 1 · Introduction: What is Deep Reinforcement Learning?

> **One-line framing:** This is a course about *learning to make decisions from experience*. Lecture 1 is the motivation lecture, answering three questions: **what is RL**, **how is it fundamentally different from today's data-driven AI**, and **why it's worth studying now**. There are no equations here, but the framing sets the tone for the next 24 lectures.

---

## Learning Objectives

After reading these notes, you should be able to:

1. Explain the essential difference between RL and supervised learning in your own words (beyond "RL has no labels")
2. Sketch the RL interaction loop (agent ↔ environment, state/action/reward) and articulate why it breaks the $(x, y)$ assumptions of supervised learning
3. Trace RL's two intellectual lineages (animal psychology + control/optimization) and how they fuse into modern deep RL
4. Internalize the **emergence vs imitation** distinction that runs through the whole course
5. Restate Sutton's *Bitter Lesson* and explain why it emphasizes **learning + search**, not just learning
6. Know the course structure: 5 homeworks, final project, grading, key policies

---

## 1. The Opening Example: Teaching a Robot to Grasp (slides 2-4)

Sergey opens with a concrete, visceral problem: **how do you get a robotic arm to pick objects out of a bin of clutter?**

Input: monocular RGB camera image. Output: a set of $(x, y, z)$ grasp coordinates + gripper actuation.

![CS285 Lecture 1, slide 2](/cs285/lec-1/slide-02.png)
*Slide 2 · Two approaches to robot grasping. Left: 7-DoF arm + monocular RGB camera setup. Top-right (Option 1): hand-engineer rules per object morphology. Bottom-right (Option 2): cast as supervised learning from `(image, grasp)` pairs. Both routes are problematic.*

Two natural approaches:

- **Option 1: Hand-engineer.** Sit down, analyze: rigid objects grasp at the centroid, irregular ones at the center of mass, deformable ones need a pinch... The special cases explode. Every new object morphology means another if-else branch.
- **Option 2: Frame as ML.** Train a CNN to predict grasp points directly from images. Elegant — but there's a fatal problem: **where does the supervision come from?**

The hidden assumption of supervised learning is that you can always obtain $(image, optimal\_grasp)$ pairs. But think carefully:

> *"...even people can't necessarily determine grasp locations very well, because they're really a property of the physical interaction between the robot and its environment, not necessarily something that is very well informed by human intuition."*

Even *humans* can't reliably label "optimal grasps" — it's a property of the robot-environment physical interaction, not something human intuition has direct access to. **No ground truth → supervised learning is stuck.**

This is where RL's core idea enters (slides 3-4):

1. **Let the robots try grasping themselves**, recording each attempt
2. Each attempt has an **outcome label** (success / failure, or more generally a *reward*)
3. Apply an RL algorithm that **learns from these outcomes** — not by copying the data, but by **maximizing future rewards**

![CS285 Lecture 1, slide 4](/cs285/lec-1/slide-04.png)
*Slide 4 · The RL paradigm for grasping. Robots collect `(image, action, {success, failure})` data → RL algorithm learns → improved policy → more data. This is a **closed loop**, not the one-way `(x, y) → f(x)` pipeline of supervised learning.*

The pivot in step 3 is crucial: **RL is not copying data.** Supervised learning tries to make $f(x) \approx y$ (imitate the data). RL tries to make the policy **better than the average behavior in the data** — because most attempts in the data were failures, and imitating them would only give you a mediocre robot.

This example anchors the rest of the lecture. **Keep this image in mind: robots flailing around, labels are success/failure.**

---

## 2. What Is Modern AI Actually Doing? (slides 5-6)

Sergey now zooms out to position RL against the current AI landscape.

The headline AI breakthroughs of the last few years — text-to-image (diffusion), conversational LLMs (ChatGPT, Claude), protein structure (AlphaFold) — are all, at their core, doing the same thing: **density estimation at unprecedented scale**.

- Text-to-image: estimating $p_\theta(\mathbf{x} \mid \text{prompt})$
- Language models: estimating $p_\theta(\mathbf{x})$, where $\mathbf{x}$ is a token sequence
- These are massively scaled-up versions of the density estimation you learned in stats class

![CS285 Lecture 1, slide 6](/cs285/lec-1/slide-06.png)
*Slide 6 · A unified view of modern generative AI: it's all density estimation — $p_\theta(\mathbf{x})$ (bottom-left, unconditional) or $p_\theta(\mathbf{y} \mid \mathbf{x})$ (bottom-right, conditional). LLMs, text-to-image, protein folding — all the same family, just at extreme scale.*

There's a fundamental constraint hidden here: **you learn the distribution of the data.** What's in the data determines what your model can produce.

> *"...if the data consists of large amounts of images mined from the web... what you're really learning about is the kind of images that people put on the web... the kind of text that humans would have written."*

This capability is extraordinarily powerful — these models can produce "things that look like a person would have made them." **But that's also the ceiling**: they produce *human-like* outputs, not *better-than-human* solutions.

Keep this contrast handy:

| Dimension | Data-driven AI (supervised + density estimation) | Reinforcement Learning |
| --- | --- | --- |
| What's being learned | Distribution of the data | A policy that maximizes reward in an environment |
| Output goal | Look like the data (= humans) | Be better than the data |
| Evaluation criterion | Similarity to human work | Objective return |
| Iconic achievement | Pictures a human might paint | Moves no human would make (AlphaGo Move 37) |

---

## 3. The Two Lineages of Modern RL (slide 7)

Sergey does a short intellectual-history detour that's actually useful for understanding the algorithm taxonomy later.

![CS285 Lecture 1, slide 7](/cs285/lec-1/slide-07.png)
*Slide 7 · RL's two intellectual lineages. Top-left: B. F. Skinner (behaviorist psychology — gave us the agent-environment-reward framing). Bottom: Karl Sims's 1994 evolved creatures + Yuval Tassa's iLQG control (controls/optimization). Right: their fusion as deep RL — neural networks + agent-environment loop — produces systems like AlphaGo.*

Modern RL emerged from **two distinct disciplines**:

### Lineage A: "Reinforcement learning" in psychology

- Iconic figure: **B. F. Skinner** (behaviorist psychology)
- Core idea: animals adjust behavior in response to **rewards and punishments** in the environment
- What it bequeathed to CS RL: the **agent ↔ environment** interaction framework, and the concept of reward as a learning signal

### Lineage B: Control, optimization, evolutionary algorithms

- Iconic works: Karl Sims's 1994 *Evolved Virtual Creatures* (creatures whose body and behavior were jointly evolved by optimization); Yuval Tassa's 2012 iLQG-based humanoid trajectory optimization
- Core idea: **don't imitate humans** — let behaviors *emerge* from optimization that humans couldn't design
- What it bequeathed: framing decision-making as an **optimization problem** — you want optimal, not human-like

### Deep RL = Classical RL algorithms × Modern deep learning's optimization scale

Marry the "reward-driven learning" of Lineage A with the "large-scale optimization" of Lineage B, and let deep nets act as the function approximators. That's the protagonist of this course.

**Why this matters**: the course's algorithms cluster into two camps — one closer to dynamic programming / value functions (Lineage A, e.g. Q-learning), the other closer to policy optimization (Lineage B, e.g. policy gradients).

---

## 4. Emergence vs Imitation: The Philosophical Through-Line (slides 8, 27)

This is **the most important conceptual point** of the lecture. Read slowly:

![CS285 Lecture 1, slide 8](/cs285/lec-1/slide-08.png)
*Slide 8 · Two distinct kinds of "impressive". Left — AlphaGo's Move 37 is impressive because **no person would have played that move** (emergence). Right — generative AI is impressive because **its outputs look like things a person might have made** (imitation). These two flavors of "impressive" point at fundamentally different research directions.*

> **Generative AI is impressive *because it looks like something a person would make*.**
> **RL is impressive *because no person would have thought of it*.**

Concretely: AlphaGo's **Move 37** in the 2016 match against Lee Sedol baffled professional Go players. *No human would have played that move.* And yet AlphaGo, through reinforcement learning, "discovered" it as a strong move.

Sergey's argument for why this distinction matters:

> If we want truly flexible intelligence, we cannot get there by copying human behavior. We need algorithms that discover **the best solution to a task**, not merely **the solution a person would have taken**, because only such systems can respond intelligently in **novel situations**.

Hold this contrast in mind — every algorithm in this course is designed around the goal of **letting an agent discover behaviors that exceed the demonstrations**.

---

## 5. Course Logic & Logistics (slides 10-12)

> TL;DR of what this course covers.

### Topic map

| Unit | Topic | Key algorithms |
| --- | --- | --- |
| 1 | Foundations | Supervised → decisions; problem formulation; imitation learning |
| 2 | Model-free RL | Q-learning, policy gradient, actor-critic |
| 3 | Model-based RL | Planning, optimal control, sequence models |
| 4 | Advanced | Exploration, offline RL, inverse RL, RL ↔ probabilistic inference |
| 5 | Frontier | Meta-learning, transfer, hierarchical RL, invited talks |

### Grading

- **Homeworks 50%**: 5 programming assignments (imitation / policy gradient / Q-learning / actor-critic / model-based / offline RL, ~2 weeks each)
- **Final project 40%**: teams of 2-3, target a workshop-paper level result
- **Quizzes 10%**: one short quiz per lecture, take it within a week, two attempts (higher score counts)

### Policies worth flagging

- **No AI coding tools on homeworks** (Sergey: *"Don't use AI coding tools (I know...)"*)
- 5 total late days across all homeworks; exceeding them = no credit for that homework
- Final project has 3 feedback rounds: proposal → milestone → final report
- All assignments use PyTorch

---

## 6. Formalizing Reinforcement Learning (slides 13-15)

Now the formal definition.

### One-sentence definition

> RL is **(1) a mathematical formalism for learning-based decision-making** and **(2) a family of methods for learning decisions and control from experience**.

⚠️ **Keep these two layers separate.** RL is both a **problem** (a problem formulation) and a set of **solutions** (algorithms). You can solve RL problems with non-RL methods (e.g. evolutionary search), and you can apply RL tools to problems that don't fit the strict RL frame. **Don't conflate the problem with the solution.**

### Supervised learning recap

$$
\text{Given } \mathcal{D} = \{(\mathbf{x}_i, \mathbf{y}_i)\}, \quad \text{learn } f_\theta(\mathbf{x}) \approx \mathbf{y}
$$

Two implicit assumptions:

1. **i.i.d. data**: samples are independent and identically distributed
2. **Ground-truth labels**: every $\mathbf{x}$ has a known correct $\mathbf{y}$

### RL formulation

RL satisfies *neither* assumption. It's a **temporal loop**:

![CS285 Lecture 1, slide 15](/cs285/lec-1/slide-15.png)
*Slide 15 · Supervised learning vs RL, side by side. Left — supervised: given $(\mathbf{x}, \mathbf{y})$ pairs, learn $f_\theta(\mathbf{x}_i) \approx \mathbf{y}_i$. Right — RL: at each step you see $\mathbf{s}_t$, output $\mathbf{a}_t$, learn a policy $\pi_\theta : \mathbf{s}_t \to \mathbf{a}_t$ that maximizes $\sum_t r_t$. The key callout: **"pick your own actions"** — the agent generates its own training distribution.*

```
state s_t  →  agent  →  action a_t  →  environment  →  state s_{t+1}, reward r_t
                  ↑                                              ↓
                  └─── your past decisions shape your future ────┘
```

Formally:

- **Input**: $\mathbf{s}_t$ at each timestep
- **Output**: $\mathbf{a}_t$ at each timestep
- **Data**: trajectories $(\mathbf{s}_1, \mathbf{a}_1, r_1, \ldots, \mathbf{s}_T, \mathbf{a}_T, r_T)$
- **Goal**: learn a policy $\pi_\theta : \mathbf{s}_t \to \mathbf{a}_t$ that maximizes $\sum_t r_t$ (cumulative reward)

### Two fundamental differences from supervised learning

| Difference | Supervised | RL |
| --- | --- | --- |
| **Data distribution** | i.i.d. | **Previous outputs influence future inputs** — your past decisions determine which states you see next |
| **Supervision signal** | Each $x$ has a true $y$ | You only see the **reward of an outcome**, *not* which decision in the sequence caused it |

The second point is the **credit assignment problem**, and it's one of the deepest difficulties in RL.

#### Credit assignment intuition

Sergey gives a great analogy: imagine you failed a class. The action that *caused* the failure was not "checking your grade on CalCentral" — by then it was already determined. The cause was some action *much earlier* — maybe a midterm you didn't prepare for — that at the time you didn't realize would lead to failure.

RL algorithms must **retroactively** attribute later reward signals to earlier decisions. That's credit assignment.

---

## 7. What Kinds of Problems Can RL Solve? (slides 16-26)

Once you have the abstract framework, *nearly any decision problem* can be cast as RL:

| Problem | State | Action | Reward |
| --- | --- | --- | --- |
| Train a dog | Sight, smell | Muscle contractions | Treats |
| Robot running | Camera, IMU | Motor torques | Speed / reaching goal |
| Inventory management | Current stock | What to purchase | Profit |
| Atari | Game frames | Joystick | Game score |
| Self-driving | Sensor readings | Steering + throttle | Safe arrival |
| LLM dialogue (RLHF) | Conversation context | Next token / reply | Human preference score |
| Text-to-image | Current generation step | Next denoising step | Similarity to prompt |
| Chip placement | Already-placed components | Where to put next component | -congestion, -latency |

A few examples worth highlighting:

### Cathy Wu's Traffic Control (slide 21)

![CS285 Lecture 1, slide 21](/cs285/lec-1/slide-21.png)
*Slide 21 · Cathy Wu's traffic RL experiments. Left — circular track: realistic human-driver models spontaneously produce stop-and-go waves (small speed perturbations amplify). Right — same effect at a figure-eight intersection. The red car is the RL agent, optimizing the **whole ring's** average speed.*

On a circular track, even simulated human drivers spontaneously form **traffic jams** — small perturbations compound into stop-and-go waves.

Cathy trained **one car** with RL, where the reward was not its own speed but the **average speed of the entire ring**. The RL car learned to **slow itself down**, leaving buffer space behind it, which prevented jams from forming.

This is textbook emergence — human drivers don't volunteer to slow down. Only when "global throughput" is the reward does the algorithm discover this counterintuitive strategy.

### RLHF (slide 24)

![CS285 Lecture 1, slide 24](/cs285/lec-1/slide-24.png)
*Slide 24 · RLHF pipeline. Sample prompts → initial LM generates multiple replies → humans rank them → train a reward model on `{sample, reward}` pairs → use RL (PPO) to push the LM toward higher reward. This is how human preference gets injected into LLMs.*

The pipeline that made conversational LLMs (ChatGPT, Claude, etc.) actually useful:

1. Supervised fine-tune on instruction data
2. Collect human preferences over pairs of model outputs; train a **reward model**
3. Use RL (typically PPO) to optimize the LLM policy against the reward model

This is currently RL's highest-stakes application. The course will cover it later.

### RT-2 (Part 3)

Google's RT-2 shows the power of **pretraining + RL/IL fine-tuning**: train a VLM on internet-scale image-text data, then fine-tune on robot trajectory data so it outputs actions. The model can follow instructions like "put the banana on the answer to the math problem" — it inherits internet-scale common sense and grounds it to physical actions.

---

## 8. The Bitter Lesson: Why We Need Deep RL (slides 28-30)

Sergey strongly recommends Richard Sutton's 2019 essay [*The Bitter Lesson*](http://www.incompleteideas.net/IncIdeas/BitterLesson.html). Read it (10 minutes).

The central claim:

> *"The two methods that seem to scale arbitrarily are **learning** and **search**."*

Many readers misinterpret this as "compute + data is all that matters, algorithms don't." **That's wrong.** Sutton says learning AND **search** — not learning AND GPUs, not learning AND big data.

**Search, in Sutton's sense, means optimization / inference**: using computation to *infer* better conclusions, not just to *match* data you've already seen.

![CS285 Lecture 1, slide 30](/cs285/lec-1/slide-30.png)
*Slide 30 · Sutton's core claim: the two things that scale arbitrarily are **learning** and **search**. Learning (extract patterns from data → understand the world) and Search (use computation to extract inferences → emergent behavior) are **both required**. Deep learning alone won't get you there. Optimization without data only works in simulators.*

| | What it does | What it can't do alone |
| --- | --- | --- |
| **Learning** (deep learning's strength) | Extract patterns from data | Outputs are stuck *within* the data distribution |
| **Search** (RL's core) | Optimize / infer better decisions | Without learning, you don't know what the world looks like — only useful in simulators |

> *"Data without optimization doesn't allow us to solve new problems in new ways. Optimization without data is hard to apply to the real world outside of simulators."*

**Deep RL = Learning (deep nets) × Search (RL optimization)**. That's the *raison d'être* of this course.

---

## 9. "All ML Is Decision-Making" — A Reframing (slides 31-32)

Sergey lands an almost philosophical claim:

> *"We need machine learning for one reason and one reason only — that's to produce **adaptable and complex decisions**."*

The framing parallels neuroscientist Daniel Wolpert's famous line: *"we have a brain for one reason and one reason only — to produce adaptable and complex movements."*

Through this lens, **every machine learning problem is fundamentally a decision problem**:

- Controlling a robot → obviously a decision (which joint torques)
- Self-driving → obviously a decision (steering)
- **Image classification** → also a decision! The label "cat" is never the endpoint — *something downstream* uses that label: traffic routing, security dispatch, autonomous driving. Those downstream consequences are what *really* determine what the label should be.

Accept this and **all of ML becomes "RL problems in disguise"** — we just sometimes happen to have labeled training data that lets us approximate the RL problem with supervised learning.

This view is intentionally provocative (Sergey himself flags it as "controversial"). But it's worth holding in your head because every research direction in this course is built on it.

---

## 10. The Single-Algorithm Hypothesis (slides 33-37)

Sergey pushes one step further: maybe intelligence isn't an assembly of N specialized modules — maybe it's **one general learning algorithm** that, given different inputs, produces all the apparent specialization we see.

Evidence (slide 36):

- **Seeing with your tongue**: blind individuals using an electrode array on the tongue (connected to a camera) learn to "see" — brain tissue meant for one input modality can repurpose itself for another
- **Ferret cortical rewiring**: if you surgically reroute the optic nerve to the auditory cortex, the auditory cortex eventually learns to process visual input

This suggests the cortex has substantial **general-purpose learning capacity**, not modality-specific dedicated algorithms.

If you accept this, what does a general intelligence need?

- **Interpret rich sensory inputs** → high-capacity models (deep learning)
- **Choose complex actions** → reinforcement learning (the mathematical framework for decisions)

So — **Deep RL is not just "a tool for robotics." It's a candidate framework for building general intelligence.**

Sergey closes with a quote from Alan Turing (1950) that he treats as the course's guiding spirit:

![CS285 Lecture 1, slide 38](/cs285/lec-1/slide-38.png)
*Slide 38 · The closing slide — Turing's 1950 *Computing Machinery and Intelligence*. Don't try to engineer the adult mind by writing down all its rules; instead build a learner (the "child"), expose it to experience, and the adult mind emerges. This is precisely the deep RL research stance.*

> *"Instead of trying to produce a program to simulate the adult mind, why not rather try to produce one which simulates the child's? If this were then subjected to an appropriate course of education, one would obtain the adult brain."*
> — Alan Turing

---

## Pitfalls & Common Misconceptions

1. **"RL is just supervised learning with a reward signal."** ❌
   - Reward ≠ label. A label tells you "the right output is $y$." A reward tells you "this outcome was good/bad" — but says nothing about *which decision* produced it. That's the credit assignment problem.

2. **"If I have a reward function, I can do RL."** ❌
   - You also have to solve: (a) where the data comes from (RL agents must *explore*), (b) how to attribute rewards back to actions, (c) the exploration-exploitation tradeoff. These dominate the algorithm design later.

3. **"Deep RL = RL + neural networks."** ✅ but incomplete
   - More precise: deep RL = **learning + search**. Deep nets handle learning (representations from data); RL algorithms handle search (optimizing decisions on those representations).

4. **"The Bitter Lesson says algorithms don't matter, just scale compute."** ❌
   - Sutton's exact phrasing is "learning **and** search." Supervised learning is learning; RL/planning is search. **Both are required.**

5. **"Generative AI is already this strong — why bother with RL?"**
   - Generative AI gives you "what humans would have produced." It can't give you "solutions better than humans." AlphaGo's Move 37, AlphaFold's folding predictions, RLHF making LLMs usable — all of these are RL (or RL derivatives). **Without the RL layer, AI is essentially advanced ctrl-c / ctrl-v.**

---

## Exercises & Reflection Questions

- **🟢 Easy**: Frame these as RL (state / action / reward / policy):
  - Choosing what to wear in the morning
  - A recommender system suggesting videos
  - A compiler picking optimization passes

- **🟡 Medium**: Read Sutton's [*The Bitter Lesson*](http://www.incompleteideas.net/IncIdeas/BitterLesson.html). Answer: why does Sutton pair *search* with *learning*, instead of emphasizing *learning* alone?

- **🟡 Medium**: Pick a recent generative AI application (DALL-E, ChatGPT). Identify (a) things it does well that fit the "imitation" paradigm, (b) things it does poorly that might require RL.

- **🔴 Hard**: In Cathy Wu's traffic example, the RL car eliminated jams by slowing itself down. As the algorithm designer:
  - How would you define the reward (individual speed vs global average)?
  - If reward = "minimize total commute time," what emergent behaviors might appear?
  - Would the policy differ if there's *one* RL car vs *all* cars being RL agents?

---

## Further Reading

- 📄 [Sutton, *The Bitter Lesson* (2019)](http://www.incompleteideas.net/IncIdeas/BitterLesson.html) — the spiritual undercurrent of the entire course
- 📄 [Sutton & Barto, *Reinforcement Learning: An Introduction* (2nd ed.)](http://incompleteideas.net/book/the-book-2nd.html) — Chapter 1 pairs beautifully with this lecture
- 🎥 Karl Sims, *Evolved Virtual Creatures* (1994) — the video referenced in slide 7
- 📄 Silver et al., *Mastering the Game of Go without Human Knowledge* (2017) — AlphaGo Zero; see how emergence actually happens
- 📄 Wu et al., *Flow: Architecture and Benchmarking for RL in Traffic Control* — the traffic RL work cited in the lecture

---

## Next Up

Lecture 2 dives into the first concrete method: **Imitation Learning**. It's RL's "appetizer" — using supervised learning to mimic expert trajectories, and exploring when it works and when it breaks. Lecture 2 will give you a visceral understanding of what "i.i.d. assumption violation" really means.
