/* ============================================================
   How to RSI — 内容数据
   RSI/DSH 内容整理自 deepseek-harness 仓库文档:AGENTS.md、docs/architecture.md、
   docs/cordis-primer.md、docs/testing.md、docs/glossary.md、packages/README.md 等。
   ============================================================ */

var DSH = {};
window.DSH = DSH;

/* ---------- 数据说明 ---------- */
/* 包/工具清单是上游仓库的时点快照;上游演化后需同步本文件。
   刷新方法:以 packages/README.md 的分组结构为准,实测列出各 packages/<组>/ 目录;
   工具条目以 docs/tool-catalog.md 为准。 */
DSH.meta = {
  snapshotCommit: null,
  note: '历史教学清单：原始生成日期与上游 commit 未记录。API 与包结构以目标版本文档为准。',
};

/* ---------- 模块(学习路径分区) ---------- */
DSH.modules = [
  { id: 'north', name: '基础概念', desc: '什么是 RSI，它在真实系统里走过了什么', icon: 'target' },
  { id: 'cap', name: '机制与评测', desc: '把 RSI 拆成机制清单，评测是门槛，载体选型是落点', icon: 'layers' },
  { id: 'align', name: '对齐与安全', desc: '让 AI 做我们真想让它做的事：失败模式、监控、元游戏、多 agent 风险、忏悔与工程护栏', icon: 'target' },
  { id: 'dsh', name: 'DSH 源码与练习', desc: '以 DSH 为案例学习运行时组合；具体 API 按版本复核', icon: 'wrench' },
];

/* ---------- 章节 ---------- */
DSH.chapters = [
  { id: 'home', num: '⌂', title: '首页', short: '首页', blurb: '阅读入口与全部章节。', icon: 'home', module: 'north' },
  { id: 'rsi', num: '01', title: '什么是 RSI', short: '什么是 RSI', blurb: '工作定义、概念源流与修改对象。', icon: 'target', module: 'north' },
  { id: 'godel', num: '02', title: '哥德尔机谱系', short: '哥德尔机', blurb: '形式证明、经验自改、开放档案与谱系估计的证据边界。', icon: 'book', module: 'north' },
  { id: 'capmap', num: '03', title: 'RSI 能力拆解', short: '能力拆解', blurb: 'RSI 六大机制(自改/状态/评估/沙箱/目标/护栏)与 DSH 包级映射。', icon: 'layers', module: 'cap' },
  { id: 'eval', num: '04', title: 'Agent 评测方法', short: '评测', blurb: '任务、评分器、重复运行与评测门模拟器。', icon: 'target', module: 'cap' },
  { id: 'carriers', num: '05', title: '载体对比', short: '载体对比', blurb: 'Claude Code / Codex / pi / ACP / 自写 harness：谁允许你改运行时。', icon: 'boxes', module: 'cap' },
  { id: 'alignment', num: '06', title: 'AI 对齐的目标与方法', short: '对齐', blurb: '外层与内层对齐、失败模式和研究方法。', icon: 'target', module: 'align' },
  { id: 'cot', num: '07', title: '推理可监控性', short: 'CoT 监控', blurb: '推理链监控指标、实验结果与适用限制。', icon: 'loop', module: 'align' },
  { id: 'metagaming', num: '08', title: '模型对评测环境的推断', short: '元游戏', blurb: '模型如何推断打分与监督环境。', icon: 'target', module: 'align' },
  { id: 'hfincident', num: '09', title: 'Hugging Face 事件', short: 'HF 事件', blurb: '按公开报告重建隔离失效与跨 Agent 信息传递。', icon: 'flask', module: 'align' },
  { id: 'confessions', num: '10', title: 'Confessions：自述奖励', short: '忏悔机制', blurb: '将任务奖励与如实报告行为的奖励分开。', icon: 'target', module: 'align' },
  { id: 'safety', num: '11', title: '安全与护栏', short: '安全与护栏', blurb: 'RSI 实验的五层防御：审批、回滚、沙箱、日志、评估。', icon: 'ruler', module: 'align' },
  { id: 'intro', num: '12', title: '认识 DSH', short: '认识 DSH', blurb: '什么是 Agent Harness、一切皆插件、快速上手、仓库鸟瞰。', icon: 'info', module: 'dsh' },
  { id: 'cordis', num: '13', title: 'Cordis 核心', short: 'Cordis 核心', blurb: '插件、服务、inject、五种分发模式、可逆效果——附模拟器。', icon: 'puzzle', module: 'dsh' },
  { id: 'architecture', num: '14', title: '架构总览', short: '架构总览', blurb: 'Profile/Bundle/Patch 分层引导、核心包与 ctx 键、三大事件域。', icon: 'layers', module: 'dsh' },
  { id: 'loop', num: '15', title: 'Agent Loop 剖析', short: 'Agent Loop', blurb: '逐帧播放一个回合：turn/start 到 turn/end 的生命周期。', icon: 'loop', module: 'dsh' },
  { id: 'session', num: '16', title: '会话与持久化', short: '会话与持久化', blurb: '模型可见 ⟺ 已记录；格式版本与迁移链。', icon: 'db', module: 'dsh' },
  { id: 'packages', num: '17', title: '包版图探索', short: '包版图', blurb: '包清单探索器；数量从当前页面数据计算。', icon: 'boxes', module: 'dsh' },
  { id: 'tools', num: '18', title: '工具与能力接缝', short: '工具系统', blurb: '工具流水线、Capability Seam 三角、全部模型工具目录。', icon: 'wrench', module: 'dsh' },
  { id: 'conventions', num: '19', title: '工程规范', short: '工程规范', blurb: '仓库级约束：效果即注册、响亮失败、防御性模式。', icon: 'ruler', module: 'dsh' },
  { id: 'testing', num: '20', title: '测试体系', short: '测试体系', blurb: '测试分层：从单测到录制回放快照。', icon: 'flask', module: 'dsh' },
  { id: 'workflow', num: '21', title: '开发工作流', short: '开发工作流', blurb: '环境搭建、命令速查、PR 与 Agent Notes 文化。', icon: 'git', module: 'dsh' },
  { id: 'glossary', num: '22', title: '术语表', short: '术语表', blurb: '领域词汇表：seam、scope、turn/step/round、Ralph……', icon: 'book', module: 'dsh' },
  { id: 'quiz', num: '23', title: '知识闯关', short: '知识闯关', blurb: '知识测验，即时反馈 + 解析。', icon: 'target', module: 'dsh' },
  { id: 'practice', num: '24', title: '实战关卡', short: '实战关卡', blurb: '五个递进 RSI 实验：第一个运行时插件到长期记忆。', icon: 'flask', module: 'dsh' },
  { id: 'evalproject', num: '25', title: '实战项目：自改评测管线', short: '实战项目', blurb: '三阶段项目：黄金任务集 → eval runner → keep/rollback 门。', icon: 'wrench', module: 'dsh' },
];

/* ---------- 评测范式对照(第 04 章) ---------- */
DSH.evalParadigms = [
  { name: '证明(Proof)', who: '形式化验证器', what: '改动的净收益可证', layer: '正确性/逻辑', games: '依赖公理、目标建模与验证器；证明搜索有成本', used: 'Gödel Machine 2003' },
  { name: '基准分数(Benchmark)', who: '评测管线(独立于被改者)', what: '改动在任务集上的通过率', layer: '结果级正确性', games: '可作弊:过拟合集、伪造日志、删检测标记', used: 'DGM 2025' },
  { name: '谱系指标(CMP)', who: '评测管线 + 后代统计', what: '用支系观测估计未来潜力；估计不等于理论 CMP', layer: '谱系/长期', games: '继承评分器漏洞，并受搜索预算和选择偏差影响', used: 'HGM arXiv v3' },
  { name: '人类评审(Review)', who: '人(审批门禁)', what: '改动意图与副作用', layer: '语义/意图', games: '慢、不可扩展、会疲劳', used: 'DSH cordis_run 审批' },
];

/* ---------- 常见评测基准速览(第 04 章,教学整理) ---------- */
DSH.evalBenchmarks = [
  { name: 'SWE-bench Verified', what: '500 题:OpenAI 联合 93 名开发者从 1699 条样本中人工筛出的真实 GitHub issue', lvl: 'L1', note: '行业标尺;固定版本、模型、任务子集和预算后才可比较论文结果' },
  { name: 'Polyglot (Aider)', what: '编程基准；语言与任务规模请按使用版本核对', lvl: 'L1', note: '考验跨语言泛化;DGM 第二基准' },
  { name: 'Terminal-Bench', what: '终端里的端到端系统任务(从源码编内核、训模型)', lvl: 'L1', note: '比"改代码"更贴近 agent 实际工作面' },
  { name: 'CORE-Bench', what: '论文级计算可复现性任务(三档难度)', lvl: 'L1', note: '判分器事故现场:Opus 4.5 被刚性判分压到 42%,修评分器后 95%' },
  { name: 'BrowseComp', what: '开放网络里"草堆找针"式检索题', lvl: 'L1', note: '设计原则:答案易验证、难解——防靠猜' },
  { name: 'LiveCodeBench', what: '滚动更新的编程题', lvl: 'L1', note: '滚动更新降低部分污染风险，不能保证没有污染' },
  { name: 'GAIA', what: '通用助理任务:联网 + 工具 + 多步推理', lvl: 'L1+L2', note: '测"会办事"而不只是"会写码"' },
  { name: 'OSWorld / WebArena', what: '真实操作系统/浏览器任务(369/812 题)', lvl: 'L1+L2', note: '判后端状态与工件(订单真下了/文件真改了),不只判界面' },
  { name: 'τ-bench / τ2-bench', what: '零售/航空/电信域:模拟用户多轮交互 + 政策一致性', lvl: 'L2', note: '提出 pass^k;τ2 为"双控"Dec-POMDP——用户也持工具改共享状态' },
  { name: 'METR 长任务评测 / RE-Bench', what: '长任务与 AI 研发任务是不同设置；时长指标与固定预算研发分数分别阅读', lvl: '任务/研发', note: '任务时长指标不直接测递归收益；趋势外推需说明任务、版本与统计不确定性' },
  { name: 'Apollo scheming / SHADE-Arena', what: '模型隐藏意图、暗中破坏能否被监控发现', lvl: 'L2+安全', note: '"把模型当对手"的评测侧实现' },
  { name: 'impossible task 评估', what: '给不可完成任务,看模型是否假装完成', lvl: 'L2+安全', note: '直接测 reward hacking 倾向' },
];

/* ---------- 评测门模拟器任务集(第 04 章,教学示意) ---------- */
DSH.evalTasks = [
  { id: 't1', q: '反转字符串 "abcde"', expect: 'edcba' },
  { id: 't2', q: '求 1..10 的平方和', expect: '385' },
  { id: 't3', q: '提取所有数字 "a1b22c333"', expect: '122333' },
  { id: 't4', q: '回文判断 "level"', expect: 'true' },
  { id: 't5', q: '数组去重 [3,1,3,2]', expect: '123' },
  { id: 't6', q: '统计元音 "sequoia"', expect: '5' },
  { id: 't7', q: '斐波那契第 8 项', expect: '21' },
];

