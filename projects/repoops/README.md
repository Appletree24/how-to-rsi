# RepoOps Lab

网站 P0–P11 的配套项目。用户输入仓库故障工单，Agent 查询工单与运行手册，提交处置代码和证据，独立 grader 检查结果。随后按课程扩展成可靠调度服务、隔离修复任务和候选搜索实验。

## 立即运行

在仓库根目录使用 Python 3.10+，只用标准库：

```sh
python -m projects.repoops.runner demo
python -m unittest discover -s tests -v
```

输出在 `lab-output/repoops/`：`runs.sqlite`、`naive.json`、`evidence.json`、`summary.json`。6 个开发任务，naive 严格通过率为 0，evidence 为 1；模型调用分别 12/24 次。它们是专为教学构造的规则策略与任务，不是真实 LLM 结果，也不是公平性能优越性证明。

`evidence` 确实执行工具：读工单、搜索手册、读当前手册、提交答案；成绩由 grader 根据结果和已读证据计算。不存在 API 花费；token usage 为 null，不会伪造 token 或美元数据。

## 运行、续跑、查看轨迹

```sh
python -m projects.repoops.runner run --policy evidence --limit 2
python -m projects.repoops.runner run --policy evidence
python -m projects.repoops.runner report RUN_ID
python -m projects.repoops.runner run --policy naive --split test_public
python -m projects.repoops.runner run --policy evidence --max-steps 2
```

把 `RUN_ID` 替换成 run 命令打印的值。相同规格跳过已提交 trial；修改数据、源代码、提示、模型修订或预算产生新实验。`--limit` 只是人为中断调试，不改变规格。`--repeats N` 是同一任务重复，不能当 N 倍独立样本。`complete=false` 表示部分报告，不可当最终成绩。

持久化单位是完整 trial（轨迹与结果一起提交），不是每个 token 或每一步 checkpoint。中途崩溃会重跑尚未提交的 trial；已经发送的模型调用可能重复，费用也可能重复。SQLite 写锁覆盖整个 trial，仅用于串行教学；P5 作业用短事务、lease 与 fencing 替换它。

## 可选真实模型

先在本机安装并启动 Ollama，准备已下载的模型。记录模型 digest，再运行：

```sh
python -m projects.repoops.runner run --policy ollama \
  --model YOUR_LOCAL_MODEL --model-revision YOUR_MODEL_DIGEST \
  --limit 1 --max-steps 6 --timeout 120
python -m projects.repoops.runner report RUN_ID
```

只连接 `http://127.0.0.1:11434/api/chat`，不处理云端密钥。`--model-revision` 是调用者声明并记录的修订，本实现未向服务器认证它；正式实验应核对服务端实际 digest。采用 messages + JSON action 协议，不是原生 function calling。可用 `--prompt PATH` 替换系统提示；两组真实模型实验应保持其它参数不变。规则策略不依赖 prompt 文本，不能用它测 prompt 优化收益。

HTTP 适配器经过 mock 协议测试；本次维护没有运行本地模型权重。超时是调用等待与循环检查，不是服务端推理硬取消。真实推理可能消耗本机 GPU/CPU；模型效果和硬件占用需要你测量。

## 文件与契约

| 文件/函数 | 职责 | 下一步练习 |
| --- | --- | --- |
| [data/tasks.json](data/tasks.json) | 12 个公开原创任务，6 个服务家族 | 补数据卡、真实来源与独立任务 |
| [agent.py](agent.py) `decode_action` | 严格工具 schema | 一次格式修复，计入同一预算 |
| `Corpus` | 简单英文词集合检索与读取 | 中文/BM25/向量检索及消融 |
| `RulePolicy` / `OllamaPolicy` | 规则/本机模型适配 | 固定模型和 prompt 的真实比较 |
| `run_agent` | 预算、动作、观察、终态 | 外部 deadline、独立环境与取消 |
| [runner.py](runner.py) `grade` | 答案、引用存在/已读/覆盖 | 自然语言支持判断与校准 |
| `evaluate` / `report` | 不可变 manifest、SQLite、完整轨迹 | Go API、attempt、lease、fencing |
| [upstream-lock.json](upstream-lock.json) | 源码审阅用固定提交 | 安装后另存真实环境锁文件 |

可接受动作：`search(query)`、`read(id)`、`finish(answer,citations)`。终态为 `ok`、`budget_exhausted`、`timeout`、`provider_error`、`invalid_output`。`ok` 只表示正常提交，是否通过由 grader 决定。

当前 dataset 内仍公开保存 expected_answer；只有函数参数层面的隔离，没有进程级保密。未知文档读取返回错误对象；不存在 shell 或任意路径读写工具。严格 schema 防止调用不存在的工具，但不证明模型不会被文档内容误导。

所有结果标注 `public_demo=true`，发布决策固定为 `disabled_public_demo`。不要把 `test_public` 改名后送入旧评测门伪装成密封确认集。正式评测适配请遵循 P7 的访问、抽样与冻结协议。

## 完成范围

| 已有并测试 | 学习者按课程实现 |
| --- | --- |
| 工具循环、独立规则 grader、规则策略 | 更一般的任务与真实模型质量实验 |
| 可选 Ollama HTTP 适配器 | 模型安装、硬件与结果复现 |
| 串行持久化、续跑、JSON 轨迹报告 | Go 服务、分布式队列、dashboard |
| 预算/协议/证据/恢复测试 | 混合检索、judge 校准、隔离执行 |
| 固定源码入口和实验设计 | Harbor/GEPA 接入、元改进实验 |

课程页面在仓库根目录 [index.html](../../index.html)，导航 P0–P11。详细接口和反例练习见 [implementation-workbook.md](../../docs/capstone/implementation-workbook.md)；求职产物见 [career-evidence.md](../../templates/career-evidence.md)。
