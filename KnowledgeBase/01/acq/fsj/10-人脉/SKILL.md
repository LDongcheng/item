---
name: fu-skill-10-contacts
description: 孚世界思维维度「10-人脉」技能。用户或智能体需要管理用户画像、人脉时使用。通过调用 HAP MCP 或 HAP V3 API 对「人脉10」表进行建表、增删改查。依赖 01/inn/hap 下的 HAP 技能执行实际操作。
license: MIT
---

# 孚世界技能 10 - 人脉

本技能让 OpenClaw 智能体对孚世界「人脉」维度数据进行建表与增删改查，**通过调用 HAP 相关技能**在明道云中操作「人脉10」表。

## 触发条件

- 用户或任务涉及：人脉、用户画像、联系人、角色画像
- 需要对「人脉」表进行创建、查询、新增、修改、删除

## 前置依赖

- 已配置 HAP 应用执行 MCP 或掌握 HAP V3 API 鉴权
- 参考：`01/inn/hap/hap-as-database`、`01/inn/hap/hap-v3-api`、`01/inn/hap/hap-mcp-usage`

## 工作表标识

- **表名**：人脉10
- **明道云工作表 ID**：`69b815619e299b18435e1686`

## 字段规范

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | 文本 | 是 | 人脉/画像名称，必须英文名 |
| content | 长文本 | 是 | 必须 md 格式，用户画像或人脉的具体内容 |
| json | 长文本/JSON | 否 | 可跨表关联，扩展画像或人脉结构 |

## 执行步骤

1. **建表**：使用 HAP MCP 或 hap-as-database 规范创建工作表，字段至少 title、content、json。
2. **增**：HAP `POST /app/worksheets/{worksheetId}/rows`，worksheetId 为上表 ID，传入 title、content，可选 json。
3. **删**：HAP 删除行接口，按行 id 或条件删除。
4. **改**：HAP 更新行接口，按行 id 更新 title、content、json。
5. **查**：HAP 列表接口，支持按 title、content、json 筛选；选项字段使用 key。

## 注意事项

- 人脉表用于用户画像，content 为 Markdown；空间表与主表 title、content、json 一致以便备份。

## 相关文档

- `03/108只虾/readme.md`、`03/108只虾/明道云数据表结构.md`
