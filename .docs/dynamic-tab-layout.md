# 商家页面动态布局

> 制定时间：2026-05-02
> 维护人：小风

---

## 概述

商家登录后，H5 直接调用 Coze 登录 API 获取用户信息和页面配置，动态调整底部导航栏布局。不同商家可以有不同数量和顺序的底部导航项。

---

## 登录接口

### 请求

```
POST https://api.coze.cn/v1/workflow/stream_run
```

### 参数

```json
{
  "workflow_id": "7635086187392647214",
  "parameters": {
    "mima": "密码",
    "phone": "手机号"
  }
}
```

### 响应（SSE 流式）

```
data: {"content":"{\"name\":\"测试账号\",\"rowid\":\"93b69f77-c65f-4ac5-895a-9ba0b7682d77\",\"shangjia\":[{\"name\":\"首页\",\"sort\":\"0\",\"page\":\"home\"},{\"name\":\"智能体\",\"sort\":\"1\",\"page\":\"agent\"},{\"name\":\"消息\",\"sort\":\"2\",\"page\":\"message\"},{\"name\":\"我的\",\"sort\":\"3\",\"page\":\"profile\"}]}"}

data: {"debug_url":"..."}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 商家名称 |
| `rowid` | string | 商家唯一标识，用作登录 token |
| `agent` | string | Agent 唯一标识，用于智能体页面 |
| `shangjia` | array | 底部导航栏配置数组 |

### shangjia 数组项

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 导航项显示名称 |
| `sort` | string | 排序序号，从小到大排列 |
| `page` | string | 对应页面标识 |
| `mode` | string | Agent 页面专属字段，`0`=普通聊天模式，`1`=沉浸模式 |

### page 支持的值

| 值 | 对应页面 | 说明 |
|----|---------|------|
| `home` | 首页 | 商家主页，含轮播图、功能列表、文章列表 |
| `agent` | 智能体 | AI 聊天页面 |
| `message` | 消息 | 消息列表页 |
| `profile` | 我的 | 个人中心页 |

---

## 默认布局

未登录状态下，底部导航栏使用默认配置：

```json
[
  { "name": "首页", "sort": 0, "page": "home" },
  { "name": "智能体", "sort": 1, "page": "agent" },
  { "name": "消息", "sort": 2, "page": "message" },
  { "name": "我的", "sort": 3, "page": "profile" }
]
```

---

## 登录后流程

```
用户点击登录
    ↓
LoginService.accountLogin(phone, password)
    ↓
POST https://api.coze.cn/v1/workflow/stream_run
    ↓
解析 SSE 响应，获取 { rowid, name, shangjia }
    ↓
ProfilePage.handleLoginResult(loginData)
    ↓
1. localStorage.setItem('fsj_token', rowid)
2. localStorage.setItem('fsj_user_name', name)
3. localStorage.setItem('fsj_shangjia_tabs', shangjia)
4. App.updateTabBar(shangjia)  → 重新渲染底部导航栏
5. ProfilePage.renderUserCard() → 更新用户卡片
6. 提示"登录成功，欢迎 xxx"
```

---

## 实现细节

### 1. 登录服务

**文件**: `js/services/login.js`

```javascript
LoginService.accountLogin(phone, password)
  .then(function (loginData) {
    // loginData = { name, rowid, shangjia }
  })
```

### 2. 底部导航栏动态渲染

**文件**: `js/app.js`

```javascript
// 默认配置
defaultTabBar: [
  { name: '首页', sort: 0, page: 'home' },
  { name: '智能体', sort: 1, page: 'agent' },
  { name: '消息', sort: 2, page: 'message' },
  { name: '我的', sort: 3, page: 'profile' },
]

// 加载配置
loadTabBarConfig()     // 从 localStorage 读取，没有则用默认
renderTabBar(config)   // 按 sort 排序后渲染
updateTabBar(shangjia) // 登录成功后调用
```

### 3. 登录结果处理

**文件**: `js/pages/profile.js`

```javascript
handleLoginResult(loginData) {
  // 保存登录信息
  localStorage.setItem('fsj_token', loginData.rowid)
  localStorage.setItem('fsj_user_name', loginData.name)
  localStorage.setItem('fsj_shangjia_tabs', JSON.stringify(loginData.shangjia))
  
  // 更新界面
  this.renderUserCard()
  this.renderSettingsList()
  window.App.updateTabBar(loginData.shangjia)
}
```

---

## 本地存储

| Key | 值 | 用途 |
|-----|----|------|
| `fsj_token` | rowid | 登录状态标识 |
| `fsj_user_name` | 商家名称 | 用户昵称 |
| `fsj_shangjia_tabs` | shangjia 数组 JSON | 底部导航栏配置 |
| `fsj_agent_id` | agent | 当前登录的 Agent ID |
| `fsj_agent_mode` | `0` 或 `1` | Agent 页面模式：0=普通，1=沉浸 |

---

## 注意事项

1. **page 值必须与 HTML 中页面 id 对应**：`page-home`、`page-agent`、`page-message`、`page-profile`
2. **sort 字段决定排序**：数字越小越靠前
3. **首次启动加载默认布局**：localStorage 无缓存时使用默认 4 项
4. **退出登录清除用户名**：同时清除 `fsj_token` 和 `fsj_user_name`
5. **API Token 安全**：当前 Token 硬编码在前端，后续应移至后端代理

---

*文档版本：2.0 | 维护人：小风 | 更新时间：2026-05-02*
