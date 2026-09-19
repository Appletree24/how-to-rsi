# 评测方法实验（合成观测）

Python 3.10+，标准库，无模型调用、GPU 或 API key。在仓库根目录：

```sh
python labs/eval_lab.py demo --output lab-output
python labs/eval_lab.py compare lab-output/improvement.input.json
python labs/eval_lab.py selection-bias --candidates 30 --seed 17
```

`demo` 写入五组 input/result 与 summary JSON；可用它们学习协议或做适配器样例。默认结果：improvement=keep，tie=inconclusive，regression/violation/expensive=reject。它们是人为构造的观测，不能用于声称模型性能提升。

## 测量契约

顶层字段：

| 字段 | 含义 |
| --- | --- |
| schema_version | 当前为 1 |
| task_ids / runs_per_task | 预先规定的完整 task×run 矩阵；run_id 从 0 开始 |
| model_id / evaluator_id / environment_id / taskset_id | 两个版本共享的实验条件；外部 verifier 负责核实 |
| split / candidate_frozen | 必须声明 confirmation / true；标签本身不证明数据确实未被使用 |
| baseline / candidate | 每个包含 version、与顶层条件一致的 conditions 对象和完整 trials |

每条 trial 必须有 task_id、run_id、passed（bool）、status（ok/timeout/crash）、cost_units（非负有限数）和 critical_violation（bool）。Timeout/crash 必须失败，不能从分母删除。模型自报 reported_score 被忽略。

**输入的真实性是前提。** 本工具不执行候选、不提供沙箱、不验证签名、不保证确认集隔离。若候选能直接编辑输入文件，它仍然能伪造观测。真实应用应由独立 runner/评分控制域生成输入，核验模型和环境标识。

## 统计口径

先在每题内平均重复，再宏平均任务的配对差。bootstrap 按任务聚类（固定 seed，2,000 次）且只作描述性估计；门使用保守单侧 Hoeffding 界：

`lower = mean_difference - sqrt(2*log(1/alpha)/N)`

因为任务差值位于 [-1,1]，在独立且从目标分布抽样的任务、预先规定的单次比较条件下，该界提供单侧覆盖保证。它不需要假设正态，但较保守。相关仓库/模板、反复复用确认集、选择后调整阈值等情形不满足此解释。上、下界分别是单侧界，不是共同 95% 区间。

默认 alpha=.05、minimum_effect=.02、max_cost_ratio=1.25。候选严重违规、成本超限或上界仍小于零时 reject；下界高于实际效应阈值才 keep；其余 inconclusive，保持 incumbent。它不进行等效性检验。

CLI 参数只供**实验前**确定：

```sh
python labs/eval_lab.py compare lab-output/improvement.input.json --alpha 0.01 --min-effect 0.05 --max-cost-ratio 1.1
```

命令成功读取并比较时退出 0，裁决在 JSON `decision` 中；输入不合法退出 2。不要把进程退出 0 解读为候选通过。

## 选择偏差实验

所有候选真实成功率固定为 .5；在 40 个开发观测上选最高分，再独立生成 40 个确认观测评那个候选。重复 300 次。seed=17、candidates=30 时，本轮 Python 运行得开发均值约 .6592、新数据均值 .5030。没有真实能力提升。

浏览器实现使用另一个确定性 PRNG；同样 seed 不承诺跨语言数值完全一致。两者演示相同统计结构。

## 扩展边界

真实任务需要另做：隔离执行与超时终止、产物断言、evaluator 校准、数据污染控制、签名/外部审计、搜索成本账本、按仓库聚类、序贯比较协议。先完成一次可信测量，再接 DSH 或其它 harness。