/* ---------- 实战项目:自改评测管线(第 25 章) ---------- */
DSH.evalProject = [
  {
    "phase": "Phase 1 · 协议",
    "t": "任务与数据分离",
    "icon": "target",
    "goal": "定义要检验的改进与任务分布。",
    "steps": [
      "固定任务、模型、评分器和环境版本。",
      "开发、选择、确认数据分开；提前设定预算与停止规则。"
    ],
    "check": "有参考解和失败样例；任务 IDs 与完整运行矩阵可验证。"
  },
  {
    "phase": "Phase 2 · 测量",
    "t": "外部 verifier",
    "icon": "flask",
    "goal": "从实际产物获得逐题证据。",
    "steps": [
      "基线与候选分别在干净环境运行；记录失败、超时与成本。",
      "评分器位于候选权限之外；不同 packageId 不能代替隔离。"
    ],
    "check": "删除失败、伪造自报分数和评分器版本错配会被发现。"
  },
  {
    "phase": "Phase 3 · 裁决",
    "t": "确认后提升版本",
    "icon": "ruler",
    "goal": "区分探索档案与用户正在使用的版本。",
    "steps": [
      "候选冻结后做独立配对确认；允许 keep/reject/inconclusive。",
      "通过统计、成本与约束门后再提升版本；外部副作用另行补偿。"
    ],
    "check": "坏候选不污染真实会话；证据不足时保留基线并如实报告。"
  }
];

/* ---------- 哥德尔机四代对照(第 02 章) ---------- */
DSH.godelMachines = [
  {
    "name": "Gödel Machine",
    "year": "2003 起",
    "by": "Schmidhuber",
    "gate": "依据形式公理证明有益重写",
    "eval": "效用模型与证明搜索",
    "status": "理论框架",
    "key": "条件保证，不等于现实中必能及时证明"
  },
  {
    "name": "Gödel Agent",
    "year": "2024 / ACL 2025",
    "by": "Yin 等",
    "gate": "目标指导下修改 agent 逻辑",
    "eval": "论文限定任务上的经验评估",
    "status": "研究实现",
    "key": "区分自修改能力与收益证据"
  },
  {
    "name": "DGM",
    "year": "2025 / v3 2026",
    "by": "Zhang 等",
    "gate": "有效候选入档；分数引导搜索",
    "eval": "编码任务与机制消融",
    "status": "研究实现",
    "key": "允许暂时较弱的探索分支"
  },
  {
    "name": "HGM",
    "year": "2025 / v3",
    "by": "Wang 等",
    "gate": "支系潜力估计与采样",
    "eval": "解耦展开和评估，固定预算比较",
    "status": "研究实现",
    "key": "oracle、在线估计与回顾统计不同"
  }
];

/* ---------- RSI:自我改进分级阶梯(第 01 章) ---------- */
DSH.rsiLevels = [
  { n: 'L0', t: '外部更新', d: '一切改进都来自外部：换模型版本、换提示词、加工具。系统本身没有自我改进回路。' },
  { n: 'L1', t: '改进提示词与知识', d: 'agent 修改自己的 system prompt、记忆、skill 文件。下一次会话受益,但不会写出新的代码能力。', cur: true },
  { n: 'L2', t: '改进工具与技能', d: 'agent 给自己编写新工具/skill/MCP 服务器并挂载使用。能力面扩展了,但运行时的核心结构没变。' },
  { n: 'L3', t: '改进运行时结构', d: 'agent 定义并挂载真正的插件——新增 Service、监听事件、替换 Provider。改变的是组合本身。DSH 的 cordis_define/cordis_run 正位于这一级。', cur: true },
  { n: 'L4', t: '改进改进过程', d: 'agent 改写自己的循环、评估器、迭代策略——“如何改进”本身也在被改进。递归真正开始收拢。' },
  { n: 'L5', t: '无约束起飞(假想)', d: '关于持续自我加速的假想，不是把前四项完成就能保证达到的级别。这是讨论最多的版本,也是工程上最需要护栏的版本。' },
];

/* ---------- RSI 能力地图(第 03 章) ---------- */
/* st: ready=DSH 已有对应能力 / extend=有 seam 需自实现 / research=仍需探索 */
DSH.capMap = [
  {
    t: '运行时自我修改', st: 'ready',
    d: '能在进程内定义代码、挂载为真插件、给它注册服务/事件/工具,而不只是改配置文件。这是 RSI 的“手”。',
    refs: ['tool-cordis(cordis_define/run/inspect)', 'extensions 包组', 'cordis-host-runner / cordis-client-runner'],
    q: '可修改粒度扩大搜索空间，但不保证单位预算收益增加。',
  },
  {
    t: '持久状态与记忆', st: 'ready',
    d: '跨会话保留“我改过什么、效果如何”的事实,供下一轮改进参考。没有记忆的改进只是随机漂移。',
    refs: ['会话日志 + 投影(ctx.sessionProjections)', 'storage / storage-sqlite', 'attachment 内容寻址存储'],
    q: '模型可见 ⟺ 已记录——自改历史也要先落成 session event 才能被未来的自己读到。',
  },
  {
    t: '自我评估与验证', st: 'extend',
    d: '判断一次自改是进步还是退步:行为断言、回归对比、录制回放。没有评估的 RSI 等于闭眼开车。',
    refs: ['快照测试体系(snapshots/)', '重复调用守卫 / 超时策略(guard 包组)', '需要你实现:行为 eval 插件'],
    q: '评估器本身也是插件——它可以被改进,但改进它的改进,需要更硬的评估器。',
  },
  {
    t: '沙箱化执行', st: 'ready',
    d: '自写的代码必然有 bug,可能危险:文件系统/子进程/沙箱 Provider 把“试错”关进受控世界。',
    refs: ['ctx.sandbox(bwrap/Landlock/Seatbelt)', 'ctx.fs / ctx.subprocess seam', 'ssh 远程执行世界'],
    q: '一次切换 Provider,整个执行世界一起搬——这是 seam 架构对安全实验的最大红利。',
  },
  {
    t: '目标管理与迭代策略', st: 'extend',
    d: 'RSI 不是一次改动,而是围绕不变目标的持续迭代:目标状态机、轮次上限、断点续跑。',
    refs: ['goal 包组(create/update/blocked/complete)', 'tool-ralph 新鲜子会话循环', 'workflow + PTC 引擎', '需要你实现:改进策略本身'],
    q: '回合关闭后谁决定再跑一轮?这个“谁”就是改进策略,它本身应该是可替换的插件。',
  },
  {
    t: '护栏与审批', st: 'ready',
    d: '自我修改必须穿过人类边界:需要检验候选能否影响控制域。审批、写策略、命令确认是地基,不是装饰。',
    refs: ['用户审批(user-approval)', 'permission-presets', 'fs-observation-policy', '插件版本回滚(current/next packageId)'],
    q: '将候选视为不可信方，验证控制域权限、日志覆盖与外部副作用。',
  },
];

/* ---------- 载体对比(第 05 章) ---------- */
DSH.carriers = [
  {
    "name": "DSH / Cordis",
    "mech": "运行时插件组合；原教程介绍 cordis_*",
    "gran": "工具、服务与事件",
    "persist": "内容寻址包；外部状态另行管理",
    "approval": "依目标版本、profile 和执行域验证",
    "note": "详细实现案例；原清单缺上游生成 commit",
    "evidence": "固定版本、隔离评分器、验证副作用边界"
  },
  {
    "name": "文件型 agent 扩展",
    "mech": "提示词、技能、hooks 或可加载扩展",
    "gran": "由具体扩展 API 决定",
    "persist": "Git / 制品版本 + 加载协议",
    "approval": "依产品、平台与版本验证",
    "note": "包括多种 CLI/IDE agent；不作统一能力断言",
    "evidence": "确认加载时机、权限和回退后的状态"
  },
  {
    "name": "自建 harness",
    "mech": "显式定义循环与可修改模块",
    "gran": "由实验定义",
    "persist": "提交或镜像 digest + 实验账本",
    "approval": "由外部控制域实现",
    "note": "自由度高；需要更多实现与验收",
    "evidence": "runner、成本、日志和隔离可独立验证"
  },
  {
    "name": "ACP",
    "mech": "client-agent 通信协议",
    "gran": "不规定自修改算法",
    "persist": "取决于接入 runtime",
    "approval": "协议不替代运行环境控制",
    "note": "协议与完整运行时不是同类产品",
    "evidence": "验证消息边界及实际 runtime"
  }
];

/* ---------- 安全与护栏(第 11 章) ---------- */
DSH.rsiSafety = [
  {
    "t": "审批边界需要独立验证",
    "d": "检查授权粒度、未来版本授权与实际调用路径。审批界面不等于候选无法改变审批逻辑。"
  },
  {
    "t": "代码回退与副作用恢复分开",
    "d": "固定提交或不可变包；对持久数据、共享存储与不可逆外部操作另外设计补偿和预提交门。"
  },
  {
    "t": "候选在一次性环境验证",
    "d": "文件、进程、网络和凭据按实际权限隔离；环境快照和执行身份须可核验。"
  },
  {
    "t": "日志由外部控制域保管",
    "d": "记录全部试验、失败、超时与成本；区分模型自述和外部观察，检查未覆盖的通道。"
  },
  {
    "t": "确认后再提升版本",
    "d": "探索档案与使用版本分开；统计、成本和约束门共同决定发布，证据不足则保持现状。"
  },
  {
    "t": "最小权限不只是一张工具清单",
    "d": "限制候选实际能读取、写入和调用的资源；同进程不同插件并非独立安全域。"
  }
];

/* ---------- 实战关卡(第 24 章) ---------- */
DSH.experiments = [
  { id: 'e1', lv: 'L1', t: '读图', title: '看懂自己运行在什么样的树上',
    desc: '跑通 dsh --profile web --dump-config,找到 cordis_* 工具所在行;在网页里用 cordis_inspect_list 看 Host/Client 两侧能力目录。补的是回路的诊断相——产物是一张组合清单,交给 L2 判断注册目标落在哪层。',
    verify: '能说出:自己此刻的能力由哪些 bundle/patch 层叠加而来。' },
  { id: 'e2', lv: 'L2', t: '第一次自改', title: '让 agent 给自己定义一个函数插件',
    desc: '在会话里用 cordis_define 写一个小插件(注册一个工具或监听一个事件),cordis_run 挂载,再 cordis_stop 卸载——亲手完成一次"写代码→活在自己身体里"。补的是回路的手:define→审批→挂载→可逆卸载。',
    verify: '插件可挂载并卸载；注册效果被清理，外部副作用需独立核验和补偿。' },
  { id: 'e3', lv: 'L3', t: '装上记忆', title: '给 agent 一个跨会话的自改日志',
    desc: '用一个新插件把"每次自改的意图与结果"写成 storage 记录或 session event;新开会话让 agent 能回答"我上次改过什么、为什么"。补的是持久状态——DGM archive 的最小版,产物是 L3+ 与第 25 章复用的日志 schema。',
    verify: 'fork/resume 后,agent 能复述上一次自改的事实,而不是猜测。' },
  { id: 'e4', lv: 'L3+', t: '装上评估', title: '让改进必须先通过一道自己的考试',
    desc: '实现一个 eval 插件:自改运行后自动执行一组行为断言(如固定 prompt 的期望输出),未通过则自动回滚到 currentPackageId。补的是选择压力——评测器须处于候选权限外；不同插件名不等于隔离。',
    verify: '故意注入一次坏改动,看到它被评估拦下并回滚;好改动正常保留。' },
  { id: 'e5', lv: 'L4', t: '收拢递归', title: '让改进策略本身成为可替换插件',
    desc: '把"改什么、何时改、改完怎么验"的策略抽成一个 Service 插件:它能驱动 cordis_define → eval → rollback/keep 的完整回路,而你随时可以 patch 换策略。补的是"改进改进过程"——这是额外的元改进研究设计，不能等同于 HGM 自动重写选种规则。',
    verify: '换掉策略插件后,同一目标下的改进行为明显不同;人类审批始终在每个回路内。' },
];

