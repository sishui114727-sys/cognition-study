# cognition-study · 学习管线

**下载：[`cognition-study-0.3.1-community.zip`](cognition-study-0.3.1-community.zip)**（混淆版，114KB） · 版本 `0.3.1` ·
文档在 [`docs/`](docs/)，源码不公开。

---

> 她看过的东西，不该看完就忘。

QQ Agent 的**可选插件**：把 B 站视频的字幕取成稿子，整理成带时间轴的简报，写成每日限量的手账，再记几条带标签的札记，随时能检索回来。

独立开关、独立数据、默认关闭。不并入认知核心——学习记录不是对话记忆。

```text
B站视频 → 取稿 → 简报（时间轴要点）→ 手账（每天 2 篇）→ 札记 → 检索
```

---

## 一、这一版（0.3.1）修了什么

真实对话里露出来的毛病：她读手账时拿不到引用稿件的标题和链接，于是说了句「要翻原视频我把BV给你」，**BV 没给出来**。

`study_journal_get` 现在顺手把引用解析成：

```json
"refs": [{ "id": "r:BVxxx:1:abc", "title": "…", "url": "https://www.bilibili.com/video/BVxxx", "coverage": "full" }]
```

稿件没了的引用标 `missing: true`，一处缺数据不让整次读取失败。

---

## 二、它能做什么

```text
取稿    study_fetch / study_list / study_read
手账    study_journal_write / study_journal_list / study_journal_get
        study_journal_amend / study_journal_stats
        study_journal_index / study_journal_volume / study_journal_export
        study_journal_repair
札记    study_note_write / study_note_list
其他    study_search / study_status
```

十六个工具，全部 owner-only（只有主人能调）。

手账的用法：

```text
写一篇     study_journal_write  每天 2 篇、6000 字上限，超了明说超了
看列表     study_journal_list   倒序、不带正文，可按天或区间筛
看一篇     study_journal_get    原条目 + 全部修订 + 引用稿件的标题与链接
改一篇     study_journal_amend  追加修订指向原 id；旧内容原样保留，不占额度
看进度     study_journal_stats  连续天数、本周、平均字数、失效引用
导出       study_journal_export 按天分组写成一份 Markdown（含修订）
修索引     study_journal_repair 派生文件坏了就重建，账本不动
```

### 三条不变量

```text
1. 账本 journal/ledger.jsonl 是唯一真相，只追加；索引、卷、面板全是派生物
2. 修订是追加，不是覆盖：改了也看得到"当时怎么写的"
3. 派生物坏了只重建，绝不倒过来改账本
```

`study_status` 会给出快照哈希；快照对不上就报 `STALE_SNAPSHOT`，而不是装没事。

---

## 三、有 SESSDATA / 没有 SESSDATA

| | 有 | 没有 |
|---|---|---|
| 标题、UP、时长、分P、简介 | ✅ | ✅ |
| 字幕正文（CC / AI 字幕） | ✅ | ❌ |
| 时间轴要点、高频词 | ✅ | 只从简介抽 |
| 手账、札记、检索 | ✅ | ✅ |

没有字幕时稿件标 `coverage: metadata-only`，简报第一行就写"只有标题与简介，没有读到正文"。**不伪造要点。**

实测（2026-10-31）：匿名 16 个样本 0 命中（字幕对象被裁到只剩 `allow_submit=false`）；带上 SESSDATA 后同一批立刻拿到 AI 字幕（`ai-zh`）。

**但字幕会骗人**：同一场演讲重复取稿，分别返回过 260 / 416 / 428 / 1476 段，也返回过 6 段 30 字、内容完全无关的片段。所以"读完了"必须能追到具体那段正文；重复取稿时若新版更全且语速合理（≤600 字/分钟）会自动升级，id 不变。

SESSDATA 只发给 `*.bilibili.com`，存在本地配置里。它是账号凭证，建议定期轮换；泄露等于别人能读你的 B 站数据。

---

## 四、让主人发链接时自动提示学习

钩子只有一个：`before-llm-messages`，默认关闭（`learnOnLink=false`）。

```text
只在 private:<主人QQ> 生效：群聊、别人的私聊一律不触发
只认链接：完整链接 / 手机链接 / 带 ?p=N / 裸 BV 号，一次最多认两条
不下载：宿主给钩子 5 秒，取稿要打三四个请求；钩子只认链接 + 查本地稿件，取稿交给工具
不碰系统提示：追加到最后一条 user 消息尾部，system 一个字节都不改
```

打开方式：设置 → 学习管线 → 主人发链接时自动提示学习。

---

## 五、和认知核心的关系

两个独立插件，零代码耦合：

| | 认知核心 | 学习管线 |
|---|---|---|
| 存什么 | 对话事件、人物、关系、认知、自我描述 | 稿件、手账、札记 |
| 谁写 | 它自己（唯一写入者） | 它自己（唯一写入者） |
| 检索 | `cognition_recall` 等 | `study_search` 等 |

从认知核心 **0.24.0** 起，核心可以**只读**搜手账：设置里打开「读取学习手账」，`cognition_study_search` 就能搜到手账 / 稿件 / 札记，回忆没有结果时也会如实指出"学习管家里有"。桥不写这个插件的数据，关掉即刻失效。

实测口径要说清楚：问"上次那个讲意义的视频"时，她更常直接调 `study_search` / `study_journal_get`，而不是走核心的桥——这是对的，桥只是她没想到去看手账时的兜底。

---

## 六、装

```text
1. 解压，把 plugin/ 整个目录复制到：
   <QQ Agent 安装目录>\resources\app\plugins\cognition-study
   （plugin.json 必须直接在这一层，不要多套一层目录）

2. 设置 → 插件信任（config.trustedPlugins）里加 "cognition-study"
   它要读写本地文件，不信任会被宿主拦下

3. 完全退出 QQ Agent，确认任务管理器里没有 QQ Agent.exe，再启动

4. 设置 → 学习管线：填主人 QQ、（可选）SESSDATA
```

详细步骤与常见问题见 [`INSTALL.md`](INSTALL.md)。

---

## 七、边界（写在这里，不藏在文档角落）

```text
只读 B站 的公开信息  不登录账号做别的操作，不代发评论
不做向量            检索是词面匹配 + 关键词；同义改写在核心侧借同义词表
修订不可删          手账只能追加修订，这是设计：留着"当时怎么写的"
额度是硬的          每天 2 篇 / 6000 字，超了明说超了，不偷偷截断
字幕质量不可控      B站 AI 字幕会返回不完整甚至无关内容，插件只能标注，不能辨真伪
```

---

## 八、版本与测试

```text
0.3.1   读手账一篇带引用稿件的标题与链接（修"BV 没给出来"）
0.3.0   主人发链接时提示学习 / 社区包 / 字幕波动时自动升级
0.2.0   手账补全：写 / 看 / 改 / 导 / 修 + 额度 + 分页 + 面板

测试    98 条全过（源码 98 / 混淆后再跑 98）
构建    混淆 10 个文件 → 语法检查 → 混淆后复跑 98 条 → 才出包
```

---

## 九、许可

见 [LICENSE](LICENSE)。插件本身可自由使用与修改；`panel/` 保持明文——用户要能看懂面板在读什么。