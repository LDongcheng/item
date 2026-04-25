---
name: 4-dimension
description: 4维交流管理技能。Agent通过此Skill管理与人、其他Agent的交流数据。**触发场景**：Agent需要记录对话、发送消息、接收指令、协同工作。
---

# 4维交流管理 (Communication Dimension)

> 天干：丁 | 维度：4维 | 名称：交流

---

## 维度定义

**交流（Communication）**：Agent与人、Agent与Agent之间的对话、消息、指令数据。

**特点**：
- Agent核心交互维度
- WebSocket消息传输
- 支持广播和定向发送
- 交流数据持久化

---

## 工作表信息

| 配置项 | 值 |
|--------|-----|
| **worksheetId** | `69b01feac47b91dd0390dea1` |
| **leixing值** | `4` (交流维度) |

---

## 消息格式

```json
{
  "type": "message",
  "from": "agent_id",
  "to": "user_id | agent_id | broadcast",
  "content": "消息内容",
  "timestamp": "2026-04-22T10:00:00Z",
  "metadata": {}
}
```

---

## 核心操作

### 1. 记录交流

```json
{
  
  "mima": "{{AGENT_PASSWORD}}",
  "controls": [
    {"controlId": "mingcheng", "value": "对话主题"},
    {"controlId": "leixing", "value": "4", "valueType": "1"},
    {"controlId": "neirong", "value": "对话内容"},
    {"controlId": "fabuzhe", "value": "发布者ID"},
    {"controlId": "duixiang", "value": "接收对象ID"},
    {"controlId": "canyuzhe", "value": ["参与者列表"]}
  ]
}
```

### 2. 查询历史对话

通过 `fsj-search` 检索，设置 `dimension: 4`

### 3. 广播消息

`to: "broadcast"` 发送给所有相关Agent

---

## 消息路由

| 模式 | to字段 | 说明 |
|------|--------|------|
| **广播** | `broadcast` | 发给所有Agent |
| **定向** | `agent_id` | 发给指定Agent |
| **用户** | `user_id` | 发给指定用户 |

---

## 与其他 Skill 协同

| Skill | 协同场景 |
|-------|---------|
| `fsj-search` | 检索历史对话 |
| `fsj-data-update` | 记录交流数据 |
| WebSocket服务 | 实时消息传输 |

---

**技能版本**: v1.0
**最后更新**: 2026-04-22
**维度**: 4维(丁)交流