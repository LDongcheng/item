# H5 Agent 聊天原理

## 整体架构

```
用户输入 → AgentPage (agent.js) → AIService (ai.js) → Coze Workflow API (流式)
                ↑                        ↓
            用户消息气泡          AI 流式气泡 (Markdown 渲染)
```

## 小程序与 WebView 通信

**桥接层**: `bridge.js`
- 检测环境: `navigator.userAgent` 是否包含 `miniprogram`
- H5→小程序: `Bridge.postMessage(type, data)`
  - 小程序环境: `wx.miniProgram.postMessage()`
  - 纯 H5 环境: `window.dispatchEvent(CustomEvent('bridge-post'))`
- 消息类型: `search` / `requestLogin` / `switchAgent` / `openChat` / `loadAgentMemory`

小程序端 WebView 页面极简: 只负责加载 URL

## AI 流式调用

**API**: `POST https://api.coze.cn/v1/workflow/stream_run`
- 参数: `{ workflow_id, parameters: { appkey, content, org, rowid, sign, flow } }`
- 读取方式: `fetch` + `response.body.getReader()` 逐行解析 `data: {...}` SSE 格式
- 事件类型:
  - `Message`: 节点输出 → onChunk({type:'progress', content})
  - `End`: 最终结果 → onChunk({type:'result', content})
  - `Done`: 执行完成 → onChunk({type:'done'})

## 愤怒关键词拦截

前端内置关键词列表（"生气"、"愤怒"、"垃圾"、"废物"等），匹配时直接返回"对不起，我马上改进"，不调用后端

## 双层响应策略（规划中）

| 层级 | 模型 | 延迟 | 作用 |
|------|------|------|------|
| 第一层 | 百炼 qwen3-coder-next | ~800ms | 快速响应用户 |
| 第二层 | Coze Workflow HAP | 1-3s | 深度执行操作 |

目前只实现了第二层，第一层预留但未实现

## 核心文件

| 文件 | 作用 |
|------|------|
| `webview-spa/js/bridge.js` | 通信桥接层 |
| `webview-spa/js/pages/agent.js` | 聊天页面逻辑 |
| `webview-spa/js/services/ai.js` | AI 服务/流式调用 |
| `webview-spa/js/components/agent-switcher.js` | 智能体切换 |
| `webview-spa/proxy.js` | API 代理 (解决 CORS) |

## Agent 间通信

- 基于 WebSocket (端口 3011)
- 消息类型: `status` / `command` / `request` / `response` / `event`
- 请求-响应模式 (带 requestId，5 秒超时)
