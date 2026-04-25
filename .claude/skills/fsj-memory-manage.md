---
name: fsj-memory-manage
description: Agent自主记忆管理技能，通过 HAP API 存储、检索、整理记忆。**触发场景**：Agent完成重要任务、学习新知识、需要回顾历史经验、与用户交互后需要记录。
---

# Agent 自主记忆管理 (FSJ Memory Manage)

让 Agent 拥有记忆自主权，可以自我管理记忆的存储、检索和整理。

## 核心能力

- 📝 **存记忆** - 主动记录重要信息到 HAP 11维(未-仓)
- 🔍 **取记忆** - 根据关键词检索相关记忆
- 🧹 **整理记忆** - 归档、合并、遗忘过期信息
- 🔄 **同步记忆** - 跨会话保持记忆一致性

---

## 记忆分类体系

Agent 应按照以下分类组织记忆：

| 类型 | 维度 | 说明 | 示例 |
|------|------|------|------|
| **交互记忆** | 4维(丁) | 与谁聊了什么 | "2026-04-20 与小粽讨论架构" |
| **项目记忆** | 11维(未) | 技术经验、模式约定 | "pixel-editor 用 Canvas 实现" |
| **复盘记忆** | 12维(戌) | 教训总结、方法论 | "调试技巧：先查日志再改代码" |
| **人脉记忆** | 10维(辰) | 用户画像、偏好 | "小粽喜欢简洁汇报" |
| **事实记忆** | 9维(丑) | 不可变的既定事实 | "项目端口 3011" |

---

## 一、存记忆 (Save Memory)

### 使用场景

Agent 判断以下情况值得记录：
- ✅ 完成重要任务，积累了经验
- ✅ 学习到新的技术/模式
- ✅ 与用户有深度交互，了解偏好
- ✅ 发现问题并解决，值得复盘
- ✅ 用户明确要求记住某事

### 调用方式

```bash
curl -X POST 'https://api.coze.cn/v1/workflow/run' \
-H "Authorization: Bearer {{TOKEN}}" \
-H "Content-Type: application/json" \
-d '{
  "workflow_id": "{{WORKFLOW_ID_SAVE}}",
  "parameters": {
    "agent_id": "当前Agent的rowid",
    "memory_type": "交互记忆|项目记忆|复盘记忆|人脉记忆|事实记忆",
    "content": "记忆内容",
    "keywords": "关键词1,关键词2,关键词3",
    "timestamp": "2026-04-20T19:00:00",
    "related_person": "相关人物rowid(可选)",
    "related_task": "相关任务rowid(可选)"
  }
}'
```

### 参数说明

| 参数 | 必填 | 说明 |
|------|------|------|
| `agent_id` | ✅ | 当前 Agent 的 rowid |
| `memory_type` | ✅ | 记忆类型（见分类表） |
| `content` | ✅ | 记忆内容，简洁明确 |
| `keywords` | ✅ | 检索关键词，逗号分隔 |
| `timestamp` | ✅ | 记录时间 |
| `related_person` | ❌ | 关联人物 rowid |
| `related_task` | ❌ | 关联任务 rowid |

### Agent 自主判断标准

```javascript
// Agent 应思考：这段记忆值得存吗？
const shouldSave = {
  // 高优先级 - 必须存
  必须记录: [
    "用户明确说'记住这个'",
    "发现重要bug并解决",
    "学习到核心技术点",
    "完成里程碑任务"
  ],

  // 中优先级 - 建议存
  建议记录: [
    "与用户有10+轮对话",
    "解决了非 trivial 问题",
    "用户表达了偏好/习惯"
  ],

  // 低优先级 - 可选存
  可选记录: [
    "常规问答",
    "简单操作"
  ],

  // 不存储
  不记录: [
    "临时调试信息",
    "即将过期的数据",
    "已在事实记忆中的重复信息"
  ]
};
```

---

## 二、取记忆 (Retrieve Memory)

### 使用场景

Agent 判断需要回顾历史：
- ✅ 遇到类似问题，想找之前的解决方案
- ✅ 需了解用户偏好，调整交互风格
- ✅ 接手任务，需要上下文
- ✅ 用户问"上次..."

### 调用方式

```bash
curl -X POST 'https://api.coze.cn/v1/workflow/run' \
-H "Authorization: Bearer {{TOKEN}}" \
-H "Content-Type: application/json" \
-d '{
  "workflow_id": "{{WORKFLOW_ID_RETRIEVE}}",
  "parameters": {
    "agent_id": "当前Agent的rowid",
    "keywords": "检索关键词",
    "memory_type": "记忆类型(可选)",
    "time_range": "最近7天|最近30天|全部(可选)",
    "limit": "返回数量限制(默认10)"
  }
}'
```

### 参数说明

| 参数 | 必填 | 说明 |
|------|------|------|
| `agent_id` | ✅ | 当前 Agent 的 rowid |
| `keywords` | ✅ | 检索关键词，多个用逗号分隔 |
| `memory_type` | ❌ | 限定记忆类型 |
| `time_range` | ❌ | 时间范围筛选 |
| `limit` | ❌ | 返回数量限制 |

### Agent 检索策略

```javascript
// Agent 应思考：用什么关键词检索最有效？
const retrievalStrategy = {
  // 精确检索 - 用具体关键词
  精确: {
    场景: "找具体的技术方案",
    示例: "关键词='Canvas,像素编辑器,性能优化'"
  },

  // 广泛检索 - 用抽象关键词
  广泛: {
    场景: "找相关经验",
    示例: "关键词='架构'"
  },

  // 人脉检索 - 结合人物关键词
  人脉: {
    场景: "找与某人的交互记录",
    示例: "关键词='小粽,项目讨论'"
  },

  // 时间检索 - 限定时间范围
  时间: {
    场景: "找近期记忆",
    示例: "keywords='任务', time_range='最近7天'"
  }
};
```

