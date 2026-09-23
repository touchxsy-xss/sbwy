# Phase 1.1 权限与开发环境加固验收报告

## 结论摘要

- 验收范围：Phase 1.1 权限边界、员工数据范围、浏览器同源开发代理和真实 PostgreSQL 验收。
- 当前分支：`codex/backend-foundation-phase1-hardening`
- 基础提交：`2e6b7b5`
- 代码提交：`b4612306b3bb9287a5d0db3c4ca6de1210834446`（`fix: harden phase1 permission boundaries and dev proxy`）。
- `main`：未修改、未 merge。
- 物业管理员/员工 API 登录失败后是否仍静默 fallback 到 Demo Auth：**NO**。API 模式失败即返回真实 API 错误；Demo Store 仅保留给未迁移业务模块。

整体结论：**CONDITIONAL PASS**。

核心权限和真实数据库验收均通过。之所以保留 CONDITIONAL，是因为仓库默认 `pnpm test` 会跳过需要外部数据库的 PostgreSQL 套件，必须显式设置 `RUN_POSTGRES_INTEGRATION=1` 并加载树莓派 `.env`；此外树莓派工作区还保留了本轮之前的非本项目历史修改，未被删除或覆盖。

## 1. 权限模型加固

### 新增权限

新增并由正式 API 使用：

- `community:read`
- `community:create`
- `community:update`
- `community:disable`

旧的 `community:write` 保留在权限数据中以兼容历史 migration，但创建、修改、停用小区的正式路由不再依赖它。本轮没有修改已发布 migration；seed 会兼容地重建本轮角色的权限关系。

### 最终角色权限

- `PLATFORM_ADMIN`：平台 bypass，允许全部受保护能力。
- `PROPERTY_ADMIN`：`company:read`、`community:read`、`community:create`、`community:update`、`community:disable`、兼容保留的 `community:write`、`employee:read`、`employee:write`、`role:read`、`access:read`、`access:write`。
- `COMMUNITY_MANAGER`：`community:read`、`community:update`、`employee:read`；没有 `community:create`、`community:disable`、`access:read` 或 `access:write`。
- `PROPERTY_STAFF`：`community:read`、`employee:read`，员工列表按授权小区过滤。
- `ENGINEER`：仅 `community:read`。

## 2. 权限边界结果

| 检查项 | 结果 | 证据 |
|---|---|---|
| 项目经理创建 A3 小区 | PASS | 真实 PostgreSQL integration test，HTTP 403 |
| 项目经理修改自己授权的 A1 | PASS | 真实 PostgreSQL integration test，HTTP 200 |
| 项目经理修改 A2 | PASS | 后端范围过滤，HTTP 404 |
| 项目经理停用 A1 | PASS | 真实 PostgreSQL integration test，HTTP 403 |
| A1 项目经理读取 A2 员工 | PASS | SQL `EXISTS` 过滤，A2-only 员工不返回，详情接口 HTTP 404 |
| `PROPERTY_STAFF` 查看员工 | PASS | 只返回自己有效角色关系所在小区范围 |
| A1 项目经理查看/管理 A2 角色授权 | PASS | 角色读取、授予、撤销接口均拒绝 |
| `PROPERTY_ADMIN` 管理 A1、A2、全部员工和角色 | PASS | 真实 integration test 全流程通过 |
| 自我授予高权限角色 | PASS | 普通员工授予 `PROPERTY_ADMIN` 返回 403 |
| A 公司管理员给 B 公司用户授权 | PASS | 跨租户角色授予返回 403 |

员工范围在 Drizzle Repository 的 SQL 层执行：公司管理员使用公司范围条件；社区范围用户使用对有效、未撤销 `user_role_assignments` 的 `EXISTS` 子查询，并限制到 `scope.communityIds`。内存 Repository 同步实现相同边界，前端没有承担安全过滤职责。

## 3. 开发环境 API Proxy

开发服务器 `scripts/server.mjs` 支持：

- `SHENGBIAN_API_PROXY_TARGET=http://192.168.1.51:3001`
- `SHENGBIAN_API_BASE=/api/v1`

浏览器请求 `http://localhost:5191/api/v1/...` 由本地服务器转发到树莓派。代理保留 HTTP method、body、Content-Type、Cookie、Set-Cookie、`X-CSRF-Token`、`X-Request-Id`、响应状态和响应体。树莓派 IP 没有硬编码进业务 API client。

真实浏览器验收通过 Swagger UI 完成：

1. 管理员登录 `http://localhost:5191/web/login`。
2. 代理 POST `/api/v1/employees` 创建测试员工，HTTP 200。
3. 代理 PATCH `/api/v1/employees/{id}` 修改测试员工，HTTP 200。
4. 代理 POST `/api/v1/employees/{id}/disable` 禁用测试员工，HTTP 200。

三次写请求均经过 CSRF token；响应显示 `Access-Control-Allow-Origin: http://localhost:5191` 和 `Access-Control-Allow-Credentials: true`，没有关闭 CSRF、Origin 或 CORS 安全检查。API client 使用 `credentials: include` 和 HttpOnly Cookie；源码没有把 API session token 写入 `localStorage`。前端 Demo Store 仍使用自己的本地存储，这是未迁移 Demo 的既有行为，不是 API 会话存储。

## 4. Compose 和树莓派数据库

`server/docker-compose.yml` 的 `POSTGRES_USER`、`POSTGRES_PASSWORD`、`POSTGRES_DB` 已全部改为环境变量；`.env.example` 仅含 placeholder。真实密码、`SESSION_SECRET`、数据库备份均未写入 Git。

树莓派现状：

