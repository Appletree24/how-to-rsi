# how-to-rsi · 理解、检验与实现自我改进

一个中文、纯静态、可离线阅读的 RSI 学习与实验仓库。**深度优先：从可检验定义、论文机制和实验设计走到可复核的结果；广度用于建立研究路线之间的联系。**

DSH / Cordis 是运行时工程案例之一。可修改运行时、单次跑分上涨、改进效率提高与持续自我加速，是不同的主张。

## 从哪里开始

直接打开 [index.html](index.html)，无需构建、联网或安装依赖。也可运行 `python -m http.server 8080` 后访问 `http://127.0.0.1:8080`。

建议优先走网站中的 **研究主线 R1–R8**：

| 顺序 | 核心问题 | 学习产物 |
| --- | --- | --- |
| R1 研究问题与系统边界 | 谁在改谁？预算和不变量是什么？ | 一个可证伪的研究协议 |
| R2 STOP / DGM / HGM 精读 | 档案、CMP 与 oracle 假设有何区别？ | 机制对照与消融设计 |
| R3 统计与实验设计 | 涨分来自改进，还是选择偏差？ | 配对比较、数据分离、停止规则 |
| R4 评分器与信任边界 | 测量可信吗？回滚撤回了什么？ | judge 校准与外部验证设计 |
| R5 研究路线地图 | 自训练、记忆、元学习、程序搜索如何关联？ | 按问题选择论文与基线 |
| R6 可运行实验 | 评测门如何处理噪声、失败和成本？ | 本地可复现的合成实验报告 |
| R7 里程碑与开放问题 | 学到什么才算能做研究/工程？ | 一个真实任务比较与机制消融计划 |
| R8 来源与证据 | 哪些是作者报告，哪些是本仓库实测？ | 带版本和核对范围的来源台账 |

原有基础概念、机制与评测、对齐与安全、DSH 教程继续保留。全局搜索支持章节正文；原来的模拟器、包/工具探索器、主题和本地学习进度仍可使用。无 JavaScript 时，正文和新章节目录仍可阅读。

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

- [内容审计](docs/content-audit.md)：本轮发现、修正与待完成事项。
- [来源台账](content/sources.json)：23 项一手来源，区分全文指定章节、摘要/元数据与作者文档的核对范围。
- [实验卡模板](templates/experiment-card.md)：先登记假设、预算和数据使用协议，再运行。
- [论文笔记模板](templates/paper-note.md)：分开机制、作者证据、本站分析和未证明结论。
- [贡献指南](CONTRIBUTING.md)：新增内容的验收标准与校验命令。
- GitHub Actions：自动检查生成一致性、本地链接、JS 语法和 Python 实验。

旧 DSH 包/工具清单未保存生成时的上游 commit，本轮没有逐包验证其时效性；精确 API 应以目标版本为准。原站 L0–L5 是教学索引，不是通用成熟度标准。研究主线核对日期：**2026-09-19**。

## 目录与内容检查

```text
content/chapters/          新增研究章节的可编辑 HTML 源文
content/sources.json       一手来源与核对范围
content/research-chapters.json  研究导航清单
index.html                原章节 + 生成嵌入的研究章节，可直接离线打开
assets/js/data.js          原课程与 DSH 历史清单
assets/js/research-data.js  生成的研究导航与来源数据
assets/js/research.js       浏览器端选择偏差实验
labs/eval_lab.py           Python 标准库评测方法实验
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
