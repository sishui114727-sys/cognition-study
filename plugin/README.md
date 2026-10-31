# cognition-study · 学习管线

QQ Agent 的**可选插件**：把 B 站视频的字幕取成稿子，整理成带时间轴的简报，写成每日限量的手账，再记几条带标签的札记，随时能检索回来。

不并入认知核心，独立开关、独立数据、默认关闭。

```text
B站视频 → 取稿 → 简报（时间轴要点）→ 手账（每天 2 篇）→ 札记 → 检索
```

主人私聊发一条 B站 链接，打开「主人发链接时自动提示学习」后她就会认出来、取稿、写手账——
钩子只认链接（不下载、不改系统提示），取稿由工具完成，超时和失败都看得见。

## 有 SESSDATA / 没有 SESSDATA 的区别

| | 有 | 没有 |
|---|---|---|
| 标题、UP、时长、分P、简介 | ✅ | ✅ |
| 字幕正文（CC / AI 字幕） | ✅ | ❌ |
| 时间轴要点、高频词 | ✅ | 只从简介抽 |
| 手账、札记、检索 | ✅ | ✅ |

没有字幕时稿件会标 `coverage: metadata-only`，简报第一行就写"只有标题与简介，没有读到正文"。**不伪造要点。**

实测（2026-10-31）：匿名 16 个样本 0 命中（字幕对象被裁到只剩 allow_submit=false）；带上 SESSDATA 后同一批样本立刻拿到 AI 字幕（ai-zh），例如 BV1UbyZB9ERb 第 1P 260–416 段 / 2550–5074 字。所以 SESSDATA 是拿到正文的唯一路径，不是装饰。

## 十六个工具

```text
取稿    study_fetch / study_list / study_read
手账    study_journal_write / study_journal_list / study_journal_get
        study_journal_amend / study_journal_stats
        study_journal_index / study_journal_volume / study_journal_export
        study_journal_repair
札记    study_note_write / study_note_list
其他    study_search / study_status
```

全部 owner-only。

钩子只有一个：`before-llm-messages`。默认关闭（`learnOnLink=false`），
只在主人私聊出现 B站 链接时追加一行提示；群聊、别人私聊一律不触发。

手账怎么用：

```text
写一篇     study_journal_write  每天 2 篇、6000 字上限，超了明说超了
看列表     study_journal_list   倒序、不带正文，可按天或区间筛
看一篇     study_journal_get    原条目 + 全部修订，能看到"当时怎么写的"
改一篇     study_journal_amend  追加修订指向原 id；旧内容原样保留，不占额度
看进度     study_journal_stats  连续天数、本周、平均字数、失效引用
导出       study_journal_export 按天分组写成一份 Markdown（含修订）
修索引     study_journal_repair 派生文件坏了就重建，账本不动
```

## 装

```text
1. 整目录放进 resources/app/plugins/cognition-study（plugin.json 在这一层）
2. config.trustedPlugins 里加 "cognition-study"（要读写本地文件，宿主会拦高危能力）
3. 重启 QQ Agent
4. 设置 → 学习管线：启用 + 主人 QQ 号（+ 可选 SESSDATA，+ 可选「主人发链接时自动提示学习」）
5. 确认出现 16 个 study_* 工具
```

细节与排错见 [`docs/使用说明.zh-CN.md`](docs/使用说明.zh-CN.md)；取舍与缺口见 [`docs/设计说明.md`](docs/设计说明.md)；
发布声明（含与记忆核心的关系与冲突、真实对话实测）在包内 `docs/发布声明.md`；社区包安装见 `INSTALL.md`。

## 数据

```text
readings/readings.jsonl + raw/ + brief/     稿件（元信息 / 字幕正文 / 简报）
journal/ledger.jsonl + index.json + volumes/ 手账（账本是唯一真相，索引与分卷可重建）
notes/notes.jsonl                            札记
```

AI 字幕每次返回的段数/字数可能不同（B站端生成）；同一 P 重复取稿保留首份，正文不覆盖。

手账额度数账本，不读计数文件：重启、崩溃都不会重置。同内容重复提交幂等，不吃额度。

额度有两道闸：每天 2 篇 + 每天 6000 字。修订不占额度——它不是新的一天里的新想法，是改错字。
修订用追加实现（新条目带 `revises` 指向原 id），所以"我当时是这么想的"永远可查。

## 测试

```text
npm test           97 项：守则 / 编码 / 字幕解析 / 简报 / 手账三不变量 / 快照 / 篇数与字数额度 / 修订与孤儿 / 连续天数 / 导出 / 修复 / 分页 / 链接识别 / 钩子边界 / 重复取稿升级 / 工具 / 检索 / 札记 / 面板渲染
```

## 构建

```text
npm test            98 条测试，必须全过
npm run build       跑测试 → 沙箱复跑 → 扫描（本机路径/QQ号/凭据/乱码）→ 打 zip → 写 manifest
```

产物：

```text
dist/cognition-study-<version>.zip            完整包（插件 + 测试 + 构建脚本，开发者用）
dist/cognition-study-<version>-community.zip  社区包（plugin/ + docs/ + README + INSTALL，拿到就能装）
dist/manifest.json                            两份 zip 的 sha256 与文件数
```

## 许可

UNLICENSED（专有）。详见 [LICENSE](LICENSE)。