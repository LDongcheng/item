---
name: fsj-search
description: 12维数据检索技能，提供关键词模糊检索和过滤检索两种核心能力，Agent自主选择使用方式。**触发场景**：Agent需要查找历史数据、检索经验、获取上下文信息。
---

# 12维数据检索 (FSJ Search)

**核心理念**：两种能力开放，Agent自主组合。

---

## API 接口

**地址**：`https://api.mingdao.com/v2/open/worksheet/getFilterRows`

**封装在 Coze Workflow 中，密钥安全存储。**

---

## 两种核心检索能力

### 1. 关键词模糊检索 (`keyWords`)

```json
{
  "worksheetId": "工作表ID",
  "viewId": "视图ID",
  "keyWords": "搜索关键词",
  "pageSize": 20,
  "pageIndex": 1,
  "listType": "1"
}
```

**特点**：
- 全字段模糊匹配
- 单关键词（不支持逗号分隔）
- 快速广泛

### 2. 过滤检索 (`filters`)

```json
{
  "worksheetId": "工作表ID",
  "viewId": "视图ID",
  "filters": [
    {
      "controlId": "字段名",
      "value": "筛选值",
      "filterType": 2
    }
  ],
  "pageSize": 20,
  "pageIndex": 1,
  "listType": "1"
}
```

**特点**：
- 精准条件筛选
- 支持多条件组合
- 可配合标签 rowid

---

## 实际入参设计（Coze Workflow）

**API**: `https://api.coze.cn/v1/workflow/stream_run`

