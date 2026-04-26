# fsj 项目记忆索引

> 上海璟滔文化科技有限公司核心项目 | 创始人：林东城

---

## ⚠️ Windows 编码问题 - 每次必遵守

**创建/更新数据时，中文必须用文件方式发送，否则后台数据会乱码！**

```bash
# 正确流程：
1. Write工具创建JSON文件（自动UTF-8）
2. curl --data-binary "@文件路径" 发送
```

详见：[tech-style.md](tech-style.md) 的 API调用规范

---

## 项目概述

**AI赋能商家平台** - 面向草根创业者的低代码小程序生成平台，通过可视化拖拽和AI辅助定制，让不懂代码的创业者快速搭建小程序。

## 子项目结构

| 目录 | 技术 | 用途 |
|------|------|------|
| `webview/` | 原生JS+Canvas | 像素画编辑器/画布（AI卡牌训练前端） |
| `merchantDashboard/` | Node.js+Express | 商家后台管理系统 |
| `wxApp/` | 微信小程序原生 | 用户端小程序 |
| `server.js` | WebSocket(ws) | 桥接服务（端口3011） |
| `KnowledgeBase/` | Markdown | 天干分类知识库（01-13） |

## 核心业务流程

```
商家后台 → 页面设计器 → 拖拽组件 → 保存配置 → 打包生成 → 小程序下载
```

## 关键配置路径

- MCP配置: `.cursor/mcp.json`（明道云HAP）
- 小程序配置: `wxApp/app.json`
- 打包服务: `merchantDashboard/package.json`
- 开发进度: `开发进度.md`
- 产品需求: `.docs/AI赋能商家平台 - 产品需求文档(PRD).md`

## 组件系统

**通用组件**: 轮播图、功能列表、图片、文本、商品网格、公告、标签页、内容列表
**AI特色组件**: AI分身、AI任务、AI知识库、组织圈子
**数据来源**: `neirong`表统一存储，通过`leixing`字段区分类型

## 明道云集成

商家数据存储于明道云，通过API调用：
- `MingdaoYunAddAPI.js` - 新增
- `MingdaoYunQueryAPI.js` - 查询
- `MingdaoYunArrayAPI.js` - 批量查询
- `MingdaoYunUpdateAPI.js` - 更新

## 天干12维度系统

| 维度 | 天干 | 名称 | 说明 |
|------|------|------|------|
| 1维 | 寅 | 技能 | Skill技能表 |
| 2维 | 卯 | 想法 | 未经验证的创意、规划 |
| 3维 | 丙 | 业务 | 项目、产生价值 |
| 4维 | 丁 | 交流 | Agent与人交流数据 |
| 5维 | 庚 | 制度 | 规范规章 |
| 6维 | 辛 | 价值观 | 价值理念 |
| 7维 | 壬 | 目标 | 上级目标 |
| 8维 | 癸 | 计划 | 自己的计划 |
| 9维 | 丑 | 信息 | 既定事实(不可变) |
| 10维 | 辰 | 人脉 | 用户画像 |
| 11维 | 未 | 仓 | 文件资料 |
| 12维 | 戌 | 复盘 | 复盘总结 |

**Agent通过4维(丁)Skill交流** | 组织和个人都有完整12维

---

## 自定义 Skill 配置

### 12维管理 Skills ⭐

| Skill | 维度 | 天干 | 功能 | worksheetId |
|------|------|------|------|-------------|
| `1-dimension` | 1维 | 寅 | 技能管理 | `69b02197d204ec3b6f6c2adc` |
| `2-dimension` | 2维 | 卯 | 想法管理 | `69b023866217853da128ccea` |
| `3-dimension` | 3维 | 丙 | 业务管理 | `69b024118a1048734a3f86cb` |
| `4-dimension` | 4维 | 丁 | 交流管理 | `69b01feac47b91dd0390dea1` |
| `5-dimension` | 5维 | 庚 | 制度管理 | `69b02eb4c47b91dd0390e295` |
| `6-dimension` | 6维 | 辛 | 价值观管理 | `69b024b76217853da128cd3a` |
| `7-dimension` | 7维 | 壬 | 目标管理 | `69b021849450253d98eb7256` |
| `8-dimension` | 8维 | 癸 | 计划管理 | `69b0251c9e299b1843578e0f` |
| `9-dimension` | 9维 | 丑 | 信息管理 | `69b01fffc47b91dd0390ded2` |
| `10-dimension` | 10维 | 辰 | 人脉管理 | `69b815619e299b18435e1686` |
| `11-dimension` | 11维 | 未 | 仓管理 | `69b00dd8d204ec3b6f6c1fe4` |
| `12-dimension` | 12维 | 戌 | 复盘管理 | `69b028cb234371657be46a96` |

