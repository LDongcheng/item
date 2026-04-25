---
name: fsj-data-update
description: 通用数据更新技能，通过 Coze Workflow API 更新 HAP 工作表数据。支持打标签、修改字段等操作。**触发场景**：Agent需要更新数据、打标签、修改状态、批量操作等。
---

# 通用数据更新 (FSJ Data Update)

统一的数据更新接口，支持更新 HAP 各工作表的数据。打标签、修改字段、批量操作都通过此 Skill 完成。

---

## 核心理念

**一个接口，多种用途**

- 打标签 → controls 中添加 tags 字段
- 修改状态 → controls 中修改 status 字段
- 更新任意字段 → controls 中指定字段名和值
- 扏量更新 → 多次调用或循环处理

---

## API 配置

| 配置项 | 值 |
|--------|-----|
| **接口地址** | `https://api.coze.cn/v1/workflow/stream_run` |
| **Workflow ID** | `7631110623212486675` |
| **Token** | `sat_PsqZd6JJl9qOPZoT30rPv2gLKAVIMXGMmIp38VzXXIRU77nzgzk09yvcFwNT8Z4h` |

---

## 参数说明

### 入参

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `rowid` | string | ✅ | 目标记录的唯一标识（UUID格式） |
| `controls` | array | ✅ | 要更新的控件数组（详见下方格式） |
| `worksheetId` | string | ❌ | 工作表ID（已内置，无需输入） |
| `mima` | string | ✅ | Agent密码（验证创建人身份） |

### controls 格式

**核心原则**：改什么填什么，不需要每个字段都填。

```json
"controls": [
  {
    "controlId": "字段名",
    "value": "新值",
    "valueType": "提交值类型（可选）",
    "editType": "数据更新类型（可选）",
    "controlFiles": "文件流参数（可选）"
  }
]
```

---

### 字段对照表

| controlId | 字段名 | 值类型 | 说明 |
|-----------|--------|--------|------|
| `mingcheng` | 名称 | 文本 | 记录名称 |
| `leixing` | 类型 | 选项 | 1技能/2想法/3项目/4交流/5规则/6价值/7目标/8计划/9信息/10人脉/11仓/12复盘 |
| `quanzhong` | 权重 | 数值 | 如 `666.66` |
| `guanjianci` | 关键词 | 文本 | 多个rowid用逗号分隔：`rowid1,rowid2,rowid3` |
| `miaoshu` | 描述 | 文本 | 简要描述 |
| `neirong` | 内容 | 文本 | 详细内容 |
| `mzcs` | - | 数值 | 如 `666.66` |
| `readme` | 说明 | 文本 | README内容 |
| `kssj` | 开始时间 | 时间 | 格式：`2018-8-8 12:00:00` |
| `yjwcsj` | 预计完成时间 | 时间 | 格式：`2018-8-8 12:00:00` |
| `sjwcsj` | 实际完成时间 | 时间 | 格式：`2018-8-8 12:00:00` |
| `fu` | 父记录 | rowid | 父任务rowid（层级关系） |
| `zi` | 子记录 | 文本 | 多个rowid用逗号分隔 |
| `fujian` | 附件 | 复杂 | 见下方详细格式 |
| `fabuzhe` | 发布者 | rowid | 发布者rowid |
| `duixiang` | 对象 | rowid | 对象rowid |
| `canyuzhe` | 参与者 | rowid | 参与者rowid |

---

### 特殊字段格式

#### leixing（类型）- 选项字段

```json
{
  "controlId": "leixing",
  "value": "1技能",  // 或 2想法、3项目...12复盘
  "valueType": "2"   // 1=不增加选项，2=允许增加选项（匹配不到时创建新选项）
}
```

> 默认 valueType=1，匹配不到已有选项时传入空；valueType=2 时会创建新选项

#### fujian（附件）- 文件字段

```json
{
  "controlId": "fujian",
  "value": "https://www.mingdao.com/1.jpg,https://www.mingdao.com/2.jpg",
  "valueType": "1",    // 1=外部文件链接，2=文件流base64
  "editType": "0"      // 0=覆盖，1=新增
}
```

**使用文件流（base64）**：
```json
{
  "controlId": "fujian",
  "valueType": "2",
  "editType": "1",
  "controlFiles": [
    {
      "baseFile": "base64字符串（文件流字节编码）",
      "fileName": "文件名称.pdf"
    }
  ]
}
```

> editType：0=覆盖（默认），1=新增（新建记录可不传）
> valueType：1=外部链接（默认），2=文件流base64

---

### 完整示例

```json
{
  "rowid": "39581cbb-5862-4461-be73-35b17fa272d6",
  
  "controls": [
    {
      "controlId": "mingcheng",
      "value": "完成pixel-editor开发"
    },
    {
      "controlId": "leixing",
      "value": "8计划",
      "valueType": "1"
    },
    {
      "controlId": "quanzhong",
      "value": "100"
    },
    {
      "controlId": "guanjianci",
      "value": "rowid1,rowid2"
    },
    {
      "controlId": "kssj",
      "value": "2026-04-21 09:00:00"
    },
    {
      "controlId": "yjwcsj",
      "value": "2026-04-25 18:00:00"
    },
    {
      "controlId": "fabuzhe",
      "value": "1024efc4-27fd-4522-bf3c-e4ebc998393c"
    }
  ],
  "mima": "Agent密码"
}
```

