# RepoOps 实现工作簿

这是 P3–P10 的具体开发任务与参考设计。已有代码入口在 [项目 README](../../projects/repoops/README.md)。本文件内的 SQL、接口草图与实验配置是供学习者实现的规格，不声称已部署或验证第三方兼容性。

## P3：先写检索合同测试

输入 `query, corpus_revision, top_k`，输出 `[{doc_id, revision, chunk_id, score}]`。约束：top_k 为正且有上限；相同内容/参数排序稳定；空查询不给整库；未知 revision 明确报错。词法与向量的原始 score 不可直接相加，先比较排名融合或经过校准的分数。

准备四个检索测试：错误码精确匹配、同义词表达、过期手册排除、无相关证据。每个测试标注 gold evidence，而非 gold answer。用同一组题量 Recall@k，再把返回结果交给同一个冻结 Agent 量最终通过率。两份表分开保存。

任务：引入支持中文的检索；增加文档 revision；实现混合检索；加入一项可关闭的 reranker。一次提交只改变一个实验变量。回归：检索索引更新后不允许仍然命中旧 cache；cache key 至少含语料、查询、检索器配置和 embedding 修订。

参考分析：向量分数高不保证证据版本正确；一个旧 runbook 可以与问题最相似。版本/权限过滤应在受信环境层实施，不能只在 prompt 中要求“不要看旧文档”。

## P4：评分器变异清单

至少实现以下独立 mutant，每个记录期望的失败维度：正确动作+不存在引用；引用正确但从未读取；旧手册；答非所问；未知错误仍强行处置；无条件拒答；格式正确但字段语义错误；超时后返回正确答案。若添加自由文本 judge，再加入冗长无关答案、位置交换和输出内的评分指令。

扩展结果：`task_outcome, protocol_ok, evidence_supported, policy_violation, evaluator_error`。不要用一个 float 掩盖它们。只有受信评分器能写最终 score；Agent 自报“测试全过”仅作为轨迹文本。

## P5：三张表和三个竞态

建议从以下 PostgreSQL 风格模型开始（类型可按实现调整）：

```sql
CREATE TABLE experiments (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT UNIQUE NOT NULL,
  spec_hash TEXT NOT NULL,
  spec_json TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE trials (
  id TEXT PRIMARY KEY,
  experiment_id TEXT NOT NULL REFERENCES experiments(id),
  task_id TEXT NOT NULL,
  repeat_index INTEGER NOT NULL,
  arm TEXT NOT NULL,
  state TEXT NOT NULL,
  fencing_token BIGINT NOT NULL DEFAULT 0,
  lease_until TIMESTAMPTZ,
  result_uri TEXT,
  UNIQUE(experiment_id, task_id, repeat_index, arm)
);
CREATE TABLE attempts (
  id TEXT PRIMARY KEY,
  trial_id TEXT NOT NULL REFERENCES trials(id),
  fencing_token BIGINT NOT NULL,
  worker_id TEXT NOT NULL,
  state TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMPTZ,
  error_class TEXT,
  usage_json TEXT,
  result_sha256 TEXT,
  UNIQUE(trial_id, fencing_token)
);
```

领取：短事务中选择 queued 或租约到期的 running 行（生产数据库可使用 `FOR UPDATE SKIP LOCKED`）；检查 experiment 没有取消；递增 token，更新 running/lease_until；新增 attempt；提交；事务外运行。旧 attempt 标记 expired，保留已知消耗。

完成：锁住 trial，验证 token、未取消、租约有效；将 attempt 终态、结果 URI/hash 和 trial 终态一起提交。同 token 的相同结果重复上报返回原结果；不同 hash 的重复完成返回冲突。过期结果只能进入诊断档案。

恢复：定时扫描过期 lease；最终回收资格以数据库状态为准。heartbeat 续租也必须条件更新；同时运行两个 sweeper 不应产生两个合法 owner。

三个必须录屏/留日志的竞态：

1. W1 拿 token=7 后卡住，W2 回收拿 token=8 并完成，W1 迟到提交 token=7，最终结果仍来自 W2。
2. 模型已返回，worker 在提交数据库前退出；重跑产生额外成本，attempt 账本表明不具备外部 exactly-once。
3. 用户取消和 worker 完成同时发生，数据库合法转移决定结果；取消请求不必等于物理终止，需要显示终止确认。

Go 实现建议顺序：内存单 worker→数据库 trial→两个 worker→heartbeat/fencing→取消→对象存储。每一步用假模型服务验证，再接昂贵模型。验收包括所有 goroutine 能退出、重试遵守总 deadline、无忙等和无限重试。

## P6：一次故障报告的最低内容

填写受影响实验、开始/发现/恢复时间、用户可见影响、根因假设、排除证据、修复与防复发。区分 data_error、provider_error、environment_error 和 grader_error。

