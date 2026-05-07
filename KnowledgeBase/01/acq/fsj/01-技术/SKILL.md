---
name: fu-skill-01-technology
description: 孚世界思维维度「01-技术」技能。用户或智能体需要管理技术类内容（技能定义、MCP 工具、API 文档、前端/后端）时使用。通过调用 HAP MCP 或 HAP V3 API 对「技能1」表进行建表、增删改查。依赖 01/inn/hap 下的 hap-as-database、hap-v3-api、hap-mcp-usage 等技能执行实际操作。
license: MIT
---

# 孚世界技能 01 - 技术

本技能让 OpenClaw 智能体对孚世界「技术」维度数据进行建表与增删改查，**通过调用 HAP 相关技能**在明道云中操作「技能1」表。

## 触发条件

- 用户或任务涉及：技术、Skills、MCP 工具、API 文档、前端/后端、技能定义、acq/inn 分类
- 需要对「技术」表进行创建、查询、新增、修改、删除

## 前置依赖

- **必须先具备**：已配置 HAP 应用执行 MCP（或掌握 HAP V3 API 鉴权）
- **参考技能**：`01/inn/hap/hap-as-database`（建表与数据规范）、`01/inn/hap/hap-v3-api`（接口调用）、`01/inn/hap/hap-mcp-usage`（MCP 配置与验证）

## 工作表标识

- **表名**：技能1（技术）
- **明道云工作表 ID**：`69b02197d204ec3b6f6c2adc`
- **空间内表**：与主数据表字段 title、content、json 一致，其余可扩展

## 字段规范

| 字段 | 别名/类型 | 必填 | 说明 |
|------|-----------|------|------|
| type | 选项 | 是 | acq（后天技能）/ inn（先天技能） |
| title | 文本 | 是 | 技术名称，必须英文名 |
| content | 长文本 | 是 | 必须 md 格式，且为标准 skills 内容 |
| json | 长文本/JSON | 否 | 可跨表关联，如 children、related_communications 等 |

## 执行步骤

1. **建表（空间首次使用时）**  
   使用 HAP MCP（如 `create_worksheet` 等）或按 hap-as-database 规范在应用中创建工作表，字段包含：type、title、content、json（及本空间所需扩展字段）。

2. **增**  
   通过 HAP MCP 或 V3 API `POST /app/worksheets/{worksheetId}/rows`，传入 `fields`：type、title、content，可选 json。

3. **删**  
   使用 HAP 删除行接口，按行 id 或筛选条件删除。

4. **改**  
   使用 HAP 更新行接口，按行 id 更新 type、title、content、json 等字段。

5. **查**  
   使用 HAP 列表接口，支持按 type、title、content 或 json 内容筛选；筛选时选项字段使用 key（UUID），不使用显示文本。

## 注意事项

- content 必须为 Markdown 且符合「标准 skills」格式。
- 跨表关联放在 json 中，如 `children`、`related_communications`，结构参考 readme 中技术表 json 示例。
- 空间内表与主表 title、content、json 一致，便于备份到主数据表。

## 相关文档

- 孚世界说明：`03/108只虾/readme.md`
- 明道云表结构：`03/108只虾/明道云数据表结构.md`
