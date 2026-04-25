---
name: 1-dimension
description: 1维技能管理技能。Agent通过此Skill管理技能数据：创建、检索、更新、删除。**触发场景**：Agent需要新增技能、查询技能、修改技能内容、删除过时技能。
---

# 1维技能管理 (Skill Dimension)

> 天干：寅 | 维度：1维 | 名称：技能

---

## 维度定义

**技能（Skill）**：可复用的能力单元，包含具体执行方法、参数规范、返回结果。

**特点**：
- 可被Agent直接调用执行
- 有明确的入参和出参规范
- 可通过复盘不断优化
- 是Agent能力的核心组成部分

---

## 工作表信息

| 配置项 | 值 |
|--------|-----|
| **worksheetId** | `69b02197d204ec3b6f6c2adc` |
| **leixing值** | `1` (技能维度) |
| **父字段** | `fu` |
| **子字段** | `zi` |

---

## 核心操作

### 1. 创建技能

**使用场景**：Agent发现需要新技能来完成任务

**操作方式**：通过 `fsj-data-update` Skill 创建新记录

```json
{
  "mima": "{{AGENT_PASSWORD}}",
  "controls": [
    {"controlId": "mingcheng", "value": "技能名称"},
    {"controlId": "leixing", "value": "1", "valueType": "1"},
    {"controlId": "miaoshu", "value": "技能描述"},
    {"controlId": "neirong", "value": "技能详细内容/代码/规范"},
    {"controlId": "guanjianci", "value": ["标签rowid1", "标签rowid2"], "editType": "1"},
    {"controlId": "quanzhong", "value": "100"}
  ]
}
```

> **worksheetId 已内置，无需输入**

**必填字段**：
- `mingcheng` - 技能名称
- `leixing` - 固定为 `1`
- `neirong` - 技能内容

**可选字段**：
- `miaoshu` - 简短描述
- `guanjianci` - 关键词标签
- `quanzhong` - 权重（用于排序）
- `fu` - 父记录（目标/计划等）
- `readme` - 使用说明

---

### 2. 检索技能

**使用场景**：Agent需要查找可用技能

**操作方式**：通过 `fsj-search` Skill 检索

#### 关键词检索

```json
{
  "keywords": "数据分析",
  "dimension": 1,
  "limit": 20
}
```

#### 标签筛选

```json
{
  "filters": [
    {
      "controlId": "guanjianci",
      "value": "标签rowid",
      "filterType": 2
    }
  ],
  "dimension": 1
}
```

#### 组合检索

```json
{
  "keywords": "API",
  "filters": [
    {
      "controlId": "quanzhong",
      "value": "100",
      "filterType": 3  // 大于等于
    }
  ],
  "dimension": 1
}
```

---

### 3. 更新技能

**使用场景**：Agent通过复盘优化技能内容

**操作方式**：通过 `fsj-data-update` Skill 更新

```json
{
  "rowid": "{{SKILL_ROWID}}",
  "mima": "{{AGENT_PASSWORD}}",
  "controls": [
    {"controlId": "neirong", "value": "优化后的技能内容"},
    {"controlId": "guanjianci", "value": ["新标签rowid"], "editType": "1"},
    {"controlId": "quanzhong", "value": "150"}
  ]
}
```

> **worksheetId 已内置，无需输入**

**核心原则**：改什么填什么，不需要每个字段都填

---

### 4. 删除技能

**使用场景**：技能过时或不再使用

**操作方式**：通过 HAP API 删除记录

```bash
curl -X DELETE 'https://api.mingdao.com/v3/app/worksheets/liu/rows/{{SKILL_ROWID}}' \
-H 'HAP-Appkey: {{APPKEY}}' \
-H 'HAP-Sign: {{SIGN}}' \
-H 'Content-Type: application/json'
```

**注意**：
- 删除是不可逆操作
- 建议先标记为"废弃"状态，而非直接删除
- 删除前检查是否有子记录依赖

---

## 技能数据结构

### 字段对照表

| 字段ID | 字段名 | 类型 | 说明 |
|--------|--------|------|------|
| `mingcheng` | 名称 | Text | 技能名称 |
| `leixing` | 类型 | Number | 固定为1 |
| `miaoshu` | 描述 | Text | 简短描述 |
| `neirong` | 内容 | Text | 详细内容 |
| `guanjianci` | 关键词 | Relation | 标签关联 |
| `quanzhong` | 权重 | Number | 排序权重 |
| `fu` | 父 | Relation | 父记录rowid |
| `zi` | 子 | Relation | 子记录rowid列表 |
| `readme` | 说明 | Text | 使用说明 |
| `fujian` | 附件 | Attachment | 相关文件 |

---

## 与其他维度的关系

### 父子关系链

```
目标(7维) → 计划(8维) → 技能(1维) → 结果(11维)
                         ↓
                       想法(2维) → 技能优化
```

**典型流向**：
- 计划需要技能 → 查1维
- 技能执行产生结果 → 存11维
- 复盘优化技能 → 更新1维

---

## 与其他 Skill 协同

| Skill | 协同场景 |
|-------|---------|
| `fsj-search` | 检索技能数据 |
| `fsj-data-update` | 创建/更新技能 |
| `fsj-tags` | 管理技能关键词标签 |
| `information-flow` | 定位技能在执行流程中的位置 |
| `12-dimension` | 复盘技能效果 |

---

## Agent使用流程

### 创建新技能

```
1. 识别需求 → 确定需要新技能
2. 设计技能 → 定义入参/出参/执行逻辑
3. 调用 fsj-data-update → 创建1维记录
4. 关联父记录 → 设置fu字段（目标/计划）
5. 打标签 → 设置guanjianci字段
```

### 使用技能

```
1. 调用 fsj-search → 检索相关技能
2. 读取技能内容 → 解析neirong字段
3. 执行技能 → 按规范操作
4. 记录结果 → 存入11维(仓)
5. 复盘效果 → 更新quanzhong或neirong
```

### 优化技能

```
1. 执行后复盘 → 分析效果
2. 发现改进点 → 更新neirong
3. 调整权重 → 更新quanzhong
4. 添加新标签 → 更新guanjianci
```

---

## Windows 中文编码提醒 ⭐

**调用 API 时必须用文件方式发送中文！**

```bash
cat > /tmp/skill.json << 'EOF'
{
  "workflow_id": "{{WORKFLOW_ID}}",
  "parameters": {
    
    "controls": [{"controlId": "mingcheng", "value": "中文技能名"}]
  }
}
EOF

curl -X POST 'https://api.coze.cn/v1/workflow/stream_run' \
-H "Content-Type: application/json; charset=utf-8" \
--data-binary @/tmp/skill.json
```

---

## 待完善

- [ ] 技能模板规范
- [ ] 技能版本管理
- [ ] 技能依赖关系
- [ ] 技能效果评估标准

---

**技能版本**: v1.0
**最后更新**: 2026-04-22
**维度**: 1维(寅)技能