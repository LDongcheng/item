# HAP MCP 安装状态报告

## ✅ 安装完成

### hap-skills-collection 技能

**安装位置**: `/home/admin/.openclaw/workspace/skills/`

**已安装技能**:
| 技能 | 状态 |
|------|------|
| hap-mcp-usage | ✅ 已安装 |
| hap-v3-api | ✅ 已安装 |
| hap-as-database | ✅ 已安装 |
| hap-frontend-project | ✅ 已安装 |
| hap-view-plugin | ✅ 已安装 |
| hap-api-doc-updater | ✅ 已安装 |
| hap-skills-updater | ✅ 已安装 |

### MCP 服务器配置

**配置文件**: `/home/admin/.openclaw/mcp.json`

**配置内容**:
```json
{
  "mcpServers": {
    "hap-mcp-孚世界": {
      "url": "https://api.mingdao.com/mcp?HAP-Appkey=b37a969f03b3cf0b&HAP-Sign=MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==",
      "type": "streamable"
    }
  }
}
```

**配置检查**:
- ✅ 配置文件位置正确
- ✅ 服务器名称符合规范 (`hap-mcp-应用名`)
- ✅ URL 包含 `HAP-Appkey` 和 `HAP-Sign`
- ✅ 类型指定为 `streamable`

---

## 📋 使用说明

### 通过 OpenClaw 使用

OpenClaw 会自动读取 `/home/admin/.openclaw/mcp.json` 并连接 MCP 服务器。

### 通过其他 AI 工具使用

如果需要在其他 AI 工具中使用，需要重新配置：

**Cursor**:
```bash
cp /home/admin/.openclaw/mcp.json ~/.cursor/mcp.json
```

**Claude Code**:
```bash
claude mcp add hap-mcp-孚世界 --url "https://api.mingdao.com/mcp?HAP-Appkey=b37a969f03b3cf0b&HAP-Sign=MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg=="
```

---

## 🔍 验证连通性

### 方法 1：查询数据表

通过 MCP 协议查询应用中的工作表列表。

### 方法 2：执行简单查询

测试 MCP 服务器是否可以正常响应。

---

## ⚠️ 注意事项

1. **Sign 安全性**
   - HAP-Sign 包含敏感信息
   - 不要公开分享完整 URL
   - 定期更新 Sign

2. **平台差异**
   - OpenClaw: `/home/admin/.openclaw/mcp.json`
   - Cursor: `~/.cursor/mcp.json`
   - Claude Code: 使用 `claude mcp add` 命令

3. **类型指定**
   - `"type": "streamable"` 必须指定
   - 这是 HTTP 流式 MCP 的标准配置

---

**安装时间**: 2026-02-28 18:14
**状态**: ✅ 已完成配置，待验证连通性
