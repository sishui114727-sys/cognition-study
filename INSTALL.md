# 安装 · cognition-study（学习管线）

这是一个**可选插件**：不装不影响 QQ Agent，装上也不会改动认知核心的一行代码。

## 一、确认你的环境

```text
QQ Agent 桌面版（Windows），插件目录为 resources/app/plugins/
认知核心 cognition-core 不是必须的 —— 这个插件自己就能跑
```

## 二、装插件

```text
1. 解压 community 包，把 plugin/ 整个目录复制到：
   resources/app/plugins/cognition-study/
   （plugin.json 要正好在这一层，不要多套一层目录）

2. 打开 data/config.json，在 trustedPlugins 数组里加一项：
   "cognition-study"
   —— 这个插件要读写本地文件（手账、稿件），不加会被宿主拦住高危能力。

3. 重启 QQ Agent。
```

## 三、打开并绑定主人

```text
设置 → 插件 → 学习管线
  ✅ 启用学习管线
   主人 QQ 号：填你自己的 QQ 号（不填则所有工具都拒绝执行）
   B站 SESSDATA：想让她读到字幕正文就填（获取方法见下）
   主人发链接时自动提示学习：想要"发个链接她就开始学"就打开
```

**SESSDATA 怎么拿**（1 分钟，只在本机操作）：

```text
1. 浏览器打开 https://www.bilibili.com 并确认已登录
2. F12 → Application（应用程序）→ Cookies → https://www.bilibili.com
3. 找到名字正好是 SESSDATA 的那一行，复制 Value 整段
4. 原样粘进设置里，不要解码、不要加引号
```

它等于你的登录状态，只存在本机、只发给 bilibili.com，插件面板和日志都不会显示原文。
不想留可以随时清空——代价是没有字幕正文，只能读到标题和简介。

## 四、确认装好了

```text
对话里问她一句：学习管线现在什么状态
应当看到 16 个 study_* 工具，status 里 hasSessdata 有/没有
```

插件设置里还有「学习手账面板」，点开是只读总览：稿件数、手账数、今日额度、连续天数、校验状态。

## 五、第一次用

```text
把一条 B站 链接发给她（私聊），说"学一下这个"。
她会：取稿 → 读简报 → 写一篇手账。当天第二篇要等手账额度。
以后要找回：问她"上次那个讲凭证的视频"，她会用 study_search 搜。
```

## 六、卸载

```text
1. 设置里关掉「启用学习管线」
2. 从 config.json 的 trustedPlugins 里删掉 "cognition-study"
3. 删掉 resources/app/plugins/cognition-study/
4. 数据在 data/plugin-data/cognition-study/，删不删随你（不删，重新装回来还在）
```

## 七、常见问题

| 现象 | 原因 | 怎么办 |
|---|---|---|
| 工具没出现 | 插件没被信任 / 没重启 | 检查 trustedPlugins，重启 |
| 所有工具都拒绝 | 没填主人 QQ 号 | 设置里填上 |
| 只能读到标题和简介 | 没填 SESSDATA | 填上；这是 B站 的登录门槛，不是插件限制 |
| 手账写不进去 | 当天额度用完（2 篇 / 6000 字） | 明天再写，或调高设置 |
| 面板显示「无快照」 | 还没启用过 | 启用一次，插件会写 live-snapshot.json |
| 发链接没自动提示 | 「主人发链接时自动提示学习」没开 | 打开它；注意只在主人私聊生效 |