- 架构：ARM64；Fastify：`192.168.1.51:3001`。
- PostgreSQL 项目容器：`server-postgres-1`，仅绑定 `127.0.0.1:5433`，不对公网开放。
- 开发数据库：`shengbian_dev`；测试数据库：`shengbian_test`。
- 既有开发数据没有删除；本轮只重建独立测试数据库以执行从零 migration。
- API `/api/v1/health` 真实 HTTP 返回 200：`{"status":"ok","service":"shengbian-property-server"}`。

## 5. Migration、Seed 和真实 PostgreSQL

| 检查项 | 结果 | 证据 |
|---|---|---|
| 现有开发库 migration 升级 | PASS | 树莓派 `pnpm run db:migrate` 成功 |
| 独立测试库从零 migration | PASS | 删除并新建 `shengbian_test` 后从第一个 migration 执行到最新 |
| Seed | PASS | A 公司 A1/A2、B 公司 B1、管理员/经理/工程员工数据可用 |
| 真实 PostgreSQL integration tests | PASS | 树莓派显式加载 `.env` 后 7 个套件、7/7 通过 |
| Argon2id 密码 hash | PASS | 集成测试断言 `$argon2id$` |
| Session token 只保存 hash | PASS | 集成测试断言数据库 token hash 为 64 位十六进制值 |
| Audit Log 脱敏 | PASS | 登录、创建/修改/禁用员工、授权/撤销角色均写入，敏感字段扫描为 0 |

集成套件覆盖 login、错误密码、auth/me、logout、session revoke、disabled user、租户隔离、小区隔离、员工范围、RBAC、自我提权、跨租户授权和审计记录。

## 6. 安全和持久化

| 检查项 | 结果 | 证据 |
|---|---|---|
| 缺失/错误 CSRF 拒绝，正确 token 允许 | PASS | unit/integration + 浏览器真实写请求 |
| 允许 Origin | PASS | `localhost:5191` 代理写请求成功 |
| 未允许 Origin 的写请求拒绝 | PASS | integration test |
| CORS 不使用 `*` 且允许 credentials | PASS | 代码配置 allowlist，浏览器响应返回限定 Origin |
| HttpOnly、SameSite、开发 Secure 配置 | PASS | Cookie 由服务端设置，开发环境 `COOKIE_SECURE=false`，未将 session 放入前端存储 |
| Rate Limit、Request ID、错误响应 | PASS | Fastify 配置及真实响应头包含 `x-request-id` |
| PostgreSQL 重启后数据持久化 | PASS | 重启 `server-postgres-1` 前后 `shengbian_dev` 计数均为公司 2、小区 4、用户 7、审计 41；重启后 API health 仍 200 |
| `pg_dump` 备份 | PASS | 实际生成树莓派 `/tmp/shengbian_dev_phase1_1_20260923081348.sql`，52,973 bytes；未提交 Git |

说明：Compose 当前没有声明 Docker healthcheck，因此容器健康状态字段为空；本轮以 PostgreSQL 查询成功和重启后真实 API 查询成功作为健康验证。

## 7. 代码和回归验证

| 检查项 | 结果 | 结果明细 |
|---|---|---|
| Server TypeScript build | PASS | `pnpm --dir server run build` |
| Server unit tests | PASS | 6 passed；默认 PostgreSQL 套件因未设置开关而 skipped |
| Frontend existing tests | PASS | 8 passed |
| Frontend build | PASS | 20 个页面模板构建完成 |
| Browser E2E | PASS | 登录 + POST + PATCH + disable，4 个真实浏览器操作链路 |
| 树莓派 API 真实 HTTP | PASS | health 200，API 监听 3001 |
| 现有前端 Demo 回归 | PASS | 仅运行既有测试，未迁移报修、工单、收费、支付、积分、评价、内容、广播、预约 |
| Phase 2 / 新业务 | PASS | 未开始、未修改 |

## 8. 资源和 Git

树莓派检查结果：

- CPU：ARM64，load average `0.11, 0.14, 0.09`。
- RAM：7.6 GiB，总可用约 6.9 GiB，Swap 2.0 GiB，当前未使用 Swap。
- 磁盘：根分区 59 GiB，已用 7.0 GiB，可用 49 GiB（13%）。
- uptime：约 19 天 21 小时。
- Docker：daemon 正常；项目 PostgreSQL 容器运行；5433 仅本机监听。

结论：树莓派适合作为当前开发/测试服务器；本报告不作生产环境适用性判断。

Git 状态：

- 当前分支：`codex/backend-foundation-phase1-hardening`。
- 基础提交：`2e6b7b5`。
- 本轮提交：`b4612306b3bb9287a5d0db3c4ca6de1210834446`（代码）以及包含本报告的后续提交。
- `main` 未修改、未 merge、未创建 PR。
- Mac 工作区中本轮代码和报告提交后保持干净。
- 树莓派 checkout 仍有此前人工复制留下的非本轮文件修改和资料目录；本轮没有擅自删除这些历史修改。

## 9. 已知问题和未测试项

1. `server` 的默认 `pnpm test` 为保护性行为，不自动连接外部 PostgreSQL，因此本地显示 6 passed、1 skipped；真实 PostgreSQL 结果以树莓派显式 `RUN_POSTGRES_INTEGRATION=1` 的 7/7 结果为准。
2. Compose 没有 healthcheck 声明；本轮通过真实 SQL、重启后数据和 API health 验证可用性，但没有把 Docker health 状态标为 healthy。
3. 树莓派工作区存在本轮之前的其它项目/资料改动，未纳入本轮 commit，也未删除。
4. 报修、工单、收费、支付、积分、评价、内容、广播、预约仍是 Demo Store；它们没有被报告为真实后端完成。

最终结论：**CONDITIONAL PASS**。
