# how-to-rsi

递归自我改进的中文学习笔记，包含论文阅读、评测方法、RepoOps Agent 项目与 DSH 源码笔记。网页为纯静态实现，可以离线阅读。

DSH / Cordis 是运行时工程案例之一。可修改运行时、单次跑分上涨、改进效率提高与持续自我加速，是不同的主张。

## 从哪里开始

直接打开 [index.html](index.html)，无需构建、联网或安装依赖。也可运行 `python -m http.server 8080` 后访问 `http://127.0.0.1:8080`。

先读 **01–03 基础章节**，运行一个时长解析器的改进器自应用实验：从修一个输入错误，到修改补丁顺序，再解释成本与分布变化后的退化。接着读 **R1–R2**，学习共同起点、冻结修改者对照以及 STOP / DGM / HGM 的控制流程。

工程主线是 **RepoOps Lab P0–P11**。已有评测基础的读者可直接从 P0 开始，遇到研究方法问题再回查基础章与 R1–R8。

```sh
python labs/improver_lab.py
```

这是实际执行解析器的有限配置实验，不调用模型。更新后的顺序在同模板确认集上从 4/10 提高到 8/10，在格式比例变化后却从 8/10 降到 3/10；包含训练的 18 次评分也没有胜过 16 次穷举。完整步骤、逐层计账与延伸练习见[实验说明](labs/improver/README.md)。网页结果表在生成时运行同一份代码。

## RepoOps Lab

Agent 读取故障工单、检索运行手册，返回处置建议。项目先实现数据、工具循环与评分，再逐步加入可靠调度、隔离修复、候选搜索和修改器实验。

P0 给出 16 周参考安排；各章围绕具体故障与实验展开，源码阅读使用 mini-SWE-agent、Inspect AI、Harbor 和 GEPA 的固定提交。岗位样本、公开面经、简历与模拟面试集中在 P11。

```sh
python -m projects.repoops.runner demo
```

仅需 Python 标准库。已有 12 个原创公开任务、受限工具循环、独立规则 grader、SQLite 续跑与轨迹报告，以及可选本机 Ollama 适配器。**规则策略的教学成绩不是 LLM 能力结果。** Go 控制面、混合检索、Harbor/GEPA 集成与递归实验是循序渐进的实现作业，这些部分尚未集成到现有示例中。

- [配套项目与运行说明](projects/repoops/README.md)
- [实现工作簿：接口、SQL、竞态、实验与反例](docs/capstone/implementation-workbook.md)
- [岗位、面经与源码映射](docs/capstone/source-map.md)
- [求职证据与反馈台账模板](templates/career-evidence.md)

## 论文与实验

| 顺序 | 核心问题 | 内容 |
| --- | --- | --- |
| R1 研究问题与系统边界 | 谁在改谁？预算和不变量是什么？ | 一个可证伪的研究协议 |
| R2 STOP / DGM / HGM 精读 | 档案、CMP 与 oracle 假设有何区别？ | 机制对照与消融设计 |
| R3 统计与实验设计 | 涨分来自改进，还是选择偏差？ | 配对比较、数据分离、停止规则 |
| R4 评分器与信任边界 | 测量可信吗？回滚撤回了什么？ | judge 校准与外部验证设计 |
| R5 研究路线地图 | 自训练、记忆、元学习、程序搜索如何关联？ | 按问题选择论文与基线 |
| R6 可运行实验 | 评测门如何处理噪声、失败和成本？ | 本地可复现的合成实验报告 |
| R7 研究练习 | 记忆、搜索和评分器还有哪些问题？ | 三个研究题与实验安排 |
| R8 参考资料 | 哪些是作者报告，哪些是本仓库实测？ | 带版本和核对范围的参考资料清单 |

全局搜索支持章节正文。页面包含机制模拟器、包/工具探索器与本地阅读进度；禁用 JavaScript 后仍可阅读正文和静态目录。

## 运行第一个实验

仅需 **Python 3.10+ 标准库**，不需要 API key：

```sh
python labs/eval_lab.py demo --output lab-output
python labs/eval_lab.py compare lab-output/improvement.input.json
python labs/eval_lab.py selection-bias --candidates 30 --seed 17
python -m unittest discover -s tests -v
```

实验演示选择偏差、任务级配对比较、保守单侧统计界和 `keep / reject / inconclusive` 三态裁决。包括成本超限、严重违规、超时、缺失/重复 trial 和伪造自报分数的检查。详见 [实验说明](labs/README.md)。

**这些数据是合成观测，不是模型能力结果。** 本仓库尚未完成真实 agent 的递归收益复现，也未实现候选执行沙箱或完整 DSH 适配器。代码 hash 用于标识输入，不是完整性防护或安全证明。

## 来源与维护

- [内容审计](docs/content-audit.md)：历史勘误与待完成事项。
- [参考资料清单](content/sources.json)：区分论文、官方文档/源码、招聘原文与面试自述，并记录版本和核对范围。
- [实验卡模板](templates/experiment-card.md)：先登记假设、预算和数据使用协议，再运行。
- [论文笔记模板](templates/paper-note.md)：分开机制、作者证据、本站分析和未证明结论。
- [贡献指南](CONTRIBUTING.md)：写作约定与校验命令。
- GitHub Actions：自动检查生成一致性、本地链接、JS 语法和 Python 实验。

旧 DSH 包/工具清单未保存生成时的上游 commit，需按使用版本核对；精确 API 应以目标版本为准。基础章节按修改对象、反馈关系和实验结果分别描述，不采用单一能力等级。各来源的版本与核对范围保存在 `content/sources.json`。

## 目录与内容检查

```text
content/chapters/          01–03、R1–R8、P0–P11 的 HTML 源文
content/sources.json       一手来源与核对范围
content/research-chapters.json  研究导航清单
index.html                原章节 + 生成嵌入的基础/研究/实战正文，可离线打开
assets/js/data.js          原课程与 DSH 历史清单
assets/js/research-data.js  生成的研究导航与来源数据
assets/js/research.js       浏览器端选择偏差实验
labs/eval_lab.py           Python 标准库评测方法实验
labs/improver_lab.py       有限改进器自应用与成本/退化实验
tests/                    评测协议与统计裁决的回归测试
scripts/                  生成与内容一致性检查
```

维护内容需要 Python 3.10+ 和 Node.js 18+（读取现有 JS 数据、语法检查）；读网页不需要它们：

```sh
python scripts/build_research.py
python scripts/check_content.py
node --check assets/js/app.js
node --check assets/js/research.js
```

编辑 `content/chapters/` 后重新生成并一同提交 `index.html`、`research-data.js`。浏览器不在运行时请求章节文件，因此保留 `file://` 使用方式。