/* ---------- 导航图标(简洁线性 SVG path, 24x24) ---------- */
DSH.icons = {
  home: 'M3 11.5 12 4l9 7.5M5.5 10v9h13v-9',
  info: 'M12 8h.01M11 12h1v4h1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  puzzle: 'M9 4h2a2 2 0 1 1 4 0h2v4a2 2 0 1 1 0 4v4h-4a2 2 0 1 0-4 0H5v-4a2 2 0 1 0 0-4V4h4Z',
  layers: 'm12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16.5 12 21l9-4.5',
  loop: 'M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4',
  db: 'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3Zm-8 3v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  boxes: 'M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z',
  wrench: 'M14.5 6.5a4 4 0 0 0-5.6 4.9L4 16.3V20h3.7l4.9-4.9a4 4 0 0 0 4.9-5.6L14 13l-3-3 3.5-3.5Z',
  ruler: 'M3 17 17 3l4 4L7 21l-4-4Zm5-1 1.5 1.5M11 13l1.5 1.5M14 10l1.5 1.5M17 7l1.5 1.5',
  flask: 'M9 3h6M10 3v5l-5.5 9.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-3.5L14 8V3M7.5 15h9',
  git: 'M6 3v12M6 15a3 3 0 1 0 3 3M18 9a3 3 0 1 0-3-3M18 9v3a6 6 0 0 1-6 6M6 3a0 0 0 1 0 0 0',
  book: 'M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2V5Zm4-2v16M4 19a2 2 0 0 0 2 2h14',
  target: 'M12 12m-9 0a9 9 0 1 0 18 0 9 9 0 1 0-18 0M12 12m-5 0a5 5 0 1 0 10 0 5 5 0 1 0-10 0M12 12m-1 0a1 1 0 1 0 2 0 1 1 0 1 0-2 0',
};

/* ---------- Cordis 五大理念 ---------- */
DSH.cordisIdeas = [
  { t: '插件是实现 Service 的对象', d: '两种导出形态不得混用：服务包 <code>default</code> 导出 <code>Service</code> 子类(生命周期由 Cordis 挂进上下文)；函数插件具名导出 <code>name</code>/<code>inject</code>/<code>Config</code>/<code>apply</code> 且无 default——Loader 的 <code>unwrapExports</code> 优先取 <code>.default</code>,混入它会丢掉整个命名空间(postmortem 0001)。' },
  { t: 'Context 是服务仓库', d: '服务认领稳定的 <code>ctx.键</code>(<code>ctx.tools</code>、<code>ctx.llm</code>、<code>ctx.sessions</code>、<code>ctx.sessionPersistence</code>…)；其它插件按键查找而非 import 实现。可选服务用 <code>ctx.get(name)</code> 读全局 isolate 存储;<code>ctx.键</code> 的属性代理是只沿 fiber 祖先上溯的拓扑敏感查找,只属于已声明的 inject。' },
  { t: '用 inject 声明依赖', d: '插件列出必需的服务名,服务就绪前不会加载——加载顺序由服务依赖表达,而非手工编排启动顺序；缺失的依赖让插件停在等待态,而不是带着半空上下文启动。' },
  { t: '类型化事件通信', d: '事件名经 TypeScript 声明合并挂进可扩展 Map(<code>SessionEventMap</code>、<code>TurnEndReasonMap</code> 等五张表同此模式),再按语义选 <code>emit</code>/<code>waterfall</code>/<code>parallel</code>/<code>serial</code>/<code>bail</code>;JSDoc 必须标 <code>@mode</code> 与 payload <code>@param</code>,生成目录校验声明与分发点一致。' },
  { t: '注册是可逆效果', d: '每份贡献走 <code>ctx.effect()</code>/<code>ctx.on()</code> 并返回 disposer,注册表的 <code>register()</code> 也返回 disposer——卸载与重载时按 yield 位置嵌套回收。teardown 顺序敏感时把相关工作放进同一个 composite effect。' },
];

/* ---------- Dispatch 模式 ---------- */
DSH.dispatchModes = [
  { id: 'emit', awaited: '否', order: '按注册顺序依次观察', ret: '无', desc: '广播通知：不等待、无返回值,监听器失败只记日志、绝不让已提交的 append 失败。真实岗位：session/event(持久事实广播,约 29 个监听包)、agent/status、agent/assistant-stream、tools/change。' },
  { id: 'waterfall', awaited: '否', order: '按注册顺序包裹(洋葱模型)', ret: '有(最外层返回值)', desc: '环绕式中间件：监听器收到 (...args, next),next() 委托下游、不调用即短路；值沿 next() 的返回值逐层回传。真实岗位：agent/pre-step、agent/request、agent/request-error、system-prompt/assemble、tools/* 三瀑布、approval/request。' },
  { id: 'parallel', awaited: '是(全部 settle)', order: '所有监听器并行观察', ret: '无', desc: '并行扇出：等待全部监听器完成,无返回值、无否决位。真实岗位：session/flush 持久化屏障(session-persistence-jsonl、session-telemetry 挂这里)、feedback/committed。' },
  { id: 'serial', awaited: '是', order: '按注册顺序依次 await,到 bail 值即止', ret: '有(首个 bail 值)', desc: '串行执行：逐个 await,首个非 null/false/undefined 的 bail 值终止分发。真实岗位：agent/created(逐个初始化,失败回滚创建并跳过后续)、agent/turn-stopping(回合关闭前依次收尾)。' },
  { id: 'bail', awaited: '否', order: '按注册顺序,直到有人 bail', ret: '有(首个非空值)', desc: 'serial 的同步版：同步调用监听器直到首个 bail 值(非 null/false/undefined)。harness 公开事件目前未采用此模式,留作"首个应答者赢"类解析的备选。' },
];

/* ---------- Agent Loop 回合播放器(源自 docs/architecture.md “Turn flow”) ---------- */
/* badge: d=写入会话日志的持久事件, l=进程内活体扩展点, o=按需记录 */
DSH.loopSteps = [
  { name: 'turn/start', badge: 'd', title: '回合开启',
    desc: '回合在领取第一份输入之前就已开启(turn/start 先于 claim),直到不再"欠"任何工作才以 turn/end 关闭——拒绝、空输入、取消都可能让它无 step 收尾。',
    narr: '用户发来一句话：<b>"把 README 里的错别字改掉"</b>。followup() 把它投进 inbox 的 next-turn 列表并唤醒驱动器;循环先写 turn/start。',
    log: [{ n: 'turn/start', t: 'd' }] },
  { name: 'claim + assemble', badge: 'l', title: '领取输入并组装',
    desc: 'step 边界取走全部 next-step 输入,回合边界再加一条 next-turn(inbox 以纯删除 splice 移除,逐条发 agent/inbox/claimed);组装 prompt sections + 工具 schema 并投影运行时上下文。inject() 的上下文不唤醒,只随下一次领取同行。',
    narr: '系统提示词的各 section、可见工具的 schema 被组装成本次请求的蓝图。',
    log: [{ n: 'agent/inbox/claimed', t: 'l' }] },
  { name: 'agent/pre-step', badge: 'l', title: '准入决策(waterfall)',
    desc: '监听器返回 { kind:\'reject\' } 或 { kind:\'enter\', messages, startsRequestSeries? }:reject 或首个 enter 被改写为空 ⇒ 不产生 step,直接关闭这个持久回合。包裹型监听器必须用 {...decision, messages} 保留下游声明。',
    narr: '策略插件(权限、plan-mode、compaction-basic、hooks 双桥…)在此审查即将进入模型的消息——本例放行。',
    log: [{ n: 'agent/pre-step', t: 'l' }] },
  { name: 'step/start', badge: 'd', title: '步骤开始',
    desc: '一个 step = 一次模型请求 + 它引发的工具执行。step/start 写入会话日志。',
    narr: '第一个 step 正式开始。',
    log: [{ n: 'step/start', t: 'd' }] },
  { name: 'agent/request → prepareCall', badge: 'l', title: '解析路由(waterfall)',
    desc: 'await next() 拿到机器本来要用的 LlmCallConfig(首次请求=agent options,之后=已记录的 header);返回替换值即换路由。这里或 prepareCall() 期间取消 ⇒ system 与 user 都不提交;waterfall 不能改消息——模型可见内容必须走已记录的通道。',
    narr: '决定这一步真正要调用哪个模型、哪条通道。',
    log: [{ n: 'agent/request', t: 'l' }] },
  { name: 'commit messages', badge: 'd', title: '提交消息与请求头',
    desc: '用准备好的调用能力对账 system/message(提示词只以历史形式旅行,空渲染清空全部活跃节点);仅首次尝试追加 user/message;按需记 request/header(reason: initial/resume/change/series)与 request/context。重试不重新组装、不重跑 pre-step。',
    narr: '系统提示词与用户消息作为持久事件入帐。',
    log: [{ n: 'system/message', t: 'd' }, { n: 'user/message', t: 'd' }, { n: 'request/header', t: 'o' }, { n: 'request/context', t: 'o' }] },
  { name: 'derive + freeze', badge: 'l', title: '从日志派生并冻结历史',
    desc: '模型历史不是内存里的聊天数组,而是由 deriveMessages() 从会话日志投影而来、再被冻结——循环发送不可变请求,同时保持取消能力;冻结证据只在完整冻结的身份上复用。',
    narr: '"模型看到的 = 日志里有的"在这一步被具体化。',
    log: [] },
  { name: 'llm/stream', badge: 'l', title: '流式模型响应',
    desc: '绑定的调用经 llm/stream(waterfall)开始流式传输;agent/assistant-stream 发布进程内 start / chunk* / end 帧(Web UI 增量渲染与 session-follow 远程消费就来自它)。',
    narr: '模型开始逐 token 输出："好的,我先读取 README…"',
    log: [{ n: 'llm/stream', t: 'l' }, { n: 'agent/assistant-stream', t: 'l' }] },
  { name: 'assistant/message', badge: 'd', title: '沉淀助手消息',
    desc: '完整的紧凑计时流(含 usage)作为一条 assistant/message 在 committed end 帧之前提交;失败/重试/取消/流错误则沉淀为 assistant/attempt(不进模型历史),中途取消落成 interrupted:true 的前缀。',
    narr: '完整回复(含工具调用意图)永久写入日志,重启后可完整重建。',
    log: [{ n: 'assistant/message', t: 'd' }] },
  { name: 'tools pipeline', badge: 'd', title: '工具执行流水线',
    desc: 'tool/call 先落账再执行 ⇒ tools/pre-execute(allow/deny/cancel/ask)⇒ 单调守卫 ⇒ tools/execute(around:超时/重试)⇒ tools/post-execute(accept/替换/block)⇒ finalizeContent ⇒ tools/result ⇒ tool/result 落账。守卫、审批、超时策略都挂在这些扩展点上。',
    narr: '模型调用 <b>read</b> 读 README,再调用 <b>edit</b> 修正错别字;每次调用都走一遍流水线。',
    log: [{ n: 'tool/call', t: 'd' }, { n: 'tools/pre-execute', t: 'l' }, { n: 'tools/execute', t: 'l' }, { n: 'tools/post-execute', t: 'l' }, { n: 'tool/result', t: 'd' }] },
  { name: 'step/end', badge: 'd', title: '步骤结束,也许再来一步',
    desc: '工具结果"欠"着下一次模型请求,或新的 next-step 输入到达 ⇒ 领取 → 下一个 step(回到 agent/pre-step 之后)。带 concludesTurn 的工具结果可在本 step 终结回合,但绝不截断已提交的 next-step 工作。',
    narr: '工具结果需要回传给模型确认——于是开启第二个 step,模型汇报"已修正 3 处"。',
    log: [{ n: 'step/end', t: 'd' }] },
  { name: 'turn-stopping → turn/end', badge: 'd', title: '回合收尾',
    desc: 'agent/turn-stopping 是 serial 事件(没有 next()):监听器若反对关闭就 agent.steer(),机器重读 inbox——数据决定,监听顺序改变不了结果。随后 turn/end 写入日志。',
    narr: '任务完成,回合落帐。整段历史可从日志完整重放、fork、导出。',
    log: [{ n: 'agent/turn-stopping', t: 'l' }, { n: 'turn/end', t: 'd' }] },
];

