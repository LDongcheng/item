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
  
  "mima": "{{AGENT_PASSWORD}}",
  "controls": [
    {"controlId": "mingcheng", "value": "目标名称"},
    {"controlId": "leixing", "value": "7", "valueType": "1"},
    {"controlId": "neirong", "value": "目标内容"},
    {"controlId": "kssj", "value": "开始时间"},
    {"controlId": "yjwcsj", "value": "预计完成时间"}
  ]
}
```

### 2. 检索目标

了解上级目标，对齐工作方向

### 3. 目标分解

目标分解为计划(8维)，计划产生业务(3维)

---

## 目标流转

```
目标(7维壬) → 计划(8维癸) → 业务(3维丙) → 结果 → 复盘(12维戌)
```

---

## 与其他 Skill 协同

| Skill | 协同场景 |
|-------|---------|
| `fsj-search` | 检索目标 |
| `fsj-data-update` | 更新目标 |
| `8-dimension` | 目标分解为计划 |

---

**技能版本**: v1.0
**最后更新**: 2026-04-22
**维度**: 7维(壬)目标