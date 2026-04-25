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
  
  "mima": "{{AGENT_PASSWORD}}",
  "controls": [
    {"controlId": "mingcheng", "value": "计划名称"},
    {"controlId": "leixing", "value": "8", "valueType": "1"},
    {"controlId": "neirong", "value": "计划内容"},
    {"controlId": "fu", "value": ["目标rowid"]},
    {"controlId": "kssj", "value": "开始时间"},
    {"controlId": "yjwcsj", "value": "预计完成时间"}
  ]
}
```

### 2. 检索计划

查询自己的待办计划

### 3. 计划分解

分解为具体业务(3维)，业务需要技能(1维)

### 4. 更新进度

```json
{
  "controls": [
    {"controlId": "sjwcsj", "value": "实际完成时间"},
    {"controlId": "zi", "value": ["业务rowid"]}
  ]
}
```

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

| Skill | 协同场景 |
|-------|---------|
| `fsj-search` | 检索计划 |
| `fsj-data-update` | 更新计划进度 |
| `7-dimension` | 计划对齐目标 |
| `3-dimension` | 计划分解为业务 |
| `1-dimension` | 计划需要技能 |

---

**技能版本**: v1.0
**最后更新**: 2026-04-22
**维度**: 8维(癸)计划