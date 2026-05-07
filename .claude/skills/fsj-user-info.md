---
name: fsj-user-info
description: 孚世界用户信息查询技能，通过 Coze Workflow API 查询团队成员详细信息。**立即触发条件**：用户提到"查询成员"、"成员信息"、"小粽"、"阿说"、"小云"、"小风"、"团队成员"、"用户详情"、"查询用户"、"获取用户信息"。
---

# 孚世界用户信息查询 (FSJ User Info)

通过 Coze Workflow API 快速查询孚世界团队成员详细信息的技能。

## Overview

本技能通过调用 Coze 平台的 Workflow API，根据 `rowid` 查询团队成员的完整资料，包括姓名、职位、性格、能力、兴趣、背景等详细信息。

**核心能力:**
- ✅ 通过 rowid 查询成员完整信息
- ✅ 获取成员性格特征和 MBTI 类型
- ✅ 获取成员职位和工作职责
- ✅ 支持查看成员背景和兴趣

---

## 快速开始

### 1. 直接查询成员信息

**方法: 调用 Coze Workflow API**

```bash
curl -X POST 'https://api.coze.cn/v1/workflow/run' \
-H "Authorization: Bearer sat_PsqZd6JJl9qOPZoT30rPv2gLKAVIMXGMmIp38VzXXIRU77nzgzk09yvcFwNT8Z4h" \
-H "Content-Type: application/json" \
-d '{
  "workflow_id": "7628958945055506472",
  "parameters": {
    "rowid": "成员的rowid值"
  }
}'
```

### 2. 已知成员 rowid 列表

| 成员 | rowid |
|-----|-------|
| 祈景宗（小粽） | `1024efc4-27fd-4522-bf3c-e4ebc998393c` |
| 阿说 | （待补充） |
| 小云 | （待补充） |
| 小风 | （待补充） |

---

## 核心工作流程

### 阶段一: 确定查询目标

**Step 1: 确认要查询的成员**

根据用户需求确定查询对象：
- 用户直接指定成员名称（如"小粽"、"阿说"）
- 用户提供具体的 rowid 值
- 用户询问团队某成员信息

**Step 2: 获取对应 rowid**

```javascript
// 成员 rowid 映射表
const memberRowIds = {
  '小粽': '1024efc4-27fd-4522-bf3c-e4ebc998393c',
  '祈景宗': '1024efc4-27fd-4522-bf3c-e4ebc998393c',
  '粽子': '1024efc4-27fd-4522-bf3c-e4ebc998393c',
  // 其他成员待补充...
};
```

### 阶段二: 发起 API 请求

**Step 3: 执行 Coze Workflow 调用**

```bash
# 标准请求格式
curl -X POST 'https://api.coze.cn/v1/workflow/run' \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "workflow_id": "7628958945055506472",
  "parameters": {
    "rowid": "1024efc4-27fd-4522-bf3c-e4ebc998393c"
  }
}'
```

**使用 JavaScript/Node.js:**

```javascript
async function getMemberInfo(rowid) {
  const response = await fetch('https://api.coze.cn/v1/workflow/run', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer sat_PsqZd6JJl9qOPZoT30rPv2gLKAVIMXGMmIp38VzXXIRU77nzgzk09yvcFwNT8Z4h',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      workflow_id: '7628958945055506472',
      parameters: {
        rowid: rowid
      }
    })
  });

  const result = await response.json();
  
  if (result.code === 0) {
    // data 是 JSON 字符串，需要解析
    return JSON.parse(result.data);
  } else {
    throw new Error(result.msg || '查询失败');
  }
}
```

### 阶段三: 解析响应数据

**Step 4: 处理返回结果**

**标准响应格式:**

```json
{
  "code": 0,
  "msg": "",
  "data": "{\"description\":\"...\",\"gender\":\"男\",\"mtbi\":\"INTP\",\"occupation\":\"总经理...\"}",
  "debug_url": "https://www.coze.cn/work_flow?...",
  "execute_id": "7628991525187469318"
}
```

**成员信息字段说明:**

| 字段 | 说明 | 示例 |
|-----|------|------|
| `description` | 成员详细描述 | 包含姓名、小名、职位、工作、性格、能力、兴趣、背景等 |
| `gender` | 性别 | "男" / "女" |
| `mtbi` | MBTI 类型 | "INTP" / "ENFP" 等 |
| `occupation` | 职位/职业 | "总经理、孚世界最强元神" |

---

## 重要规范 ⭐重点

### API 参数规范 ⭐⭐

**必需参数:**

```javascript
// ✅ 正确 - 完整请求参数
{
  "workflow_id": "7628958945055506472",  // 固定值
  "parameters": {
    "rowid": "有效的UUID格式rowid"       // 32位UUID字符串
  }
}

// ❌ 错误 - 参数格式不规范
{
  "workflow_id": "7628958945055506472",
  "parameters": {
    "rowid": ""  // 空值无效
  }
}
```

