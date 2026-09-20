# RepoOps 实战主线交付记录

基线：`7122d58c2cdcd437499f8abf01c8e243c2e6ab2c`；日期：2026-09-19。

## 为什么增加这一主线

原研究章节提供概念与方法，合成评测实验验证统计规则，但缺少贯穿项目的工程任务、持续交付和求职反馈。本次用一个仓库运维 Agent 串起数据、工具、检索、评分、调度、可观测性、统计、隔离执行、搜索与元改进。

## 已写入

- P0–P11 共 12 篇课程正文，16 周建议节奏，每章有实现/验收与就业证据。
- 首页入口、模块导航、正文搜索、无 JS 目录，与既有学习进度兼容。
- Python 标准库入门实现：严格动作协议、只读检索与读取、两种规则策略、独立 grader、SQLite 原子 trial 与续跑、JSON 报告。
- 本机 Ollama 适配器与 mock HTTP 契约测试；12 个原创公开教学任务，按 6 个服务家族拆分。
- 实现工作簿：检索合同、grader mutant、SQL/竞态、故障/成本、统计、Harbor 任务规格、GEPA 接口和元实验记录。
- 3 份招聘原文、2 份有明确可信度限制的公开面试资料、4 个开源项目固定源码入口；来源总数从 23 增至 36。
- 求职岗位矩阵、作品证据与反馈台账模板。

## 验证（2026-09-19 的历史命令）

```sh
python scripts/build_research.py
python scripts/check_content.py
python -m unittest discover -s tests -v
python -m projects.repoops.runner demo
node --check assets/js/research-data.js
node --check assets/js/app.js
node --check assets/js/research.js
node --check scripts/smoke_browser.cjs
git diff --check
```

本地结果：内容生成一致；46 个导航条目、36 项来源；25 项 Python 测试通过。离线 demo 完成 6 个开发任务的两组运行并产生 SQLite/JSON 结果。新增项目命令已经加入 CI。

浏览器 smoke 脚本扩展了新章节、全文搜索和无 JS 检查，但本环境没有 Chromium；上一轮下载浏览器超时，本轮没有重复下载。因此不将浏览器视觉与交互测试记为通过。

前端已于后续迁移到 Vite + TypeScript；以上 JS 文件路径是历史记录。当前使用 `npm run build` 与 `npm run test:browser`，部署步骤见仓库根目录的 README。

## 限制

- 规则策略与人工夹具的 0/1 成绩只验证流水线，不是模型或搜索能力提升。
- 真实模型权重未运行；Ollama 仅验证 HTTP 契约。模型修订由运行者声明，需要实际核对。
- SQLite runner 是串行教学实现，崩溃时未提交任务会重新调用，外部费用可能重复。
- Go 服务、混合检索、自然语言 judge、Harbor/GEPA 接入和元改进实验是完整课程中的进阶作业，未作为完成的系统提交。
- 上游 commit 只锁源码审阅对象，不是经过运行验证的依赖锁；没有发布网站或合并主分支。

每个进一步的能力主张都应附运行命令、环境、数据与结果；课程和实现状态必须一起维护。
