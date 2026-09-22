# 声边物业后端基础

这是 Phase 1 的单体后端底座，当前只覆盖认证、物业公司、小区、内部员工、角色权限和审计日志。现有前端 Demo Store、居民业务和协同模块暂不迁移。

## 本地运行

1. 启动 PostgreSQL：

```bash
docker compose up -d
```

2. 创建本地环境文件并设置随机的 `SESSION_SECRET`：

```bash
cp .env.example .env
```

3. 安装依赖、执行 migration 和开发种子：

```bash
pnpm install --ignore-workspace
pnpm run db:migrate
pnpm run db:seed
```

4. 启动 API：

```bash
pnpm run dev
```

默认地址为 `http://localhost:3001`，OpenAPI 页面为 `/api/docs`。

## 验证

```bash
pnpm run build
pnpm test
```

如果当前 shell 没有 Node.js，需要先把 Node.js 加入 `PATH`。测试使用内存仓储，不会连接或修改真实数据库。

## 认证约定

- Session 是数据库中的服务端 opaque session，浏览器只持有 HttpOnly Cookie。
- 写操作要求 `sb_csrf` Cookie 与 `X-CSRF-Token` 请求头匹配。
- `APP_ORIGIN` 控制允许携带凭证的前端来源。
- `SEED_ADMIN_PASSWORD` 只用于本地种子，不写入源码。
