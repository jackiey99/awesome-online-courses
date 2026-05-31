---
lecture: 1
title: "导论：什么是深度强化学习"
course: CS285 Deep Reinforcement Learning
instructor: Sergey Levine
institute: UC Berkeley
year: Fall 2023
videos:
  - https://www.youtube.com/watch?v=SupFHGbytvA
  - https://www.youtube.com/watch?v=BYh36cb92JQ
  - https://www.youtube.com/watch?v=Ufww5pzc_N0
slides: https://rail.eecs.berkeley.edu/deeprlcourse/static/slides/lec-1.pdf
lang: zh
---

# Lecture 1 · 导论：什么是深度强化学习

> 一句话定位：这是一门关于"如何从经验中学习决策"的课。本节是动机课，回答三个问题——**什么是 RL**、**它与生成式 AI 有何根本不同**、**为什么值得学**。整节课没有公式，但它给后面 24 节课定调，值得认真消化。

---

## 本节学习目标

读完本节笔记，你应该能：

1. 用自己的话解释 RL 与监督学习的本质区别（不止"有没有 label"这么简单）
2. 写出 RL 的基本循环（agent ↔ environment 的 state/action/reward 流），并指出它和监督学习的 $(x, y)$ 范式如何不兼容
3. 说清 RL 现代研究的两条历史血脉（心理学 + 控制/优化），以及它们如何融合成 deep RL
4. 理解 **emergence vs imitation** 这条贯穿全课的哲学线
5. 复述 Richard Sutton 的 "Bitter Lesson" 为什么强调 **learning + search**，而不仅仅是 learning
6. 掌握课程结构、作业安排、评分方式

---

## 1. 一个引子：教机器人抓东西（slides 2-4）

Sergey 整门课的开场是一个具体到不能再具体的问题：**怎么让机械臂从一堆杂物里把东西抓出来**。

输入：单目 RGB 相机的图像；输出：一组 $(x, y, z)$ 抓取坐标 + 夹爪动作。

两种思路：

- **Option 1：手工设计**。你坐下来分析问题——刚性物体抓中间、不规则物体抓质心、变形物体用捏的……你会发现 special case 多到崩溃。每多一种物体形态就要加一段 if-else。
- **Option 2：当作机器学习问题**。让 CNN 直接从图像预测抓取点。这听上去优雅，但有个致命问题：**监督信号从哪来**？

第二种思路里隐藏着监督学习的一个潜在假设："总能弄到一份 $(image, optimal\_grasp)$ 的数据集"。但你仔细想——

> *"...even people can't necessarily determine grasp locations very well, because they're really a property of the physical interaction between the robot and its environment, not necessarily something that is very well informed by human intuition."*

人类自己都说不准"最优抓取点"是什么——它是机器人和物体之间物理交互的属性，不是人类直觉能标注的东西。**找不到 ground truth 标签**，监督学习的范式就跑不动。

这时候 RL 的核心思路登场（slides 3-4）：

1. **让机器人自己去抓**，把过程录下来
2. 每次尝试有一个**结果标签**（成功 / 失败，更一般地说是一个 reward）
3. 用 RL 算法**从这些 outcome 标签里学出策略**，目标不是模仿数据里的行为，而是**最大化未来的 reward 总和**

注意第 3 步的关键转折：**RL 不是在拷贝数据**。监督学习的目标是让 $f(x) \approx y$（模仿数据），RL 的目标是让策略**比数据里的平均行为更好**——因为数据里大部分是失败的尝试，模仿它们只会得到平均水平的机器人。

这个例子贯穿整节课，是理解后面所有抽象定义的锚。**记住这个画面：一堆机器人自己抓东西，标签是 success/failure。**

---

## 2. 现在的 AI 都在干什么？（slides 5-6）

Sergey 接下来花了一段时间讲"非 RL 的现代 AI"，目的是把 RL 放在更大的图景里对照。

最近几年的 AI 突破——文生图 (Diffusion)、对话 LLM (ChatGPT、Claude)、蛋白质结构 (AlphaFold) ——本质上都在干同一件事：**density estimation（密度估计）**。

- 文生图：在估计条件分布 $p_\theta(\mathbf{x} \mid \text{prompt})$
- 语言模型：在估计 $p_\theta(\mathbf{x})$，其中 $\mathbf{x}$ 是文本序列
- 一切都是大学统计课里的密度估计的**超大规模版本**