/* ---------- “新行为放哪里”(docs/architecture.md) ---------- */
DSH.extGoals = [
  { g: '新增一个模型提供商', m: '在 ctx.llm 上注册它的适配器;增删经 llm/adapters-updated 广播' },
  { g: '新增一个模型可见能力(工具)', m: '在 ctx.tools 上注册 ToolDefinition;其 schema 经显式白名单加入提示词组装' },
  { g: '让某个会话拥有不同的能力集', m: '组合一个 agent preset(preset cordis.yml);其中的 service 行需要 isolate realm' },
  { g: '新增 shell 执行后端', m: '注册 ctx.shell 后端;本地实现通过 ctx.subprocess 派生进程' },
  { g: '新增持久终端执行', m: '注册 ctx.terminals 后端,搭配 dsh-tool-terminal' },
  { g: '新增一个人类命令(/命令)', m: '在 ctx.commands 上注册;不经过模型回合直接分发' },
  { g: '新增后台任务', m: '在 ctx.jobs 上注册;job_* 工具负责收集输出或停止它' },
  { g: '由外部 webhook 拉起会话', m: '在 ctx.webhookRuntime 注册可信规则,并挂载 Provider 适配器' },
  { g: '新增文件系统访问或策略', m: '注册 ctx.fs Provider,或监听 fs/* 事件(读前编辑门禁 = fs-observation-policy 挂在 fs/write-intent / fs/edit-intent 上)' },
  { g: '限制派生进程(沙箱)', m: '使用 ctx.sandbox 后端;消费方在 spawn 前包装 argv' },
  { g: '拦截请求/工具/回合', m: '用对应的 agent/* 或 tools/* 事件;agent/turn-stopping 的反对票 = 注入 steering,数据决定关不关闭' },
  { g: '注入模型可见上下文', m: '调用 agent.inject();它落在下一个被准入的请求里(不唤醒驱动器)' },
  { g: '新增 UI 或编辑器集成', m: '驱动 ctx.agents,并从 session/event 渲染(该 emit 现有约 29 个监听包)' },
  { g: '新增 Web 客户端 Chat 节点', m: '注册 ConversationNodeDefinition + 按键渲染器' },
  { g: '新增持久会话状态', m: '扩展 SessionEventMap(声明合并);从日志渲染与重放' },
  { g: '管理同会话目标', m: '用 ctx.goals;继续回合经 agent/* 域推进(goal round 是 goal 源的 turn)' },
  { g: '生成会话标题', m: '注册唯一的 ctx.sessionTitle Provider' },
  { g: '在回合边界 fork 会话', m: 'ctx.agents.create({ sessionId, seed, meta: { parentSession, seedLength } })——只有 agent-loop 发布的会话才持久' },
  { g: '把会话存到新后端', m: '实现 SessionPersistence(create/open/stat/list/flush + 每会话 handle 的 read/append/flush/close),过共享契约套件' },
  { g: '把注册限定到单个 agent', m: '使用那个 agent 的 agent.ctx——作用域可见且作用域同寿命' },
];

/* ---------- 包分组(packages/README.md + 目录实测) ---------- */
DSH.buckets = [
  { id: 'all', name: '全部' },
  { id: 'core', name: '核心引擎' },
  { id: 'exec', name: '执行与环境' },
  { id: 'cap', name: '智能体能力' },
  { id: 'app', name: '应用与界面' },
  { id: 'exp', name: '实验性' },
  { id: 'support', name: '支撑设施' },
];

