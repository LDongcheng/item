# webview-spa2.0

童小智 - 小学数学 AI 学习助手，基于 SPA 架构的 WebView 应用。

## 技术栈

- **构建工具**: Vite 5
- **AI 服务**: Coze 工作流 API (流式输出)
- **Markdown 渲染**: marked.js
- **纯原生 JS**，无前端框架

## 功能特性

- **智能体对话**: 基于 Coze 工作流的流式 AI 对话，支持上下文记忆
- **沉浸模式**: 带数字人视频 + 语音朗读(TTS)的沉浸式学习体验
- **错题分析**: 拍照上传错题，AI 自动归因分析 + 推送变式题
- **学习报告**: 自动记录答题数据，生成个性化学习报告
- **多格式输出**: 支持 `[0]`/`[1]` 前缀标签，`[1]` 触发独立 HTML 生成工作流
- **动态 TabBar**: 登录后根据用户权限动态渲染底部导航栏

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建产物
npm run preview
```

开发服务器默认运行在 `http://localhost:3003`。

## 项目结构

```
├── index.html              # 入口文件，4 个页面路由
├── css/
│   ├── base.css            # 基础样式 (变量、reset、布局)
│   ├── components.css      # 组件样式 (消息气泡、TabBar、输入框)
│   ├── components-login.css # 登录页样式
│   └── pages.css           # 页面级样式
├── js/
│   ├── app.js              # 应用入口 (初始化、路由、TabBar 控制)
│   ├── bridge.js           # 原生桥接 (拍照、上传等)
│   ├── services/
│   │   ├── ai.js           # Coze 工作流 AI 服务 (流式输出)
│   │   ├── login.js        # 登录服务
│   │   ├── tts.js          # 语音朗读服务
│   │   └── agentVideo.js   # 沉浸模式视频资源服务
│   └── pages/
│       ├── agent.js        # 智能体页面 (对话、沉浸模式、TTS)
│       ├── message.js      # 消息页面
│       └── profile.js      # 我的页面
├── docs/
│   └── agent-output-format.md  # AI Agent 输出格式规范
└── memory/
    └── agent-output-format.md  # 输出格式规范(精简版)
```

## 核心架构

### AI 对话流程

```
用户输入
  → AgentPage.buildContentWithContext()  拼接历史上下文
  → AIService.execute()                  调用 Coze 工作流
  → 流式返回 (progress/delta/result/done)
  → _handleAiEvent()                     统一事件处理
  → 渲染到消息气泡 / 沉浸模式消息列表
```

### 输出格式

AI 每次回复以 3 字符前缀开头：

| 前缀 | 含义 | 行为 |
|------|------|------|
| `[0]` | 纯文本 | 直接 Markdown 渲染显示 |
| `[1]` | 需要 HTML | 文本显示完成后，触发 HTML 专用工作流生成页面 |

### 页面路由

SPA 通过切换 `data-page` 属性的页面 div 实现路由，底部 TabBar 根据登录返回的 `shangjia` 配置动态渲染。

## API 配置

Coze 工作流配置在 `js/services/ai.js` 中：

- **普通模式**: workflow `7634531869195796499`
- **沉浸模式**: workflow `7635274334010196020`

## 数据持久化

- **聊天历史**: `localStorage.fsj_chat_history`
- **智能体模式**: `localStorage.fsj_agent_mode` (0=普通, 1=沉浸)
- **TTS 开关**: `localStorage.fsj_tts_enabled`
