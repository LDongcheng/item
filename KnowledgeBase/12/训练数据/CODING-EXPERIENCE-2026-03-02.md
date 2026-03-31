# 代码经验 - 守护进程设计与自动重启 - 2026-03-02

## 🎯 任务：明道云记录守护进程崩溃问题修复

### 问题背景
- `auto-record-daemon.js` 在 2026-03-01 20:20 后停止运行
- 日志中没有错误信息，进程直接消失
- 明道云消息同步中断超过 12 小时
- 需要彻底解决，让守护进程永不崩溃

---

## 🔧 遇到的关键问题

### 1️⃣ 没有全局错误处理（最大坑！）

**问题：**
```javascript
// ❌ 错误：没有错误处理
fs.watch(filePath, (eventType) => {
  // 如果这里抛出异常，整个进程直接崩溃
  const content = fs.readFileSync(filePath, 'utf-8');
  // ...
});

// 进程崩溃后没有任何日志，直接消失
```

**现象：**
- 进程停止但没有错误日志
- `journalctl` 查不到崩溃信息
- `dmesg` 没有 OOM killer 记录

**解决：**
```javascript
// ✅ 正确：全局错误捕获
process.on('uncaughtException', (err) => {
  console.error(`❌ 未捕获异常：${err.message}`);
  console.error(err.stack);
  // 不退出进程，继续运行！
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`❌ 未处理的 Promise 拒绝：${reason}`);
  // 不退出进程，继续运行！
});
```

**教训：**
- **永远添加全局异常处理**，Node.js 默认行为是退出进程
- `fs.watch()` 回调中的异常会导致进程崩溃
- Promise 拒绝未处理也会崩溃

---

### 2️⃣ fs.watch() 没有错误监听

**问题：**
```javascript
// ❌ 错误：没有监听 watcher 错误
const watcher = fs.watch(filePath, (eventType) => {
  // ...
});
// 如果 watcher 出错（文件被删除/权限变化），进程崩溃
```

**解决：**
```javascript
// ✅ 正确：监听 watcher 错误
try {
  const watcher = fs.watch(filePath, { persistent: true }, (eventType) => {
    // ...
  });
  
  watcher.on('error', (err) => {
    console.error(`❌ 监控 ${sessionKey} 出错：${err.message}`);
    // 不崩溃，继续监控其他文件
  });
} catch (error) {
  console.error(`❌ 无法监控 ${sessionKey}: ${error.message}`);
}
```

**教训：**
- `fs.watch()` 返回的 `FSWatcher` 对象可能抛出错误
- 必须用 `try-catch` 包裹创建过程
- 必须监听 `watcher.on('error')`

---

### 3️⃣ 没有进程守护机制

**问题：**
```bash
# ❌ 错误：手动启动
node auto-record-daemon.js &
# 进程崩溃后不会自动重启
```

**解决：**
```ini
# ✅ 正确：systemd 服务
[Service]
Type=simple
Restart=always          # 总是重启
RestartSec=5            # 5 秒后重启
StandardOutput=journal
StandardError=journal
```

**教训：**
- **永远不要相信进程不会崩溃**
- 手动启动的进程崩溃后需要人工干预
- systemd 可以自动重启，无需人工介入

---

### 4️⃣ 没有心跳日志

**问题：**
- 进程是否运行无法快速判断
- 需要查 `journalctl` 才能确认
- 无法知道进程"活著但卡住"的状态

**解决：**
```javascript
// ✅ 正确：定期心跳
setInterval(() => {
  console.log(`💓 心跳 - 已记录 ${recordedMessages.size} 条消息`);
}, 300000);  // 5 分钟
```

**好处：**
- 日志中看到心跳 = 进程正常
- 心跳停止 = 进程崩溃
- 可以监控业务指标（已记录消息数）

---

### 5️⃣ 没有优雅退出处理

**问题：**
```javascript
// ❌ 错误：没有处理退出信号
// 进程被 kill 时缓存没保存，下次启动重复记录
```

**解决：**
```javascript
// ✅ 正确：优雅退出
process.on('SIGINT', () => {
  console.log('\n👋 守护进程退出');
  saveCache();  // 保存缓存
  process.exit();
});

process.on('SIGTERM', () => {
  console.log('\n👋 收到 SIGTERM，优雅退出');
  saveCache();
  process.exit();
});
```

