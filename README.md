# 声边物业（Shengbian Property Demo）

一个覆盖居民、物业运营、维修工程师和集团运营四类角色的物业服务业务演示。项目保留原始页面视觉结构，并在浏览器内实现可验证的业务流、权限边界和数据校验，适合演示物业服务数字化的主要操作链路。

> 这是前端高保真演示项目。业务数据默认存储在浏览器的 Local Storage、Session Storage 和 IndexedDB 中，不连接真实支付、身份认证、文件服务或生产数据库。

## 业务闭环

```text
居民在线报修
  -> 物业调度派工
  -> 工程师接单、到岗、完工结算
  -> 居民支付维修账单
  -> 居民服务评价并获得积分
```

同一浏览器内，物业端发布广播或周报后，居民端其他标签页会通过浏览器存储事件刷新内容。页面间使用真实路由和参数化详情页，不依赖复制页面实现跳转。

## 功能范围

| 角色 | 主要能力 | 入口 |
| --- | --- | --- |
| 居民端 | 房屋认证、在线报修、账单缴费、服务预约、积分兑换、邻里内容、广播与个人中心 | `/mobile/home` |
| 物业运营端 | 工单调度、费用审批、收缴管理、周报发布、紧急广播、居民管理与系统设置 | `/web/overview` |
| 工程师端 | 接单、到岗打卡、耗材与结算、完工照片、任务记录 | `/worker/tasks` |
| 集团运营端 | 项目余额查看、跨项目资金调拨、组织与财务视图 | `/web/group` |

完整路由和页面职责见 [docs/page-map.md](docs/page-map.md)。

## 核心规则

- **工单状态受控流转**：待派工 -> 已派工 -> 已接单 -> 已到岗 -> 已完成 -> 已归档；非法状态转换会被拒绝。
- **到岗 SLA**：工程师接单时生成到岗时限，现场打卡时记录准时或超时结果。
- **结算前置条件**：完工必须有至少一张现场照片；存在维修结算金额时自动生成待缴账单。
- **幂等与原子性模拟**：重复支付、重复评价、重复积分兑换、重复预约会被拦截；模拟支付失败不会扣减积分或写入订单。
- **内容范围控制**：物业运营人员只能向当前小区发布内容；平台全量内容仅允许平台角色创建。
- **浏览器端登录隔离**：不同角色的会话使用独立 Session Storage 键保存，受保护路由会回跳至相应登录页。

## 技术架构

| 层级 | 实现 |
| --- | --- |
| 页面与样式 | 原始 HTML 页面模板、原生 ES Modules、Tailwind CSS 编译产物 |
| 构建 | `esbuild`、PostCSS、Tailwind CSS、Cheerio 页面清理与本地资源映射 |
| 路由与服务 | 原生 Node.js HTTP 服务；静态页和参数化业务详情路由 |
| 状态与附件 | Local Storage、Session Storage、IndexedDB |
| 自动化验证 | Node Test、Playwright（核心闭环、辅助业务链路、页面审计、响应式检查） |
| 部署 | Nginx、Docker Compose |

## 快速开始

### 环境要求

- Node.js 20 或更高版本
- pnpm 9 或更高版本（推荐；仓库含 `pnpm-lock.yaml`）
- 运行浏览器自动化测试时，需要已安装 Google Chrome；Playwright 也可使用其自带浏览器

### 本地运行

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

默认服务地址为 `http://localhost:5173`。如果端口已被占用，服务会自动尝试下一个端口。开发时可以使用：

```bash
pnpm dev
```

常用入口：

```text
物业运营端  http://localhost:5173/web/overview
工程师端    http://localhost:5173/worker/tasks
居民端      http://localhost:5173/mobile/home
集团运营端  http://localhost:5173/web/group
```

受保护页面会跳转到演示登录页。勾选页面协议后提交即可进入相应角色的演示会话；不需要真实手机号或密码。

### 使用 Docker Compose

仓库已提交构建后的 `dist/`，可直接启动 Nginx 静态服务：

```bash
docker compose -f deploy/demo/compose.yaml up --build -d
```

