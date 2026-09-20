# 内容贡献约定

优先把一个问题讲深，再扩大主题数量。不要把框架宣传、论文标题或排行榜数字直接当成研究结论。

每篇研究文章应包含：可证伪问题、前置知识、操作定义、机制或伪代码、假设、公平对照、失败/反例、成本与可复现步骤。可复用 [论文模板](templates/paper-note.md) 和 [实验模板](templates/experiment-card.md)。

这些是内容要求，不要求每篇使用相同的标题和段落顺序。标题直接说明主题，开头从具体问题、例子或机制写起。“深度”“先进”“可信”等判断需要由正文支撑，不必写成课程口号。练习说清要修改什么、观察什么，避免每章重复求职建议；岗位与投递安排集中在 P11。

评审时实际走一遍例子：读者能否从输入推到输出、找出决定结果的代码或假设，再改变一个条件解释结论为什么失效？增加术语、卡片或链接不等于完成这一步。基础章 01 的两层评分与 R2 的父代权重手算可以作为参照；不要求其他章节照搬它们的排版。

版本、完成范围和实验限制放在相关命令、结论或来源旁。编辑记录留在 `docs/`，生成方法留在贡献说明中。删减时保留反例、推导、源码定位与复现步骤。

将“来源报告”“本站分析”“本仓库运行”分开。新增数字必须注明模型、数据子集、预算和原文定位；未执行的步骤明确标为设计。模拟器与合成数据不能被描述为论文复现或实际能力证明。

## 编辑与生成

1. 新章节编辑 `content/chapters/<id>.html`；研究导航登记在 `content/research-chapters.json`，实战导航登记在 `content/capstone-chapters.json`。
2. 来源登记在 `content/sources.json`，写清类型与实际核对范围。使用 `<cite data-source="id"></cite>` 引用。面试自述仅支持考察主题，技术解释需官方文档/源码；本站练习不得标为企业原题。
3. 基础章 `rsi`、`godel`、`capmap` 已迁入 `content/chapters/`，也由生成脚本嵌入；其余原有章节仍在 `index.html`，交互数据在 `assets/js/data.js`。不要手改生成的三个基础章，或 BEGIN/END GENERATED RESEARCH 之间的块。
4. 运行 `python scripts/build_research.py`，提交源文件与生成物。

01 中的结果表通过 `<!-- IMPROVER_RESULTS -->` 从 `labs/improver_lab.py` 的实际确定性运行生成。修改实验后，重新核对正文中的调用次数、逐步得分和解释；表格同步不代表推导自动正确。

就地编辑导出的 `index.html` 是网页副本。若要把其中 01–03、R1–R8、P0–P11 的修改提交回仓库，应同步到对应的章节源文件再生成；只改生成物会在下次构建时被覆盖。

## 必需检查

```sh
python scripts/check_content.py
python -m unittest discover -s tests -v
node --check assets/js/app.js
node --check assets/js/research.js
```

维护检查需要 Python 3.10+ 和 Node.js 18+，不需要第三方 Python 包。网页仍然零运行依赖、支持 file://。

本地如有 Playwright 与 Chromium，可运行 `node scripts/smoke_browser.cjs` 做路由、搜索、实验与无 JS 检查。可用 `NODE_PATH` 指向已有依赖；不把浏览器测试库作为网页依赖。

若使用已有 Chrome 安装，可用 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 指定可执行文件；`QA_SCREENSHOT_DIR` 可指定截图目录。

不要随意更换旧章节 ID 或 localStorage key，以免破坏书签与学习记录。新增内容要支持亮暗主题、键盘访问、移动端与静态正文降级。