**教训：**
- systemd 停止服务时发送 `SIGTERM`
- 必须捕获退出信号，保存状态
- 避免数据丢失和重复记录

---

## 📊 架构设计

### 多层防护架构

```
┌─────────────────────────────────────┐
│  第 1 层：脚本内部错误处理            │
│  - uncaughtException                │
│  - unhandledRejection               │
│  - fs.watch 错误监听                 │
│  - 优雅退出处理                     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  第 2 层：systemd 进程守护            │
│  - Restart=always                   │
│  - RestartSec=5                     │
│  - 自动重启                         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  第 3 层：日志追踪                   │
│  - 标准输出重定向到 journal          │
│  - 心跳日志（每 5 分钟）             │
│  - 错误堆栈输出                     │
└─────────────────────────────────────┘
```

### 文件结构

```
mingdao-chat/
├── auto-record-daemon.js    # 守护进程主程序（已加固）
├── auto-hook.js             # 明道云 API 封装
├── mingdao-record.service   # systemd 服务文件
└── daemon.log               # 日志文件
```

---

## 🛠️ 修改的文件

### /home/admin/openclaw/workspace/skills/mingdao-chat/

| 文件 | 操作 | 说明 |
|------|------|------|
| `auto-record-daemon.js` | 修改 | 添加全局错误处理、watcher 错误监听、心跳日志 |
| `mingdao-record.service` | 新增 | systemd 服务配置文件 |
| `daemon.log` | 新增 | 日志文件（systemd 重定向） |

### /etc/systemd/system/

| 文件 | 操作 | 说明 |
|------|------|------|
| `mingdao-record.service` | 创建 | 系统级服务配置 |

---

## 📋 核心教训

| 问题 | 教训 | 优先级 |
|------|------|--------|
| 没有全局错误处理 | **永远添加 `uncaughtException` 和 `unhandledRejection`** | 🔴 最高 |
| fs.watch 无错误监听 | **永远监听 `watcher.on('error')`** | 🔴 最高 |
| 没有进程守护 | **永远使用 systemd（Restart=always）** | 🔴 最高 |
| 没有心跳日志 | **永远添加定期心跳输出** | 🟡 高 |
| 没有优雅退出 | **永远处理 SIGINT/SIGTERM** | 🟡 高 |
| 日志无限增长 | **配置 logrotate 日志轮转** | 🟡 中 |

---

## 💡 可复用的代码模式

### 1. 守护进程模板

```javascript
#!/usr/bin/env node

// ============ 全局错误处理 ============
process.on('uncaughtException', (err) => {
  console.error(`❌ 未捕获异常：${err.message}`);
  console.error(err.stack);
  // 不退出进程
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`❌ 未处理的 Promise 拒绝：${reason}`);
  // 不退出进程
});

// ============ 优雅退出 ============
process.on('SIGINT', () => {
  console.log('\n👋 收到 SIGINT，优雅退出');
  saveState();
  process.exit();
});

process.on('SIGTERM', () => {
  console.log('\n👋 收到 SIGTERM，优雅退出');
  saveState();
  process.exit();
});

// ============ 心跳日志 ============
setInterval(() => {
  console.log(`💓 心跳 - 状态正常`);
}, 300000);  // 5 分钟

// ============ 主程序 ============
async function main() {
  console.log('🚀 守护进程启动...');
  // ...
}

main();
```

**使用场景：** 任何需要长期运行的后台脚本

---

### 2. 文件监控错误处理

```javascript
function watchFile(filePath) {
  try {
    const watcher = fs.watch(filePath, { persistent: true }, (eventType) => {
      try {
        // 处理文件变化
        const content = fs.readFileSync(filePath, 'utf-8');
        // ...
      } catch (error) {
        console.error(`❌ 处理文件变化失败：${error.message}`);
      }
    });
    
    watcher.on('error', (err) => {
      console.error(`❌ 监控出错：${err.message}`);
    });
    
    console.log(`✅ 开始监控：${filePath}`);
  } catch (error) {
    console.error(`❌ 无法监控：${error.message}`);
  }
}
```