这有一个根本性的暗含约束：**你学的是数据分布。** 数据来自哪，你的模型就只能产出"长得像那一类数据"的东西。

> *"...if the data consists of large amounts of images mined from the web... what you're really learning about is the kind of images that people put on the web... the kind of text that humans would have written."*

这种能力很强大——它能产出"看上去像人会画的画 / 会写的文章"。**但这正是它的天花板**：它只能产出"人会做的事"，做不出"人想不到的事"。

记住这条对比线：

| 维度 | 数据驱动 AI（监督 + 密度估计） | 强化学习 |
| --- | --- | --- |
| 学什么 | 数据的分布 | 在环境中最大化 reward |
| 输出的目标 | 像数据（人类）一样 | 比数据更好 |
| 评价标准 | 与人类作品相似度 | 客观回报 |
| 经典效果 | 像人画的画 | 人想不到的解法（AlphaGo Move 37） |

---

## 3. 强化学习的两条血脉（slide 7）

Sergey 在这里做了一个学术史的拆解，理解这一点对后面的算法分类很有帮助。

现代 RL 其实是**两个学科融合的产物**：

### 血脉 A：心理学的"强化学习"

- 代表人物：**B. F. Skinner**（行为主义心理学家）
- 核心思想：动物在环境中根据**奖励/惩罚**调整行为
- 给我们的遗产：**Agent ↔ Environment** 这个交互框架，以及 reward 作为学习信号的概念

### 血脉 B：控制论、最优化、进化算法

- 代表作品：Karl Sims 1994 年的 *Evolved Virtual Creatures*（用进化算法优化虚拟生物的形态和行为）；Yuval Tassa 2012 年的 iLQG 模型预测控制
- 核心思想：**不去模仿人类**，而是**从优化目标里涌现出人类设计不出的行为**
- 给我们的遗产：把决策当成一个**优化问题**——你要的不是模仿，是最优解

### Deep RL = 经典 RL 算法思想 × 现代深度学习的优化规模

把心理学血脉的"reward 驱动学习"和控制论血脉的"大规模优化"结合起来，再用深度网络做 function approximator，就是这门课的主角。

**为什么这个区分重要**：你会发现这门课的算法分两大派——一派偏 dynamic programming / value function（贴近 A 血脉，比如 Q-learning），一派偏 policy optimization（贴近 B 血脉，比如 policy gradients）。

---

## 4. Emergence vs Imitation：贯穿全课的哲学线（slides 8, 27）

这是本节课**最重要的一个观念**，请慢读：

> **生成式 AI 的"惊艳"，是惊艳于"像人做的"。**
> **RL 的"惊艳"，是惊艳于"没人想过的"。**

具体到 AlphaGo 对李世石那盘棋的 **Move 37**：那一步棋让所有围棋职业棋手都困惑，因为没有人会下那一手。但 AlphaGo 自己通过强化学习"发现"了这个解。

为什么这个区分对 AI 研究关键？Sergey 的论点是：

> 如果我们想要真正灵活的智能（flexible intelligence），仅靠"复制人类行为"是走不到的。我们必须有能发现**新解**的算法，因为只有这样的系统在**新场景**下才能智能地反应。

记住这条对照线，你会发现整门课的算法都在围绕这个目标设计：**怎么让 agent 发现比人示范更好的解**。

---

## 5. 课程逻辑与作业安排（slides 10-12）

> 如果你只是想速览这门课讲什么，本节是 TL;DR。

### 内容版图

| 单元 | 主题 | 关键算法 |
| --- | --- | --- |
| 1 | 基础 | 监督学习 → 决策；问题定义；imitation learning |
| 2 | Model-free RL | Q-learning、Policy Gradient、Actor-Critic |
| 3 | Model-based RL | Planning、Optimal Control、序列模型 |
| 4 | Advanced | Exploration、Offline RL、Inverse RL、与概率推断的关系 |
| 5 | 前沿 | Meta-learning、Transfer、Hierarchical RL、研究讲座 |

### 评分

- **作业 50%**：共 5 次编程作业（imitation / policy gradient / Q-learning / actor-critic / model-based / offline RL，每两周一次）
- **Final Project 40%**：可以 2-3 人组队，水平接近 workshop paper
- **Quizzes 10%**：每节课一个小 quiz

### 几个细节

