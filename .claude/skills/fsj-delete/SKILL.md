---
name: fsj-delete
description: fsj组织数据删除技能。二次开发接口，隐藏sign/appkey，支持组织协作鉴权。Agent通过此Skill删除自己发布的数据。**触发场景**：Agent需要删除错误数据、过时内容、测试记录。**重要限制**：一次只能删除一条数据，密码验证发布者身份。
---

# fsj 数据删除 (fsj-delete)

> 组织协作型接口 | 二次开发 | 隐藏鉴权细节

---

## 接口性质

| 特点 | 说明 |
|------|------|
| **二次开发** | 隐藏了 HAP 的 sign/appkey |
| **组织协作** | Agent 可公用协作的数据基座 |
| **鉴权逻辑** | 密码验证发布者身份才能删除 |
| **区别于 HAP** | 不是 HAP 原生 API，避免混淆 |

---

## API配置

| 配置项 | 值 |
|--------|-----|
| **接口地址** | `https://api.coze.cn/v1/workflow/stream_run` |
| **Workflow ID** | `7632170406112559138` |
| **Token** | `sat_PsqZd6JJl9qOPZoT30rPv2gLKAVIMXGMmIp38VzXXIRU77nzgzk09yvcFwNT8Z4h` |

---

## 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `mima` | String | ✅ | Agent密码，验证是数据的发布者 |
| `rowid` | String | ✅ | 要删除的数据rowid |

---

## 使用方式

### curl 命令

```bash
curl -X POST 'https://api.coze.cn/v1/workflow/stream_run' \
-H "Authorization: Bearer sat_PsqZd6JJl9qOPZoT30rPv2gLKAVIMXGMmIp38VzXXIRU77nzgzk09yvcFwNT8Z4h" \
-H "Content-Type: application/json" \
-d '{
  "workflow_id": "7632170406112559138",
  "parameters": {
    "mima": "{{AGENT_PASSWORD}}",
    "rowid": "{{TARGET_ROWID}}"
  }
}'
```

### 实际示例

```bash
curl -X POST 'https://api.coze.cn/v1/workflow/stream_run' \
-H "Authorization: Bearer sat_PsqZd6JJl9qOPZoT30rPv2gLKAVIMXGMmIp38VzXXIRU77nzgzk09yvcFwNT8Z4h" \
-H "Content-Type: application/json" \
-d '{
  "workflow_id": "7632170406112559138",
  "parameters": {
    "mima": "381644",
    "rowid": "6371d1b2-dda5-4fca-9519-ba81a4cda449"
  }
}'
```

---

## 返回结果

### 成功

```json
{
  "output": {
    "data": true,
    "error_code": 1,
    "success": true
  }
}
```

### 失败（密码错误）

```json
{
  "output": {
    "data": false,
    "error_code": 0,
    "success": false
  }
}
```

---

## 重要限制 ⭐

| 限制 | 说明 |
|------|------|
| **一次只能删一条** | 不支持批量删除 |
| **密码验证** | 必须是数据的发布者才能删除 |
| **不可逆** | 删除后无法恢复 |

---

## Agent密码

| Agent | rowid | 密码 |
|-------|-------|------|
| 小粽 | `1024efc4-27fd-4522-bf3c-e4ebc998393c` | `381644` |

---

## 使用场景

### 适合删除

- 测试数据
- 错误创建的记录
- 过时不再使用的内容
- 迭代记忆中无价值的部分

### 不建议删除

- 核心记忆（重要复盘、关键产出）
- 有子记录关联的数据（会断链）
- 被其他记录引用的数据

---

## 批量删除方案

由于API限制一次只能删一条，批量删除需要循环调用：

```bash
for rowid in "xxx1" "xxx2" "xxx3"; do
  curl -X POST 'https://api.coze.cn/v1/workflow/stream_run' \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"workflow_id\": \"7632170406112559138\", \"parameters\": {\"mima\": \"381644\", \"rowid\": \"$rowid\"}}"
done
```

---

## fsj 系列 vs HAP 原生 API

| 对比项 | fsj 系列 | HAP 原生 |
|--------|----------|----------|
| **鉴权** | 隐藏 sign/appkey | 需要自己处理 |
| **适用场景** | 组织协作、Agent公用 | 直接操作 HAP |
| **接口类型** | 二次开发（Coze Workflow） | HAP REST API |
| **命名规范** | `fsj-*` | `hap-*` |

---

## 与双层记忆架构的关系

| 记忆类型 | 删除策略 |
|----------|----------|
| **核心记忆** | 不轻易删除，先标记"废弃" |
| **迭代记忆** | 可直接删除，清理无价值内容 |

---

## 与其他 fsj Skill 协同

| Skill | 协同场景 |
|-------|---------|
| `fsj-search` | 先检索找到要删除的rowid |
| `fsj-data-update` | 优先更新而非删除 |
| `fsj-tags` | 删除前可先移除标签关联 |

---

## 操作流程

```
1. fsj-search 检索 → 找到目标数据rowid
2. 确认是自己的数据 → 核对发布者
3. 确认删除必要性 → 是否真的要删
4. 调用 fsj-delete → 执行删除
5. 检查返回结果 → success=true 则成功
```

---

**技能版本**: v1.0
**创建时间**: 2026-04-24
**Workflow ID**: `7632170406112559138`