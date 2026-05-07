---
name: fu-skill-08-task
description: 孚世界思维维度「08-任务」技能。用户或智能体需要管理自己根据目标设定的任务、todolist 时使用。通过调用 HAP MCP 或 HAP V3 API 对「任务8」表进行建表、增删改查。依赖 01/inn/hap 下的 HAP 技能执行实际操作。
license: MIT
---

# 孚世界技能 08 - 任务

本技能让 OpenClaw 智能体对孚世界「任务」维度数据进行建表与增删改查，**通过调用 HAP 相关技能**在明道云中操作「任务8」表。

## 触发条件

- 用户或任务涉及：任务、todolist、待办、紧急重要、层级任务
- 需要对「任务」表进行创建、查询、新增、修改、删除

## 前置依赖

- 已配置 HAP 应用执行 MCP 或掌握 HAP V3 API 鉴权
- 参考：`01/inn/hap/hap-as-database`、`01/inn/hap/hap-v3-api`、`01/inn/hap/hap-mcp-usage`

## 工作表标识

- **表名**：任务8
- **明道云工作表 ID**：`69b0251c9e299b1843578e0f`

## 字段规范

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tag | 选项 | 否 | 紧急重要、紧急不重要、不重要紧急、不重要不重要 |
| title | 文本 | 是 | 任务名称，必须英文名 |
| content | 长文本 | 是 | 必须 md 格式，任务的具体内容 |
| fu | 关联 | 条件 | 层级任务必填，父任务（明道云子父表关联） |
| zi | 关联 | 条件 | 层级任务必填，子任务（明道云子父表关联） |
| json | 长文本/JSON | 否 | 可跨表关联，如 children、related_goals、related_technology、related_business |

## 执行步骤

1. **建表**：使用 HAP MCP 或 hap-as-database 规范创建工作表，字段含 tag、title、content、fu、zi、json；若为层级任务，配置子父表关联。
2. **增**：HAP `POST /app/worksheets/{worksheetId}/rows`，worksheetId 为上表 ID；层级任务需填 fu、zi。
3. **删**：HAP 删除行接口，按行 id 或条件删除；注意层级关系的级联策略。
4. **改**：HAP 更新行接口，按行 id 更新 tag、title、content、fu、zi、json。
5. **查**：HAP 列表接口，支持按 tag、title、content、fu、zi、json 筛选；选项字段使用 key。

## 注意事项

- 层级任务必须填写 fu、zi，采用明道云子父表关联方式；无层级任务可不填。
- content 为 Markdown；json 可含 children、related_goals、related_technology、related_business，见 readme 任务表 json 示例。
- 空间表与主表 title、content、json 一致以便备份。

## 相关文档

- `03/108只虾/readme.md`、`03/108只虾/明道云数据表结构.md`