- **作业一律不允许用 AI 编码工具**（Sergey 原话："Don't use AI coding tools (I know...)"）
- 总共 5 个 late days，用完就不能补交
- Final project 有 proposal + milestone + final report 三轮反馈
- 用 PyTorch 训练神经网络

---

## 6. 强化学习的形式化定义（slides 13-15）

终于到正式定义。

### 一句话定义

> RL 是 **(1) 一套关于"基于学习的决策"的数学形式化**，**(2) 一套从经验中学习决策与控制的方法论**。

⚠️ **务必区分这两层**：RL 既是一个**问题**（problem formulation），也是一组**解法**（algorithms）。你可以用非 RL 的方法（比如 evolutionary search）去解 RL 的问题，也可以把 RL 的工具用到非 RL 的问题上。**不要把"问题"和"解"混为一谈。**

### 监督学习的范式

$$
\text{Given } \mathcal{D} = \{(\mathbf{x}_i, \mathbf{y}_i)\}, \quad \text{learn } f_\theta(\mathbf{x}) \approx \mathbf{y}
$$

它的两个隐含假设：

1. **i.i.d.（独立同分布）**：数据点之间互不影响，标签生成机制对所有样本相同
2. **Ground-truth labels**：每个 $\mathbf{x}$ 都有对应的 $\mathbf{y}$ 真值

### RL 的范式

RL 没有这两个假设。它是一个**时序循环**：

```
state s_t  →  agent  →  action a_t  →  environment  →  state s_{t+1}, reward r_t
                  ↑                                              ↓
                  └─────────── 影响未来输入 ─────────────────────┘
```

形式化地：

- **Input**: $\mathbf{s}_t$（每个时间步的 state）
- **Output**: $\mathbf{a}_t$（每个时间步的 action）
- **Data**: 轨迹 $(\mathbf{s}_1, \mathbf{a}_1, r_1, \ldots, \mathbf{s}_T, \mathbf{a}_T, r_T)$
- **Goal**: 学一个 policy $\pi_\theta : \mathbf{s}_t \to \mathbf{a}_t$，使得 $\sum_t r_t$（累积奖励）最大

### 与监督学习的两个根本差异

| 差异 | 监督学习 | RL |
| --- | --- | --- |
| **数据分布** | i.i.d. | **previous outputs influence future inputs**（你过去的决策影响你以后能看到什么 state） |
| **监督信号** | 每个 $x$ 有真值 $y$ | 只知道某个 outcome 的 reward 是多少，**不知道哪一步行为造成了它** |

第二点叫 **credit assignment problem（信用分配问题）**，是 RL 算法设计的核心难点之一。

#### Credit assignment 直觉例子

Sergey 用了一个很贴切的类比：你期末挂科了。让你挂科的并不是"你查成绩单"这个动作（你查成绩单时已经挂了），而是**学期中某次考试没考好**——那个动作发生时，你完全没意识到它将导致挂科。

RL 算法必须**回溯式地**把后来的低 reward 归因到前面的某个决策上。这就是 credit assignment。

---

## 7. RL 能解决什么问题？（slides 16-26）

把上面那个抽象框架往具体问题上套，几乎所有"决策"问题都能表达成 RL：

| 问题 | State | Action | Reward |
| --- | --- | --- | --- |
| 训练狗子做特技 | 视觉、嗅觉 | 肌肉收缩 | 零食 |
| 机器人跑步 | 摄像头、IMU | 电机扭矩 | 速度 / 是否到达 |
| 仓库库存管理 | 当前库存 | 采购量 | 利润 |
| 玩 Atari | 游戏画面 | 摇杆动作 | 游戏分数 |
| 自动驾驶 | 传感器 | 方向盘 + 油门 | 是否安全到达 |
| LLM 对话 (RLHF) | 上下文 | 下一个 token / 回复 | 人类偏好打分 |
| 文生图 | 当前生成步 | 下一去噪步 | 与 prompt 相似度 |
| 芯片设计 | 已布局的元件 | 下一个元件放哪 | -拥塞、-延迟 |

注意几个特别精彩的例子：

### Cathy Wu 的交通控制（slide 21）

在环形跑道上，一堆人类驾驶模型的车会**自发形成 traffic jam**（你即使匀速开圆圈，相互的微小延迟也会堆叠成堵车）。

