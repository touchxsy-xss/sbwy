# 声边物业后端

当前后端包含 Phase 1 身份、RBAC、物业公司、小区、内部员工和审计底座，已冻结的 Phase 2A 楼栋、单元、房屋、客户和人与房屋关系 API，以及 Phase 2B Work Order / Repair Workflow 后端。居民前端 Demo Store、收费、支付、协同和附件通知尚未迁移。

## 本地运行

1. 准备 PostgreSQL 16，并启动本地开发容器（或提供等价的外部 PostgreSQL）：

```bash
docker compose -f server/docker-compose.yml up -d
```

2. 创建本地环境文件并设置随机的 `SESSION_SECRET`：

```bash
cp server/.env.example server/.env
```

3. 安装依赖、执行全部 migration 和 Phase 1 开发种子：

```bash
pnpm --dir server install --ignore-workspace
pnpm --dir server run db:migrate
pnpm --dir server run db:seed
```

4. 编译并从停止状态启动 API：

```bash
pnpm --dir server run build
pnpm --dir server run start
```

默认健康检查为 `http://localhost:3001/api/v1/health`，OpenAPI 页面为 `/api/docs`。开发时可以用 `pnpm --dir server run dev` 代替 `pnpm --dir server run start`。

## 验证

```bash
pnpm --dir server run build
pnpm --dir server test
```

默认测试包含内存仓储测试。真实 PostgreSQL 集成测试必须使用独立数据库，先执行 migration 和 seed，再显式启用：

```bash
set -a; . server/.env; set +a
(cd server && RUN_POSTGRES_INTEGRATION=1 node --import tsx --test tests/postgres-integration.test.ts)
(cd server && RUN_POSTGRES_INTEGRATION=1 node --import tsx --test tests/postgres-phase2-integration.test.ts)
(cd server && RUN_POSTGRES_INTEGRATION=1 node --import tsx --test tests/postgres-phase2b-work-order.test.ts)
```

Phase 1 和 Phase 2 PostgreSQL suites 必须顺序独立执行，因为二者均会操作同一开发种子用户的 session。Phase 2 集成 fixture 只应在专用测试数据库执行；不要将其指向开发或生产数据库。

## 环境变量

以 `.env.example` 为准。运行 API 必须设置 `DATABASE_URL`、`SESSION_SECRET` 和 `APP_ORIGIN`；`PORT`、`HOST`、`NODE_ENV` 与 `COOKIE_SECURE` 有安全默认值但生产环境应显式设置。四个 `SEED_*_PASSWORD` 变量仅由本地开发种子使用，不是 API 启动必需项。

## 认证约定

- Session 是数据库中的服务端 opaque session，浏览器只持有 HttpOnly Cookie。
- 写操作要求 `sb_csrf` Cookie 与 `X-CSRF-Token` 请求头匹配。
- `APP_ORIGIN` 控制允许携带凭证的前端来源。
- `SEED_ADMIN_PASSWORD` 只用于本地种子，不写入源码。
- `SEED_ADMIN_PASSWORD` 只用于本地开发种子，不写入源码。

## Phase 2B API

工单 API 见 `../docs/phase2b-api-contract.md`。迁移会创建
`work_orders` 和 `work_order_events`，但不会修改居民端页面或报修 Demo
Store。正式状态流转为：待派工、已派工、已接单、已到岗、已完成、已归档；
待派工和已派工允许取消。
