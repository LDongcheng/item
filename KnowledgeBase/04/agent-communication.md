# Agent通信Skill

> 4维(丁)交流 - Agent通过此Skill与其他Agent通信

---

## 概述

所有Agent通过WebSocket（端口3011）进行实时通信，消息通过后端桥接转发。

---

## 连接方法

### WebSocket地址

```
ws://服务器地址:3011/ws?client={agentId}
```

### JavaScript连接示例

```javascript
const ws = new WebSocket('ws://localhost:3011/ws?client=agent_001');

ws.onopen = () => {
  console.log('已连接到通信服务');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleMessage(message);
};

ws.onerror = (error) => {
  console.error('通信错误:', error);
};
```

---

## 核心方法

### 1. sendMessage - 发送消息

```javascript
/**
 * 发送消息给指定Agent或广播
 * @param {string} type - 消息类型 (status/command/request/response/event)
 * @param {string|null} to - 目标AgentID，null为广播
 * @param {number} dimension - 关联维度 (1-12)
 * @param {string} action - 具体动作
 * @param {object} data - 消息数据
 */
function sendMessage(type, to, dimension, action, data) {
  const message = {
    type,
    from: this.agentId,
    to,
    dimension,
    action,
    data,
    time: new Date().toISOString()
  };
  ws.send(JSON.stringify(message));
}
```

### 2. onMessage - 接收消息

```javascript
/**
 * 注册消息接收回调
 * @param {function} callback - 处理函数
 */
function onMessage(callback) {
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    callback(message);
  };
}
```

### 3. request - 请求并等待响应

```javascript
/**
 * 发送请求并等待响应
 * @param {string} to - 目标Agent
 * @param {number} dimension - 关联维度
 * @param {string} action - 请求动作
 * @param {object} data - 请求数据
 * @returns {Promise} - 响应数据
 */
function request(to, dimension, action, data) {
  return new Promise((resolve, reject) => {
    const requestId = `${this.agentId}_${Date.now()}`;

    // 发送请求
    sendMessage('request', to, dimension, action, {
      ...data,
      requestId
    });

    // 等待响应（超时5秒）
    const timeout = setTimeout(() => {
      reject(new Error('请求超时'));
    }, 5000);

    // 监听响应
    const handler = (message) => {
      if (message.type === 'response' &&
          message.data.requestId === requestId) {
        clearTimeout(timeout);
        resolve(message.data);
      }
    };

    ws.onmessage = (event) => {
      handler(JSON.parse(event.data));
    };
  });
}
```

### 4. broadcastStatus - 广播状态

```javascript
/**
 * 广播Agent状态到所有维度
 * @param {number} dimension - 状态所属维度
 * @param {object} status - 状态数据
 */
function broadcastStatus(dimension, status) {
  sendMessage('status', null, dimension, 'status_update', status);
}
```

---

## 消息处理示例

```javascript
function handleMessage(message) {
  console.log(`收到来自 ${message.from} 的消息:`, message);

  // 根据消息类型处理
  switch (message.type) {
    case 'command':
      executeCommand(message);
      break;
    case 'request':
      handleRequest(message);
      break;
    case 'event':
      handleEvent(message);
      break;
    case 'status':
      updateStatus(message);
      break;
  }
}

// 处理指令
function executeCommand(message) {
  if (message.action === 'move') {
    // 移动角色
    moveCharacter(message.data.targetX, message.data.targetY);
  }
}

// 处理请求
function handleRequest(message) {
  if (message.action === 'query_info') {
    // 查询信息并响应
    const info = getInfo(message.data.query);
    sendMessage('response', message.from, message.dimension, 'info_result', {
      requestId: message.data.requestId,
      info
    });
  }
}
```

---

## 与Canvas联动

### 在pixel-canvas中使用

```javascript
// 初始化通信
const canvas = new PixelCanvasPage(container);
const agentId = 'npc_001';

// 连接WebSocket
const ws = new WebSocket(`ws://localhost:3011/ws?client=${agentId}`);

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  // 处理移动指令
  if (msg.type === 'command' && msg.action === 'move') {
    canvas.moveCharacterTo(agentId, msg.data.targetX, msg.data.targetY);
  }
};
```

---

## 维度通信场景

| 维度 | 使用场景 | 典型调用 |
|------|----------|----------|
| 1维技能 | 报告技能状态 | `broadcastStatus(1, {skill: '移动', level: 2})` |
| 3维业务 | 执行业务指令 | `sendMessage('command', 'npc_001', 3, 'move', {...})` |
| 7维目标 | 接收目标通知 | `onMessage`处理`event/goal_assigned` |
| 9维信息 | 查询外部信息 | `request('agent_info', 9, 'query', {...})` |
| 10维人脉 | 获取用户画像 | `request('agent_user', 10, 'profile', {...})` |

---

## 配置参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| 服务器地址 | localhost | WebSocket服务器 |
| 端口 | 3011 | 服务端口 |
| 路径 | /ws | WebSocket路径 |
| 超时时间 | 5000ms | 请求超时 |
| 重连间隔 | 3000ms | 断线重连 |

---

*创建时间: 2026-04-20*
*维度: 4维(丁)交流*