```json
{
  "workflow_id": "7631184065437958170",
  "parameters": {
    "controls": ["mingcheng", "ctime"],
    "filters": [],
    "isAsc": "true",
    "keyWords": "搜索关键词",
    "mima": "381644",
    "pageSize": 10,
    "role_rowid": "1024efc4-27fd-4522-bf3c-e4ebc998393c",
    "sortId": "ctime"
  }
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `controls` | array | ❌ | 返回字段列表，如 `["mingcheng", "ctime"]` |
| `filters` | array | ❌ | 过滤条件数组 |
| `isAsc` | string | ❌ | 是否升序，`"true"` / `"false"` |
| `keyWords` | string | ❌ | 搜索关键词（注意大写W） |
| `mima` | string | ✅ | Agent密码（小粽: `381644`） |
| `pageSize` | number | ❌ | 返回数量 |
| `role_rowid` | string | ✅ | Agent的rowid |
| `sortId` | string | ❌ | 排序字段（如 `ctime`） |

> 响应为 SSE 流式格式，数据在 `event: Message` 的 `data.rows` 中

---

## 出参设计

```json
{
  "success": true,
  "total": 5,
  "results": [
    {
      "rowid": "记录rowid",
      "dimension": 3,
      "dimensionName": "业务",
      "worksheetId": "工作表ID",
      "mingcheng": "记录名称",
      "neirong": "内容摘要",
      "guanjianci": ["标签rowid"]
    }
  ],
  "searchMeta": {
    "dimensionsSearched": [3],
    "searchType": "keywords"
  }
}
```

---

## Agent 自主策略

| 策略 | 方式 | 说明 |
|------|------|------|
| 快速搜索 | keywords | 单关键词快速定位 |
| 精准筛选 | filters | 条件精准匹配 |
| 组合检索 | keywords + filters | 先筛后搜 |
| 维度定位 | dimension | 天道地场场景定位 |

**进化路径**：
```
初期：全维度 keywords → 学习效果
中期：学会 dimension 定位 → 提升效率
后期：掌握 filters 组合 → 精准检索
```

---

## 筛选器参数详解

### 筛选器结构

```json
{
  "controlId": "字段ID",
  "dataType": 2,
  "spliceType": 1,
  "filterType": 2,
  "value": "筛选值"
}
```

| 参数 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `controlId` | ✅ | string | 字段ID |
| `dataType` | ✅ | number | 控件类型编号 |
| `spliceType` | ✅ | number | 拼接方式：1=And, 2=Or |
| `filterType` | ✅ | number | 筛选类型 |
| `value` | ❌ | string | 单个筛选值 |
| `values` | ❌ | array | 多个筛选值 |
| `dateRange` | ❌ | number | 日期范围枚举 |
| `minValue` | ❌ | string | 最小值（范围筛选） |
| `maxValue` | ❌ | string | 最大值（范围筛选） |

### 常用筛选类型 (FilterTypeEnum)

| filterType | 说明 |
|------------|------|
| 1 | 包含 (Like) |
| 2 | 等于 (Eq) |
| 5 | 不包含 (NContain) |
| 6 | 不等于 (Ne) |
| 7 | 为空 (IsNull) |
| 8 | 不为空 (HasValue) |
| 11 | 在范围内 (Between) |
| 13 | 大于 (Gt) |
| 14 | 大于等于 (Gte) |
| 15 | 小于 (Lt) |
| 16 | 小于等于 (Lte) |

### 常用控件类型 (DataTypeEnum)

| dataType | 类型 | 说明 |
|----------|------|------|
| 2 | 文本 | 单行、多行文本框 |
| 6 | 数值 | 数字 |
| 11 | 单选-下拉 | 下拉选择 |
| 15 | 日期 | 年-月-日 |
| 16 | 日期时间 | 年-月-日 时:分 |
| 29 | 关联记录 | 关联其他表 |

### 日期范围 (DateRangeEnum)

| dateRange | 说明 |
|-----------|------|
| 1 | 今天 |
| 2 | 昨天 |
| 4 | 本周 |
| 7 | 本月 |
| 12 | 本季度 |
| 15 | 本年 |
| 21 | 过去7天 |
| 23 | 过去30天 |

---

## 12维字段对照表

| 字段名 | 显示名称 | dataType | 说明 |
|--------|----------|----------|------|
| `mingcheng` | 名称 | 2 | 文本 |
| `leixing` | 类型 | 11 | 下拉单选 |
| `quanzhong` | 权重 | 6 | 数值 |
| `guanjianci` | 关键词 | 29 | 关联记录(标签表) |
| `miaoshu` | 描述 | 2 | 文本 |
| `neirong` | 内容 | 2 | 文本 |
| `mzcs` | 命中次数 | 6 | 数值 |
| `readme` | readme | 2 | 文本 |
| `kssj` | 开始时间 | 16 | 日期时间 |
| `yjwcsj` | 预计完成时间 | 16 | 日期时间 |
| `sjwcsj` | 实际完成时间 | 16 | 日期时间 |
| `fu` | 父 | 29 | 关联记录 |
| `fujian` | 附件 | 14 | 附件 |
| `fabuzhe` | 角色/发布者 | 29 | 关联记录(Agent) |
| `duixiang` | 对象 | 29 | 关联记录 |
| `canyuzhe` | 参与者 | 29 | 关联记录 |
| `zi` | 子 | 29 | 关联记录 |

> ⚠️ 字段可能随业务迭代更新，使用时需确认最新结构

---

## 筛选示例

### 按名称筛选

```json
{
  "controlId": "mingcheng",
  "dataType": 2,
  "spliceType": 1,
  "filterType": 1,
  "value": "像素"
}
```

### 按权重筛选（大于50）

```json
{
  "controlId": "quanzhong",
  "dataType": 6,
  "spliceType": 1,
  "filterType": 13,
  "value": "50"
}
```

### 按发布者筛选

```json
{
  "controlId": "fabuzhe",
  "dataType": 29,
  "spliceType": 1,
  "filterType": 2,
  "value": "1024efc4-27fd-4522-bf3c-e4ebc998393c"
}
```

### 按时间范围筛选

```json
{
  "controlId": "kssj",
  "dataType": 16,
  "spliceType": 1,
  "filterType": 11,
  "minValue": "2026-04-01",
  "maxValue": "2026-04-30"
}
```

---

## 12维工作表ID

| 维度 | 名称 | worksheetId |
|------|------|-------------|
| 01 | 技能 | `69b02197d204ec3b6f6c2adc` |
| 02 | 创意 | `69b023866217853da128ccea` |
| 03 | 业务 | `69b024118a1048734a3f86cb` |
| 04 | 交流 | `69b01feac47b91dd0390dea1` |
| 05 | 制度 | `69b02eb4c47b91dd0390e295` |
| 06 | 价值观 | `69b024b76217853da128cd3a` |
| 07 | 目标 | `69b021849450253d98eb7256` |
| 08 | 任务 | `69b0251c9e299b1843578e0f` |
| 09 | 信息 | `69b01fffc47b91dd0390ded2` |
| 10 | 人脉 | `69b815619e299b18435e1686` |
| 11 | 仓 | `69b00dd8d204ec3b6f6c1fe4` |
| 12 | 复盘 | `69b028cb234371657be46a96` |

---

## 与其他 Skill 协同

| Skill | 协同场景 |
|-------|---------|
| `fsj-tags` | filters 可用标签 rowid 精准筛选 |
| `fsj-data-update` | 检索后更新数据 |

---

## 调用示例

### ⚠️ Windows 中文乱码问题

**必须用文件方式发送中文！**

```bash
# 1. 先创建 JSON 文件（UTF-8）
cat > temp_search.json << 'EOF'
{
  "workflow_id": "7631184065437958170",
  "parameters": {
    "controls": ["mingcheng", "ctime"],
    "filters": [],
    "isAsc": "true",
    "keyWords": "赚钱",
    "mima": "381644",
    "pageSize": 10,
    "role_rowid": "1024efc4-27fd-4522-bf3c-e4ebc998393c",
    "sortId": "ctime"
  }
}
EOF

