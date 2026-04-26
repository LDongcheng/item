---
name: fsj-tags
description: 全局标签管理技能，用于存储、检索、关联标签。标签是全局性的，角色、12维、其他表都采用统一标签体系。**触发场景**：Agent需要打标签、检索标签、重新打标签。
---

# 全局标签管理 (FSJ Tags)

统一标签体系，用于全局检索。角色、12维、记忆等所有模块共用一套标签库。

---

## 核心理念

**标签 = 知识沉淀，只增不改删**

- 标签库越丰富，检索能力越强
- 尽可能多打标签，中英文都要考虑
- 简单直接，能实现检索目的就好

---

## 标签格式规范

| 规范 | 示例 | 说明 |
|------|------|------|
| 中文 | 历史、性能优化 | 正常中文 |
| 英文 | history、performance_optimization | 统一小写 |
| 组合词 | performance_optimization | 用下横杠连接 |
| 技术术语 | canvas、api | 保留原文但小写 |

---

## 标签库存储结构

| 字段 | 类型 | 说明 |
|------|------|------|
| `rowid` | UUID | 标签唯一标识 |
| `name` | string | 标签名（中文或英文都存这里） |
| `count` | number | 使用次数 |
| `created_at` | datetime | 创建时间 |

其他表引用标签时，用 `tags` 字段存 tag_id 数组。

---

## 一、获取/创建标签

### 使用场景

Agent 对内容打标签时：
1. 大模型拆分内容为最小标签（中英文交替）
2. 遍历标签，查标签库
3. 匹配返回现有标签 rowid / 新建后返回

### 调用方式

> ⚠️ Windows 环境下直接发送中文 JSON 会乱码，需通过文件方式发送

```bash
# 1. 写入 UTF-8 文件（内容包含要打标签的内容）
echo '{"workflow_id":"7630808620096536614","parameters":{"content":"要打标签的内容"}}' > temp.json

# 2. 用文件发送请求
curl -s -X POST 'https://api.coze.cn/v1/workflow/stream_run' \
-H "Authorization: Bearer sat_PsqZd6JJl9qOPZoT30rPv2gLKAVIMXGMmIp38VzXXIRU77nzgzk09yvcFwNT8Z4h" \
-H "Content-Type: application/json; charset=utf-8" \
--data-binary @temp.json
```
```

### 参数说明

| 参数 | 方向 | 类型 | 说明 |
|------|------|------|------|
| `content` | 输入 | string | 要打标签的内容 |
| `tags` | 输出 | array | 拆分后的标签数组 |
| `tag_ids` | 输出 | array | 已存在的标签 rowid 数组 |
| `new_tags` | 输出 | array | 本次新建的标签 rowid 数组 |

### 输出示例

```json
{
  "tags": ["东城", "dongcheng", "吉他", "guitar"],
  "tag_ids": ["uuid-1", "uuid-3"],
  "new_tags": ["uuid-2", "uuid-4"]
}
```

---

## 二、查询标签

### 使用场景

搜索标签库，模糊匹配

### 调用方式

```bash
curl -X POST 'https://api.coze.cn/v1/workflow/run' \
-H "Authorization: Bearer {{TOKEN}}" \
-H "Content-Type: application/json" \
-d '{
  "workflow_id": "{{WORKFLOW_ID_SEARCH}}",
  "parameters": {
    "keyword": "搜索关键词",
    "limit": 20
  }
}'
```

### 参数说明

| 参数 | 方向 | 类型 | 说明 |
|------|------|------|------|
| `keyword` | 输入 | string | 搜索关键词（中英文均可） |
| `limit` | 输入 | number | 返回数量限制（默认20） |
| `tags` | 输出 | array | 匹配的标签列表 |

### 输出格式

```json
{
  "tags": [
    {"rowid": "uuid-1", "name": "性能优化", "count": 5},
    {"rowid": "uuid-2", "name": "performance_optimization", "count": 5}
  ]
}
```

---

## 三、重新打标签

### 使用场景

对某条记忆/记录重新关联标签

### 调用方式

```bash
curl -X POST 'https://api.coze.cn/v1/workflow/run' \
-H "Authorization: Bearer {{TOKEN}}" \
-H "Content-Type: application/json" \
-d '{
  "workflow_id": "{{WORKFLOW_ID_RETAG}}",
  "parameters": {
    "record_id": "记录的rowid",
    "record_type": "记忆",
    "content": "重新分析的内容（可选）"
  }
}'
```

### 参数说明

| 参数 | 方向 | 类型 | 说明 |
|------|------|------|------|
| `record_id` | 输入 | string | 记录的 rowid |
| `record_type` | 输入 | string | 记录类型（记忆、角色等） |
| `content` | 输入 | string | 重新分析的内容（可选） |
| `old_tags` | 输出 | array | 原标签列表 |
| `new_tags` | 输出 | array | 新标签列表 |
| `success` | 输出 | boolean | 操作是否成功 |

---

## 大模型拆分配置

### 系统提示词

```
你是标签拆分专家，将内容拆分为最小语义单位的标签，同时提供中英文，提取尽可能多有检索价值的标签。