Cathy 让其中**一辆车**用 RL 学策略，目标不是它自己开多快，而是**让整圈所有车的平均速度最高**。结果这辆 RL 车学会的策略是：**主动放慢自己**，给后车留出 buffer，反而消除了 traffic jam。

这是典型的"emergence"——人类司机不会主动放慢；只有当你把"整体最优"作为 reward 时，算法才能"发现"这种反直觉策略。

### RLHF（slide 24）

对话 LLM（ChatGPT、Claude 等）的关键一步：

1. 先做有监督 fine-tuning
2. 让人类对模型生成的多个回复打分，训练一个 **reward model**
3. 用 RL（PPO）把 LLM 当 agent，去最大化 reward model 的打分

这是 RL 当下最受关注的应用，本课程后期会专门讲。

### RT-2（part 3）

Google 的 RT-2 模型展示了**预训练 + RL 微调**的威力：先在互联网图文数据上训练一个 VLM，再用机器人轨迹数据 fine-tune 让它输出动作。结果模型能听懂"把香蕉放在数学题答案上"这种需要互联网常识的指令——这是预训练模型给 robot policy "注入"的语言/常识能力。

---

## 8. Bitter Lesson：为什么需要 deep RL（slides 28-30）

Sergey 在这里隆重推荐 Richard Sutton 2019 年的短文 [*The Bitter Lesson*](http://www.incompleteideas.net/IncIdeas/BitterLesson.html)（强烈建议你点进去读，10 分钟）。

文章的中心论点：

> *"The two methods that seem to scale arbitrarily are **learning** and **search**."*

很多人读这篇时**误读了一半**，以为它说的是"算力 + 数据就够了，算法不重要"。**不对**。Sutton 说的是 learning AND **search**——不是 learning AND GPUs，也不是 learning AND big data。

**Search 在 Sutton 的语境里 = 优化 / 推断**：用计算去**推**出更好的结论，而不是只去**匹配**已经见过的数据。

具象一点：

| | 作用 | 不足 |
| --- | --- | --- |
| **Learning**（深度学习当下擅长） | 从数据中提取模式 | 只能输出"分布内"的东西 |
| **Search**（RL 的核心机制） | 用计算去优化、推断更好的决策 | 没有学习就不知道世界长什么样，只在仿真器里有用 |

> *"Data without optimization doesn't allow us to solve new problems in new ways. Optimization without data is hard to apply to the real world outside of simulators."*

**Deep RL = Learning (deep nets) × Search (RL optimization)**。这是这门课存在的根本理由。

---

## 9. "机器学习 = 决策制定"的颠覆性视角（slides 31-32）

Sergey 最后抛出一个有点哲学的观点：

> *"We need machine learning for one reason and one reason only — that's to produce **adaptable and complex decisions**."*

类比神经科学家 Daniel Wolpert 的名言："we have a brain for one reason and one reason only — to produce adaptable and complex movements"。

这个视角下，**所有机器学习问题本质上都是决策问题**：

- 控制机器人 → 显然是决策（关节怎么动）
- 自动驾驶 → 显然是决策（方向盘怎么打）
- **图像分类** → 也是决策！"标签是 cat" 不是终点，下游一定有人/系统**根据这个标签去做事**。它最终会被用于路由交通 / 调用安保 / 触发自动驾驶，而这些下游使用方式才是真正决定 label 该是什么的东西。

如果接受这个视角，**所有 ML 问题其实都是"伪装成监督学习的 RL 问题"**——只是有些幸运的情况下，我们能拿到带 label 的训练数据，让监督学习当成 RL 的近似来用。

这个观点比较激进，未必每个人都同意（Sergey 本人也说了 *"this will be a controversial statement"*）。但记住它，因为这门课所有的研究取向都建立在这个信念之上。

---

## 10. Single Algorithm Hypothesis（slides 33-37）

Sergey 进一步抛出一个更激进的猜测：**或许智能不是 N 个模块的拼装，而是一个统一的学习算法在不同输入上的体现**。

证据（slide 36）：

- **舌头视觉**：盲人通过舌头上的电极阵列（连接到摄像头）能学会"看"——大脑的某块组织可以处理与它原本无关的感官输入
- **雪貂实验**：把视觉皮层和听觉皮层"对调"接线后，听觉皮层依然能学会处理视觉信息

这说明大脑皮层有相当程度的**通用学习能力**，不是每种感官都有"专用算法"。

如果接受这个假说，"通用智能"需要什么？

- **解读复杂感官输入** → 大容量模型（深度学习）
- **选择复杂动作** → reinforcement learning（决策的数学框架）

所以——**Deep RL** 不是"机器人控制的一个工具"，而是**构建通用智能的候选框架**。

最后 Sergey 引用了 Alan Turing 1950 年的一句话（这门课的精神 quote）：

> *"Instead of trying to produce a program to simulate the adult mind, why not rather try to produce one which simulates the child's? If this were then subjected to an appropriate course of education, one would obtain the adult brain."*
> — Alan Turing

---

## 易混点 & 常见误解

1. **"RL 就是有 reward 的监督学习"** ❌
   - reward 不等同于 label。label 告诉你"应该输出 y"，reward 只告诉你"这个 outcome 多好"，**没说哪一步行为造成的它**。这就是 credit assignment 的根源。

2. **"我有 reward function 就能跑 RL"** ❌
   - 还要解决：(a) 数据从哪来（RL 要 agent 自己探索）；(b) 如何用 reward 反向归因到具体动作；(c) 探索-利用如何权衡。这些是后面所有算法的核心。

3. **"Deep RL = RL + 深度网络"** ✅但不全面
   - 更准确的说法：deep RL 是 **learning + search** 的结合体。深度网络负责从大数据里学世界的表征（learning），RL 算法负责用优化在表征上做决策推断（search）。

4. **"Bitter Lesson 说算法不重要，只要算力够"** ❌
   - Sutton 的原话是 "learning **AND** search"。监督学习是 learning，RL/planning 是 search。**两者缺一不可**。

5. **"生成式 AI 已经这么强了，还学 RL 干嘛"**
   - 生成式 AI 只会产出"像人会做的事"，无法产出"比人更好的解"。AlphaGo 的 Move 37、AlphaFold 的折叠预测、RLHF 让 LLM 真正可用——这些都是 RL（或其衍生）做的。**没有 RL 这一层，AI 永远是"高级 ctrl-c/ctrl-v"。**

---

## 练习与思考题

- **🟢 简单**：用本节课的语言（state / action / reward / policy）描述以下问题：
  - 你早上决定穿什么衣服
  - 推荐系统给你推视频
  - 编译器选择优化策略

- **🟡 中等**：阅读 Richard Sutton 的 [*The Bitter Lesson*](http://www.incompleteideas.net/IncIdeas/BitterLesson.html)。回答：为什么 Sutton 把 search 和 learning 并列，而不是只强调 learning？

- **🟡 中等**：找一个最近的生成式 AI 应用（比如 DALL-E、ChatGPT），思考：哪些它做得好的事情属于 "imitation 范式" 解决的？哪些它做不好的事情可能需要 RL 的介入？

- **🔴 进阶**：本节课提到 Cathy Wu 的交通 RL 例子里，单一 RL 车通过"主动放慢"消除了 jam。如果你是这个系统的算法设计者：
  - reward function 该怎么定义（个体速度 vs 全局平均速度）？
  - 如果 reward 是 "minimize total commute time"，会出现什么 emergent 行为？
  - 如果环境里只有一辆 RL 车 vs 所有车都是 RL，结果会不会很不一样？

---

## 延伸阅读

- 📄 [Sutton, *The Bitter Lesson* (2019)](http://www.incompleteideas.net/IncIdeas/BitterLesson.html) — 整门课的精神底色
- 📄 [Sutton & Barto, *Reinforcement Learning: An Introduction* (2nd ed.)](http://incompleteideas.net/book/the-book-2nd.html) — RL 圣经，Chapter 1 与本节高度互补
- 🎥 Karl Sims, *Evolved Virtual Creatures* (1994) — 课件里那个进化虚拟生物的视频
- 📄 Silver et al., *Mastering the Game of Go without Human Knowledge* (2017) — AlphaGo Zero 论文，看 emergence 怎么发生
- 📄 Wu et al., *Flow: Architecture and Benchmarking for RL in Traffic Control* — 课上提到的交通 RL 工作

---

## 下节预告

Lecture 2 进入第一个具体方法：**Imitation Learning**。它是 RL 的"前菜"——用监督学习的方式去模仿专家轨迹，看看在哪些条件下能 work，哪些条件下会崩。这会让你深刻体会到本节课讨论的"i.i.d. 假设违背"到底是什么意思。