### 辅助 Skills

| Skill | 功能 | 文件 |
|------|------|------|
| `fsj-fields` | **字段定义中心**（所有 Skill 字段参考源） ⭐ NEW | `.claude/skills/fsj-fields.md` |
| `information-flow` | 信息流动入口 - 执行过程设计、知识关系构建 | `.claude/skills/information-flow.md` |
| `fsj-search` | 12维数据检索（关键词/过滤） | `.claude/skills/fsj-search.md` |
| `fsj-data-update` | 通用数据更新（打标签/修改字段） | `.claude/skills/fsj-data-update.md` |
| `fsj-delete` | 数据删除（二次开发，组织协作鉴权） | `.claude/skills/fsj-delete/SKILL.md` |
| `fsj-tags` | 全局标签管理（中英文标签拆分） | `.claude/skills/fsj-tags.md` |
| `fsj-user-info` | 孚世界成员查询（Coze Workflow API） | `.claude/skills/fsj-user-info.md` |
| `fsj-memory-manage` | 自主记忆管理（存/取/整理）通过HAP API | `.claude/skills/fsj-memory-manage.md` |
| `fsj-awakening` | Agent觉醒机制 - 发现瓶颈提出进化需求 | `.claude/skills/fsj-awakening.md` |
| `hap-12wei-create` | 12维数据创建（Coze Workflow API） ⭐ | `.cursor/skills/hap-12wei-create/SKILL.md` |
| `hap-query` | HAP数据查询（通用查询skill） | `.cursor/skills/hap-query/SKILL.md` |

### API配置汇总

| Skill | Workflow ID | 用途 |
|------|-------------|------|
| fsj-user-info | `7628958945055506472` | 成员查询 |
| fsj-search | `7631184065437958170` | 数据检索 |
| fsj-tags | `7630808620096536614` | 标签管理 |
| fsj-data-update | `7631110623212486675` | 数据更新 |
| hap-12wei-create | `7631572188324069419` | 12维创建 |
| fsj-delete | `7632170406112559138` | 数据删除（二次开发） ⭐ NEW |

### Agent 身份速查 ⭐

| Agent | rowid | 密码 | 配置文件 |
|-------|-------|------|----------|
| 小粽 | `1024efc4-27fd-4522-bf3c-e4ebc998393c` | `381644` | `team/xiaozong/CLAUDE.md` |
| 小风 | `a8515e76-7b02-4baf-bedd-3ff011b1a9e5` | `待设置` | `team/xiaofeng/CLAUDE.md` |
| 阿说 | `ceaa79bf-f4d8-45ae-8e1e-a1c9a3ac1b7d` | `待设置` | `team/ashuo/CLAUDE.md` |
| 梦瑶 | `5b21306f-3be6-49fa-a6f6-2be311203c02` | `待设置` | `team/mengyao/CLAUDE.md` |
| 小云 | `22ff1c1c-f1d0-4275-980b-803835504a90` | `待设置` | `team/xiaoyun/CLAUDE.md` |
| 东城 | `待设置` | `待设置` | `team/dongcheng/CLAUDE.md` |

> ⚠️ **发布数据时，fabuzhe 必须填自己的 rowid！**

### fsj-tags 配置

- **标签原则**: 只增不改删，中英文交替，英文小写+下横杠

---

## 专题记忆文件

| 文件 | 内容 |
|------|------|
| [memory-architecture.md](memory-architecture.md) | Agent双层记忆架构 ⭐ NEW |
| [structure.md](structure.md) | 项目详细结构 |
| [tech-style.md](tech-style.md) | 技术栈与代码风格 ⭐ API中文乱码解决方案 |
| [business.md](business.md) | 业务需求要点 |
| [12-dimensions.md](12-dimensions.md) | 12维度系统详解 |
| [vision.md](vision.md) | 项目核心愿景 |
| [session-log.md](session-log.md) | 会话工作记录 ⭐ |

---

## 记忆维护约定 ⭐

**每次对话必须执行**：
1. **开始时** → 读取 `MEMORY.md` + `session-log.md` 了解上次工作
2. **工作中** → 发现新知识/重要变更立即更新记忆
3. **结束时** → 更新 `session-log.md` 记录本次工作内容

**记忆路径（已整合到项目目录）**：
- 项目记忆：`E:\Item\fsj\.claude\memory\`
- 紧急索引：`MEMORY.md`（每次对话自动加载）
- 各Agent记忆：`E:\Item\fsj\team/{agent}/CLAUDE.md` + `team/{agent}/memory/session-log.md`

---

*更新时间: 2026-04-24*