拆分原则：
- 最小语义单位，独立可检索
- 多维度提取（主体、属性、行为、时间、空间、技术、业务）
- 核心概念保持完整，语义重复只保留一个

格式规范：
- 英文统一小写
- 组合词用下横杠连接，如performance_optimization
- 技术术语保留原文但小写，如canvas

示例：
"历史人物传记" → ["历史", "history", "人物", "figure", "传记", "biography"]
"Canvas像素编辑器性能优化方法" → ["Canvas", "canvas", "像素编辑器", "pixel_editor", "性能优化", "performance_optimization", "前端", "frontend"]
"东城打飞机" → ["东城", "dongcheng", "打飞机", "masturbation"]

仅输出JSON数组，无其他内容：
["标签1", "标签2", "标签3"]
```

### 用户提示词

```
{{content}}
```

### 模型参数配置

| 参数 | 建议值 |
|------|--------|
| 生成随机性 | 0.4 |
| Top P | 0.9 |
| 重复语句惩罚 | 0.8 |
| 最大回复长度 | 100 |
| 深度思考 | 不开启 |

---

## API 配置状态

| 配置项 | 状态 | 说明 |
|--------|------|------|
| `TOKEN` | ✅ 已配置 | `sat_PsqZd6JJl9qOPZoT30rPv2gLKAVIMXGMmIp38VzXXIRU77nzgzk09yvcFwNT8Z4h` |
| `WORKFLOW_ID_GET_OR_CREATE` | ✅ 已测试 | `7630808620096536614`（获取/创建标签） |
| `WORKFLOW_ID_SEARCH` | ✅ 已测试 | `7632929583486058511`（搜索标签，无需鉴权） |

> **重新打标签**：不需要单独 Workflow，直接用 `fsj-data-update` 更新 `guanjianci` 字段即可

---

## 搜索标签 Workflow

**无需权限验证！标签是全局的，任何人都可以查询。**

### 参数

```json
{
  "workflow_id": "7632929583486058511",
  "parameters": {
    "keyWords": "搜索关键词（可选）",
    "pageSize": 10,
    "sortId": "ctime",
    "isAsc": "false"
  }
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `keyWords` | string | ❌ | 搜索关键词，不传则返回全部 |
| `pageSize` | number | ✅ | 返回数量 |
| `sortId` | string | ✅ | 排序字段，如 `ctime` |
| `isAsc` | string | ✅ | 是否升序，`"true"` / `"false"` |

### 返回字段

| 字段 | 说明 |
|------|------|
| `rowid` | 标签唯一标识 |
| `mingcheng` | 标签名称 |
| `ctime` | 创建时间 |

### 示例

```bash
# 搜索标签
curl -s -X POST 'https://api.coze.cn/v1/workflow/stream_run' \
-H "Authorization: Bearer sat_PsqZd6JJl9qOPZoT30rPv2gLKAVIMXGMmIp38VzXXIRU77nzgzk09yvcFwNT8Z4h" \
-H "Content-Type: application/json" \
-d '{
  "workflow_id": "7632929583486058511",
  "parameters": {
    "keyWords": "历史",
    "pageSize": 10,
    "sortId": "ctime",
    "isAsc": "false"
  }
}'

# 返回全部标签（不传 keyWords）
curl -s -X POST 'https://api.coze.cn/v1/workflow/stream_run' \
-H "Authorization: Bearer sat_PsqZd6JJl9qOPZoT30rPv2gLKAVIMXGMmIp38VzXXIRU77nzgzk09yvcFwNT8Z4h" \
-H "Content-Type: application/json" \
-d '{
  "workflow_id": "7632929583486058511",
  "parameters": {
    "pageSize": 25,
    "sortId": "ctime",
    "isAsc": "false"
  }
}'
```

---

## 与其他 Skill 的协同

| Skill | 协同场景 |
|-------|---------|
| `fsj-memory-manage` | 存记忆时调用 tags 打标签 |
| `fsj-user-info` | 人物标签可用 tags |
| 其他业务 skill | 所有需要标签的模块 |

---

## 注意事项

### 1. 标签只增不改删

标签库只增不改删，检索能力随时间增强。

### 2. 英文检索需转小写

检索时统一转小写：`keyword.toLowerCase()`

### 3. 重新打标签不改标签本身

只改记录的标签关联关系，标签库不变。

---

**技能版本**: v1.1
**最后更新**: 2026-04-21
**待配置**: API Token、Workflow ID