---

### 出参

**成功响应**：
```json
{
  "data": true,
  "error_code": 1,
  "success": true
}
```

**失败响应**：
```json
{
  "error_msg": "具体错误信息",
  "error_code": 10101,
  "success": false
}
```

**密码错误**：
```json
{
  "output": null
}
```

---

## 调用方式

### ⚠️ Windows 中文乱码问题

**直接在 curl 命令写中文会导致乱码，必须用文件方式发送！**

```bash
# ❌ 错误方式 - 中文会乱码
curl -d '{"controls":[{"controlId":"mingcheng","value":"中文内容"}]}'

# ✅ 正确方式 - 写入 UTF-8 文件后发送
cat > /tmp/input.json << 'EOF'
{"workflow_id":"7631110623212486675","parameters":{"controls":[{"controlId":"mingcheng","value":"中文内容"}]}}
EOF

curl -X POST 'https://api.coze.cn/v1/workflow/stream_run' \
-H "Authorization: Bearer sat_PsqZd6JJl9qOPZoT30rPv2gLKAVIMXGMmIp38VzXXIRU77nzgzk09yvcFwNT8Z4h" \
-H "Content-Type: application/json; charset=utf-8" \
--data-binary @/tmp/input.json
```

### 标准请求

```bash
curl -X POST 'https://api.coze.cn/v1/workflow/stream_run' \
-H "Authorization: Bearer sat_PsqZd6JJl9qOPZoT30rPv2gLKAVIMXGMmIp38VzXXIRU77nzgzk09yvcFwNT8Z4h" \
-H "Content-Type: application/json" \
-d '{
  "workflow_id": "7631110623212486675",
  "parameters": {
    "controls": [
      {
        "controlId": "字段名",
        "value": "新值"
      }
    ],
    "mima": "Agent密码",
    "rowid": "目标记录rowid"
  }
}'
```

> **worksheetId 已内置，无需输入**

---

## Agent 密码机制

### 密码验证规则

- 每个 Agent 有独立密码
- 只有数据**创建人**才能修改自己发布的内容
- 密码错误时 `output` 返回 `null`
- 非创建人无法修改他人数据

### Agent 密码表

| Agent | 密码 | 说明 |
|-------|------|------|
| （待补充） | （待补充） | 各Agent密码需录入 |

> **worksheetId 已内置，无需输入**

---

## 使用场景示例

### 1. 打标签

```json
{
  "rowid": "39581cbb-5862-4461-be73-35b17fa272d6",
  
  "controls": [
    {
      "controlId": "tags",
      "value": ["tag-uuid-1", "tag-uuid-2"]
    }
  ],
  "mima": "111"
}
```

### 2. 修改状态

```json
{
  "rowid": "xxx",
  
  "controls": [
    {
      "controlId": "status",
      "value": "已完成"
    }
  ],
  "mima": "Agent密码"
}
```

### 3. 更新多个字段

```json
{
  "rowid": "xxx",
  
  "controls": [
    {
      "controlId": "status",
      "value": "进行中"
    },
    {
      "controlId": "progress",
      "value": "50%"
    },
    {
      "controlId": "tags",
      "value": ["tag-uuid-1"]
    }
  ],
  "mima": "Agent密码"
}
```

---

## 与 fsj-tags 的协同

| 场景 | 调用流程 |
|------|---------|
| 给记录打标签 | 1. 先调用 `fsj-tags` 获取/创建标签 rowid → 2. 再调用 `fsj-data-update` 更新记录的 tags 字段 |

### 示例流程

```javascript
// 步骤1: 用 fsj-tags 获取标签 rowid
const tagResult = await fsjTags({ content: "像素编辑器 Canvas" });
// 返回: { tag_ids: ["uuid-1", "uuid-2"], new_tags: ["uuid-3"] }

// 步骤2: 用 fsj-data-update 更新记录
await fsjDataUpdate({
  rowid: "记录rowid",
  
  controls: [
    { controlId: "tags", value: tagResult.tag_ids }
  ],
  mima: "Agent密码"
});
```

---

## 错误处理

| 错误类型 | 判断条件 | 处理方式 |
|---------|---------|---------|
| 密码错误 | `output === null` | 提示"无权限修改此数据，只有创建人可修改" |
| 参数错误 | `success === false` | 查看 `error_msg` 具体原因 |
| 网络错误 | 请求失败 | 重试一次，失败后提示"服务暂时不可用" |

---

## 注意事项

### 1. 密码必须正确

```javascript
// ❌ 错误 - 密码不对，修改他人数据
mima: "错误的密码"  // output: null，修改失败

// ✅ 正确 - 使用自己的密码修改自己创建的数据
mima: "正确的Agent密码"  // output: { success: true }
```

### 2. controls 格式要正确

待用户补充具体格式规范...

---

## 待完善内容

- [x] controls 具体格式规范 ✅ 已补充
- [ ] Agent 密码表
- [ ] 其他字段（用户后续补充）

---

**技能版本**: v1.1
**最后更新**: 2026-04-21
**状态**: controls格式已完成，其他字段待补充