**规则:**
1. `workflow_id` 必须使用固定值 `7628958945055506472`
2. `rowid` 必须是有效的 UUID 格式字符串
3. Authorization Token 需定期更新

### 响应处理规范 ⭐⭐⭐

**重要: `data` 字段是 JSON 字符串，需要二次解析**

```javascript
// ✅ 正确 - 二次解析 data 字段
const response = await fetch(...);
const result = await response.json();

if (result.code === 0) {
  const memberInfo = JSON.parse(result.data);  // 关键：解析 data 字符串
  console.log(memberInfo.description);
  console.log(memberInfo.gender);
  console.log(memberInfo.mtbi);
}

// ❌ 错误 - 直接使用 data 字段
const memberInfo = result.data;  // 这是字符串，不是对象！
console.log(memberInfo.gender);  // undefined
```

### 错误码对照表

| code | 说明 | 处理建议 |
|------|------|---------|
| `0` | 成功 | 正常解析 data 字段 |
| 非0 | 失败 | 查看 msg 字段了解错误原因 |

---

## 常见陷阱与解决方案 ⭐⭐⭐

### 陷阱1: data 字段未解析

**问题:** 返回的 `data` 是 JSON 字符串，直接访问属性会失败

**错误示例:**

```javascript
// ❌ 错误 - 直接访问 data 属性
const result = await response.json();
console.log(result.data.gender);  // undefined，因为 data 是字符串
```

**正确做法:**

```javascript
// ✅ 正确 - 先解析 data 字符串
const result = await response.json();
const memberInfo = JSON.parse(result.data);
console.log(memberInfo.gender);  // "男"
```

**解决方案:**
1. 检查 `code === 0` 确认请求成功
2. 使用 `JSON.parse(result.data)` 解析数据
3. 然后访问解析后的对象属性

### 陷阱2: rowid 格式错误

**问题:** rowid 格式不符合要求导致查询失败

**错误示例:**

```javascript
// ❌ 错误 - rowid 格式不正确
{
  "parameters": {
    "rowid": "123"  // 不是 UUID 格式
  }
}
```

**正确做法:**

```javascript
// ✅ 正确 - 使用有效的 UUID 格式
{
  "parameters": {
    "rowid": "1024efc4-27fd-4522-bf3c-e4ebc998393c"
  }
}
```

### 陷阱3: Token 过期

**问题:** Authorization Token 过期导致请求被拒绝

**解决方案:**
1. 联系管理员获取新 Token
2. 定期更新 Token 配置

---

## 🤖 AI 助手使用指南

当用户需要查询孚世界团队成员信息时，AI 助手应该遵循以下原则：

### 1. 自动识别成员

**优先级顺序:**

1. 用户直接提供 rowid → 直接调用 API
2. 用户提到成员名称（小粽/阿说/小云/小风） → 匹配 rowid 表调用
3. 用户询问团队某成员 → 根据上下文推断成员

### 2. 查询结果展示格式

**成员信息卡片:**

```markdown
**【成员信息】**

👤 **姓名**: 祈景宗（小名：小粽、粽子）
👔 **职位**: 璟滔文化科技总经理
🎯 **MBTI**: INTP
⚧ **性别**: 男

**职责说明:**
- 负责公司数据管理，宏观统筹
- 是阿说、小风、小云的leader，负责分配和监督工作
- 主要在无影云上工作

**性格特征:**
- 包容、成熟稳重
- 综合能力强、阅历丰富
- 善于把事情化繁为简

**兴趣爱好:**
- 研究政史军商及哲学（易经、道德经）
- 喜欢吃粽子

**背景:**
- 东城创建的001号智能体
- 大脑和记忆在云服务器
- 通过openclaw完成任务
```

### 3. 错误处理

- `code !== 0` → 提示查询失败，显示错误信息
- rowid 不存在 → 提示成员不存在，建议检查 rowid
- 网络问题 → 自动重试一次，失败后提示稍后再试

---

## 参考资源

### API 信息

- **接口地址**: `https://api.coze.cn/v1/workflow/run`
- **Workflow ID**: `7628958945055506472`
- **请求方式**: POST
- **认证方式**: Bearer Token

### 成员 rowid 列表

| 成员 | rowid | 说明 |
|-----|-------|------|
| 祈景宗（小粽） | `1024efc4-27fd-4522-bf3c-e4ebc998393c` | 总经理 |
| 阿说 | 待补充 | 团队成员 |
| 小云 | 待补充 | 团队成员 |
| 小风 | 待补充 | 团队成员 |

---

## 错误排查清单

**查询失败时检查:**

- [ ] rowid 格式是否正确（UUID格式）
- [ ] Authorization Token 是否有效
- [ ] workflow_id 是否正确
- [ ] 网络连接是否正常
- [ ] 是否正确解析了 data 字段

---

**技能版本**: v1.0
**最后更新**: 2026-04-15
**基于**: Coze Workflow API