---
name: webview-spa-template
description: 小程序内嵌 webview 的 SPA 单页应用开发模板。三分离架构（HTML+CSS+JS），原生开发，不使用框架。触发场景：开发小程序内嵌webview页面、创建新页面、制定前端开发规范。
---

# Webview SPA 三分离开发模板

> 小程序内嵌 webview · SPA 架构 · HTML+CSS+JS 三分离 · 原生开发

---

## 技术选型

| 项目 | 选择 | 说明 |
|------|------|------|
| 架构 | SPA 单页应用 | 页面切换无刷新 |
| 开发模式 | 三分离 | HTML/CSS/JS 独立文件 |
| 框架 | 无 | 原生 JavaScript，不引入 Vue/React |
| 样式 | Tailwind CDN | `<script src="https://cdn.tailwindcss.com"></script>` |
| 图标 | Font Awesome | `https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css` |
| 模块系统 | ES6 Module | `<script type="module">` + 动态 import() |
| 通信 | wx.miniProgram | 小程序 webview SDK |

---

## 目录结构

```
pages/项目名/
├── index.html          # 页面结构
├── index.css           # 页面样式
├── index.js            # 页面逻辑（导出默认类）
└── assets/             # 项目专属资源
```

---

## 标准代码模板

### index.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>页面名称</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="index.css">
</head>
<body>
    <div id="app">
        <!-- 页面内容 -->
    </div>
    <script type="module" src="index.js"></script>
</body>
</html>
```

### index.js

```javascript
import '../../app.css'; // 引入全局样式（按需）

class 页面名 {
    constructor(container) {
        this.container = container;
        this.timer = null;
    }

    async init() {
        // 1. 加载 HTML 模板
        const html = await fetch('index.html').then(res => res.text());
        this.container.innerHTML = html;

        // 2. 绑定事件
        this.bindEvents();

        // 3. 加载数据
        await this.loadData();
    }

    bindEvents() {
        // 事件绑定示例
        // this.container.querySelector('#btn').addEventListener('click', () => {});
    }

    async loadData() {
        // 数据加载逻辑
    }

    destroy() {
        // 清理：定时器、事件监听、DOM引用
        if (this.timer) clearInterval(this.timer);
    }
}

export default 页面名;
```

### index.css

```css
/* 页面专属样式 */
```

---

## 页面组件规范

### 生命周期

| 方法 | 作用 |
|------|------|
| `constructor(container)` | 初始化，接收容器元素 |
| `async init()` | 加载 HTML/CSS/资源、绑定事件 |
| `destroy()` | 清理资源（必须实现） |

### 路由切换

```javascript
// 导航到另一页
window.postMessage({ type: 'navigate', page: '目标页面目录名' });
```

### 小程序通信

```javascript
// 发送数据给小程序
wx.miniProgram.postMessage({ data: { action: 'xxx', payload: {} } });

// 接收小程序数据
window.addEventListener('message', (event) => {
    const data = event.data;
    // 处理数据
});
```

---

## 开发注意事项

1. **必须通过 HTTP 服务器运行**：ES6 模块在 `file://` 协议下不工作
2. **rem 适配**：`html { font-size: 100px }`，基于 750px 设计稿
3. **禁止横向滚动**：`body { overflow-x: hidden; }`
4. **清理资源**：每个页面的 `destroy()` 必须清理定时器和事件监听
5. **CDN 回退**：如果使用 CDN，考虑离线场景的降级方案
6. **小程序 webview 限制**：不能使用 localStorage（会被清除），数据通过 postMessage 传递

---

## 与小程序集成

### webview 页面配置

小程序页面中放置 webview 组件：

```html
<web-view src="https://你的域名/webview/pages/项目名/index.html"></web-view>
```

### 数据传递流程

```
小程序 → webview：通过 URL 参数传递
webview → 小程序：通过 wx.miniProgram.postMessage()
```

---

## 成功项目经验总结

基于三个已上线项目的实战经验：

### 1. shuxiaohe（同檐er）- 校园便利店小程序
- **架构**：小程序原生 + webview 混合，双价格体系（全额/盒子价）
- **后端**：Express + MySQL（宝塔），认证与业务服务分离
- **关键经验**：JWT 30天有效期、订单号关联双系统（MySQL+HAP）、来源标记中间件
- **部署**：宝塔 Node.js + nginx 反向代理 + MySQL

### 2. sxz（沈仙子）- AI陪诊助手
- **架构**：H5 webview 为主 + 少量原生页面（录音/支付）
- **关键经验**：
  - URL 版本号参数解决 webview 缓存问题
  - Hash 通信实现小程序与 webview 双向数据传递
  - Coze AI 流式对话（SSE + Markdown 渲染）
  - 语音识别 59 秒自动分段 + 错误重试
- **部署**：同一套后端（端口3000），明道云 V2 API

### 3. youqu（友趣）- 社区社交小程序
- **架构**：原生小程序为主 + webview（培训系统）
- **关键经验**：
  - HAP V3 API 统一封装（529行）
  - 浏览器/小程序双端 API 适配（fetch vs wx.request）
  - 完整社交数据模型（帖子/评论/关注/私信）
  - 字段 ID 映射管理（getCategoryKey/getTaskTypeKey）

---

## 关键可复用模式

### webview 缓存刷新方案（sxz 经验）
```javascript
// URL 参数版本号强制刷新
const url = `index.html?v=${Date.now()}_${Math.random().toString(36).slice(2)}`;
```

### JWT 认证模式（shuxiaohe 经验）
```javascript
// 登录获取 token
const login = async (code) => {
  const res = await fetch('/api/v1/auth/code2session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  const { token, user } = await res.json();
  localStorage.setItem('token', token);
  return user;
};

// 请求携带 token
const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: { ...options.headers, 'Authorization': `Bearer ${token}` }
  });
};
```

### HAP V3 API 统一封装（youqu 经验）
```javascript
class HAPAPI {
  constructor(baseURL, appKey, sign) {
    this.baseURL = baseURL;
    this.appKey = appKey;
    this.sign = sign;
  }

  async getRows(worksheetId, filters = {}) {
    const res = await fetch(`${this.baseURL}/v3/app/worksheets/${worksheetId}/rows/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId: this.appKey, sign: this.sign, ...filters })
    });
    return res.json();
  }

  async createRow(worksheetId, controls) {
    const res = await fetch(`${this.baseURL}/v3/app/worksheets/${worksheetId}/rows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId: this.appKey, sign: this.sign, controls })
    });
    return res.json();
  }
}
```

### 宝塔部署架构
```
域名: yourdomain.com
├── /项目名/api/*     → Node.js 服务（Express, 端口 3000/3001）
├── /webview/*        → 静态文件（H5 webview）
└── MySQL             → 宝塔数据库
```

.env 配置：
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=xxx
DB_NAME=项目名
JWT_SECRET=xxx
WECHAT_APPID=xxx
WECHAT_SECRET=xxx
WECHAT_MCH_ID=xxx
WECHAT_API_KEY=xxx
PORT=3000
```

---

*版本: v2.0*
*创建时间: 2026-04-26*
*作者: 小风*