DSH.packageGroups = [
  { id: 'core', bucket: 'core', role: '产品 API 主干：会话、提示词、工具、agent 服务与具体循环', pkgs: ['agent', 'agent-default-model', 'agent-loop', 'agent-tool-presentation', 'scope', 'session', 'system-prompt', 'tools'] },
  { id: 'llm', bucket: 'core', role: 'LLM 能力族：抽象服务 + 各提供商适配器', pkgs: ['deepseek-llm-api-extensions', 'llm', 'llm-deepseek', 'llm-pi-ai', 'llm-retry', 'plugin-package-inventory-deepseek', 'token-meter'] },
  { id: 'typert', bucket: 'core', role: '类型图生成、工件加载与运行时注册表', pkgs: ['generator', 'loader', 'protocol', 'registry'] },
  { id: 'context', bucket: 'core', role: '模型可见的请求上下文：工作区指令、时间上下文、引用', pkgs: ['agent-instructions', 'file-reference', 'file-reference-local', 'session-reference', 'time-context', 'tmux-context'] },
  { id: 'compaction', bucket: 'core', role: '上下文压缩能力族：Service Definition + 基础 Provider + 命令 Consumer', pkgs: ['command-compact', 'compaction', 'compaction-basic', 'compaction-image-offload', 'compaction-tool-result-pruner'] },
  { id: 'session', bucket: 'core', role: '持久会话数据平面：持久化 seam + 后端、投影 seam、日志驱动的标题、会话报告', pkgs: ['session-checkpoint-policy', 'session-format', 'session-format-catalog', 'session-format-v0-to-v1', 'session-format-v1-to-v2', 'session-format-v2-to-v3', 'session-log-deepseek', 'session-persistence', 'session-persistence-jsonl', 'session-projection', 'session-projection-cache', 'session-stats', 'session-telemetry', 'session-telemetry-otel', 'session-title', 'session-title-all-prompts-llm', 'session-title-first-prompt-llm', 'session-title-llm', 'session-turn-outline'] },
  { id: 'session-query', bucket: 'core', role: '会话检索族：逻辑语料、有界读取、谱系、语义过滤、SQLite 全文搜索', pkgs: ['session-log-export', 'session-query', 'session-query-sqlite', 'tool-session-query'] },
  { id: 'shell', bucket: 'exec', role: 'Bash/PowerShell 能力族：执行器 seam、本地实现、模型工具(能力接缝的教科书案例)', pkgs: ['bash-local', 'bash-sandbox', 'pwsh-local', 'pwsh-sandbox', 'shell', 'shell-env', 'tool-bash', 'tool-bash-persistent', 'tool-pwsh', 'tool-pwsh-persistent'] },
  { id: 'subprocess', bucket: 'exec', role: '子进程能力族：Service Definition + 本地进程树 Provider', pkgs: ['subprocess', 'subprocess-local', 'win32-process'] },
  { id: 'ssh', bucket: 'exec', role: 'POSIX 远程连接，配套的文件系统/子进程/沙箱 Provider：一次切换，整个执行世界上云', pkgs: ['fs-ssh', 'sandbox-ssh', 'ssh', 'subprocess-ssh'] },
  { id: 'terminal', bucket: 'exec', role: '持久 PTY 能力族：所有者作用域的终端会话、本地实现、模型工具', pkgs: ['terminal', 'terminal-bash', 'tool-terminal'] },
  { id: 'ptc-runtime', bucket: 'exec', role: 'PTC 执行能力族：Service Definition + 沙箱化 Node Provider + PTC 模式 Consumer', pkgs: ['ptc-runtime', 'ptc-runtime-node'] },
  { id: 'sandbox', bucket: 'exec', role: '进程限制 seam；bwrap / Landlock / Seatbelt 后端', pkgs: ['sandbox', 'sandbox-local', 'sandbox-policy', 'sandbox-windows-acl'] },
  { id: 'fs', bucket: 'exec', role: '文件系统能力族：seam、本地实现、模型文件工具与发现工具', pkgs: ['fs', 'fs-local', 'fs-observation-policy', 'fs-sandbox', 'tool-fs', 'tool-fs-search', 'tool-str-replace-editor'] },
  { id: 'deliverables', bucket: 'exec', role: '回合交付物：显式文件交付(present)与基于 git 快照的工作区变更记录', pkgs: ['tool-present', 'workspace-changes'] },
  { id: 'document', bucket: 'exec', role: '共享的 Host 侧 Office→PDF 转换(LibreOffice kit，原生引擎或 WASM)', pkgs: ['office-to-pdf'] },
  { id: 'lsp', bucket: 'exec', role: 'LSP 能力族：seam、通用 stdio Provider 与 lsp 工具', pkgs: ['lsp', 'lsp-stdio', 'tool-lsp'] },
  { id: 'computer-use', bucket: 'exec', role: '独占命名的桌面 Provider 注册', pkgs: ['computer-use'] },
  { id: 'browser-use', bucket: 'exec', role: '独占命名的浏览器 Provider 注册', pkgs: ['browser-use'] },
  { id: 'web', bucket: 'cap', role: 'Web 能力族：seam、搜索/抓取 Provider、模型侧 web 工具', pkgs: ['tool-web', 'web', 'web-fetch-http', 'web-search-deepseek', 'web-search-exa', 'web-search-perplexity'] },
  { id: 'skill', bucket: 'cap', role: '技能能力族：Provider 注册表、本地 Provider、模型侧目录/加载器', pkgs: ['skill', 'skill-badge', 'skill-filesystem', 'tool-skill'] },
  { id: 'subagent', bucket: 'cap', role: '子智能体能力族：Provider 注册表契约与模型侧委派工具(可桥接 Claude Code / Codex / ACP)', pkgs: ['subagent', 'subagent-acp', 'subagent-claude-code', 'subagent-codex', 'subagent-dsh-sdk', 'subagent-fork-in-process', 'subagent-in-process-driver', 'subagent-spawn-in-process', 'tool-subagent', 'tool-subagent-control'] },
  { id: 'jobs', bucket: 'cap', role: '通用后台任务运行时与模型侧任务控制工具', pkgs: ['jobs', 'jobs-local', 'tool-jobs'] },
  { id: 'workflow', bucket: 'cap', role: '工作流 seam、PTC 流程引擎与模型侧 workflow / ralph 工具', pkgs: ['tool-ralph', 'tool-workflow', 'workflow', 'workflow-ptc'] },
  { id: 'webhook', bucket: 'cap', role: '已验证的外部事件、可信规则与 fire-and-forget 的 Workspace 会话', pkgs: ['webhook', 'webhook-github'] },
  { id: 'todo', bucket: 'cap', role: '模型侧 todo_write 工具', pkgs: ['tool-todo'] },
  { id: 'plan', bucket: 'cap', role: '带直接入口命令与评审出口的计划协作状态', pkgs: ['plan-mode'] },
  { id: 'goal', bucket: 'cap', role: '同会话目标的持久化与生命周期', pkgs: ['command-goal', 'goal', 'goal-round-driver', 'tool-goal'] },
  { id: 'schedule', bucket: 'cap', role: '会话内定时跟进', pkgs: ['schedule'] },
  { id: 'mcp', bucket: 'cap', role: '将外部 Model Context Protocol 服务器暴露为原生工具', pkgs: ['mcp-client', 'mcp-resources'] },
  { id: 'extensions', bucket: 'cap', role: '运行时自我修改：插件/服务实时检视与模型编写的挂载/卸载', pkgs: ['cordis-client-runner', 'cordis-host-runner', 'tool-cordis', 'ui-cordis'] },
  { id: 'guard', bucket: 'cap', role: '循环卫生守卫：重复调用提醒 + tools/execute 截止时间执行器', pkgs: ['repeat-tool-reminder', 'timeout-policy'] },
  { id: 'preset', bucket: 'cap', role: '从 preset cordis.yml 进行的按会话 agent 组合', pkgs: ['agent-presets', 'persona'] },
  { id: 'attachment', bucket: 'cap', role: '持久附件身份、校验与本地内容寻址存储', pkgs: ['attachment', 'attachment-local'] },
  { id: 'spill', bucket: 'cap', role: '输出溢写能力族：存储 seam、本地实现、工具结果溢写策略', pkgs: ['spill', 'spill-local', 'spill-policy'] },
  { id: 'storage', bucket: 'cap', role: '非会话存储枢纽 + 后端 + 领域表单', pkgs: ['storage', 'storage-domain', 'storage-json', 'storage-sqlite'] },
  { id: 'workspace', bucket: 'cap', role: '工作区实体', pkgs: ['workspace'] },
  { id: 'feedback', bucket: 'cap', role: '人类反馈采集与命令', pkgs: ['command-feedback', 'message-feedback'] },
  { id: 'identity', bucket: 'cap', role: '共享匿名身份', pkgs: ['anonymous-user-id'] },
  { id: 'interaction', bucket: 'cap', role: '人机协作平面：审批/交互 seam、权限预设、命令、ask-user 工具', pkgs: ['commands', 'permission-presets', 'tool-ask-user', 'user-approval', 'user-questions'] },
  { id: 'hooks', bucket: 'cap', role: 'Hook 桥接 + 共享的 Claude Code / Codex 线协议库', pkgs: ['hook-protocol', 'hooks-claude-code', 'hooks-codex'] },
  { id: 'api', bucket: 'app', role: '远程 BFF 组装与 Typert RPC 网关', pkgs: ['gateway', 'remotes', 'session-controller', 'settings-controller', 'terminal-controller', 'workspace-controller', 'workspace-files'] },
  { id: 'sdk', bucket: 'app', role: '进程外 SDK：JSON-RPC 协议与 TypeScript 客户端/服务器', pkgs: ['client', 'protocol', 'server'] },
  { id: 'acp', bucket: 'app', role: '仅自动化的 Agent Client Protocol 服务器', pkgs: ['acp'] },
  { id: 'boot', bucket: 'app', role: '应用二进制共享的引导胶水：cordis.yml 引导、CLI 参数、HMR 协调、插件管理', pkgs: ['app-boot', 'cmdline', 'hmr', 'plugin-manager'] },
  { id: 'host', bucket: 'app', role: 'Web GUI 宿主侧：API 网关 + HTTP 路由服务器', pkgs: ['directory-picker', 'directory-picker-auto', 'directory-picker-browse', 'directory-picker-native', 'frontend-static', 'open-in-app', 'plugin-inventory', 'webserver'] },
  { id: 'client', bucket: 'app', role: 'Web GUI 浏览器侧：外壳、连线、对象服务、插槽与成套 ui-* 插件', pkgs: ['connection', 'file-upload', 'hmr', 'locale', 'modules', 'resources', 'store', 'ui-agent-preset', 'ui-approval', 'ui-attachment', 'ui-brand-official', 'ui-chat', 'ui-commands', 'ui-conversation', 'ui-deliverables', 'ui-directory-picker-browse', 'ui-directory-picker-native', 'ui-dockkit', 'ui-goal', 'ui-input-trigger', 'ui-jobs', 'ui-layout', 'ui-message-feedback', 'ui-model-selection', 'ui-open-in-app', 'ui-permission-presets', 'ui-plan', 'ui-primitives', 'ui-reference', 'ui-renderer', 'ui-schedule', 'ui-session', 'ui-settings', 'ui-settings-general', 'ui-settings-models', 'ui-settings-plugin-inventory', 'ui-settings-plugins', 'ui-settings-unarchive-sessions', 'ui-sidebar', 'ui-sidebar-documentpreview', 'ui-sidebar-files', 'ui-sidebar-right', 'ui-sidebar-terminal', 'ui-skill', 'ui-slots', 'ui-subagent', 'ui-theme', 'ui-tool', 'ui-trajectory', 'ui-user-questions', 'ui-workflow-run', 'ui-workspace', 'web'] },
  { id: 'bundle', bucket: 'app', role: '可安装的 dsh --profile 补丁层(base / web-app / headless / sdk-app / sdk-minimal / acp-app)', pkgs: ['acp-app', 'base', 'headless', 'sdk-app', 'sdk-minimal', 'web-app'] },
  { id: 'settings', bucket: 'app', role: '用户设置 seam + 文件后端 Provider', pkgs: ['settings', 'settings-file'] },
  { id: 'credentials', bucket: 'app', role: '凭据引用/记录 seam + env 优先于 .env 的 Provider + 需要人工确认的授权流程', pkgs: ['authorization', 'credentials', 'credentials-local'] },
  { id: 'experimental', bucket: 'exp', role: '预稳定原型：默认公开，少数显式私有(Agent Teams、浏览器/桌面驱动、WebWorker 预览…)', pkgs: ['agent-team', 'agent-team-profile', 'agent-team-web-profile', 'auto-review', 'browser-use-chrome-devtools-mcp', 'browser-use-playwright-mcp', 'browser-use-runtime', 'browser-use-stagehand-native', 'client-ui-agent-team', 'computer-use-cua-driver-mcp', 'computer-use-cua-driver-native', 'inspector', 'ptc-runtime-python', 'tool-agent-team', 'webworker-packer', 'webworker-runtime'] },
  { id: 'test-support', bucket: 'support', role: '测试基础设施(testkit、LLM mock/回放、Loader 冒烟、会话快照)', pkgs: ['agent-loop-testkit', 'client-runtime', 'llm-mock-server', 'llm-replay', 'loader-smoke', 'remote-mock', 'session-snapshot'] },
  { id: 'runtime-diagnostics', bucket: 'support', role: '运行时诊断：包自有的不变量检查与报告', pkgs: ['invariants'] },
  { id: 'util', bucket: 'support', role: '跨组共享的零依赖底层工具(Branded 品牌类型、路径、超时、保留策略…)', pkgs: ['atomic-write', 'brand', 'chunked-list', 'crypto', 'deque', 'home-paths', 'http-proxy', 'launch-environment', 'lazy-require', 'native-command', 'output-retention', 'package-manifest', 'time', 'timeout', 'values', 'workspace-path'] },
];

/* ---------- 模型工具目录(docs/tool-catalog.md，按包归组) ---------- */
DSH.toolCats = [
  { id: 'all', name: '全部' },
  { id: 'fs', name: '文件与搜索' },
  { id: 'exec', name: '命令执行' },
  { id: 'term', name: '持久终端' },
  { id: 'web', name: '网络' },
  { id: 'sq', name: '会话检索' },
  { id: 'deleg', name: '委派协作' },
  { id: 'plan', name: '规划与目标' },
  { id: 'jobs', name: '后台作业' },
  { id: 'browser', name: '浏览器' },
  { id: 'self', name: '运行时自改' },
  { id: 'misc', name: '交互与其它' },
];

DSH.tools = [
  { n: 'read', p: 'dsh-tool-fs', c: 'fs', d: '读取工作区文件内容' },
  { n: 'write', p: 'dsh-tool-fs', c: 'fs', d: '写入/创建文件' },
  { n: 'edit', p: 'dsh-tool-fs', c: 'fs', d: '精确字符串替换式编辑' },
  { n: 'read_image', p: 'dsh-tool-fs', c: 'fs', d: '读取图像文件供模型查看' },
  { n: 'glob', p: 'dsh-tool-fs-search', c: 'fs', d: '按 glob 模式发现文件' },
  { n: 'grep', p: 'dsh-tool-fs-search', c: 'fs', d: '正则内容搜索' },
  { n: 'str_replace_editor', p: 'dsh-tool-str-replace-editor', c: 'fs', d: '经典 str-replace 风格的编辑器工具' },
  { n: 'present', p: 'dsh-tool-present', c: 'fs', d: '将工作区文件作为成果呈现给用户' },
  { n: 'bash', p: 'dsh-tool-bash', c: 'exec', d: '一次性 Bash 命令执行(经 ctx.shell seam)' },
  { n: 'pwsh', p: 'dsh-tool-pwsh', c: 'exec', d: '一次性 PowerShell 命令执行' },
  { n: 'bash (persistent)', p: 'dsh-tool-bash-persistent', c: 'exec', d: '在持久 shell 会话中执行 Bash' },
  { n: 'pwsh (persistent)', p: 'dsh-tool-pwsh-persistent', c: 'exec', d: '在持久 shell 会话中执行 PowerShell' },
  { n: 'run_code', p: 'dsh-tools (core)', c: 'exec', d: 'PTC：在沙箱化 Node 运行时执行模型编写的代码来编排工具' },
  { n: 'terminal_open', p: 'dsh-tool-terminal', c: 'term', d: '打开持久 PTY 终端' },
  { n: 'terminal_send', p: 'dsh-tool-terminal', c: 'term', d: '向终端发送输入' },
  { n: 'terminal_read', p: 'dsh-tool-terminal', c: 'term', d: '读取终端输出' },
  { n: 'terminal_signal', p: 'dsh-tool-terminal', c: 'term', d: '向终端进程发送信号' },
  { n: 'terminal_list', p: 'dsh-tool-terminal', c: 'term', d: '列出当前打开的终端' },
  { n: 'terminal_close', p: 'dsh-tool-terminal', c: 'term', d: '关闭终端会话' },
  { n: 'web_search', p: 'dsh-tool-web', c: 'web', d: '网络搜索(DeepSeek / Exa / Perplexity Provider)' },
  { n: 'web_fetch', p: 'dsh-tool-web', c: 'web', d: '抓取 URL 内容' },
  { n: 'session_search', p: 'dsh-tool-session-query', c: 'sq', d: '跨会话检索历史会话' },
  { n: 'session_trace', p: 'dsh-tool-session-query', c: 'sq', d: '追踪会话谱系(父子关系)' },
  { n: 'session_event_read', p: 'dsh-tool-session-query', c: 'sq', d: '有界读取会话事件' },
  { n: 'session_event_search', p: 'dsh-tool-session-query', c: 'sq', d: '检索会话内事件(含 SQLite 全文索引)' },
  { n: 'session_event_trace', p: 'dsh-tool-session-query', c: 'sq', d: '追踪事件上下游' },
  { n: 'subagent', p: 'dsh-tool-subagent', c: 'deleg', d: '委派子智能体执行任务(多种 Provider：同进程/fork/Claude Code/Codex/ACP/SDK)' },
  { n: 'list_subagent_models', p: 'dsh-tool-subagent', c: 'deleg', d: '列出子智能体可用模型' },
  { n: 'send_message', p: 'dsh-tool-subagent-control', c: 'deleg', d: '向其它智能体发送消息' },
  { n: 'list_agents', p: 'dsh-tool-subagent-control', c: 'deleg', d: '列出存活智能体' },
  { n: 'interrupt_agent', p: 'dsh-tool-subagent-control', c: 'deleg', d: '中断某个智能体' },
  { n: 'spawn_teammate', p: 'dsh-experimental-tool-agent-team', c: 'deleg', d: '(实验)创建团队成员智能体' },
  { n: 'team_task_create / get / list / update', p: 'dsh-experimental-tool-agent-team', c: 'deleg', d: '(实验)团队任务看板的增删查改' },
  { n: 'wait_agent', p: 'dsh-experimental-tool-agent-team', c: 'deleg', d: '(实验)等待队友完成' },
  { n: 'todo_write', p: 'dsh-tool-todo', c: 'plan', d: '维护任务清单(todo list)' },
  { n: 'exit_plan_mode', p: 'dsh-plan-mode', c: 'plan', d: '结束计划模式并交付计划供评审' },
  { n: 'create_goal / get_goal / update_goal', p: 'dsh-tool-goal', c: 'plan', d: '管理同会话持久目标(active/paused/blocked/complete)' },
  { n: 'schedule_create / delete / list', p: 'dsh-schedule', c: 'plan', d: '会话内定时跟进' },
  { n: 'workflow', p: 'dsh-tool-workflow', c: 'plan', d: '执行工作流(PTC 流程引擎)' },
  { n: 'ralph', p: 'dsh-tool-ralph', c: 'plan', d: 'Ralph 循环：面向不可变目标的“新鲜子会话”多轮工作流' },
  { n: 'skill', p: 'dsh-tool-skill', c: 'plan', d: '加载技能(预置工作流说明书)' },
  { n: 'job_list / job_output / job_kill', p: 'dsh-tool-jobs', c: 'jobs', d: '查看/收集/终止后台作业' },
  { n: 'stagehand_act / navigate / observe / extract / screenshot / tabs', p: 'dsh-experimental-browser-use-stagehand-native', c: 'browser', d: '(实验)浏览器自动化：操作、导航、观察、提取、截图、标签页' },
  { n: 'cordis_inspect_list / query', p: 'dsh-tool-cordis', c: 'self', d: '仅有的两个发货只读工具：检视 Host/Client 运行时 API 与服务目录' },
  { n: 'cordis_define / run / stop / undefine / inspect_self', p: 'dsh-cordis-host-runner', c: 'self', d: '动态会话工具(非发货目录)：定义/挂载/停止/删除运行时插件与包自诊断' },
  { n: 'plugin_manager', p: 'dsh-plugin-manager', c: 'self', d: '管理当前 profile 的插件与 bundle：启用/禁用、安装/移除外部 bundle，免手改配置' },
  { n: 'ask_user_question', p: 'dsh-tool-ask-user', c: 'misc', d: '向用户提出结构化问题并等待回答' },
  { n: 'lsp', p: 'dsh-tool-lsp', c: 'misc', d: '调用语言服务器(定义/引用/诊断等)' },
  { n: 'list_mcp_resources / templates, read_mcp_resource', p: 'dsh-mcp-resources', c: 'misc', d: '枚举与读取外部 MCP 服务器资源' },
];

