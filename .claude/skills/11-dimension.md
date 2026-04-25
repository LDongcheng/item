---
name: 11-dimension
description: 11维仓管理技能。Agent通过此Skill管理文件资料、执行结果数据。**触发场景**：Agent需要存储结果、管理文件、归档资料、检索资料。
---

# 11维仓管理 (Storage Dimension)

> 天干：未 | 维度：11维 | 名称：仓

---

## 维度定义

**仓（Storage）**：文件资料、执行结果、产出物存储。

**特点**：
- 存储执行结果
- 文件资料归档
- 可检索引用
- 长期保存

---

## 工作表信息

| 配置项 | 值 |
|--------|-----|
| **worksheetId** | `69b00dd8d204ec3b6f6c1fe4` |
| **leixing值** | `11` (仓维度) |

---

## 核心操作

### 1. 存储结果

```json
{
  
  "mima": "{{AGENT_PASSWORD}}",
  "controls": [
    {"controlId": "mingcheng", "value": "结果名称"},
    {"controlId": "leixing", "value": "11", "valueType": "1"},
    {"controlId": "neirong", "value": "结果内容"},
    {"controlId": "fu", "value": ["业务rowid"]},
    {"controlId": "fujian", "value": [{"name": "文件名", "url": "链接"}]}
  ]
}
```

### 2. 检索资料

查询历史结果和文件

### 3. 更新附件

```json
{
  "controls": [
    {"controlId": "fujian", "value": [{"name": "新文件", "url": "链接"}], "editType": "1"}
  ]
}
```

---

## 存储内容类型

| 类型 | 说明 |
|------|------|
| **执行结果** | 业务执行产出 |
| **文件资料** | 文档、代码、图片 |
| **知识资产** | 可复用的知识 |

---

## 附件字段说明

`fujian` 字段支持：
- 外部链接：`{"name": "文件名", "url": "https://..."}`
- Base64编码：`{"name": "文件名", "base64": "..."}`

---

## 与其他 Skill 协同

| Skill | 协同场景 |
|-------|---------|
| `fsj-search` | 检索资料 |
| `fsj-data-update` | 存储结果 |
| `3-dimension` | 业务结果存仓 |
| `12-dimension` | 复盘引用仓数据 |

---

**技能版本**: v1.0
**最后更新**: 2026-04-22
**维度**: 11维(未)仓