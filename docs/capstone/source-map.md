# 岗位、面经与开源源码映射

核对日期：2026-09-19。用于课程设计的样本，不是招聘市场统计。技术原理由官方文档/源码支持；面经只提供考察主题。未找到可稳定核对正文的牛客搜索结果没有纳入来源，避免将搜索摘要或首页当成真实面经。

## 岗位样本

| 来源 | 核对结果 | 对应产物 |
| --- | --- | --- |
| [Anthropic · Research Engineer, Model Evaluations](https://job-boards.greenhouse.io/anthropic/jobs/5198255008) | 能力指标、可靠评测执行、回归定位、实验解释；要求 Python 与系统能力 | P1/P4/P6/P7 数据卡、审计与报告 |
| [Anthropic · Software Engineer, Research Infrastructure](https://job-boards.greenhouse.io/anthropic/jobs/5283063008) | 研究基础设施的可靠性、扩展与架构取舍；资深工作样本 | P5/P6 租约、恢复、容量与 ADR |
| [Anthropic · Applied AI, Research Engineer](https://job-boards.greenhouse.io/anthropic/jobs/5390811008) | 围绕客户需求做技术原型、评测和沟通 | P2/P3/P11 演示与证据叙述 |

三个岗位均是海外机构样本，不能推出国内岗位数量、薪资或学历要求。课程不承诺匹配这些具体职位。学习者应补采目标城市与资历的 10 个当前 JD，填入岗位矩阵。

## 面经的可信度与引用边界

- [Datawhale 社区 · LLM & VLM & Agent 面试问题总结](https://github.com/datawhalechina/hello-agents/blob/203e9fac88b23291b407f76549e250fd51c295e3/Extra-Chapter/Extra01-%E9%9D%A2%E8%AF%95%E9%97%AE%E9%A2%98%E6%80%BB%E7%BB%93.md)：作者称整理自 2025 秋招多次真实技术面试。核对声明与 Agent/RAG/评估主题；个人自述，未独立验证，不作为技术原理依据。
- [卡码 · 字节 Agent 开发四面面经（转载与编辑整理）](https://notes.kamacoder.com/interview/llm/20260506bytedance.html)：核对公开转载的候选人经历及编辑提炼的问题主题；未访问付费原帖。不可作为企业标准题库或技术答案权威。

| 来源定位 | 可提取的主题 | 课程映射 | 不作何种推断 |
| --- | --- | --- | --- |
| Datawhale §4 Agent | 组件、工具、记忆、选型 | P2/P3/P8 | 不归属到某家公司或频率排行 |
| Datawhale §5 RAG | 检索/生成分开评估 | P3 | 不直接转载其参考答案 |
| Datawhale §6 评估 | judge、过程效率、鲁棒性 | P4/P6/P7 | 个人面试样本不代表所有岗位 |
| 卡码转载经历与编辑主题 | 工程基础、上下文、工具、成本 | P2/P5/P6/P11 | 未验证付费原帖，不称企业标准题库 |

P11 的答辩题、参考检查点与编码练习均为本站原创训练设计，不能改标为企业真题。本文不复制整套题库。

## 四个开源项目：读什么、为什么、做到什么

### mini-SWE-agent · DefaultAgent 源码

[固定源码](https://github.com/SWE-agent/mini-SWE-agent/blob/04d809ceab9df28f9adaed044884180159172930/src/minisweagent/agents/default.py) · commit 04d809ceab9df28f9adaed044884180159172930

阅读 DefaultAgent.run/step/query/execute_actions，画预算检查与异常的控制流；解释为什么单次调用可能先超预算再停止。对应 P2，交付自己的动作协议与轨迹。

### Inspect AI · Task 源码

[固定源码](https://github.com/UKGovernmentBEIS/inspect_ai/blob/ec4dfc6953784dc45b79de3147530c89868c6e26/src/inspect_ai/_eval/task/task.py) · commit ec4dfc6953784dc45b79de3147530c89868c6e26

阅读 Task 构造参数的 dataset/solver/scorer、limits 与错误策略；与 RepoOps 的执行/评分接口对照。对应 P4，不要求同时采用两套编排框架。

### Harbor · Trial 源码

[固定源码](https://github.com/harbor-framework/harbor/blob/2993946dd5b64a46dac3aa766d03065f432a1468/src/harbor/trial/trial.py) · commit 2993946dd5b64a46dac3aa766d03065f432a1468

阅读 Trial 初始化对 Task、environment、verifier、paths 的关联；本轮只核对前 180 行，完整生命周期与清理由学习者继续追踪。对应 P8，交付一个 oracle/negative 都有效的隔离任务。

### GEPA · GEPAAdapter / EvaluationBatch 源码

[固定源码](https://github.com/gepa-ai/gepa/blob/15ee314f9c7d34ec153b809d401f42f55c4dcd76/src/gepa/core/adapter.py) · commit 15ee314f9c7d34ec153b809d401f42f55c4dcd76

阅读 EvaluationBatch 和 GEPAAdapter 前 180 行，核对数组对齐、反馈与错误语义。对应 P9，交付适配器、预算账本和无反馈消融。

源码锁文件在 [upstream-lock.json](../../projects/repoops/upstream-lock.json)。它只锁阅读对象，不是经过依赖解析和运行验证的环境 lock。实际安装需要另记录 Python、包版本、镜像 digest 与模型修订。

## 操作与 API 依据

- [Harbor 官方 · Create a task](https://docs.harborframework.com/tutorials/create-a-task)：核对任务文件、init/oracle/view 命令与 reward 文件；未在本仓库运行 Harbor。
- [Harbor 官方 · Separate verifier](https://docs.harborframework.com/core-concepts/tasks/separate-verifier)：核对默认共享环境、显式 separate 配置、镜像选择和 artifact 传递；运行时兼容性待学习者验证。
- [GEPA 官方仓库 · 反思优化](https://github.com/gepa-ai/gepa)：核对文本候选、轨迹反馈和适配器定位；未引用宣传收益或声称复现。
- [Ollama 官方 · Generate a chat message](https://docs.ollama.com/api/chat)：核对本机 /api/chat、messages、stream、format 和 usage 字段；本仓库只做 HTTP 契约 mock 测试，未运行真实权重。

## 原创项目设计与待验证部分

RepoOps 的任务数据、课程节奏、接口设计、故障练习、统计协议、岗位证据映射由本站编写，非上述项目的官方教程。已有能力与练习范围见 [项目 README](../../projects/repoops/README.md)。若文档/API 更新，先复查固定源码与实际版本差异，再更新适配代码和来源台账；不要只改日期。