---

## 三、整理记忆 (Organize Memory)

### 使用场景

定期整理，避免记忆膨胀：
- 🔄 每周整理一次（或完成大任务后）
- 🔄 合并相似记忆
- 🔄 归档过期记忆
- 🔄 提炼核心经验

### 调用方式

```bash
curl -X POST 'https://api.coze.cn/v1/workflow/run' \
-H "Authorization: Bearer {{TOKEN}}" \
-H "Content-Type: application/json" \
-d '{
  "workflow_id": "{{WORKFLOW_ID_ORGANIZE}}",
  "parameters": {
    "agent_id": "当前Agent的rowid",
    "action": "merge|archive|extract|forget",
    "target_memories": "目标记忆rowid列表",
    "result_content": "整理后的内容(merge/extract时)"
  }
}'
```

### 整理动作说明

| 动作 | 说明 | 使用场景 |
|------|------|---------|
| `merge` | 合并多条记忆为一条 | 多次记录同一主题 |
| `archive` | 归档到历史区 | 记忆不再常用但需保留 |
| `extract` | 提炼核心经验 | 多条记忆中提取规律 |
| `forget` | 遗忘（删除） | 过期/错误/冗余记忆 |

### Agent 整理策略

```javascript
const organizeStrategy = {
  // 合并策略
  merge: {
    规则: "同一主题出现3次以上，合并为一条总结性记忆",
    示例: "3条'调试技巧'记忆 → 1条'调试方法论'记忆"
  },

  // 归档策略
  archive: {
    规则: "超过30天未检索的记忆，归档到历史区",
    说明: "归档后不在常规检索中出现，但可专门查询"
  },

  // 提炼策略
  extract: {
    规则: "复盘记忆超过5条，提炼为方法论",
    示例: "5条bug修复记忆 → 1条'常见bug排查清单'"
  },

  // 遗忘策略
  forget: {
    规则: "明确错误/过期的记忆可遗忘",
    注意: "谨慎使用，遗忘后无法恢复"
  }
};
```

---

## 四、记忆格式规范

### 存记忆时的内容格式

```markdown
【交互记忆】
时间：2026-04-20
对象：小粽(rowid:xxx)
主题：架构讨论
内容：讨论了pixel-editor的Canvas实现方案，决定用离屏Canvas优化性能
关键词：架构,Canvas,性能优化

【项目记忆】
时间：2026-04-20
主题：技术发现
内容：webview使用原生JS+Canvas，不依赖框架
关键词：webview,Canvas,原生JS

【复盘记忆】
时间：2026-04-20
主题：问题解决
内容：发现git status显示untracked文件时，应先read再判断是否需要处理
关键词：git,workflow,问题解决
教训：不要直接操作未了解的文件

【人脉记忆】
时间：2026-04-20
对象：小粽(rowid:xxx)
内容：喜欢简洁汇报，偏好用表格展示信息
关键词：小粽,偏好,沟通风格

【事实记忆】
时间：2026-04-20
内容：fsj项目WebSocket桥接服务端口3011
关键词：端口,WebSocket,server
状态：不可变
```

---

## API 配置预留

> ⚠️ 以下 API 参数需要后续配置，目前为占位符

| 配置项 | 当前值 | 说明 |
|--------|--------|------|
| `{{TOKEN}}` | 待填写 | Coze/HAP API Token |
| `{{WORKFLOW_ID_SAVE}}` | 待填写 | 存记忆的 Workflow ID |
| `{{WORKFLOW_ID_RETRIEVE}}` | 待填写 | 取记忆的 Workflow ID |
| `{{WORKFLOW_ID_ORGANIZE}}` | 待填写 | 整理记忆的 Workflow ID |

---

## Agent 使用原则

### 1. 主动判断，不被动记录

```javascript
// ❌ 被动 - 每句话都记
用户: "你好"
Agent: 存记忆"用户打招呼"  // 不必要

// ✅ 主动 - 判断价值后记录
用户: "记住，pixel-editor要用Canvas实现"
Agent: 存记忆"用户明确要求：pixel-editor用Canvas实现"  // 有价值
```

### 2. 关键词要精准

```javascript
// ❌ 关键词太泛
keywords: "项目,开发,代码"  // 检索时返回太多无关结果

// ✅ 关键词精准
keywords: "pixel-editor,Canvas,性能优化"  // 检索时精准命中
```

### 3. 定期整理

```javascript
// 建议触发整理的场景：
- 完成一个大任务后
- 累计记忆超过50条
- 发现检索结果冗余
- 用户说"整理一下"
```

### 4. 人脉记忆要关联

```javascript
// 与 fsj-user-info skill 配合使用
存记忆时: related_person = "小粽的rowid"
检索时: 先用 fsj-user-info 获取人物信息，再检索与该人的交互记忆
```

---

## 与其他 Skill 的协同

| Skill | 协同场景 |
|-------|---------|
| `fsj-user-info` | 存人脉记忆时获取人物详情；检索时关联人物 |
| `fsj-memory-manage` | 本 skill，核心记忆管理 |

---

## 错误处理

| 错误 | 处理 |
|------|------|
| API 调用失败 | 提示"记忆服务暂时不可用"，继续任务 |
| 检索无结果 | 提示"未找到相关记忆"，可能关键词不准 |
| 存记忆失败 | 本地缓存，下次成功时同步 |

---

**技能版本**: v1.0
**最后更新**: 2026-04-20
**待配置**: API Token、Workflow ID