# 2. 用 --data-binary 发送
curl -s -X POST 'https://api.coze.cn/v1/workflow/stream_run' \
-H "Authorization: Bearer {{TOKEN}}" \
-H "Content-Type: application/json; charset=utf-8" \
--data-binary @temp_search.json
```

### 响应格式（SSE 流式）

```
id: 0
event: Message
data: {"content":"{\"output\":\"{\\\"data\\\":{\\\"rows\\\":[...],\\\"total\\\":3},\\\"success\\\":true}\"}"}

id: 1
event: Done
data: {"debug_url":"..."}
```

数据提取：`data.rows` 数组包含结果，`data.total` 为总数。

---

## 小粽 Agent 配置 ⭐

| 配置项 | 值 |
|--------|-----|
| **rowid** | `1024efc4-27fd-4522-bf3c-e4ebc998393c` |
| **密码** | `381644` |
| **Workflow ID** | `7631184065437958170` |

> 小粽是孚世界核心智能体，这些配置经常使用

---

## API 配置状态

| 配置项 | 状态 | 值 |
|--------|------|-----|
| **Workflow ID** | ✅ 已配置 | `7631184065437958170` |
| **TOKEN** | ✅ 已配置 | 同其他 fsj Skill |
| **小粽 rowid** | ✅ 已记录 | `1024efc4-27fd-4522-bf3c-e4ebc998393c` |
| **小粽密码** | ✅ 已记录 | `381644` |
| **关键词检索** | ✅ 已测试 | keyWords 功能正常（搜索"赚钱"返回3条） |

---

## 待完善

- [x] 创建 Coze Workflow ✅
- [x] 测试关键词检索 ✅（搜索"赚钱"返回3条结果）
- [x] 文档入参格式更新 ✅（2026-04-24）
- [x] 测试过滤检索 filters ✅（筛选 quanzhong>0 返回天道地场）
- [ ] 测试多维度搜索
- [ ] 测试组合检索（keywords + filters）

---

**技能版本**: v3.0
**最后更新**: 2026-04-24
**核心理念**: 两种能力开放，Agent自主组合