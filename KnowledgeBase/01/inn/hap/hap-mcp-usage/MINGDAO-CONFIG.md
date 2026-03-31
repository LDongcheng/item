# 明道云 MCP 配置文档

## 📦 已配置的 MCP 服务器

### hap-mcp-孚世界

**配置文件**: `/home/admin/.openclaw/mcp.json`

**连接信息**:
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

**应用信息**:
- **名称**: 孚世界
- **类型**: HAP 应用执行 MCP
- **用途**: 操作真实数据（查询/创建/修改/删除）

---

## 🔧 使用场景

### 高频使用场景

1. **项目平台数据查询**
   - 查询项目记录
   - 获取任务状态
   - 统计数据

2. **应用数据操作**
   - 创建新记录
   - 更新现有记录
   - 删除记录

3. **工作流执行**
   - 触发自动化流程
   - 执行批量操作

---

## 📚 相关技能

| 技能 | 用途 |
|------|------|
| `hap-mcp-usage` | MCP 配置和使用 |
| `hap-v3-api` | HAP V3 API 调用 |
| `hap-as-database` | HAP 作为数据库使用 |

---

## 🔍 验证连接

**测试命令**:
```bash
# 检查 MCP 配置文件
cat /home/admin/.openclaw/mcp.json

# 验证 MCP 服务器（需要 MCP 客户端支持）
# 具体命令取决于使用的 AI 工具
```

---

## ⚠️ 注意事项

1. **密钥安全**
   - HAP-Sign 包含敏感信息
   - 不要公开分享完整 URL
   - 定期更新 Sign

2. **配置位置**
   - OpenClaw: `/home/admin/.openclaw/mcp.json`
   - 备份：`KnowledgeBase/config/feng/mcp.json`

3. **类型指定**
   - `"type": "streamable"` 必须指定
   - 这是 HTTP 流式 MCP 的标准配置

---

**最后更新**: 2026-02-28
**配置状态**: ✅ 已完成