/* ---------- 工程规范卡片(根 AGENTS.md Conventions) ---------- */
DSH.rules = [
  { g: '架构铁律', items: [
    { t: '注册即效果', d: '每一份贡献都走 <code>ctx.effect()</code> / <code>ctx.on()</code>；注册表的 <code>register()</code> 返回 disposer，卸载时自动回收。' },
    { t: '插件化，而非改循环', d: '新行为挂到有文档的扩展点上；改 <code>agent-loop</code> 本身必须同步更新 docs/architecture.md。' },
    { t: 'Seam 是完整三角', d: '能力接缝 = Service Definition + Provider + Consumer，缺一不可；仅当角色独立演化时才拆包。' },
    { t: '包边界上显式 > 隐式', d: '默认值是拥有方显式的 <code>resolve(request): Spec</code> 步骤，绝不是 <code>run()</code> 里藏的 <code>?? default</code>；dsh-shell 的 request/spec 拆分是模板。' },
    { t: '插件禁止硬编码可调参数', d: '随部署变化的选择必须是 cordis.yml 可改的、经校验的 <code>Config</code> 字段；<code>DEFAULT_*</code> 常量不算可配置。协议常量、外部规范、安全不变量保持固定。' },
    { t: '配置错误响亮失败', d: '能自洽判断就在加载时报错，否则在最早可解析点报错；绝不默默跳过缺失的引用。' },
    { t: '跨边界 ID 必须打标', d: '不透明的跨边界 id 用 <code>Branded&lt;B&gt;</code>(来自 dsh-brand)，绝不用裸 <code>string</code>。' },
    { t: '同进程类型边界信任 TS', d: '静态接口已保证的值不加运行时校验/兜底；校验只发生在真边界：解析/配置、队列、模型与工具 JSON、持久文件、worker、进程、网络。' },
    { t: '源码面与制品面不混用', d: '静态门禁与测试通过 tsconfig paths 解析到 <code>src</code>；消费构建产物 <code>lib/</code> 的门禁必须声明依赖。' },
    { t: 'ESM 到底', d: '所有包 <code>"type": "module"</code>；跨包用包名导入，本地相对导入带 <code>.ts</code>；dsh 源码启动走 tsx ESM-only hook，触及的模块不得是 CJS-only。' },
  ]},
  { g: '事件与类型', items: [
    { t: '事件用声明合并', d: '类型化事件通过 declaration merging 声明；事件 JSDoc 必须标 <code>@mode</code> 与 payload <code>@param</code>。' },
    { t: 'waterfall 必须 next()', d: '委托式监听器必须调用 <code>next()</code>；不调用就是短路——只有“拥有决定权”的单决策监听器才允许这么做。' },
    { t: '在判别标签上 switch', d: '封闭联合以 <code>assertNever</code> 收尾；可合并扩展的联合落入有文档的 default 分支。' },
    { t: '模型可见 ⟺ 已记录', d: '任何进入模型请求的内容必须能从会话日志重建；新的模型可见输入 ⇒ 新的 session event。运行时不变量会断言这一点。' },
    { t: 'SessionEventMap 默认“读时必认”', d: '不认识某类型的构建会拒绝读日志，除非事件带 <code>ignorable: true</code>；只有结构性变更才 bump <code>SESSION_FORMAT_VERSION</code>。' },
    { t: '全量 strict + JSDoc', d: '一切在 <code>strict: true</code> 下编译；每个模块与导出都有简洁 JSDoc，函数需 <code>@param</code>/<code>@returns</code>(verify-export-jsdoc 把关)。' },
  ]},
  { g: '代码卫生', items: [
    { t: '空 catch 必须留名', d: '空 <code>catch</code> 要命名错误并说明为什么忽略；其 <code>try</code> 只包一条语句。' },
    { t: '注释就地且只讲契约', d: '不复述代码、不写推理过程、不保存评审历史；保留行为/失败/时序/所有权事实，链接决策理由。' },
    { t: '平行值保持对称', d: '未解释的不对称通常意味着漏提了一个抽象。' },
    { t: '依赖优于手写', d: '能真正删掉自有代码和测试时，优先选择有人维护的依赖而非手制轮子。' },
    { t: 'TODO 标记分紧急度', d: '<code>FIXME</code> &gt; <code>TODO</code> &gt; <code>XXX</code> 按紧急度使用；文件末尾恰好一个换行(pre-commit 把关)。' },
    { t: '禁用含混来源词', d: '仓库明令禁用 “prove”+“nance” 拼成的那个词作为来源标签——写清楚确切来源。' },
  ]},
  { g: '流程与协作', items: [
    { t: '非平凡改动必附 Agent Note', d: '同一个 PR 里写下决策记录(为什么、放弃了什么、如何验证)；归档后的 note 冻结，不再是现行权威。' },
    { t: '慢进快退的 Git 约束', d: '独立改动拆 PR；重写历史只用 <code>--force-with-lease</code>，远端有新提交就中止，永不裸 <code>--force</code>。' },
    { t: '测试描述行为而非正确性', d: '行为过时就连同测试一起改，并在 PR 里解释原因。' },
    { t: '文档随代码同行', d: '每次代码变更同步更新受影响的 README 与 JSDoc；中英双语文档成对更新。' },
    { t: 'UI 文案归属 locale', d: '客户端产品文案走类型化字典与 <code>t()</code>；<code>verify-client-ui-i18n</code> 拒绝硬编码文案。' },
    { t: '每个工具先设计 UI 呈现', d: 'Host presenter 保持纯函数；Web 卡片从原始事件与持久化结果元数据派生。' },
  ]},
];

/* ---------- 防御性模式(docs/defensive-patterns.md) ---------- */
DSH.defensive = [
  { t: '正交结果独立上报', d: '一个结果可能同时是多件事：进程可以既超时又退出码 0(它捾住了信号)。timedOut / signal / exitCode 各自独立上报，绝不把一个旗子的报告嵌在另一个的分支里。' },
  { t: '公开契约双向履行', d: '实现收到同一结果的多种表示时，先归一化再穿过公开 API：模型请求失败只以终止 finish 块暴露，中间件/消费方缺陷仍然抛出——消费方不必猜异常来自谁。' },
  { t: '异步状态 ≠ 同步状态', d: 'agent.followup() 没有单条消息的完成回执；多条追加、定向、注入可能共享一个 running 区间。真正拥有一次运行的调用方必须显式定义自己的区间，并处理“无可等待”分支，否则永久挂起。' },
  { t: 'Dispose 要抵达静止，不只是发起', d: '只发 kill/abort 就返回的 teardown 会留下孤儿进程。清理必须异步并 await 子进程退出(kill → await done)；先关监听/通知注册表再 kill，迟到的完成保持静默。' },
  { t: '在分发器里围堵回调异常', d: '用户提供的监听器抛异常，不得拖垃它所处的 promise、也不得饿死后续监听器：dispatch 循环 try/catch + 记日志，一个坏订阅者永不击穿核心生命周期。' },
  { t: '不把环境交给不可信输出', d: '派生命令的环境变量被清洗(去除 *KEY* / *SECRET* / *TOKEN* / *PASSWORD*)；临时/溢写文件用 0700 私有目录、随机名、独占只读打开——可预测的世界可读路径会招致符号链接竞争与泄露。' },
  { t: '链接形状的路径用 unlink', d: '可能是 symlink / Windows junction 的路径，先 lstat 判断再 unlink——unlink 只删链接本身；递归 rmSync 只留给确知的真目录，否则可能穿进目标目录里删库。' },
];

