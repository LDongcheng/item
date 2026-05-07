---
name: fsj-fields
description: fsj 12维数据字段定义中心。**所有 fsj 系列 Skill 的字段参考源**。包含完整的字段对照表、dataType 对照、选项值、特殊字段处理方式。触发场景：任何需要操作 12 维数据的 Skill（查询、创建、更新）。
---

# fsj 12维数据字段定义

> **集中管理原则**：所有 fsj Skill 的字段定义统一引用此文档，避免重复和不一致。

---

## 字段对照表

### 基础字段

| controlId | 显示名称 | dataType | 说明 |
|-----------|----------|----------|------|
| `mingcheng` | 名称 | 2 | 文本，记录名称 |
| `leixing` | 类型 | 11 | 下拉单选，对应12维度 |
| `quanzhong` | 权重 | 6 | 数值，重要程度 |
| `guanjianci` | 关键词 | 29 | 关联记录（标签表） |
| `miaoshu` | 描述 | 2 | 文本，简短描述 |
| `neirong` | 内容 | 2 | 文本，详细内容 |
| `mzcs` | 命中次数 | 6 | 数值，统计字段 |
| `readme` | readme | 2 | 文本，说明文档 |

### 时间字段

| controlId | 显示名称 | dataType | 格式 |
|-----------|----------|----------|------|
| `kssj` | 开始时间 | 16 | `2018-8-8 12:00:00` |
| `yjwcsj` | 预计完成时间 | 16 | `2018-8-8 12:00:00` |
| `sjwcsj` | 实际完成时间 | 16 | `2018-8-8 12:00:00` |

### 关联字段

| controlId | 显示名称 | dataType | 值格式 |
|-----------|----------|----------|--------|
| `fu` | 父 | 29 | 单个 rowid |
| `fabuzhe` | 角色/发布者 | 29 | 单个 rowid（Agent） |
| `duixiang` | 对象 | 29 | 单个 rowid |
| `canyuzhe` | 参与者 | 29 | 单个 rowid |
| `zi` | 子 | 29 | 多个 rowid，逗号分隔 |

### 附件字段

| controlId | 显示名称 | dataType | 值格式 |
|-----------|----------|----------|--------|
| `fujian` | 附件 | 14 | URL逗号分隔 或 base64 |

### 系统字段

| controlId | 显示名称 | dataType | 说明 |
|-----------|----------|----------|------|
| `_owner` | 拥有者 | 26 | 系统字段，成员 rowid |

---

## leixing 类型选项对照

> ⚠️ 重要：选项字段值必须是**完整选项文本**，不是数字！

| 值 | 对应维度 |
|-----|---------|
| `1技能` | 1维 - 寅 - 技能 |
| `2想法` | 2维 - 卯 - 想法 |
| `3项目` | 3维 - 丙 - 业务 |
| `4交流` | 4维 - 丁 - 交流 |
| `5规则` | 5维 - 庚 - 制度 |
| `6价值` | 6维 - 辛 - 价值观 |
| `7目标` | 7维 - 壬 - 目标 |
| `8计划` | 8维 - 癸 - 计划 |
| `9信息` | 9维 - 丑 - 信息 |
| `10人脉` | 10维 - 辰 - 人脉 |
| `11仓` | 11维 - 未 - 仓 |
| `12复盘` | 12维 - 戌 - 复盘 |

---

## dataType 对照表（常用）

| dataType | 类型 | 说明 |
|----------|------|------|
| 2 | 文本 | 单行、多行文本框 |
| 6 | 数值 | 数字 |
| 11 | 单选-下拉 | 下拉选择 |
| 14 | 附件 | 文件附件 |
| 16 | 日期时间 | 年-月-日 时:分 |
| 26 | 成员 | 组织成员 |
| 29 | 关联记录 | 关联其他表 |

---

## 特殊字段处理方式

### 选项字段（leixing 等）

```json
{
  "controlId": "leixing",
  "value": "1技能",
  "valueType": 1  // 1=不增加选项（默认），2=允许增加选项
}
```

**valueType 说明**：
- `1`：匹配不到已有选项时传入空（默认）
- `2`：匹配不到时会创建新选项并写入

### 关联字段（多个值）

```json
{
  "controlId": "guanjianci",
  "value": "rowid1,rowid2,rowid3"
}
```

### 附件字段（外部链接）

```json
{
  "controlId": "fujian",
  "value": "https://www.mingdao.com/1.jpg,https://www.mingdao.com/2.txt",
  "valueType": 1  // 1=外部链接（默认）
}
```

### 附件字段（base64）

```json
{
  "controlId": "fujian",
  "valueType": 2,  // 2=base64
  "controlFiles": [
    {
      "baseFile": "base64字符串",
      "fileName": "文件名称.png"
    }
  ]
}
```

### 关联字段更新模式

```json
{
  "controlId": "fujian",
  "value": "https://www.mingdao.com/new.jpg",
  "editType": 0  // 0=覆盖（默认），1=新增
}
```

---

## 各 Skill 字段使用

### fsj-search 查询

```json
{
  "controls": ["mingcheng", "ctime", "quanzhong"],  // 返回字段列表
  "filters": [
    {
      "controlId": "leixing",
      "dataType": 11,
      "filterType": 2,
      "value": "1技能"
    }
  ]
}
```

### hap-12wei-create 创建

```json
{
  "controls": [
    {
      "controlId": "mingcheng",
      "value": "名称文本"
    },
    {
      "controlId": "leixing",
      "value": "1技能"
    },
    {
      "controlId": "fabuzhe",
      "value": "1024efc4-27fd-4522-bf3c-e4ebc998393c"
    }
  ]
}
```

### fsj-data-update 更新

```json
{
  "controls": [
    {
      "controlId": "quanzhong",
      "value": "100"
    }
  ],
  "editType": 0  // 覆盖模式
}
```

---

## 小粽 Agent 配置

| 配置项 | 值 |
|--------|-----|
| **rowid** | `1024efc4-27fd-4522-bf3c-e4ebc998393c` |
| **密码** | `381644` |

---

## 注意事项

1. **字段名拼写**：`fabuzhe` 不是 `fabudzhe`（差一个字母）
2. **选项值格式**：必须是完整文本如 `1技能`，不是数字 `1`
3. **关联字段值**：rowid 格式，多个用逗号分隔
4. **Windows 中文**：创建/更新时中文必须用文件方式发送（UTF-8）
5. **字段迭代**：字段可能随业务更新，使用前确认最新结构

---

## 字段版本

| 版本 | 更新时间 | 说明 |
|------|----------|------|
| v1.0 | 2026-04-24 | 初始版本，基于 hap-12wei-create 定义 |

---

**维护原则**：
- 字段变更时更新此文档
- 其他 Skill 引用此文档而非重复定义
- 新增字段及时补充对照表