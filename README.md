# how-to-rsi · 造一个能改进自己的 Agent

一个纯静态、可离线使用的交互式学习与实践站：目标是 **RSI(Recursive Self-Improvement,递归自我改进)**。DeepSeek Harness(dsh) 是本站的实战载体——它是目前公开实现中唯一让 agent 把新代码变成"自己身体的一部分"（运行时 Cordis 插件）的 harness。

## 使用方法

直接双击打开 `index.html` 即可(无需构建、无需联网、无外部依赖)。

如果希望用本地服务器访问(可选)：

```sh
# 任选其一
cd <本目录>
python -m http.server 8080
npx serve .
```

然后打开 http://127.0.0.1:8080。

## 内容与结构

四个模块，先学后做：

- **基础概念**：什么是 RSI、自我改进分级阶梯(L0–L5)、RSI 回路的最小形状；哥德尔机四代谱系(2003 原型 → 2024 Gödel Agent → DGM → HGM)、"贪心爬坡 vs 开放档案"模拟器、AlphaEvolve 近邻辨析
- **机制与评测**：实现 RSI 的六项机制 ↔ DSH 包级映射(自改/记忆/评估/沙箱/目标/护栏)；评测专章(四种范式/三级能力/防作弊/评测门模拟器)；载体对比(谁让你改运行时——选型维度与落点)
- **对齐与安全**：对齐总览(外层/内层、失败模式动物园、四层方法论地图)；推理可监控性(CoT 安全层)；元游戏——模型自发推理"谁在打分、谁在监督"；Hugging Face 事件复盘(多 agent 涌现协调)；忏悔机制(分离奖励通道让"主动交代作弊"成为最优策略)；安全与护栏(五层防御清单)
- **DSH 实战**：12 章交互教程(认识 DSH → Cordis → 架构 → Agent Loop → 持久化 → 包版图 → 工具 → 规范 → 测试 → 工作流 → 术语 → 14 题测验) → 五个递进实战关卡(L1 读图 → L4 策略插件化) → 实战项目「自改评测管线」(黄金任务集 → eval runner → keep/rollback 门)

交互与全局能力：

- 事件分发模拟器、Agent Loop 逐帧播放器(含会话日志磁带)、包版图探索器(52 组 / 280+ 包)、工具目录探索器(按包归组的全部工具条目)、扩展点选择器、可搜索术语表、14 题测验(带解析与彩蛋)、实战关卡 checklist(带验收标准)
- Ctrl/Cmd+K 命令面板搜索、←/→ 翻章、亮/暗主题(默认纸面浅色)、学习进度持久化(localStorage)、代码一键复制、响应式 + 减动效适配
- 可访问性：全站可键盘操作(焦点环/跳转链接/ARIA 标注)；禁用 JavaScript 时自动降级为带目录的纯阅读模式

设计取向：排版优先的极简博客风——纸张底、衬线正文、单一强调色、无渐变/发光/玻璃拟态、无入场动画，内容密度优先。

## 内容来源与可信度

- **RSI 概念章节为教学整理**（非学术论文），安全章节只讨论"有审批、可回滚、可评估"的工程实现。
- **DSH 章节**整理自 deepseek-harness 仓库的权威文档：`AGENTS.md`、`docs/architecture.md`、`docs/cordis-primer.md`、`docs/testing.md`、`docs/glossary.md`、`docs/defensive-patterns.md`、`packages/README.md` 等；包/工具清单取自仓库实测时点快照(见 data.js 的 DSH.meta)。标注"教学示意"的代码片段为示意性质。DSH 处于 developer preview，一切以仓库为准。
- **载体对比表**为教学整理，基于各产品公开文档与发布形态，随版本演进可能变化。

## 目录结构

```
index.html            单页应用(全部章节正文)
assets/css/main.css   设计系统与动画
assets/js/data.js     内容数据(模块/章节/包/工具/术语/测验/RSI 数据…)
assets/js/app.js      路由、交互组件、动效引擎
assets/favicon.svg    站点图标
```
