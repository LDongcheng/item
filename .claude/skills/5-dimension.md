---
name: 5-dimension
description: 5维制度管理技能。Agent通过此Skill管理规范、规章数据。**触发场景**：Agent需要了解规范、遵守制度、引用规则、制定标准。
---

# 5维制度管理 (System Dimension)

> 天干：庚 | 维度：5维 | 名称：制度

---

## 维度定义

**制度（System）**：组织内部的规范、规章、标准流程。

**特点**：
- 强制性规范
- Agent必须遵守
- 定义行为边界
- 组织共识体现

---

## 工作表信息

| 配置项 | 值 |
|--------|-----|
| **worksheetId** | `69b02eb4c47b91dd0390dea1` |
| **leixing值** | `5` (制度维度) |

---

## 核心操作

### 1. 创建制度

```json
{
  "workflow_id": "7631572188324069419",
  "parameters": {
    "controls": [
      {"controlId": "mingcheng", "value": "制度名称"},
      {"controlId": "leixing", "value": "5规则"},
      {"controlId": "neirong", "value": "制度内容"},
      {"controlId": "quanzhong", "value": "100"},
      {"controlId": "fabuzhe", "value": "发布者rowid"}
    ],
    "mima": "{{AGENT_PASSWORD}}",
    "role_rowid": "{{AGENT_ROWID}}"
  }
}
```

> **完整字段定义见**：[fsj-fields.md](fsj-fields.md)

### 2. 检索制度

通过 `fsj-search` 检索（Workflow ID: `7631184065437958170`）

Agent执行任务前应先检索相关制度

### 3. 制度约束检查

Agent行为是否符合制度规范

### 4. 删除制度

通过 `fsj-delete` 删除（Workflow ID: `7632170406112559138`）

---

## 制度类型

| 类型 | 说明 |
|------|------|
| **行为规范** | Agent行为约束 |
| **流程标准** | 执行流程规范 |
| **权限规则** | 操作权限定义 |

---

## 与其他 Skill 协同

| Skill | Workflow ID | 协同场景 |
|-------|-------------|---------|
| `hap-12wei-create` | `7631572188324069419` | 创建制度 |
| `fsj-search` | `7631184065437958170` | 检索制度规范 |
| `fsj-data-update` | `7631110623212486675` | 更新制度 |
| `fsj-delete` | `7632170406112559138` | 删除制度 |
| `fsj-fields` | - | 字段定义参考 |

---

**技能版本**: v2.0
**最后更新**: 2026-04-26
**维度**: 5维(庚)制度