# fsj 项目详细结构

## webview 目录（像素前端）

```
webview/
├── index.html          # SPA入口
├── app.js              # 路由控制（动态import）
├── pages/
│   ├── pixel-canvas/   # 41x41格子画布 + A*寻路 + 角色渲染
│   └── pixel-editor/   # 调色板 + 绘制工具 + 导出
├── assets/isPixel/     # 像素风格素材
├── color.json          # 调色板配置
├── juese.json          # 角色配置
└── ziti.json           # 字体配置
```

**技术特点**: 纯原生JS，无第三方依赖，ES Module模块化

## merchantDashboard 目录（商家后台）

```
merchantDashboard/
├── shouye.html/js      # 首页仪表板
├── store.html/js       # 门店管理
├── components/         # 组件库
│   ├── componentRegistry.js  # 组件注册
│   ├── image.js, text.js, tabs.js...
├── wxApp/utils/        # 明道云API工具
├── node_modules/       # 依赖
└── package.json        # express, archiver, jimp, axios
```

**核心功能**: 页面设计器、组件拖拽、小程序打包下载

## wxApp 目录（微信小程序）

```
wxApp/
├── app.js/json/wxss    # 小程序入口
├── pages/
│   ├── default-page-1/ # 首页
│   ├── default-page-2/ # 我的
│   ├── login/          # 登录
│   └── webview/        # WebView容器
├── utils/              # 明道云API封装
├── images/             # tabBar图标
└── project.config.json # 开发者工具配置
```

**商家绑定**: merchantId `698826f3b35652a8d4f60e21`

## KnowledgeBase 目录（知识库）

```
KnowledgeBase/
├── 01/甲-技术/
│   ├── acq/            # 后天技能（fsj项目技能）
│   └── inn/hap/        # 先天技能（HAP相关）
├── 03/丙-业务/
│   ├── 108只虾/        # AI卡牌训练需求
│   └── 产品/旧版/      # 产品文档
├── 08/癸-任务/
├── 09/戊-信息/
│   └ openclaw/         # OpenClaw学习资料
│   └ 编程/             # 编程技术
├── 12/戊-复盘/
│   └ 训练数据/         # 开发经验记录
└── skills/             # 技能文档
```

## server.js（WebSocket服务）

- 端口: 3011
- 路径: `/ws`
- 功能: 客户端消息转发、心跳检测（30s ping）
- 用途: webview与小程序实时通信

## scripts 目录

```
scripts/
├── create-mingdao-tables.js  # 创建明道云表
├── seed-108-roles.js         # 初始化角色
└── clone-user-worksheet.js   # 克隆工作表
```

## community 目录

社区功能：首页、详情页、发布页（`index.html`, `detail.html`, `publish.html`）