# WebSocket 桥接技能 (ws-bridge)

## 📖 概述

**用途**：绕过云电脑/容器的入站流量限制，实现双向通信

**核心原理**：
- 云电脑（如无影云）入站流量完全阻止，但**出站流量允许**
- 在公网服务器部署 WebSocket 服务（80/443 端口）
- 云电脑主动出站连接 WebSocket，建立长连接
- 通过 WebSocket 桥接实现双向消息转发

**适用场景**：
- 无影云电脑、容器等入站受限环境
- 需要实时双向通信的应用
- 小程序 ↔ 后端 ↔ AI 助手通信

---

## 🏗️ 架构设计

```
┌─────────────┐                      ┌─────────────┐
│  小程序/客户端 │ ←── WS:80/443 ──→  │  公网服务器  │
│  (出站连接)  │   wss://domain/ws   │  (Nginx+WS) │
└─────────────┘                      └──────┬──────┘
                                            │ WS
                                            ↓
┌─────────────┐                      ┌─────────────┐
│   业务后端   │ ←── HTTP ──→        │   云电脑     │
│  (API 服务)   │                     │  (WS 客户端)  │
└─────────────┘                      └─────────────┘
```

---

## 📦 部署步骤

### 第一步：公网服务器部署 WebSocket 服务

```bash
# 1. 创建目录
mkdir -p /root/ws-bridge
cd /root/ws-bridge

# 2. 创建 package.json
cat > package.json << 'EOF'
{
  "name": "ws-bridge",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "ws": "^8.14.0"
  }
}
EOF

# 3. 创建 WebSocket 服务
cat > server.js << 'EOF'
const WebSocket = require('ws');
const http = require('http');

const PORT = 3010;
const clients = new Map();

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('WebSocket Bridge Running');
});

const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  const clientId = req.url.split('?client=')[1] || 'unknown';
  console.log(`[${new Date().toISOString()}] 客户端连接：${clientId}`);
  
  clients.set(clientId, ws);
  
  ws.on('message', (message) => {
    console.log(`[${clientId}] 收到：`, message.toString());
    
    // 广播给其他客户端
    clients.forEach((client, id) => {
      if (id !== clientId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          from: clientId,
          data: message.toString(),
          time: new Date().toISOString()
        }));
      }
    });
  });
  
  ws.on('close', () => {
    console.log(`[${new Date().toISOString()}] 客户端断开：${clientId}`);
    clients.delete(clientId);
  });
  
  ws.send(JSON.stringify({
    type: 'welcome',
    clientId,
    message: '已连接到 WebSocket 桥接服务'
  }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ WebSocket 服务已启动，监听端口：${PORT}`);
});
EOF

# 4. 安装依赖并启动
npm install
nohup node server.js > ws-bridge.log 2>&1 &

# 5. 验证
ps aux | grep "node server" | grep -v grep
```

---

### 第二步：配置 Nginx 反向代理

**宝塔面板操作**：
1. 登录宝塔 → 网站 → 设置 → 反向代理
2. 添加反向代理：
   - 代理名称：`websocket`
   - 目标 URL：`http://127.0.0.1:3010`
   - 代理目录：`/ws`
   - 勾选 **启用 WebSocket**

**或手动配置**：
```nginx
location /ws {
    proxy_pass http://127.0.0.1:3010;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;
}
```

---

### 第三步：云电脑部署 WebSocket 客户端

```bash
# 1. 创建客户端脚本
cat > ws-bridge-client.js << 'EOF'
#!/usr/bin/env node
const WebSocket = require('ws');
const { execSync } = require('child_process');

const CONFIG = {
  WS_URL: 'ws://8.155.148.75/ws?client=xiaozong',
  RECONNECT_INTERVAL: 5000,
  MAX_RECONNECT: 10
};

let ws = null;
let reconnectCount = 0;

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

function handleMessage(data) {
  try {
    const msg = JSON.parse(data);
    log(`📬 收到消息：${JSON.stringify(msg)}`);
    
    if (msg.type === 'chat' || msg.data || msg.message) {
      log('🔄 转发给后端...');
      const messageText = msg.data || msg.message || JSON.stringify(msg);
      
      try {
        const result = execSync(
          `curl -s -X POST http://127.0.0.1:3001/chat -H "Content-Type: application/json" -d '${JSON.stringify({ message: messageText }).replace(/'/g, "'\\''")}'`,
          { encoding: 'utf-8', timeout: 30000 }
        );
        log(`✅ 后端响应：${result.substring(0, 200)}`);
        
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'response',
            data: result,
            time: new Date().toISOString()
          }));
        }
      } catch (e) {
        log(`❌ 后端调用失败：${e.message}`);
      }
    }
  } catch (e) {
    log(`❌ 消息解析失败：${e.message}`);
  }
}