服务默认发布到 `http://localhost:5180`。停止服务：

```bash
docker compose -f deploy/demo/compose.yaml down
```

## 开发命令

| 命令 | 说明 |
| --- | --- |
| `pnpm assets` | 处理和生成静态资源映射。 |
| `pnpm build` | 从页面模板生成 `dist/`、编译样式和脚本、更新交互清单。 |
| `pnpm dev` | 先构建，再启动本地开发服务。 |
| `pnpm start` | 启动已有 `dist/` 的本地静态服务。 |
| `pnpm test` | 执行状态层单元测试。 |
| `pnpm test:e2e` | 执行 Playwright 核心业务闭环测试。 |

以下检查脚本在启动本地服务后执行：

```bash
node tests/secondary.mjs
node tests/audit.mjs
node tests/responsive.mjs
```

可通过 `DEMO_URL` 指向非默认的测试环境，例如：

```bash
DEMO_URL=http://localhost:5180 node tests/e2e.mjs
```

## 验证覆盖

核心端到端测试覆盖以下业务路径：

1. 受保护路由、登录校验和回跳地址。
2. 居民报修的输入校验、确认提交和持久化。
3. 物业查询、派工和工单状态同步。
4. 工程师接单、到岗 SLA、完工结算和账单生成。
5. 居民支付失败重试、电子回单、评价与积分一次性发放。
6. 积分兑换、服务预约、支出审批和集团资金调拨。
7. 广播跨标签刷新、周报草稿与发布范围控制。

`tests/audit.mjs` 会遍历全部页面，检查页面错误、HTTP 错误、失效图片、未绑定交互控件和死链接；`tests/responsive.mjs` 在 320 至 1920 像素宽度下检查横向溢出和固定头部控件越界。

## 项目结构

```text
.
├── src/                 # 交互逻辑、路由、数据模型和页面功能模块
│   ├── data/            # 演示种子数据和构建时提取的页面数据
│   ├── pages/           # 居民端、运营端、内容业务模块
│   └── services/        # 浏览器存储、附件和音频服务
├── web/                 # 物业端和工程师端原始页面模板
├── 小程序/              # 居民端原始页面模板
├── public/assets/       # 本地静态图片、字体和音频资源
├── scripts/             # 资源处理、构建和本地 HTTP 服务
├── tests/               # 单元、端到端、审计和响应式测试
├── docs/                # 路由地图和构建出的交互清单
├── dist/                # 已构建的部署产物
└── deploy/demo/         # Nginx 与 Docker Compose 配置
```

## 数据与安全边界

- 所有业务记录都是演示数据，仅保存在当前浏览器；清除站点数据后将恢复初始状态。
- "支付成功/失败"、登录、通知、文件上传和电子回单均为本地模拟，不会产生真实扣款、发送消息或上传到外部服务。
- 不应将任何生产个人信息、真实支付凭证或私密附件填入演示环境。
- 若要接入生产环境，需要将浏览器存储层替换为具备认证、权限控制、审计、并发控制和数据备份能力的服务端 API。

## 部署说明

`deploy/demo/Dockerfile` 使用 `nginx:stable-alpine` 提供已构建的静态文件；`deploy/demo/nginx.conf` 为 Web、工程师和居民端路由提供重写规则。每次修改模板或 `src/` 后，请先执行 `pnpm build`，再构建 Docker 镜像，以确保 `dist/` 与源码一致。

## 维护提示

- 新增页面时，同时更新 `src/routes.js`、`docs/page-map.md` 以及 Nginx 路由规则。
- 修改业务状态时，先扩展 `src/services/store.js` 的迁移与状态流转规则，再补充单元测试和端到端测试。
- 更新页面模板后运行 `pnpm build`；构建过程会刷新 `src/data/source.json` 和 `docs/interaction-inventory.json`。
- `test-results/` 是本地测试输出，故意不提交；可用于排查自动化失败和查看页面截图。

## 许可与使用

本仓库用于产品演示和内部评估。使用前请根据实际业务、素材来源和部署环境补充适用的许可证、隐私政策及合规说明。