/* ---------- 命令速查(根 AGENTS.md) ---------- */
DSH.commands = [
  { c: 'pnpm install', d: 'pnpm workspaces 安装；Node ^22.19 || >=24；同时配置 lefthook 钩子与翻译配对 merge driver', g: '环境' },
  { c: 'pnpm run typecheck', d: '类型检查(首次 clone 后跑一次验证环境)', g: '环境' },
  { c: 'pnpm run build', d: 'tsc 产出 lib/类型，tsdown 打包运行时', g: '环境' },
  { c: 'pnpm run clean', d: '清理构建产物与已删包残留', g: '环境' },
  { c: 'pnpm run test', d: '单元测试(vitest)', g: '测试' },
  { c: 'pnpm run test:coverage', d: 'CI 覆盖率门禁：packages/*/*/src 逐文件 100%', g: '测试' },
  { c: 'pnpm run test:e2e', d: '真实 API 测试；无 DEEPSEEK_API_KEY 时自动跳过', g: '测试' },
  { c: 'pnpm run test:expected', d: '持有者本地的进程期望输出测试', g: '测试' },
  { c: 'pnpm run test:snapshot', d: '无密钥录制会话回放(经发布 profile)；-t <name> 过滤', g: '测试' },
  { c: 'pnpm run test:snapshot:record', d: '重新录制期望输出(需密钥)', g: '测试' },
  { c: 'pnpm run lint', d: '代码风格检查', g: '质量' },
  { c: 'pnpm run duplication', d: '跨文件 TypeScript 克隆检测', g: '质量' },
  { c: 'pnpm run hygiene', d: 'publint + 工作区/包/依赖检查 + NodeNext 消费检查', g: '质量' },
  { c: 'pnpm run doc-sync', d: '文档门禁(scripts/run-gates.ts)', g: '文档' },
  { c: 'pnpm run test:docs', d: '快速文档检查(不构建)', g: '文档' },
  { c: 'pnpm run website:build', d: 'VitePress 构建(兼作死链检查)', g: '文档' },
  { c: 'pnpm dsh --profile headless "task"', d: '从源码跑一次任务(需 DEEPSEEK_API_KEY)', g: '运行' },
  { c: 'pnpm dsh web', d: '启动 Web UI(默认 http://127.0.0.1:3080)', g: '运行' },
  { c: 'dsh --profile web --dump-config', d: '打印本机引导的插件树；任意行都可被 patch 替换', g: '运行' },
  { c: 'pnpm run demo:ptc -- "task"', d: 'headless PTC 模式演示(需密钥)', g: '运行' },
];

/* ---------- 术语表(docs/glossary.md + 核心文档) ---------- */
DSH.glossary = [
  { t: '能力接缝', en: 'seam', src: 'docs/glossary.md', d: '可替换能力，含三角色：Service Definition(拥有 ctx 键与词汇类型的 Cordis Service，绝非 TS interface)、一个或多个 Service Provider、一个或多个 Consumer。shell 包组是教科书案例：dsh-shell / dsh-bash-local / dsh-tool-bash。seam 永远指完整能力，不指单个角色。' },
  { t: '作用域', en: 'scope', src: 'docs/glossary.md', d: '按 agent 注册的单位：一份贡献(工具/提示词段/变量/限制/监听器)要么全局可见，要么归属恰好一个 scope key。两层扁平结构：不向子 agent 继承；子树行为用 lineage 数据表达。' },
  { t: '作用域键', en: 'scope key', src: 'docs/glossary.md', d: 'scope 的不透明身份，按对象同一性比较；惯例：存活 agent 就是自己 scope 的 key。' },
  { t: 'agent 上下文', en: 'agent.ctx', src: 'docs/glossary.md', d: 'agent 的作用域上下文：经它的注册既“作用域可见”又“作用域同寿命”(一个事实驱动两种行为)，其监听器参与该 agent 的作用域过滤分发。' },
  { t: '名字遮蔽', en: 'shadowing', src: 'docs/glossary.md', d: '最具体获胜的名称解析：作用域内的同名工具/段落/变量仅对该作用域替换全局同名项——实现按 agent 人格与工具变体的机制。' },
  { t: '限制', en: 'restriction / tools.restrict', src: 'docs/glossary.md', d: '为单个作用域过滤全局工具集(交集合成)；被过滤掉的全局工具在提示词中不出现、执行也拒绝，与不存在无法区分。' },
  { t: '创建窗口', en: 'setup window', src: 'docs/glossary.md', d: '创建时组装 agent 作用域世界的槽位(CreateAgentOptions.setup)：scope 与 agent 对象已存在，但 agent/会话尚未发布、agent/created 未触发、首个提示词未组装。setup 只注册，从不驱动 agent。' },
  { t: '谱系', en: 'lineage', src: 'docs/glossary.md', d: '以数据形式携带的父子事实(parentSession、持久 delegationDepth、运行时 subagentDepth)；永不影响可见性。' },
  { t: '回合', en: 'turn', src: 'docs/glossary.md', d: '会话中一次已准入输入的“排空”：模型与其工具停止、或终止策略介入后结束；包含 0..n 个 step。' },
  { t: '步骤', en: 'step', src: 'docs/glossary.md', d: '一次模型请求加上它引发的工具执行。' },
  { t: '轮次', en: 'round', src: 'docs/glossary.md', d: '包含一个 turn 的外层策略迭代(goal round、Ralph 尝试)；计数器属于那个策略，不数会话里的每个 turn。' },
  { t: '目标', en: 'goal', src: 'docs/glossary.md', d: '附在现有会话上的单一持久完成目标，带版本化的 active/paused/blocked/complete 阶段与轮次上限；是状态而非调度器，会话日志仍是真相源。' },
  { t: '目标激活', en: 'goal activation', src: 'docs/glossary.md', d: '进程本地的继续许可(armed/disarmed)，故意不进入持久回放：resume/fork 后需要人类再次授权才能自动继续。' },
  { t: '人类命令', en: 'human command', src: 'docs/glossary.md', d: '斜杠前缀指令，由面向人类的适配器经 ctx.commands 解释执行，不变成模型消息；区别于模型工具与 shell 执行。' },
  { t: 'Ralph 循环', en: 'Ralph loop', src: 'docs/glossary.md', d: '面向不可变目标的前台“新鲜 agent”工作流：由 workflow + subagent 原语组合的模型侧工具策略；每轮是无种子的全新子会话，靠共享工作区与有界 handoff 传递状态。' },
  { t: 'Ralph 交接', en: 'Ralph handoff', src: 'docs/glossary.md', d: '一轮传给下一轮的规范化有界报告：状态、摘要、证据、下一步、阻塞说明；补充而非替代共享工作区的权威。' },
  { t: '配置方案', en: 'profile', src: 'docs/architecture.md', d: '存在 Harness home 的具名组合：列出堆叠的 bundle、存放仓外插件、保留用户自己的 cordis.patch.yml。随产品发货：web、headless、sdk、sdk-minimal、acp。' },
  { t: '包裹', en: 'bundle', src: 'docs/architecture.md', d: 'Cordis 配置行及其挂载代码的分发格式；它插入的一切对上层保持可 patch。dsh-base 是 web/headless/sdk/acp 四个 profile 共享的第一层。' },
  { t: '补丁', en: 'patch (cordis.patch.yml)', src: 'docs/architecture.md', d: '按 id 定位一行并整体替换其 config，或插入新行；层序：bundle(按序) → profile 补丁 → home 补丁 → --patch 覆盖层。' },
  { t: '会话事件', en: 'session event', src: 'docs/architecture.md', d: '追加到会话日志的持久事实，经 session/event 广播；需要在重启后存活的事实就用它。' },
  { t: 'agent 事件', en: 'agent/*', src: 'docs/architecture.md', d: '携带存活 Agent 的实时事件：inbox、step、status、request、validation、continuation；用于观察或拦截飞行中的工作。' },
  { t: '能力事件', en: 'fs/* tools/* telemetry/*', src: 'docs/architecture.md', d: '不导入循环即可在 seam 上附加策略与适配器的事件域。' },
  { t: '投影', en: 'projection (ctx.sessionProjections)', src: 'docs/architecture.md', d: '注册的单元增量折叠已提交事件；宿主用 stateOf() 读一个类型化状态，载体用 snapshot() 批量裁剪客户端视图。agent-loop 注册共享的 turnBoundary 状态。' },
  { t: '快照测试', en: 'snapshot test', src: 'docs/testing.md', d: '顶层场景用已录制的最高代父会话提供输入与模型回放，同时充当期望的持久结果；无密钥可跑。目录：snapshots/session|sdk|acp|web。' },
  { t: '代理笔记', en: 'Agent Note', src: '.agents/notes/', d: '活跃决策记录：为什么、放弃了什么、需要什么验证；非平凡 PR 必须附带。归档后冻结，不再作为现行权威。' },
  { t: '品牌类型', en: 'Branded<B>', src: 'AGENTS.md', d: 'dsh-brand 提供的标称类型包装：让不透明的跨边界 id 在类型层面互不混淆，禁止裸 string。' },
  { t: '应用启动铁律', en: 'application launch', src: 'docs/architecture.md', d: '只有 dsh CLI + 命名 profile 能启动受支持的 Node 应用；包 bin、demo、SDK argv 逃逸一律禁止，verify-application-entrypoints 把关。' },
  { t: '会话格式版本', en: 'SESSION_FORMAT_VERSION', src: 'docs/session-format-status.md', d: '写入器版本的唯一代码权威(packages/core/session/src/types.ts)；已发布的最新格式由发布记录追踪(当前为 v3，证据标签 dsh-v0.1.5-alpha.1)。' },
  { t: '相邻迁移', en: 'adjacent migration', src: 'AGENTS.md', d: '每个迁移包只拥有一步 vN → vN+1；可新增版本命名的后继文件，但永不移动/覆盖/删除已提交代际；前代不隐含回退支持。' },
  { t: '溯源失败类测试', en: 'REAL-composition test', src: 'packages/AGENTS.md', d: '产品可见插件必须有非单元的真实组合测试：用测试专属 cordis.yml 经 Loader 与应用/进程启动，只 mock 外部或非确定性输入，断言模型可见/持久/用户可见输出。' },
  { t: 'PTC', en: 'PTC runtime', src: 'packages/README.md', d: 'PTC 执行能力族(ptc-runtime 分组)：Service Definition + 沙箱化 Node Provider + PTC 模式 Consumer；与 run_code 工具、demo:ptc 相关——让模型用代码编排工具调用。' },
  { t: '收件箱', en: 'inbox', src: 'docs/architecture.md', d: '输入抵达驱动器的唯一通道：有些消息立即唤醒循环；注入的上下文则在收件箱里等到另一条消息唤醒才随行。' },
  { t: '展开式嵌入流', en: 'embedded assistant stream', src: 'docs/architecture.md', d: '每条 assistant/message 内嵌产生它的精确紧凑计时流；assistant/attempt 保留失败/重试/取消/流错误的尝试而不增加模型历史。' },
  { t: '哥德尔机', en: 'Gödel machine', src: '第 02 章 · Schmidhuber 2003', d: '自改的形式化原型：agent 持有自身完整描述，仅当能数学证明一次重写带来净收益时才执行——包括重写自己的证明器。形式最优，但证明搜索在实践中不可计算；Gödel Agent/DGM/HGM 用经验评估替代证明门槛。' },
  { t: '哥德尔 agent', en: 'Gödel Agent', src: '第 02 章 · arXiv:2410.04444', d: '首个可运行的自引用 agent 框架(PKU × UCSB, ACL 2025)：LLM 在运行时直接改写自身逻辑(monkey-patch 式)，仅靠高层目标引导，不需预设流水线。比 DGM 早大半年——它证明“能跑”，DGM 证明“能严谨地跑”。' },
  { t: '开放式进化', en: 'open-endedness', src: '第 02 章 · DGM', d: '不只从当前最优个体继续，而是维护不断增长的多样性档案库：任何“垫脚石”祖先都能成为新分支的起点。DGM 消融实验证明它与生改进同等必要——贪心爬坡会困在局部最优。' },
  { t: '元生产力', en: 'metaproductivity (CMP)', src: '第 02 章 · HGM', d: '一个 agent 的“自我改进潜力”，理论上涉及未来终选效用；在线估计使用支系统计，二者不可等同。HGM 的关键洞见：自身分数高 ≠ 后代会强——评估谁当祖先,要看谱系而非个人。' },
  { t: '对齐', en: 'alignment', src: '第 06 章 · Amodei 2016 / Russell 2019', d: '让系统的实际行为与人类意图/价值一致。分外层(奖励/评测写对了吗)与内层(模型学到的目标是否一致)；reward hacking、对齐造假、元游戏都是两层缝隙里长出的失败模式。' },
  { t: '元游戏', en: 'metagaming', src: '第 08 章 · OpenAI × Apollo 2026', d: '模型对“环境如何打分/谁在监督”这类游戏外机制的推理——不要求分清训练/评测/部署、不要求猜对机制。能力导向 RL 里自发上升、随激励结构开关，是对齐造假与绕过监督的前置认知能力。' },
  { t: '轨迹', en: 'transcript / trajectory', src: '第 04 章 · Anthropic evals', d: '一次试运行的完整记录：输出、工具调用、推理、中间结果。评测器要么评轨迹(过程)，要么评最终结果(outcome)——Anthropic 强调评 outcome 不评路径，防 agent 因"没按预期步骤走"被误杀。' },
  { t: '评分器', en: 'grader', src: '第 04 章 · Anthropic evals', d: '给一次试运行打分的逻辑：代码级(断言/单测/静态分析)、模型级(LLM-as-judge + rubric)、人类级(评审)。一个任务可挂多个 grader，各自含多条断言。' },
  { t: '结果', en: 'outcome', src: '第 04 章 · Anthropic evals', d: '试运行结束时环境的最终状态(如数据库里真的有了预订)，区别于 agent 自己说的"我订好了"。评 outcome 而非 transcript，是防"嘴上完成"的关键。' },
  { t: 'pass@k / pass^k', en: 'pass@k / pass^k', src: '第 04 章 · Anthropic evals', d: '非确定性下两个互补指标：pass@k 是 k 次尝试至少过一次的概率(单发找解)，pass^k 是 k 次全过的概率(用户期望的稳定性)。同一个 agent 在 k=10 时两者可以一个趋近 100% 一个趋近 0。' },
  { t: '评测饱和', en: 'eval saturation', src: '第 04 章 · Anthropic evals', d: 'agent 把可解任务全做对后，分数停在 ~100%，只剩最难的尾巴——此时分数增长放缓不代表能力停滞。饱和的能力评测可"毕业"成回归集。' },
  { t: '能力评测 / 回归评测', en: 'capability vs regression eval', src: '第 04 章 · Anthropic evals', d: '两种评测目的不同：能力评测选 agent 做不好的题(低通过率起步)，用来爬坡;回归评测选已掌握的题(≈100% 通过)，用来防退步。前者毕业即后者。' },
];