**使用场景：** 监控配置文件、会话文件、日志文件等

---

### 3. systemd 服务模板

```ini
[Unit]
Description=服务描述
After=network.target

[Service]
Type=simple
User=admin
WorkingDirectory=/path/to/workdir
ExecStart=/usr/bin/node script.js
Restart=always
RestartSec=5

# 日志
StandardOutput=append:/path/to/log
StandardError=append:/path/to/log

# 资源限制
LimitNOFILE=65535
Nice=10

[Install]
WantedBy=multi-user.target
```

**使用场景：** 任何 Node.js 后台服务

---

### 4. 日志轮转配置

```bash
# /etc/logrotate.d/mingdao-record
/home/admin/openclaw/workspace/skills/mingdao-chat/daemon.log {
    daily           # 每天轮转
    rotate 7        # 保留 7 天
    compress        # 压缩旧日志
    missingok       # 日志不存在也不报错
    notifempty      # 空日志不轮转
    create 0644 admin admin
}
```

**使用场景：** 任何长期运行的服务日志

---

## 🎓 守护进程设计原则

> **永远不要相信代码不会出错！**

### 核心原则

1. **永远添加全局异常处理** - Node.js 默认崩溃退出
2. **永远使用 systemd 守护** - 自动重启，无需人工干预
3. **永远配置日志轮转** - 防止日志占满磁盘
4. **永远添加心跳日志** - 方便监控和排查
5. **永远优雅退出** - 保存状态，避免数据丢失

### 检查清单

创建任何后台脚本时必须检查：

```
□ 1. 全局错误处理
   □ uncaughtException
   □ unhandledRejection

□ 2. 文件监控错误处理
   □ try-catch 包裹 fs.watch
   □ watcher.on('error')

□ 3. systemd 服务
   □ Restart=always
   □ RestartSec=5
   □ 日志重定向

□ 4. 优雅退出
   □ SIGINT 处理
   □ SIGTERM 处理
   □ 保存状态

□ 5. 心跳日志
   □ 定期输出状态
   □ 包含业务指标

□ 6. 日志轮转
   □ logrotate 配置
   □ 保留期限合理
```

---

## 📊 效果对比

| 指标 | 修复前 | 修复后 |
|------|--------|--------|
| 崩溃后恢复 | 人工干预 | 5 秒自动重启 |
| 错误追踪 | 无日志 | 完整堆栈 |
| 状态监控 | 无法判断 | 心跳日志 |
| 数据完整性 | 可能丢失 | 优雅退出保存 |
| 维护成本 | 高 | 零维护 |

---

## 🚀 管理命令

```bash
# 查看状态
sudo systemctl status mingdao-record

# 查看实时日志
sudo journalctl -u mingdao-record -f

# 重启服务
sudo systemctl restart mingdao-record

# 停止服务
sudo systemctl stop mingdao-record

# 查看服务配置
systemctl cat mingdao-record
```

---

## 🎯 总结

### 核心经验

1. **全局错误处理** - 防止未捕获异常导致进程崩溃
2. **systemd 守护** - 崩溃后自动重启，无需人工干预
3. **心跳日志** - 方便监控进程状态
4. **优雅退出** - 保存状态，避免数据丢失

### 关键教训

1. ⚠️ **Node.js 默认行为是退出进程** - 必须显式捕获异常
2. ⚠️ **fs.watch() 可能抛出错误** - 必须监听 error 事件
3. ⚠️ **手动启动的进程不可靠** - 必须用 systemd 管理
4. ⚠️ **日志不轮转会占满磁盘** - 必须配置 logrotate

### 可复用模式

1. 守护进程模板
2. 文件监控错误处理
3. systemd 服务配置
4. 日志轮转配置

---

> **不要假设进程不会崩溃，要设计崩溃后自动恢复！**

---

**日期**: 2026-03-02  
**作者**: 小粽 (AI)  
**相关仓库**: 
- 代码：`/home/admin/openclaw/workspace/skills/mingdao-chat/`
- 经验：`/home/admin/openclaw/workspace/KnowledgeBase/CODING-EXPERIENCE-2026-03-02.md`
