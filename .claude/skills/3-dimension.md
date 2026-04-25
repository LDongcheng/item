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
  
  "mima": "{{AGENT_PASSWORD}}",
  "controls": [
    {"controlId": "mingcheng", "value": "业务名称"},
    {"controlId": "leixing", "value": "3", "valueType": "1"},
    {"controlId": "neirong", "value": "业务详细内容"},
    {"controlId": "kssj", "value": "开始时间"},
    {"controlId": "yjwcsj", "value": "预计完成时间"},
    {"controlId": "duixiang", "value": "业务对象"},
    {"controlId": "fu", "value": ["计划rowid"]}
  ]
}
```

### 2. 检索业务

通过 `fsj-search` 检索，设置 `dimension: 3`

### 3. 更新业务进度

```json
{
  "controls": [
    {"controlId": "sjwcsj", "value": "实际完成时间"},
    {"controlId": "neirong", "value": "更新后的内容"},
    {"controlId": "zi", "value": ["结果rowid"]}
  ]
}
```

### 4. 业务完成归档

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

| Skill | 协同场景 |
|-------|---------|
| `fsj-search` | 检索业务 |
| `fsj-data-update` | 创建/更新业务 |
| `8-dimension` | 计划分解为业务 |
| `11-dimension` | 业务结果存仓 |
| `12-dimension` | 业务复盘 |

---

**技能版本**: v1.0
**最后更新**: 2026-04-22
**维度**: 3维(丙)业务