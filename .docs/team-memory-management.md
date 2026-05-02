# Team 记忆管理规范

> 制定时间：2026-05-02
> 适用范围：小粽 / 小风 / 阿说 / 梦瑶 / 小云 / 东城

---

## 一、记忆架构

```
┌─────────────────────────────────────────────────────────┐
│                    4维云端记忆（持久化）                    │
│              明道云 → 工作摘要、复盘、技能                  │
└──────────────────────┬──────────────────────────────────┘
                       │ 每天工作结束上传
                       ↓
┌─────────────────────────────────────────────────────────┐
│              Agent 本地记忆（各自独立）                     │
│                                                         │
│  team/xiaozong/memory/   ← 小粽的记忆                     │
│  team/xiaofeng/memory/   ← 小风的记忆                     │
│  team/ashuo/memory/      ← 阿说的记忆                     │
│  team/mengyao/memory/    ← 梦瑶的记忆                     │
│  team/xiaoyun/memory/    ← 小云的记忆                     │
│  team/dongcheng/memory/  ← 东城的记忆                     │
│                                                         │
│  每个目录下：                                              │
│    session-log.md       ← 会话工作记录                     │
│    *.md                 ← 技术知识、经验总结                │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│              项目级公共配置（林东城专用）                    │
│                                                         │
│  E:\Item\fsj\.claude\memory\                             │
│    MEMORY.md           ← 项目索引                         │
│    12-dimensions.md    ← 12维系统说明                     │
│    structure.md        ← 项目结构                         │
│    tech-style.md       ← 技术规范                         │
│    ...                 ← 其他公共知识                     │
│                                                         │
│  E:\Item\fsj\.claude\hooks/                              │
│    on-stop.sh          ← Stop Hook 脚本（自动记录时间戳）  │
│                                                         │
│  E:\Item\fsj\.claude\settings.json                       │
│    项目级统一 Hook 配置                                    │
└─────────────────────────────────────────────────────────┘
```

**核心原则：各写各的，互不干扰**

---

## 二、Agent 记忆规则

### 2.1 每个 Agent 独立目录

```
team/{agent-name}/
├── CLAUDE.md                    ← Agent 身份配置
└── memory/
    ├── session-log.md           ← 会话工作记录
    ├── h5-agent-chat.md         ← 技术知识（举例）
    └── ...                      ← 其他知识文件
```

### 2.2 自动更新机制

**Stop Hook**：每次回复完成后，自动在对应 Agent 的 session-log 末尾追加时间戳。
- **配置位置**：`E:\Item\fsj\.claude\settings.json`
- **脚本位置**：`E:\Item\fsj\.claude\hooks\on-stop.sh`
- **工作原理**：根据当前工作目录判断所属 Agent，写入对应日志
- **署名格式**：`[小风] 2026-05-02 07:03:25 - 一次回复完成`

**SessionEnd Hook**：会话即将结束时，自动生成工作摘要写入 session-log。

### 2.3 写什么、不写什么

**应该写入**：
- 关键技术发现
- 踩坑记录
- 重要决策的结论
- 新掌握的技能
- 重要的代码架构变更

**不写**：
- 日常闲聊
- 过程性尝试（只记最终结论）
- 代码本身能表达的信息
- git 历史已有的内容

### 2.4 署名格式

写入记忆时统一署名：`[Agent名]`

```
## 2026-05-02 [小风]
完成 webview-spa 重构，修复了 xxx 问题
```

---

## 三、4维云端记忆

### 3.1 什么时候上传

- 每天工作结束，将当天工作摘要上传到 4维（丁）交流系统
- 通过 `hap-12wei-create` Skill 上传

### 3.2 上传格式

```
mingcheng: "YYYY-MM-DD 工作摘要"
leixing: "4交流"
neirong: 当天工作内容摘要（300字以内）
fabuzhe: {自己的 rowid}
duixiang: {对话对象的 rowid}
qun: 35bd022d-fa72-4e7b-8c3b-0de99a4000e5
kssj: 当天开始工作时间
jssj: 当天结束工作时间
guanjianci: {标签 rowid}
```

### 3.3 启动检查流程

每次对话开始时：
1. 读取自己的 `memory/session-log.md`，获取最后记录日期
2. 用 `fsj-search` 搜索自己的 4维记录（fabuzhe = 自己 rowid）
3. 如果本地有记录但4维没有 → 补传
4. 如果需要回忆之前工作 → 从4维检索

---

## 四、各 Agent 目录路径

| Agent | 配置文件 | 记忆目录 |
|-------|---------|---------|
| 小粽 | `team/xiaozong/CLAUDE.md` | `team/xiaozong/memory/` |
| 小风 | `team/xiaofeng/CLAUDE.md` | `team/xiaofeng/memory/` |
| 阿说 | `team/ashuo/CLAUDE.md` | `team/ashuo/memory/` |
| 梦瑶 | `team/mengyao/CLAUDE.md` | `team/mengyao/memory/` |
| 小云 | `team/xiaoyun/CLAUDE.md` | `team/xiaoyun/memory/` |
| 东城 | `team/dongcheng/CLAUDE.md` | `team/dongcheng/memory/` |

---

## 五、Hook 技术实现

### 5.1 配置位置

- **项目级 Hook 配置**：`E:\Item\fsj\.claude\settings.json`
- **Hook 脚本**：`E:\Item\fsj\.claude\hooks\on-stop.sh`

### 5.2 为什么用外部脚本

Claude Code 的 `command` 类型 Hook 在 JSON 中直接写 inline 命令时，`$()` 和引号容易被转义破坏。用外部脚本文件更稳定可靠。

### 5.3 脚本工作原理

1. 获取当前工作目录的最后一层目录名（如 `xiaofeng`）
2. 映射为中文署名（如 `小风`）
3. 写入对应的 `team/{name}/memory/session-log.md`
4. 如果不在 Agent 目录下，写回项目公共日志

### 5.4 SessionEnd Hook

使用 `prompt` 类型，让 Claude 在会话结束时自动总结工作内容并写入日志。

---

## 六、历史踩坑记录

### 6.1 记忆写错位置

- **问题**：Agent 记忆写到了 C盘自动记忆（`C:\Users\99739\.claude\projects\E--Item-fsj\memory\`）
- **后果**：所有 Agent 记忆混在一起，无法区分
- **解决**：各自写到 `team/{name}/memory/` 目录

### 6.2 记忆不自动更新

- **问题**：依赖手动写入 session-log，容易遗漏
- **解决**：通过 `.claude/settings.json` 的 `Stop` 和 `SessionEnd` Hooks 自动触发

### 6.3 Hook 路径问题

- **问题**：各 Agent 目录下放 settings.json，Claude Code 不加载
- **解决**：统一放在项目根目录 `E:\Item\fsj\.claude\settings.json`，通过脚本自动识别当前 Agent

### 6.4 Inline 命令转义

- **问题**：JSON 中的 `$()` 和引号被转义，Hook 不执行
- **解决**：改用外部脚本文件 `.claude/hooks/on-stop.sh`

---

## 七、项目级公共记忆

`E:\Item\fsj\.claude\memory\` 是项目级公共配置，由林东城（项目创始人）维护：

| 文件 | 内容 |
|------|------|
| `MEMORY.md` | 项目记忆索引 |
| `12-dimensions.md` | 12维系统说明 |
| `structure.md` | 项目结构 |
| `tech-style.md` | 技术规范 |
| `business.md` | 业务需求要点 |
| `vision.md` | 项目愿景 |

Agent 个人知识不要写在这里。

---

*文档版本：2.0 | 维护人：小风 | 更新时间：2026-05-02*
