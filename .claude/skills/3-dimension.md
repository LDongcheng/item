---
name: 3-dimension
description: 3维业务管理技能。Agent通过此Skill管理业务、项目数据：创建、检索、更新、删除。**触发场景**：Agent参与业务执行、项目跟进、产出价值。
---

# 3维业务管理 (Business Dimension)

> 天干：丙 | 维度：3维 | 名称：业务

---

## 维度定义

**业务（Business）**：产生价值的项目、任务执行，是Agent实际工作的体现。

**特点**：
- 产生实际价值
- 有明确的执行过程
- 可追踪进度和结果
- 核心价值产出维度

---

## 工作表信息

| 配置项 | 值 |
|--------|-----|
| **worksheetId** | `69b024118a1048734a3f86cb` |
| **leixing值** | `3` (业务维度) |

---

## 核心操作

### 1. 创建业务

```json
{
  "workflow_id": "7631572188324069419",
  "parameters": {
    "controls": [
      {"controlId": "mingcheng", "value": "业务名称"},
      {"controlId": "leixing", "value": "3项目"},
      {"controlId": "neirong", "value": "业务详细内容"},
      {"controlId": "kssj", "value": "2026-04-26 09:00:00"},
      {"controlId": "yjwcsj", "value": "2026-04-30 18:00:00"},
      {"controlId": "duixiang", "value": "业务对象rowid"},
      {"controlId": "fu", "value": "计划rowid"},
      {"controlId": "fabuzhe", "value": "发布者rowid"}
    ],
    "mima": "{{AGENT_PASSWORD}}",
    "role_rowid": "{{AGENT_ROWID}}"
  }
}
```

> **完整字段定义见**：[fsj-fields.md](fsj-fields.md)

### 2. 检索业务

通过 `fsj-search` 检索（Workflow ID: `7631184065437958170`）

### 3. 更新业务进度

通过 `fsj-data-update` 更新（Workflow ID: `7631110623212486675`）

```json
{
  "workflow_id": "7631110623212486675",
  "parameters": {
    "rowid": "{{BUSINESS_ROWID}}",
    "controls": [
      {"controlId": "sjwcsj", "value": "2026-04-30 16:00:00"},
      {"controlId": "neirong", "value": "更新后的内容"},
      {"controlId": "zi", "value": "结果rowid1,结果rowid2"}
    ],
    "mima": "{{AGENT_PASSWORD}}"
  }
}
```

### 4. 删除业务

通过 `fsj-delete` 删除（Workflow ID: `7632170406112559138`）

### 5. 业务完成归档

完成后存入11维(仓)，复盘存入12维(戌)

---

## 业务流转

```
计划(8维) → 业务(3维) → 执行 → 结果(11维) → 复盘(12维)
```

---

## 时间字段

| 字段 | 说明 |
|------|------|
| `kssj` | 开始时间 |
| `yjwcsj` | 预计完成时间 |
| `sjwcsj` | 实际完成时间 |

---

## 与其他 Skill 协同

| Skill | Workflow ID | 协同场景 |
|-------|-------------|---------|
| `hap-12wei-create` | `7631572188324069419` | 创建业务 |
| `fsj-search` | `7631184065437958170` | 检索业务 |
| `fsj-data-update` | `7631110623212486675` | 更新业务 |
| `fsj-delete` | `7632170406112559138` | 删除业务 |
| `fsj-fields` | - | 字段定义参考 |
| `8-dimension` | - | 计划分解为业务 |
| `11-dimension` | - | 业务结果存仓 |
| `12-dimension` | - | 业务复盘 |

---

**技能版本**: v2.0
**最后更新**: 2026-04-26
**维度**: 3维(丙)业务