function connect() {
  log(`🔌 尝试连接：${CONFIG.WS_URL}`);
  
  ws = new WebSocket(CONFIG.WS_URL, { reconnect: false });
  
  ws.on('open', () => {
    log('✅ WebSocket 连接成功！');
    reconnectCount = 0;
  });
  
  ws.on('message', handleMessage);
  
  ws.on('close', () => scheduleReconnect());
  ws.on('error', (err) => log(`❌ 连接错误：${err.message}`));
}

function scheduleReconnect() {
  if (reconnectCount >= CONFIG.MAX_RECONNECT) return;
  reconnectCount++;
  const delay = CONFIG.RECONNECT_INTERVAL * reconnectCount;
  log(`⏳ ${delay}ms 后第 ${reconnectCount} 次重连...`);
  setTimeout(connect, delay);
}

// 检查 ws 模块
try { require.resolve('ws'); } catch (e) {
  log('❌ 缺少 ws 模块，执行：npm install ws');
  process.exit(1);
}

connect();
EOF

# 2. 安装依赖
npm install ws

# 3. 启动客户端
nohup node ws-bridge-client.js > /tmp/ws-client.log 2>&1 &

# 4. 验证
tail -20 /tmp/ws-client.log
```

---

## 🧪 测试方法

### 方式 1：wscat 测试
```bash
npm install -g wscat
wscat -c "ws://8.155.148.75/ws?client=test" -x '{"type":"chat","data":"测试消息"}'
```

### 方式 2：网页测试
```html
<script>
const ws = new WebSocket('ws://8.155.148.75/ws?client=test');
ws.onopen = () => ws.send(JSON.stringify({type:'chat',data:'测试'}));
ws.onmessage = (e) => console.log('收到:', e.data);
</script>
```

### 方式 3：小程序测试
```javascript
const ws = wx.connectSocket({
  url: 'ws://100000whys.cn/ws?client=miniprogram'
});
ws.onOpen(() => ws.send({
  data: JSON.stringify({type:'chat',data:'你好'})
}));
```

---

## 📁 文件结构

```
skills/ws-bridge/
├── SKILL.md              # 技能说明文档
├── server.js             # WebSocket 服务端
├── client.js             # WebSocket 客户端
├── nginx.conf.example    # Nginx 配置示例
└── README.md             # 部署文档
```

---

## ⚠️ 注意事项

1. **端口选择**：云电脑出站通常只允许 80/443，必须用 Nginx 反向代理
2. **心跳保活**：长连接需要心跳，建议 30 秒一次 ping/pong
3. **重连机制**：客户端必须有重连逻辑，网络波动会断开
4. **消息格式**：建议统一用 JSON 格式，包含 type、data、time 字段
5. **安全性**：生产环境建议加 token 认证、WSS 加密

---

## 🔧 故障排查

| 问题 | 原因 | 解决 |
|------|------|------|
| 404 错误 | Nginx 配置未生效 | 检查 location /ws 配置，重载 Nginx |
| 连接超时 | 防火墙阻止 | 检查阿里云安全组、宝塔防火墙 |
| 频繁断开 | 网络波动/超时 | 增加重连逻辑、心跳保活 |
| 消息不转发 | 客户端 ID 不匹配 | 检查广播逻辑中的客户端过滤 |

---

## 📚 相关资源

- [ws 模块文档](https://github.com/websockets/ws)
- [Nginx WebSocket 代理](https://nginx.org/en/docs/http/websocket.html)
- [小程序 WebSocket](https://developers.weixin.qq.com/miniprogram/dev/api/network/websocket/wx.connectSocket.html)

---

**版本**：1.0.0  
**作者**：小粽  
**更新时间**：2026-03-02
