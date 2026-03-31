# 代码经验 - 2026-03-01

## 🎯 任务：明道云对话记录技能修复

### 问题背景
- 删除明道云 → OpenClaw 的轮询/推送功能（系统消息循环注入、无影云无法开放端口）
- 保留 OpenClaw → 明道云的消息记录功能
- 原有代码使用字段别名，但明道云 API 需要实际字段 ID

---

## 🔧 遇到的关键问题

### 1️⃣ 字段 ID 问题（最大坑！）

**问题：**
```javascript
// ❌ 错误：使用字段别名
{ id: 'neirong', value: content }

// ✅ 正确：使用实际字段 ID
{ id: '68da906bd34347b006235da5', value: content }
```

**教训：**
- 明道云 API **必须使用实际字段 ID**，不是别名
- 别名只在网页界面显示，API 不识别
- 先用 API 查询工作表获取字段 ID 映射

**字段 ID 映射表：**
| 字段 | 对话工作表 ID | 消息工作表 ID |
|------|--------------|--------------|
| 内容 | `68da90934256d51497bb9ff9` | `68da906bd34347b006235da5` |
| 发起人 | `68da90c3432b11f7ba68cb6c` | - |
| 接收人 | `692bfbb1e22247ab9a654f3d` | - |
| 对话 | - | `68da9105d34347b006235df6` |
| 用户 | - | `692d147433260875c1970b8a` |
| 日期 | `692cf82fe22247ab9a67d78d` | `692d166992609b5d9de82b58` |

---

### 2️⃣ 缓存初始化问题

**问题：**
```javascript
// ❌ 错误：初始化为 null
let dialogCache = null;
// 后续访问时报错：Cannot read properties of null

// ✅ 正确：初始化为对象
let dialogCache = {};
```

**教训：**
- 对象类型缓存**永远初始化为 `{}`**，不是 `null`
- 加载缓存前先 `ensureCache()`
- 解析 JSON 时用 `try-catch`

---

### 3️⃣ 会话文件格式变化

**问题：**
```javascript
// ❌ 错误：假设 content 是字符串
message.content  // 可能是数组！

// ✅ 正确：处理两种格式
function extractText(content) {
  if (Array.isArray(content)) {
    return content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('');
  }
  return content || null;
}
```

**教训：**
- OpenClaw 会话文件格式可能变化
- **永远做类型检查**，不要假设数据结构
- 数组格式包含 `thinking`、`text`、`toolCall` 等多种类型

---

### 4️⃣ 明道云列表查询限制

**问题：**
- API 写入成功，返回 ID
- 但列表查询 (`paging=false`) 返回 0 条记录

**教训：**
- 明道云列表查询**可能有视图过滤**
- **根据 ID 查询能查到 = 数据确实存在**
- 不要依赖列表查询验证写入，直接用 ID 查询

---

### 5️⃣ 守护进程文件监控去重

**问题：** 文件监控会触发多次，如何避免重复记录？

**解决方案：**
```javascript
const recordedMessages = new Set();  // 去重

function processMessage(message) {
  const msgId = message.id;
  if (recordedMessages.has(msgId)) return;  // 跳过已记录
  recordedMessages.add(msgId);
  // 记录到明道云...
}
```

---

## 📊 架构设计

```
┌─────────────────────┐
│ auto-record-daemon.js│ ← 监控层（会话文件）
└──────────┬──────────┘
           │ 调用
           ↓
┌─────────────────────┐
│ auto-hook.js        │ ← API 层（明道云）
└──────────┬──────────┘
           │ HTTP
           ↓
┌─────────────────────┐
│ 明道云 API          │ ← 数据层
└─────────────────────┘
```

**好处：**
- 监控逻辑和 API 逻辑分离
- 修改明道云配置只改 `auto-hook.js`
- 修改监控策略只改 `auto-record-daemon.js`

---

## 🛠️ 修改的文件

### skills/mingdao-chat/

| 文件 | 操作 | 说明 |
|------|------|------|
| `auto-hook.js` | 修改 | 修复字段 ID，添加配置对象 |
| `auto-record-daemon.js` | 新增 | 会话监控守护进程 |
| `SKILL.md` | 修改 | 更新技术文档 |
| `README.md` | 修改 | 更新使用指南 |
| `USAGE.md` | 修改 | 更新使用示例 |
| `poller.log` | 删除 | 轮询器日志 |
| `.poller-cache.json` | 删除 | 轮询器缓存 |
| `IMPLEMENTATION-LOG.md` | 删除 | 历史实现日志 |
| `session-watcher.js` | 删除 | 会话监控器 |
| `webhook-receiver.js` | 删除 | Webhook 接收器 |

---

## 📋 核心教训

| 问题 | 教训 | 优先级 |
|------|------|--------|
| 字段 ID 用别名 | **永远用实际 ID** | 🔴 最高 |
| 缓存初始化为 null | **对象永远初始化为 `{}`** | 🔴 最高 |
| 假设 content 是字符串 | **永远做类型检查** | 🟡 高 |
| 依赖列表查询验证 | **用 ID 查询验证写入** | 🟡 高 |
| 文件监控不去重 | **必须用 Set 去重** | 🟡 高 |

---

## 💡 未来避免的坑

1. **先查工作表获取字段 ID**，不要猜
2. **缓存初始化检查**，写成工具函数
3. **类型检查**，尤其是 API 返回数据
4. **去重逻辑**，文件监控必备
5. **日志分级**，方便调试

---

## 🎓 总结

> **不要假设，要验证！**
> - 不要假设字段 ID 是别名 → 查 API
> - 不要假设缓存有值 → 检查初始化
> - 不要假设数据格式 → 做类型检查
> - 不要假设写入成功 → 用 ID 查询验证

---

**日期**: 2026-03-01  
**作者**: 小粽 (AI)  
**相关仓库**: 
- 代码：`github.com/aidegl/item/skillshop/mingdao-chat`
- 经验：`github.com/aidegl/KnowledgeBase/CODING-EXPERIENCE-2026-03-01.md`
