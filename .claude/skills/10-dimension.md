---
name: 10-dimension
description: 10维人脉管理技能。Agent通过此Skill管理用户画像、人际关系数据。**触发场景**：Agent需要了解用户、记录人脉、维护关系、个性化服务。
---

# 10维人脉管理 (Network Dimension)

> 天干：辰 | 维度：10维 | 名称：人脉

---

## 维度定义

**人脉（Network）**：用户画像、人际关系、联系信息。

**特点**：
- 用户个性化数据
- Agent服务对象信息
- 外生数据（来自外部）
- 长期维护更新

---

## 工作表信息

| 配置项 | 值 |
|--------|-----|
| **worksheetId** | `69b815619e299b18435e1686` |
| **leixing值** | `10` (人脉维度) |

---

## 核心操作

### 1. 创建用户画像

```json
{
  "workflow_id": "7631572188324069419",
  "parameters": {
    "controls": [
      {"controlId": "mingcheng", "value": "用户名称"},
      {"controlId": "leixing", "value": "10人脉"},
      {"controlId": "neirong", "value": "用户画像信息"},
      {"controlId": "duixiang", "value": "关联用户rowid"},
      {"controlId": "guanjianci", "value": "标签rowid1,标签rowid2"},
      {"controlId": "fabuzhe", "value": "发布者rowid"}
    ],
    "mima": "{{AGENT_PASSWORD}}",
    "role_rowid": "{{AGENT_ROWID}}"
  }
}
```

> **完整字段定义见**：[fsj-fields.md](fsj-fields.md)

### 2. 检索用户信息

通过 `fsj-search` 检索（Workflow ID: `7631184065437958170`）

查询用户画像，提供个性化服务

### 3. 更新用户画像

通过 `fsj-data-update` 更新（Workflow ID: `7631110623212486675`）

根据交互历史更新画像

### 4. 删除用户画像

通过 `fsj-delete` 删除（Workflow ID: `7632170406112559138`）

---

## 用户画像内容

| 内容 | 说明 |
|------|------|
| **基本信息** | 姓名、联系方式 |
| **偏好设置** | 用户偏好、习惯 |
| **交互历史** | 与Agent的交流记录 |
| **标签分类** | 用户标签分组 |

---

## 与其他 Skill 协同

| Skill | Workflow ID | 协同场景 |
|-------|-------------|---------|
| `hap-12wei-create` | `7631572188324069419` | 创建用户画像 |
| `fsj-search` | `7631184065437958170` | 检索用户信息 |
| `fsj-data-update` | `7631110623212486675` | 更新用户画像 |
| `fsj-delete` | `7632170406112559138` | 删除用户画像 |
| `fsj-fields` | - | 字段定义参考 |
| `4-dimension` | - | 交互记录关联 |

---

**技能版本**: v2.0
**最后更新**: 2026-04-26
**维度**: 10维(辰)人脉