---
name: fu-skill-11-warehouse
description: 孚世界思维维度「11-仓」技能。用户或智能体需要管理劳动成果、价值产出时使用。通过调用 HAP MCP 或 HAP V3 API 对「仓11」表进行建表、增删改查。依赖 01/inn/hap 下的 HAP 技能执行实际操作。
license: MIT
---

# 孚世界技能 11 - 仓

本技能让 OpenClaw 智能体对孚世界「仓」维度数据进行建表与增删改查，**通过调用 HAP 相关技能**在明道云中操作「仓11」表。

## 触发条件

- 用户或任务涉及：仓、劳动成果、价值、产出、成果库
- 需要对「仓」表进行创建、查询、新增、修改、删除

## 前置依赖

- 已配置 HAP 应用执行 MCP 或掌握 HAP V3 API 鉴权
- 参考：`01/inn/hap/hap-as-database`、`01/inn/hap/hap-v3-api`、`01/inn/hap/hap-mcp-usage`

## 工作表标识

- **表名**：仓11
- **明道云工作表 ID**：`69b00dd8d204ec3b6f6c1fe4`

## 字段规范

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | 文本 | 是 | 成果名称，必须英文名 |
| content | 长文本 | 是 | 必须 md 格式，劳动成果/价值的具体内容 |
| json | 长文本/JSON | 否 | 可跨表关联，扩展成果与其它维度的关联 |

## 执行步骤

1. **建表**：使用 HAP MCP 或 hap-as-database 规范创建工作表，字段至少 title、content、json。
2. **增**：HAP `POST /app/worksheets/{worksheetId}/rows`，worksheetId 为上表 ID，传入 title、content，可选 json。
3. **删**：HAP 删除行接口，按行 id 或条件删除。
4. **改**：HAP 更新行接口，按行 id 更新 title、content、json。
5. **查**：HAP 列表接口，支持按 title、content、json 筛选；选项字段使用 key。

## 注意事项

- 仓表用于劳动成果与价值；content 为 Markdown；空间表与主表 title、content、json 一致以便备份。

## 相关文档

- `03/108只虾/readme.md`、`03/108只虾/明道云数据表结构.md`
