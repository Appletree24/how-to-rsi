# how-to-rsi · DSH 互动学堂

一个纯静态、可离线使用的 DeepSeek Harness(dsh)交互式学习网站。（本 README 替换了原先的占位内容，旧版可经 git 历史找回。）

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

## 内容与功能

- 12 个章节：认识 DSH → Cordis 核心 → 架构总览 → Agent Loop → 会话与持久化 → 包版图 → 工具系统 → 工程规范 → 测试体系 → 开发工作流 → 术语表 → 知识闯关
- 交互组件：事件分发模拟器、Agent Loop 逐帧播放器(含会话日志磁带)、包版图探索器(52 组 / 280+ 包)、工具目录探索器(72 个 schema)、扩展点选择器、可搜索术语表、12 题测验(带解析与彩蛋)
- 全局能力：Ctrl/Cmd+K 命令面板搜索、←/→ 翻章、亮/暗主题、学习进度持久化(localStorage)、代码一键复制、响应式 + 减动效适配

## 内容来源与可信度

内容整理自 deepseek-harness 仓库的权威文档：`AGENTS.md`、`docs/architecture.md`、`docs/cordis-primer.md`、`docs/testing.md`、`docs/glossary.md`、`docs/defensive-patterns.md`、`docs/session-format-status.md`、`packages/README.md`、`docs/tool-catalog.md` 等；包/工具清单取自仓库实测。标注“教学示意”的代码片段为示意性质，非仓库原文。DSH 处于 developer preview，一切以仓库为准。

## 目录结构

```
index.html            单页应用(全部章节正文)
assets/css/main.css   设计系统与动画
assets/js/data.js     内容数据(章节/包/工具/术语/测验…)
assets/js/app.js      路由、交互组件、动效引擎
assets/favicon.svg    站点图标
```
