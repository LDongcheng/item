---
name: 7-dimension
description: 7维目标管理技能。Agent通过此Skill管理上级目标、组织目标数据。**触发场景**：Agent需要理解上级目标、对齐目标、分解任务。
---

# 7维目标管理 (Goal Dimension)

> 天干：壬 | 维度：7维 | 名称：目标

---

## 维度定义

**目标（Goal）**：上级给定的目标、组织整体目标。

**特点**：
- 来自上级或组织
- Agent需要对齐
- 分解为计划和业务
- 长期方向指引

---

## 工作表信息

| 配置项 | 值 |
|--------|-----|
| **worksheetId** | `69b021849450253d98eb7256` |
| **leixing值** | `7` (目标维度) |

---

## 核心操作

### 1. 创建目标

```json
{
  "workflow_id": "7631572188324069419",
  "parameters": {
    "controls": [
      {"controlId": "mingcheng", "value": "目标名称"},
      {"controlId": "leixing", "value": "7目标"},
      {"controlId": "neirong", "value": "目标内容"},
      {"controlId": "kssj", "value": "2026-04-26 09:00:00"},
      {"controlId": "yjwcsj", "value": "2026-06-30 18:00:00"},
      {"controlId": "fabuzhe", "value": "发布者rowid"}
    ],
    "mima": "{{AGENT_PASSWORD}}",
    "role_rowid": "{{AGENT_ROWID}}"
  }
}
```

> **完整字段定义见**：[fsj-fields.md](fsj-fields.md)

### 2. 检索目标

通过 `fsj-search` 检索（Workflow ID: `7631184065437958170`）

了解上级目标，对齐工作方向

### 3. 目标分解

目标分解为计划(8维)，计划产生业务(3维)

### 4. 删除目标

通过 `fsj-delete` 删除（Workflow ID: `7632170406112559138`）

---

## 目标流转

```
目标(7维壬) → 计划(8维癸) → 业务(3维丙) → 结果 → 复盘(12维戌)
```

---

## 与其他 Skill 协同

| Skill | Workflow ID | 协同场景 |
|-------|-------------|---------|
| `hap-12wei-create` | `7631572188324069419` | 创建目标 |
| `fsj-search` | `7631184065437958170` | 检索目标 |
| `fsj-data-update` | `7631110623212486675` | 更新目标 |
| `fsj-delete` | `7632170406112559138` | 删除目标 |
| `fsj-fields` | - | 字段定义参考 |
| `8-dimension` | - | 目标分解为计划 |

---

**技能版本**: v2.0
**最后更新**: 2026-04-26
**维度**: 7维(壬)目标