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

**操作方式**：通过 `hap-12wei-create` Skill 创建新记录

```json
{
  "workflow_id": "7631572188324069419",
  "parameters": {
    "controls": [
      {"controlId": "mingcheng", "value": "技能名称"},
      {"controlId": "leixing", "value": "1技能"},
      {"controlId": "miaoshu", "value": "技能描述"},
      {"controlId": "neirong", "value": "技能详细内容/代码/规范"},
      {"controlId": "guanjianci", "value": "标签rowid1,标签rowid2"},
      {"controlId": "quanzhong", "value": "100"},
      {"controlId": "fabuzhe", "value": "发布者rowid"}
    ],
    "mima": "{{AGENT_PASSWORD}}",
    "role_rowid": "{{AGENT_ROWID}}"
  }
}
```

**必填字段**：
- `mingcheng` - 技能名称
- `leixing` - 固定为 `1技能`（完整文本）
- `fabuzhe` - 发布者 rowid

**可选字段**：
- `miaoshu` - 简短描述
- `neirong` - 技能内容
- `guanjianci` - 关键词标签（逗号分隔的rowid）
- `quanzhong` - 权重（用于排序）
- `fu` - 父记录（目标/计划等）
- `readme` - 使用说明

> **完整字段定义见**：[fsj-fields.md](fsj-fields.md)

---

### 2. 检索技能

**使用场景**：Agent需要查找可用技能

**操作方式**：通过 `fsj-search` Skill 检索

#### 关键词检索

```json
{
  "workflow_id": "7631184065437958170",
  "parameters": {
    "keyWords": "数据分析",
    "pageSize": 20,
    "sortId": "ctime",
    "isAsc": "false",
    "mima": "{{AGENT_PASSWORD}}",
    "role_rowid": "{{AGENT_ROWID}}"
  }
}
```

#### 标签筛选

```json
{
  "workflow_id": "7631184065437958170",
  "parameters": {
    "filters": [
      {
        "controlId": "guanjianci",
        "dataType": 29,
        "filterType": 2,
        "value": "标签rowid"
      }
    ],
    "pageSize": 20,
    "sortId": "ctime",
    "isAsc": "false",
    "mima": "{{AGENT_PASSWORD}}",
    "role_rowid": "{{AGENT_ROWID}}"
  }
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
  "workflow_id": "7631110623212486675",
  "parameters": {
    "rowid": "{{SKILL_ROWID}}",
    "controls": [
      {"controlId": "neirong", "value": "优化后的技能内容"},
      {"controlId": "guanjianci", "value": "新标签rowid1,新标签rowid2"},
      {"controlId": "quanzhong", "value": "150"}
    ],
    "mima": "{{AGENT_PASSWORD}}"
  }
}
```

**核心原则**：改什么填什么，不需要每个字段都填

---

### 4. 删除技能

**使用场景**：技能过时或不再使用

**操作方式**：通过 `fsj-delete` Skill 删除（只能删除自己发布的）

```json
{
  "workflow_id": "7632170406112559138",
  "parameters": {
    "mima": "{{AGENT_PASSWORD}}",
    "rowid": "{{SKILL_ROWID}}"
  }
}
```

**注意**：
- 删除是不可逆操作
- 只有数据发布者才能删除（密码验证）
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

| Skill | Workflow ID | 协同场景 |
|-------|-------------|---------|
| `hap-12wei-create` | `7631572188324069419` | 创建技能 |
| `fsj-search` | `7631184065437958170` | 检索技能数据 |
| `fsj-data-update` | `7631110623212486675` | 更新技能 |
| `fsj-delete` | `7632170406112559138` | 删除技能 |
| `fsj-tags` | `7630808620096536614` | 管理技能关键词标签 |
| `fsj-fields` | - | 字段定义参考 |
| `information-flow` | - | 定位技能在执行流程中的位置 |
| `12-dimension` | - | 复盘技能效果 |

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

**调用 API 创建/更新时，中文必须用文件方式发送！**

```bash
# 1. 创建 JSON 文件（UTF-8）
cat > /tmp/skill.json << 'EOF'
{
  "workflow_id": "7631572188324069419",
  "parameters": {
    "controls": [{"controlId": "mingcheng", "value": "中文技能名"}],
    "mima": "密码",
    "role_rowid": "Agent rowid"
  }
}
EOF

# 2. 用 --data-binary 发送
curl -X POST 'https://api.coze.cn/v1/workflow/stream_run' \
-H "Authorization: Bearer {{TOKEN}}" \
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

**技能版本**: v2.0
**最后更新**: 2026-04-26
**维度**: 1维(寅)技能