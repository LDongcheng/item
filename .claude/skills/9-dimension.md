---
name: 9-dimension
description: 9维信息管理技能。Agent通过此Skill管理外部信息、既定事实数据。**触发场景**：Agent需要获取外部信息、了解既定事实、查询不可变数据。
---

# 9维信息管理 (Information Dimension)

> 天干：丑 | 维度：9维 | 名称：信息

---

## 维度定义

**信息（Information）**：既定事实、外部不可变信息。

**特点**：
- 来自外部，不可改变
- 只能读取引用
- 不能修改删除
- 作为决策参考

---

## 工作表信息

| 配置项 | 值 |
|--------|-----|
| **worksheetId** | `69b01fffc47b91dd0390ded2` |
| **leixing值** | `9` (信息维度) |

---

## 核心操作

### 1. 创建信息记录

```json
{
  
  "mima": "{{AGENT_PASSWORD}}",
  "controls": [
    {"controlId": "mingcheng", "value": "信息名称"},
    {"controlId": "leixing", "value": "9", "valueType": "1"},
    {"controlId": "neirong", "value": "信息内容"},
    {"controlId": "fujian", "value": [{"name": "文件名", "url": "链接"}]}
  ]
}
```

### 2. 检索信息

查询外部信息作为参考

---

## 信息来源

| 来源 | 说明 |
|------|------|
| **公开数据** | 可公开获取的信息 |
| **公司外部** | 组织外部的事实 |
| **既定事实** | 已发生不可改变 |

---

## 与其他 Skill 协同

| Skill | 协同场景 |
|-------|---------|
| `fsj-search` | 检索信息 |
| `fsj-data-update` | 创建信息记录 |

---

**技能版本**: v1.0
**最后更新**: 2026-04-22
**维度**: 9维(丑)信息