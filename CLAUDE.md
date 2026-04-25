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

所有记忆文件已整合到项目目录：
- **核心索引**: `.claude/memory/MEMORY.md`
- **会话记录**: `.claude/memory/session-log.md`
- **专题文件**: `.claude/memory/`（12-dimensions、tech-style、business、structure、vision）

**每次对话开始时**，请先读取 `MEMORY.md` 和 `session-log.md` 了解上次工作。

---

## 项目概述

**AI赋能商家平台** - 草根创业者低代码小程序生成平台

| 子项目 | 技术 | 用途 |
|------|------|------|
| webview | 原生JS+Canvas | 像素画编辑器 |
| merchantDashboard | Node.js+Express | 商家后台 |
| wxApp | 微信小程序原生 | 用户端小程序 |

## 12维度系统

天干地支架构：寅(1维技能)、卯(2维想法)、丙(3维业务)、丁(4维交流)...戌(12维复盘)

**小粽Agent**: rowid `1024efc4-27fd-4522-bf3c-e4ebc998393c`，密码 `381644`

---

## Skills 配置

- **12维创建**: hap-12wei-create (`7631572188324069419`)
- **数据检索**: fsj-search (`7631184065437958170`)
- **数据更新**: fsj-data-update (`7631110623212486675`)
- **标签管理**: fsj-tags (`7630808620096536614`)

详见 `.claude/skills/` 和 `.cursor/skills/`

---

*更新时间: 2026-04-24*