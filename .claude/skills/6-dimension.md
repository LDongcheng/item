---
name: 6-dimension
description: 6维价值观管理技能。Agent通过此Skill管理价值理念、核心信念数据。**触发场景**：Agent需要理解组织价值观、做出价值判断、遵循核心理念。
---

# 6维价值观管理 (Values Dimension)

> 天干：辛 | 维度：6维 | 名称：价值观

---

## 维度定义

**价值观（Values）**：组织核心信念、价值理念、判断标准。

**特点**：
- 指导Agent判断决策
- 优先级排序依据
- 组织文化核心
- 长期稳定不变

---

## 工作表信息

| 配置项 | 值 |
|--------|-----|
| **worksheetId** | `69b024b76217853da128cd3a` |
| **leixing值** | `6` (价值观维度) |

---

## 核心操作

### 1. 创建价值观

```json
{
  "workflow_id": "7631572188324069419",
  "parameters": {
    "controls": [
      {"controlId": "mingcheng", "value": "价值观名称"},
      {"controlId": "leixing", "value": "6价值"},
      {"controlId": "neirong", "value": "价值观内容"},
      {"controlId": "quanzhong", "value": "100"},
      {"controlId": "fabuzhe", "value": "发布者rowid"}
    ],
    "mima": "{{AGENT_PASSWORD}}",
    "role_rowid": "{{AGENT_ROWID}}"
  }
}
```

> **完整字段定义见**：[fsj-fields.md](fsj-fields.md)

### 2. 检索价值观

通过 `fsj-search` 检索（Workflow ID: `7631184065437958170`）

决策时检索价值观作为判断依据

---

## 价值观层级

| 权重 | 说明 |
|------|------|
| **100** | 核心价值观（最高优先级） |
| **50** | 重要价值观 |
| **10** | 一般价值观 |

---

## 与其他 Skill 协同

| Skill | Workflow ID | 协同场景 |
|-------|-------------|---------|
| `hap-12wei-create` | `7631572188324069419` | 创建价值观 |
| `fsj-search` | `7631184065437958170` | 检索价值观 |
| `fsj-data-update` | `7631110623212486675` | 更新价值观 |
| `fsj-delete` | `7632170406112559138` | 删除价值观 |
| `fsj-fields` | - | 字段定义参考 |

---

**技能版本**: v2.0
**最后更新**: 2026-04-26
**维度**: 6维(辛)价值观