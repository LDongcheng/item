# MCP 连通性测试报告

## 测试时间
2026-02-28 18:52

---

## 测试项目

### 1. MCP 端点测试

**端点**: `https://api.mingdao.com/mcp`

**测试方法**: JSON-RPC 2.0 initialize 请求

**结果**: ⏳ 无响应（可能超时或需要特定客户端）

```bash
curl -X POST "https://api.mingdao.com/mcp?HAP-Appkey=xxx&HAP-Sign=xxx" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize",...}'
```

---

### 2. V2 API 测试

**端点**: `https://api.mingdao.com/v2/openapi/apps/{appkey}`

**结果**: ❌ 404 - 接口不存在

---

### 3. OpenAPI V2 测试

**端点**: `https://api.mingdao.com/openapi/v2/applications/{appkey}`

**结果**: ❌ 404 - 接口不存在

---

## 分析

### 可能的原因

1. **MCP 需要专用客户端**
   - MCP 协议可能需要通过 MCP Inspector 或类似工具
   - 直接 HTTP 请求可能不被支持

2. **API 端点不正确**
   - 明道云 API 可能有不同的端点格式
   - 需要查看最新的 API 文档

3. **认证方式问题**
   - V3 API 可能需要特殊的签名算法
   - 不仅仅是简单的 apikey header

---

## 解决方案

### 方案 1：安装 MCP Inspector（推荐）

```bash
npm install -g @modelcontextprotocol/inspector
mcp-inspector "https://api.mingdao.com/mcp?HAP-Appkey=xxx&HAP-Sign=xxx"
```

### 方案 2：从明道云后台获取数据表

1. 登录明道云管理后台
2. 进入"孚世界"应用
3. 查看应用设置 → 工作表列表
4. 记录所有工作表的 ID 和名称

### 方案 3：联系明道云技术支持

获取正确的 API 端点和认证方式。

---

## 当前状态

| 项目 | 状态 |
|------|------|
| MCP 配置 | ✅ 已正确配置 |
| MCP 连通性 | ⏳ 待验证 |
| API 访问 | ❌ 端点不正确 |
| 数据表列表 | ⏳ 待获取 |

---

## 下一步建议

**最快的方式**：小粽直接从明道云后台复制数据表列表

1. 登录明道云
2. 进入"孚世界"应用
3. 截图或复制工作表列表
4. 告诉我每个表的名称和用途

这样我们可以跳过 API 测试，直接开始使用数据。

---

**测试人员**: 风 (6c42)
**状态**: ⏳ 等待进一步指示
