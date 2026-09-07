# 声边物业演示页面地图

本项目保留 Stitch 导出的页面结构，以原生 ES Modules、`esbuild` 和浏览器本地 Demo 数据层实现交互。路由定义在 `src/routes.js`；登录状态、业务数据和草稿分别保存在 Session Storage、Local Storage 与 IndexedDB。

## Web 管理端

| 页面 | 路径 | 用途与后续操作 |
| --- | --- | --- |
| 调度概览 | `/web/overview` | 工单摘要、快捷派发、通知、居民与设置入口。 |
| 工单调度 | `/web/work-orders` | 搜索、筛选、派工，进入 `/web/orders/:id` 查看与改派。 |
| 物业支出 | `/web/expenses` | 新建支出、审批、导出与维修基金筛选。 |
| 财务收缴 | `/web/finance` | 查看缴费流水、登记收费项与线下补录。 |
| 融媒体采编 | `/web/media` | 保存草稿、预览并发布周报。 |
| 周报附件 | `/web/media/weekly` | 上传附件、编辑、发布到居民内容详情页。 |
| 广播中心 | `/web/broadcast` | 编辑、发布、撤回，居民首页跨标签页同步。 |
| 集团财务 | `/web/group` | 跨项目余额、调拨和对账。 |

## 工程师端

| 页面 | 路径 | 用途与后续操作 |
| --- | --- | --- |
| 任务接单 | `/worker/tasks` | 待接、处理中、已完成任务切换；接单后跳转打卡。 |
| 打卡与结算 | `/worker/checkin?id=:id` | 到岗、添加耗材、选择结算方式、完工并生成居民账单或支出。 |
| 工单详情 | `/worker/orders/:id` | 查看工单进度，返回任务列表或进入打卡。 |

## 居民移动端

| 页面 | 路径 | 用途与后续操作 |
| --- | --- | --- |
| 首页 | `/mobile/home` | 公告、邻里内容、报修、服务和个人中心入口。 |
| 登录 | `/mobile/login?next=:path` | Demo 登录后回到受保护页面。 |
| 房屋认证 | `/mobile/verify` | 业主确权或租客提交租约，完成后进入个人中心。 |
| 在线报修 | `/mobile/repair` | 校验、上传、提交，进入 `/mobile/orders/:id`。 |
| 工单详情 | `/mobile/orders/:id` | 取消待派工单、缴维修费、完成后评价。 |
| 服务评价 | `/mobile/review?id=:id` | 评价完工工单并一次性发放积分。 |
| 合并账单 | `/mobile/bills` | 按账期和类型支付，生成演示回单。 |
| 分项账单 | `/mobile/billing?tab=:type&bill=:id` | 处理物业、停车和维修等具体账单。 |
| 积分中心 | `/mobile/points` | 兑换、现金加价模拟支付、广播积分和兑换记录。 |
| 便利服务 | `/mobile/services` | 服务分类，进入 `/mobile/services/:id` 预约、收藏或提交闪铺申请。 |
| 声边视听 | `/mobile/media` | 播放音频，进入 `/mobile/articles/:id` 阅读、收藏、分享或报名。 |
| 服务与我的 | `/mobile/profile` | 工单、预约、账期、个人资料和退出登录。 |

## 共享闭环

居民报修 -> 管理端派工 -> 工程师接单/到岗/完工 -> 居民缴费 -> 居民评价/积分。管理端发布广播或周报后，居民端在同一浏览器的其他标签页收到刷新通知。所有 ID 详情使用参数路由而不是复制页面模板。
