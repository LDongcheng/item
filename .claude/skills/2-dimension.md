---
name: 2-dimension
description: 2维想法管理技能。Agent通过此Skill管理创意、想法数据：创建、检索、更新、删除。**触发场景**：Agent产生新想法、需要验证创意、规划工作思路。
---

# 2维想法管理 (Idea Dimension)

> 天干：卯 | 维度：2维 | 名称：想法

---

## 维度定义

**想法（Idea）**：未经验证的创意、规划思路，可能转化为技能或业务。

**特点**：
- 未经验证，处于"萌芽"状态
- 可转化为1维(技能)或3维(业务)
- 需要验证后才能执行
- 允许试错和修改

---

## 工作表信息

| 配置项 | 值 |
|--------|-----|
| **worksheetId** | `69b023866217853da128ccea` |
| **leixing值** | `2` (想法维度) |

---

## 核心操作

### 1. 创建想法

```json
{
  "workflow_id": "7631572188324069419",
  "parameters": {
    "controls": [
      {"controlId": "mingcheng", "value": "想法名称"},
      {"controlId": "leixing", "value": "2想法"},
      {"controlId": "neirong", "value": "想法详细内容"},
      {"controlId": "miaoshu", "value": "简短描述"},
      {"controlId": "guanjianci", "value": "标签rowid1,标签rowid2"},
      {"controlId": "fabuzhe", "value": "发布者rowid"}
    ],
    "mima": "{{AGENT_PASSWORD}}",
    "role_rowid": "{{AGENT_ROWID}}"
  }
}
```

> **完整字段定义见**：[fsj-fields.md](fsj-fields.md)

### 2. 检索想法

通过 `fsj-search` 检索（Workflow ID: `7631184065437958170`）

### 3. 更新想法

通过 `fsj-data-update` 更新（Workflow ID: `7631110623212486675`）

### 4. 删除想法

通过 `fsj-delete` 删除（Workflow ID: `7632170406112559138`，只能删除自己发布的）

---

## 想法转化路径

```
想法(2维) → 验证 → 技能(1维) 或 业务(3维)
想法(2维) → 否定 → 删除
```

---

## 与其他维度关系

- **父**：可能来自目标(7维)、计划(8维)
- **子**：转化为技能(1维)、业务(3维)

---

## 与其他 Skill 协同

| Skill | Workflow ID | 协同场景 |
|-------|-------------|---------|
| `hap-12wei-create` | `7631572188324069419` | 创建想法 |
| `fsj-search` | `7631184065437958170` | 检索想法 |
| `fsj-data-update` | `7631110623212486675` | 更新想法 |
| `fsj-delete` | `7632170406112559138` | 删除想法 |
| `fsj-fields` | - | 字段定义参考 |
| `1-dimension` | - | 想法转化为技能 |
| `3-dimension` | - | 想法转化为业务 |

---

**技能版本**: v2.0
**最后更新**: 2026-04-26
**维度**: 2维(卯)想法