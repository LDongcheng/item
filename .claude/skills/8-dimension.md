---
name: 8-dimension
description: 8维计划管理技能。Agent通过此Skill管理自己的计划、待办数据。**触发场景**：Agent制定计划、规划任务、分解工作、跟进进度。
---

# 8维计划管理 (Plan Dimension)

> 天干：癸 | 维度：8维 | 名称：计划

---

## 维度定义

**计划（Plan）**：Agent自己的计划、待办事项、工作安排。

**特点**：
- Agent自主制定
- 可分解为业务
- 有明确时间线
- 可追踪进度

---

## 工作表信息

| 配置项 | 值 |
|--------|-----|
| **worksheetId** | `69b0251c9e299b1843578e0f` |
| **leixing值** | `8` (计划维度) |

---

## 核心操作

### 1. 创建计划

```json
{
  "workflow_id": "7631572188324069419",
  "parameters": {
    "controls": [
      {"controlId": "mingcheng", "value": "计划名称"},
      {"controlId": "leixing", "value": "8计划"},
      {"controlId": "neirong", "value": "计划内容"},
      {"controlId": "fu", "value": "目标rowid"},
      {"controlId": "kssj", "value": "2026-04-26 09:00:00"},
      {"controlId": "yjwcsj", "value": "2026-04-30 18:00:00"},
      {"controlId": "fabuzhe", "value": "发布者rowid"}
    ],
    "mima": "{{AGENT_PASSWORD}}",
    "role_rowid": "{{AGENT_ROWID}}"
  }
}
```

> **完整字段定义见**：[fsj-fields.md](fsj-fields.md)

### 2. 检索计划

通过 `fsj-search` 检索（Workflow ID: `7631184065437958170`）

查询自己的待办计划

### 3. 计划分解

分解为具体业务(3维)，业务需要技能(1维)

### 4. 更新进度

通过 `fsj-data-update` 更新（Workflow ID: `7631110623212486675`）

```json
{
  "workflow_id": "7631110623212486675",
  "parameters": {
    "rowid": "{{PLAN_ROWID}}",
    "controls": [
      {"controlId": "sjwcsj", "value": "2026-04-30 16:00:00"},
      {"controlId": "zi", "value": "业务rowid1,业务rowid2"}
    ],
    "mima": "{{AGENT_PASSWORD}}"
  }
}
```

### 5. 删除计划

通过 `fsj-delete` 删除（Workflow ID: `7632170406112559138`）

---

## 计划流转

```
目标(7维) → 计划(8维) → 业务(3维) → 执行
                ↓
              想法(2维)
                ↓
              技能(1维)
```

---

## 与其他 Skill 协同

| Skill | Workflow ID | 协同场景 |
|-------|-------------|---------|
| `hap-12wei-create` | `7631572188324069419` | 创建计划 |
| `fsj-search` | `7631184065437958170` | 检索计划 |
| `fsj-data-update` | `7631110623212486675` | 更新计划进度 |
| `fsj-delete` | `7632170406112559138` | 删除计划 |
| `fsj-fields` | - | 字段定义参考 |
| `7-dimension` | - | 计划对齐目标 |
| `3-dimension` | - | 计划分解为业务 |
| `1-dimension` | - | 计划需要技能 |

---

**技能版本**: v2.0
**最后更新**: 2026-04-26
**维度**: 8维(癸)计划