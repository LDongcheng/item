# fsj 技术栈与代码风格

## 前端技术栈

| 子项目 | 技术 | 特点 |
|--------|------|------|
| webview | 原生JS + Canvas 2D | 无框架，ES Module |
| merchantDashboard | 原生JS + CSS | 拖拽交互，组件化 |
| wxApp | 微信小程序原生 | 不用uniapp |

## 后端技术栈

| 服务 | 技术 | 用途 |
|------|------|------|
| 打包服务 | Node.js + Express | 小程序代码生成 |
| WebSocket | ws库 | 实时通信（端口3011） |
| 图片处理 | Jimp | 图标颜色叠加 |
| 打包工具 | archiver | ZIP压缩 |

## 数据存储

**主数据库**: 明道云（HAP平台）
- 商家配置JSON格式存储
- 用户数据按merchantId隔离
- `neirong`表统一内容存储

## API封装风格

统一返回结构: `{success, data, error_msg, error_code}`

文件命名: `MingdaoYun<Action>API.js`
- Add/Query/Array/Update

## 小程序代码生成

```
配置JSON → 复制基础框架 → 生成页面代码 → 生成app.json → 下载图片 → ZIP打包
```

**版本管理**: `MINIPROGRAM_VERSION`常量，每次修改必须更新

## Canvas像素风格

- 像素尺寸: 16x16, 32x32, 64x64
- 禁用抗锯齿，保持像素化效果
- 资源存储: `assets/isPixel/`

## 代码规范

- ESLint规范
- Git版本控制
- 中文变量名在WXML中禁用（会触发编译错误）
- 颜色格式统一: `#RRGGBB`

## 禁用事项

- 不使用uniapp（小程序原生）
- WXML中不使用中文变量名
- 不使用NUL（Windows），用`/dev/null`

## API调用规范 ⭐ ⭐ ⭐ 最重要

### Windows 中文乱码问题 - 强制遵守

**规则**：在 Windows 环境下，调用 Coze/HAP API 创建/更新数据时，直接在 curl 命令中写中文会导致后台数据乱码！

**根本原因**：Windows CMD/PowerShell 默认编码与 UTF-8 不兼容

**解决方案**：必须用文件方式发送，确保 UTF-8 编码

```bash
# ❌ 错误方式 - 中文会乱码，后台数据变成乱码
curl -d '{"controls":[{"controlId":"mingcheng","value":"中文内容"}]}'

# ✅ 正确方式 - 写入 UTF-8 文件后发送
# 步骤1：创建请求文件（Write工具自动UTF-8编码）
# 步骤2：用 --data-binary 发送文件
curl -X POST 'https://api.coze.cn/v1/workflow/stream_run' \
-H "Authorization: Bearer TOKEN" \
-H "Content-Type: application/json" \
--data-binary "@request.json"
```

**适用所有场景**：
- fsj-tags（标签拆分）
- fsj-data-update（数据更新）
- hap-12wei-create（12维数据创建）
- **任何涉及中文内容的 API 调用都必须用文件方式**

**操作流程**：
```
1. Write工具创建JSON文件 → 自动UTF-8编码
2. curl --data-binary "@文件路径" 发送
3. 发送后删除临时文件（可选）
```

**Python/Node.js 方式**（无乱码问题）：
```python
# Python - 直接发送即可，requests自动处理编码
response = requests.post(url, data=json.dumps(payload, ensure_ascii=False).encode('utf-8'))
```

---

## 中国镜像优先

- npm/node/python/docker 优先使用国内镜像
- CDN: `cdn.jsdelivr.net`, `unpkg.com`, `cdn.bootcdn.net`