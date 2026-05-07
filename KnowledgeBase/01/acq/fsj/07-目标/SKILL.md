---
name: fu-skill-07-goal
description: 孚世界思维维度「07-目标」技能。用户或智能体需要管理上级给的目标时使用。通过调用 HAP MCP 或 HAP V3 API 对「目标7」表进行建表、增删改查。依赖 01/inn/hap 下的 HAP 技能执行实际操作。
license: MIT
---

# 孚世界技能 07 - 目标

本技能让 OpenClaw 智能体对孚世界「目标」维度数据进行建表与增删改查，**通过调用 HAP 相关技能**在明道云中操作「目标7」表。

## 触发条件

- 用户或任务涉及：目标、上级目标、KPI、指标
- 需要对「目标」表进行创建、查询、新增、修改、删除

## 前置依赖

- 已配置 HAP 应用执行 MCP 或掌握 HAP V3 API 鉴权
- 参考：`01/inn/hap/hap-as-database`、`01/inn/hap/hap-v3-api`、`01/inn/hap/hap-mcp-usage`

## 工作表标识

- **表名**：目标7
- **明道云工作表 ID**：`69b021849450253d98eb7256`

## 字段规范

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | 文本 | 是 | 目标名称，必须英文名 |
| content | 长文本 | 是 | 必须 md 格式，目标的具体内容 |
| json | 长文本/JSON | 否 | 可跨表关联，如 children、related_tasks、related_values、related_business |

## 执行步骤

1. **建表**：使用 HAP MCP 或 hap-as-database 规范创建工作表，字段至少 title、content、json。
2. **增**：HAP `POST /app/worksheets/{worksheetId}/rows`，worksheetId 为上表 ID，传入 title、content，可选 json。
3. **删**：HAP 删除行接口，按行 id 或条件删除。
4. **改**：HAP 更新行接口，按行 id 更新 title、content、json。
5. **查**：HAP 列表接口，支持按 title、content、json 筛选；选项字段使用 key。

## 注意事项

- content 为 Markdown；json 可含 children、related_tasks、related_values、related_business，见 readme 目标表 json 示例。
- 空间表与主表 title、content、json 一致以便备份。

## 相关文档

- `03/108只虾/readme.md`、`03/108只虾/明道云数据表结构.md`
