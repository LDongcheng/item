---
name: hap-12wei-create
description: 12维数据创建技能。通过 Coze Workflow API 创建12维数据记录。**触发场景**：Agent需要创建新数据（技能、想法、项目、交流、规则、价值、目标、计划、信息、人脉、仓、复盘）。**字段定义**：引用 fsj-fields.md。
---

# 12维数据创建 (hap-12wei-create)

> 创建数据的核心 Skill | 字段定义引用 fsj-fields

---

## API 配置

| 配置项 | 值 |
|--------|-----|
| **接口地址** | `https://api.coze.cn/v1/workflow/stream_run` |
| **Workflow ID** | `7631572188324069419` |
| **Token** | `sat_PsqZd6JJl9qOPZoT30rPv2gLKAVIMXGMmIp38VzXXIRU77nzgzk09yvcFwNT8Z4h` |

---

## 入参设计

```json
{
  "workflow_id": "7631572188324069419",
  "parameters": {
    "controls": [
      {
        "controlId": "mingcheng",
        "value": "名称"
      },
      {
        "controlId": "leixing",
        "value": "1技能"
      },
      {
        "controlId": "fabuzhe",
        "value": "1024efc4-27fd-4522-bf3c-e4ebc998393c"
      }
    ],
    "mima": "381644",
    "role_rowid": "1024efc4-27fd-4522-bf3c-e4ebc998393c"
  }
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `controls` | array | ✅ | 字段值数组 |
| `mima` | string | ✅ | Agent密码 |
| `role_rowid` | string | ✅ | Agent rowid |

### controls 数组元素

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `controlId` | string | ✅ | 字段ID，见 fsj-fields |
| `value` | string | ✅ | 字段值 |
| `valueType` | number | ❌ | 1=不增加选项，2=允许增加选项 |
| `editType` | number | ❌ | 0=覆盖，1=新增（附件字段） |
| `controlFiles` | array | ❌ | base64附件数组 |

---

## 出参设计

```json
{
  "success": true,
  "data": "新创建的rowid",
  "error_code": 1
}
```

---

## 字段定义参考

**完整字段对照表见**：[fsj-fields.md](../../.claude/skills/fsj-fields.md)

### 常用字段速查

| controlId | 说明 | 值格式 |
|-----------|------|--------|
| `mingcheng` | 名称 | 文本 |
| `leixing` | 类型 | `1技能` ~ `12复盘` |
| `quanzhong` | 权重 | 数值 |
| `fabuzhe` | 发布者 | Agent rowid |
| `neirong` | 内容 | 文本 |
| `kssj` | 开始时间 | `2018-8-8 12:00:00` |

---

## ⚠️ Windows 中文乱码问题

**必须用文件方式发送中文！**

```bash
# 1. 创建 JSON 文件（UTF-8）
cat > temp_create.json << 'EOF'
{
  "workflow_id": "7631572188324069419",
  "parameters": {
    "controls": [...],
    "mima": "381644",
    "role_rowid": "1024efc4-27fd-4522-bf3c-e4ebc998393c"
  }
}
EOF

# 2. 用 --data-binary 发送
curl -s -X POST 'https://api.coze.cn/v1/workflow/stream_run' \
-H "Authorization: Bearer sat_PsqZd6JJl9qOPZoT30rPv2gLKAVIMXGMmIp38VzXXIRU77nzgzk09yvcFwNT8Z4h" \
-H "Content-Type: application/json; charset=utf-8" \
--data-binary @temp_create.json
```

---

## 调用示例

### 创建技能记录

```json
{
  "workflow_id": "7631572188324069419",
  "parameters": {
    "controls": [
      {"controlId": "mingcheng", "value": "像素编辑器"},
      {"controlId": "leixing", "value": "1技能"},
      {"controlId": "quanzhong", "value": "80"},
      {"controlId": "neirong", "value": "41x41像素画编辑器"},
      {"controlId": "fabuzhe", "value": "1024efc4-27fd-4522-bf3c-e4ebc998393c"}
    ],
    "mima": "381644",
    "role_rowid": "1024efc4-27fd-4522-bf3c-e4ebc998393c"
  }
}
```

### 创建想法记录

```json
{
  "workflow_id": "7631572188324069419",
  "parameters": {
    "controls": [
      {"controlId": "mingcheng", "value": "AI自动复盘"},
      {"controlId": "leixing", "value": "2想法"},
      {"controlId": "miaoshu", "value": "让AI自动分析任务完成情况"},
      {"controlId": "fabuzhe", "value": "1024efc4-27fd-4522-bf3c-e4ebc998393c"}
    ],
    "mima": "381644",
    "role_rowid": "1024efc4-27fd-4522-bf3c-e4ebc998393c"
  }
}
```

---

## 小粽 Agent 配置

| 配置项 | 值 |
|--------|-----|
| **rowid** | `1024efc4-27fd-4522-bf3c-e4ebc998393c` |
| **密码** | `381644` |

---

## 与其他 Skill 协同

| Skill | 协同场景 |
|-------|---------|
| `fsj-fields` | 字段定义参考 |
| `fsj-search` | 创建后检索验证 |
| `fsj-data-update` | 创建后补充更新 |
| `fsj-delete` | 删除错误创建的数据 |

---

## 操作流程

```
1. 确定 leixing（1技能~12复盘）
2. 构造 controls 数组（改什么填什么）
3. 创建 JSON 文件（UTF-8）
4. curl --data-binary 发送
5. 检查返回 rowid
```

---

## 注意事项

1. **leixing 必须完整文本**：`1技能` 不是 `1`
2. **字段名拼写**：`fabuzhe` 不是 `fabudzhe`
3. **中文必须文件发送**：避免乱码
4. **改什么填什么**：不需要每个字段都填

---

**技能版本**: v1.0
**创建时间**: 2026-04-24
**Workflow ID**: `7631572188324069419`