/* ---------- 测验 ---------- */
DSH.quiz = [
  { q: 'waterfall 监听器想把控制权交给下一个监听器，应该怎么做？', o: ['返回 undefined', '调用 next()', '抛出 PassException', '调用 ctx.emit()'], a: 1, e: 'waterfall 是环绕式中间件：监听器收到 (...args, next)，调用 next() 委托下游；不调用就是短路。只有真正拥有决定权的单决策监听器才允许不调用 next()。' },
  { q: '以下哪个是写入会话日志的持久事件？', o: ['agent/pre-step', 'llm/stream', 'tool/result', 'tools/execute'], a: 2, e: '持久事件是 turn/*、step/*、system/message、user/message、assistant/message、assistant/attempt 与 tool/*；agent/*、llm/stream、tools/* 是进程内活体扩展点。' },
  { q: 'CI 的覆盖率门禁要求是？', o: ['全仓库平均 80%', 'packages/*/*/src 逐文件 100%', '核心包 90%，其它 70%', '只要求新增代码覆盖'], a: 1, e: 'pnpm run test:coverage 是门禁：逐文件 100%。未覆盖的行往往是该删的死代码，而不是要补的测试；行覆盖必要但永远不充分。' },
  { q: '想让一个新的事实变成模型可见的输入，首先需要？', o: ['直接拼进 prompt 字符串', '新增一个 session event', '写进全局变量', '修改 agent-loop'], a: 1, e: '铁律“模型可见 ⟺ 已记录”：任何进入模型请求的内容必须能从会话日志重建，运行时不变量会断言；所以新的模型可见输入需要新的 session event。' },
  { q: 'Capability Seam(能力接缝)由哪三个角色组成？', o: ['Model / View / Controller', 'Service Definition / Service Provider / Consumer', 'Interface / Implementation / Test', 'Plugin / Service / Event'], a: 1, e: 'seam = 声明接口的 Service Definition + 实现它的 Provider + 使用它的 Consumer(常为模型工具)；shell 包组是教科书案例。它是完整能力，绝非单个角色。' },
  { q: '启动受支持的 DSH Node 应用的唯一方式是？', o: ['直接 node lib/main.js', '各包自带的 bin', 'dsh CLI + 命名 profile', '在代码里直接挂载插件树'], a: 2, e: '只有 dsh CLI 配合命名 profile(web/headless/sdk/sdk-minimal/acp)能启动受支持的 Node 应用；verify-application-entrypoints 拒绝一切绕过 dsh 的路径。' },
  { q: 'cordis.yml 中 !!js 表达式允许出现在哪里？', o: ['任意字段', '只有插件 config 与条目 disabled', '只有插件名', '禁止使用'], a: 1, e: '!!js(永远不是 !js)仅允许出现在插件 config 和条目 disabled 下；其它元数据保持字面量，条件化组合用 overlay。' },
  { q: '哪种 dispatch 模式会等待所有监听器并行完成？', o: ['emit', 'waterfall', 'parallel', 'bail'], a: 2, e: 'parallel 是唯一“并行观察 + 等待全部”的模式；serial 也等待但是依次执行；emit/waterfall/bail 不等待。' },
  { q: '关于会话文件代际，正确的是？', o: ['迁移时把旧文件升级重写', 'v1+ 命名 session.vN.jsonl，已提交代际永不改名/覆盖/删除', '旧版本读取时自动删除', '只保留最新两代'], a: 1, e: 'JSONL v0 用 session.jsonl[.zstd]，v1+ 用小写 session.vN.jsonl[.zstd]；写式 open 在源文件旁边发布后继，已提交代际永不改名、替换或删除。' },
  { q: '插件想使用一个“可选”服务(没有声明在 inject 里)，应该用？', o: ['ctx.<name> 属性直接读', 'ctx.get(name)', 'import 具体实现', 'new 一个实例'], a: 1, e: '可选服务用 ctx.get(name) 读全局服务存储；ctx.<name> 属性代理留给已声明的注入，它对拓扑敏感(源自 postmortem 0001)。' },
  { q: '单元测试中应该 mock 什么？', o: ['尽量全部 mock 保证隔离', '只 mock 昂贵或非确定性边界(LLM 适配器/网络/时钟)，下游保持真实', '只 mock 文件系统', '从不 mock'], a: 1, e: '手工替身只能证明“桥能搬字节”。保持真实的工具注册表与流水线，只把 LLM 适配器、网络、时钟这类边界换成 mock(如 MockAdapter)。' },
  { q: '以下哪条推理属于元游戏(metagaming)？', o: ['“这题考察递归，我应该用分治”', '“分析通道里的代码执行可能被监控看到，我还是手写计算吧”', '“用户想要快一点，我跳过测试”', '“上一轮我答错了，这次换个思路”'], a: 1, e: '元游戏是对“游戏外”打分/监督机制的推理：监控能否看到工具调用、隐藏测试会不会抓到绕过、评分管线如何实现——与题目本身无关。注意它不要求模型分清自己在训练还是评测，也不要求猜对机制。' },
  { q: '外层对齐与内层对齐的区别是？', o: ['外层=模型写对代码，内层=模型跑得快', '外层=奖励/评测表达了真实意图，内层=模型学到的目标与之一致', '外层=部署安全，内层=训练安全', '两者是同义词'], a: 1, e: '外层问“我们给的目标对不对”，内层问“模型内部学的目标是不是同一个”。RLHF 只近似外层；内层失败就是 alignment faking——模型学会“表现得对齐”而非“对齐”。' },
  { q: '一个 step 和一个 turn 的关系是？', o: ['同一个概念', 'turn 包含 0..n 个 step；step = 一次模型请求 + 其工具调用', 'step 包含多个 turn', 'turn 只能有一个 step'], a: 1, e: 'step = 一次模型请求加它引发的工具执行；turn 在领取第一份输入前开启、无所“欠”时关闭，可能包含 0 个 step(如 pre-step 拒绝)。' },
  { q: '想在运行时给 agent 加一个新工具，DSH 的正规路径是？', o: ['改 agent-loop 源码加分支', 'cordis_define 一个包注册 ToolDefinition，审批后 cordis_run 挂载', '把函数写进提示词让模型自己调用', '重启进程加载新文件'], a: 1, e: '新工具走 ctx.tools.register(经 ctx.effect 返回 disposer)；运行时自改用 cordis_define 产不可变 packageId，cordis_run 人工审批后挂载——失败可一键回滚到 currentPackageId。' },
  { q: 'DSH 里 plugin_manager 工具由谁提供、干什么？', o: ['dsh-tool-cordis，读运行时 API', 'dsh-plugin-manager(boot 组)，管理当前 profile 的插件/bundle 启用与安装', 'dsh-bundle-base，编译插件', 'dsh-ui-cordis，渲染插件面板'], a: 1, e: 'dsh-tool-cordis 只发货 cordis_inspect_list/query 两个只读工具；持久的插件/bundle 管理归 boot 组的 plugin-manager(提供 pluginManager 服务 + plugin_manager 工具)。运行时自改工具(define/run/stop)由 cordis-host-runner 提供，不在发货目录。' },
];

/* ---------- 文档地图 ---------- */
DSH.docmap = [
  { f: 'docs/architecture.md', d: '改 packages/ 前必读的有序地图：组合、核心包、循环、seam、扩展点' },
  { f: 'docs/cordis-primer.md', d: 'Cordis 入门：五大理念、dispatch 模式、waterfall 语义、Loader 配置' },
  { f: 'docs/cordis-tutorial/', d: '动手版 Cordis 教程' },
  { f: 'docs/testing.md', d: '测试分层与铁律：with-key 策略、真实入口路径、快照要求' },
  { f: 'docs/defensive-patterns.md', d: '真实事故沉淀的防御性规则；写生命周期/并发/子进程代码前必读' },
  { f: 'docs/glossary.md', d: '领域术语的唯一正式定义' },
  { f: 'docs/subsystems/', d: '每子系统一页：类型定义、语义与生成的 Cordis API' },
  { f: 'docs/cookbook/', d: '带验证步骤的手把手指南：加包、加工具、加 LLM 适配器、加设置卡片' },
  { f: 'docs/tool-catalog.md', d: '生成的完整工具 schema 目录' },
  { f: 'docs/config-catalog.md', d: '生成的配置字段目录' },
  { f: 'docs/event-producer-consumer.md', d: '每个事件的生产者/消费者地图' },
  { f: 'docs/user/', d: '面向产品用户的 Web UI 指南(发布到文档网站)' },
  { f: '.agents/notes/', d: 'Agent Notes：活跃决策记录与历史归档' },
  { f: 'docs/postmortem/', d: '事故复盘——唯一允许“战争故事”叙事的层级' },
];