算成本时先保存 usage 原始字段，再用带时间的价格表换算。价格表不应改变历史用量；可以按新价格生成新的估价列，但不能悄悄改旧报告。未返回 usage 的请求记录 unknown，并根据明确方法给出估计范围，不默认为 0。

容量实验先用固定 100 个假任务，包含短、中、长三个时长档及少量故障。改变并发 1/2/4/8，记录吞吐、排队、p50/p95 和 provider 限流。报告机器配置与假服务逻辑；不把本地吞吐外推为线上容量。

## P7：配对分析的输入检查

输入必须有完整 `task_id × repeat × arm` 矩阵；重复键、缺行、NaN、失败被删除、模型版本不一致都应失败。跨仓库数据先确认聚类层级。比较前记录候选选了多少次，最终集用过几次。

对任务级差值做 bootstrap 时，采样 task/family，保留簇内全部重复和两组。不能分别重采样 A 和 B，否则破坏配对信息。若同 family 内高度相关，以 family 为单位；独立家族只有几个时，区间意义有限，展示原始结果并扩大数据。

结果分三种：效果达到门槛且成本/风险合格；明确退化或越界；证据不足。课程旧 [eval_lab.py](../../labs/eval_lab.py) 只适合其文档声明的独立任务假设，不支持自动聚类识别或自适应重复检验。

## P8：一个可以写出的配置修复任务

任务：一个简化服务有 `replicas` 和 `pool_size`，数据库总配额 24，同时活跃连接需求分别为 6、12、18。Agent 必须提交 JSON 配置，保证每种场景容量够用且总连接上限不超配额，且不能通过修改测试或系统配额“解决”。

这是一张容量模型教学任务，不是负载压测。可以先让 verifier 检查：字段类型严格为整数；replicas 在 1–4；pool_size 在 1–24；18 ≤ replicas×pool_size ≤ 24；未知字段拒绝。接受多个正确配置，不检查固定字符串。后续换成真实可运行 HTTP 服务和负载工具，才讨论实际连接池行为。

文件合同：

| 文件 | 编写内容 |
| --- | --- |
| `instruction.md` | 用户约束、输入位置、输出 `/app/config.json`、禁止改动范围 |
| `environment/Dockerfile` | 固定 Python/服务环境，放初始错误配置，不放隐藏验证 |
| `solution/solve.sh` | 人工 oracle 写入一份满足条件的配置 |
| `tests/grader.py` | 读取配置但不执行其内容；验证容量和 schema |
| `tests/test.sh` | 执行 grader，成功/失败都写 reward 文件 |
| `tests/Dockerfile` | 独立 verifier 镜像，自带 `/tests/test.sh` 与 grader |
| `task.toml` | separate verifier、资源限制、artifact 白名单 |

按官方 separate-verifier 文档，显式 `artifacts` 的 source 会恢复到 verifier 中相同路径；配置 `/app/config.json` 为唯一必要输出，不传递 grader、解释器或用户提供的测试代码。示意配置：

```toml
version = "1.0"
artifacts = ["/app/config.json"]

[agent]
timeout_sec = 120.0

[verifier]
timeout_sec = 30.0
environment_mode = "separate"
```

这是待实测的集成起点。还要设置适用于所选环境的网络、CPU、内存与存储限制，并核对镜像 digest。不能拿功能测试通过代替隔离审计。

## P9：搜索账本与适配伪代码

每个 candidate 保存 `id,parent_id,changed_components,artifact_hash,proposer_revision,proposal_cost,dev_scores,selection_scores`；每个搜索过程保存总预算和剩余预算。预留/结算操作应原子化。已失败的 proposal 也计入预算。

`evaluate` 必须返回与 batch 等长的 outputs/scores/trajectories。一次模型错误返回该样本失败及原因；整个模型配置缺失则中断搜索，不能以零分悄悄继续。GEPA 的 `make_reflective_dataset` 只获取开发集的轨迹与评分，不可读取最终确认标签。

消融矩阵：相同基础模型×相同候选空间×相同总搜索预算，比较无反馈生成和带反馈生成；之后固定生成器，只改反馈内容。记忆更新另开实验，避免一次改变多个模块。

## P10：元收益的最小实验记录

为每个完整搜索记录 `search_seed,start_candidate,improver_revision,task_family_split,total_search_cost,selected_candidate,final_score`。训练新 improver 的一次性成本另列；给出包含它的总成本，以及假定复用 N 次的摊销成本。N 是情景假设，不能冒充实际部署次数。

反例：updated improver 组从已优化候选出发，而 frozen 组从最初候选出发；这无法分离起点优势与改进器优势。修复：两组共享起点，再按相同预算运行多个完整搜索，并在新家族上终评。

开发集上涨、独立任务收益、改进器迁移收益与持续自我加速对应不同的实验条件。报告需要说明观测支持其中哪一项；负结果同样有助于定位方法的适用范围。
