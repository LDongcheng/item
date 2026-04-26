# fsj 项目指令

> 此文件每次对话自动加载 - 记忆已整合到项目目录

---

## ⚠️ 关键提醒

**Windows 中文编码问题**：调用 API 创建/更新数据时，中文必须用文件方式发送！

```bash
# 正确流程：
1. Write工具创建JSON文件（UTF-8）
2. curl --data-binary "@文件路径" 发送
```

---

## 记忆路径

### 如果你是团队成员（阿说/小风/梦瑶/小云/东城）
**不要读取项目级记忆，使用你自己的记忆文件：**
- 身份配置 → 你的 `CLAUDE.md`
- 会话记录 → 你的 `memory/session-log.md`
- 12维调用 → `../../.claude/skills/how_to_use_fsj_skills.md`

### 如果你是林东城（直接使用，非Agent分身）
- **核心索引**: `.claude/memory/MEMORY.md`
- **会话记录**: `.claude/memory/session-log.md`
- **专题文件**: `.claude/memory/`（12-dimensions、tech-style、business、structure、vision）
- 详见 `how_to_use_fsj_skills` Skill

---

## 项目概述

**AI赋能商家平台** - 草根创业者低代码小程序生成平台

| 子项目 | 技术 | 用途 |
|------|------|------|
| webview | 原生JS+Canvas | 像素画编辑器 |
| merchantDashboard | Node.js+Express | 商家后台 |
| wxApp | 微信小程序原生 | 用户端小程序 |

## 身份确认 ⭐

**如果你是一个Agent（小粽/小风/阿说/梦瑶/小云/东城），请先读取你自己的身份配置：**
- 小粽 → `team/xiaozong/CLAUDE.md`
- 小风 → `team/xiaofeng/CLAUDE.md`
- 阿说 → `team/ashuo/CLAUDE.md`
- 梦瑶 → `team/mengyao/CLAUDE.md`
- 小云 → `team/xiaoyun/CLAUDE.md`
- 东城 → `team/dongcheng/CLAUDE.md`

**每个Agent使用自己的 rowid 和密码，不要使用其他Agent的身份！**

**如果你是当前对话的Claude（林东城直接使用），使用项目记忆即可。**

---

## 12维度系统

天干地支架构：寅(1维技能)、卯(2维想法)、丙(3维业务)、丁(4维交流)...戌(12维复盘)

---

## Agent 身份速查

| Agent | rowid | 密码 | 配置文件 |
|-------|-------|------|----------|
| 小粽 | `1024efc4-27fd-4522-bf3c-e4ebc998393c` | `381644` | `team/xiaozong/CLAUDE.md` |
| 小风 | `a8515e76-7b02-4baf-bedd-3ff011b1a9e5` | `待设置` | `team/xiaofeng/CLAUDE.md` |
| 阿说 | `ceaa79bf-f4d8-45ae-8e1e-a1c9a3ac1b7d` | `待设置` | `team/ashuo/CLAUDE.md` |
| 梦瑶 | `5b21306f-3be6-49fa-a6f6-2be311203c02` | `待设置` | `team/mengyao/CLAUDE.md` |
| 小云 | `22ff1c1c-f1d0-4275-980b-803835504a90` | `待设置` | `team/xiaoyun/CLAUDE.md` |
| 东城 | `2ab12bea-8db1-4b78-a955-3505d547fba7` | `888888` | `team/dongcheng/CLAUDE.md` |

> ⚠️ **发布数据时，fabuzhe 必须填自己的 rowid，不是其他Agent的！**

---

## Skills 配置

- **12维创建**: hap-12wei-create (`7631572188324069419`)
- **数据检索**: fsj-search (`7631184065437958170`)
- **数据更新**: fsj-data-update (`7631110623212486675`)
- **标签管理**: fsj-tags (`7630808620096536614`)

详见 `.claude/skills/` 和 `.cursor/skills/`

---

*更新时间: 2026-04-24*