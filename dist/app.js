// src/routes.js
var pages = [
  { key: "overview", path: "/web/overview", file: "web/_1/code.html", name: "\u8C03\u5EA6\u6982\u89C8\u5DE5\u4F5C\u53F0", group: "web", level: 1 },
  { key: "work-orders", path: "/web/work-orders", file: "web/_2/code.html", name: "\u5DE5\u5355\u6D3E\u53D1\u4E0E\u8C03\u5EA6", group: "web", level: 1 },
  { key: "expenses", path: "/web/expenses", file: "web/_3/code.html", name: "\u7269\u4E1A\u652F\u51FA\u7BA1\u7406", group: "web", level: 1 },
  { key: "finance", path: "/web/finance", file: "web/_4/code.html", name: "\u7269\u4E1A\u8D22\u52A1\u6536\u7F34\u4E2D\u5FC3", group: "web", level: 1 },
  { key: "weekly", path: "/web/media", file: "web/_6/code.html", name: "\u5468\u62A5\u9644\u4EF6\u4E0A\u4F20", group: "web", level: 1 },
  { key: "broadcast", path: "/web/broadcast", file: "web/_7/code.html", name: "\u7D27\u6025\u901A\u77E5\u4E0E\u5E7F\u64AD", group: "web", level: 1 },
  { key: "checkin", path: "/worker/checkin", file: "web/_8/code.html", name: "\u73B0\u573A\u6253\u5361\u4E0E\u5B8C\u5DE5\u7ED3\u7B97", group: "worker", level: 2 },
  { key: "tasks", path: "/worker/tasks", file: "web/_9/code.html", name: "\u5E08\u5085\u4EFB\u52A1\u63A5\u5355", group: "worker", level: 1 },
  { key: "group", path: "/web/group", file: "web/_10/code.html", name: "\u96C6\u56E2\u8FD0\u8425\u4E2D\u67A2", group: "web", level: 1 },
  { key: "home", path: "/mobile/home", file: "\u5C0F\u7A0B\u5E8F/_1/code.html", name: "\u5C45\u6C11\u9996\u9875", group: "mobile", level: 1, public: true },
  { key: "login", path: "/mobile/login", file: "\u5C0F\u7A0B\u5E8F/_2/code.html", name: "\u5C45\u6C11\u767B\u5F55", group: "mobile", level: 2, public: true },
  { key: "verify", path: "/mobile/verify", file: "\u5C0F\u7A0B\u5E8F/_3/code.html", name: "\u5B9E\u540D\u4E0E\u623F\u5C4B\u786E\u6743", group: "mobile", level: 2, public: true },
  { key: "review", path: "/mobile/review", file: "\u5C0F\u7A0B\u5E8F/_4/code.html", name: "\u7EF4\u4FEE\u670D\u52A1\u8BC4\u4EF7", group: "mobile", level: 3 },
  { key: "media", path: "/mobile/media", file: "\u5C0F\u7A0B\u5E8F/_5/code.html", name: "\u58F0\u8FB9\u89C6\u542C", group: "mobile", level: 1, public: true },
  { key: "services", path: "/mobile/services", file: "\u5C0F\u7A0B\u5E8F/_6/code.html", name: "\u7269\u4E1A\u4FBF\u5229\u4E0E\u90BB\u5C45\u95EA\u94FA", group: "mobile", level: 1, public: true },
  { key: "bills", path: "/mobile/bills", file: "\u5C0F\u7A0B\u5E8F/_7/code.html", name: "\u5408\u5E76\u7F34\u8D39\u8D26\u5355", group: "mobile", level: 2 },
  { key: "repair", path: "/mobile/repair", file: "\u5C0F\u7A0B\u5E8F/_8/code.html", name: "\u5728\u7EBF\u62A5\u4FEE", group: "mobile", level: 2 },
  { key: "profile", path: "/mobile/profile", file: "\u5C0F\u7A0B\u5E8F/_9/code.html", name: "\u670D\u52A1\u4E0E\u6211\u7684", group: "mobile", level: 1 },
  { key: "billing", path: "/mobile/billing", file: "\u5C0F\u7A0B\u5E8F/_10/code.html", name: "\u5206\u9879\u6536\u8D39\u8D26\u5355", group: "mobile", level: 2 },
  { key: "points", path: "/mobile/points", file: "\u5C0F\u7A0B\u5E8F/_11/code.html", name: "\u58F0\u8FB9\u79EF\u5206\u4E0E\u5151\u6362", group: "mobile", level: 2 }
];
var navRoutes = {
  overview: "/web/overview",
  "work-orders": "/web/work-orders",
  "finance-center": "/web/finance",
  "expense-management": "/web/expenses",
  "property-expenses": "/web/expenses",
  "property-expenditure": "/web/expenses",
  "reserve-fund-expense": "/web/expenses?fund=maintenance",
  "maintenance-fund-expenses": "/web/expenses?fund=maintenance",
  "maintenance-fund": "/web/expenses?fund=maintenance",
  "media-editor": "/web/media",
  "weekly-media": "/web/media",
  "broadcast-dispatcher": "/web/broadcast",
  "property-residents": "/web/overview?panel=residents",
  "system-settings": "/web/overview?panel=settings",
  login: "/web/login",
  home: "/mobile/home",
  "media-audio": "/mobile/media",
  "neighborhood-community": "/mobile/services",
  "services-profile": "/mobile/profile",
  "task-orders": "/worker/tasks",
  "ongoing-tasks": "/worker/tasks?status=accepted",
  "completed-records": "/worker/tasks?status=completed",
  "profile-center": "/worker/tasks?panel=account",
  "financial-overview": "/web/group",
  "collection-comparison": "/web/group?section=matrix-table",
  "expenditure-reconciliation": "/web/group?section=matrix-table&view=expenditure",
  "capital-pool": "/web/group?section=capital",
  "project-matrix": "/web/group?section=matrix-table",
  "work-order-kanban": "/web/work-orders",
  "converged-media": "/web/media",
  "organization-permissions": "/web/group?panel=settings",
  "group-center": "/web/group"
};
function matchRoute(pathname) {
  const direct = pages.find((p) => p.path === pathname);
  if (direct) return direct;
  if (pathname === "/web/login" || pathname === "/worker/login") return { ...pages.find((p) => p.key === "login"), path: pathname, group: pathname.split("/")[1] };
  if (/^\/(mobile|web|worker)\/orders\/[^/]+$/.test(pathname)) {
    const group2 = pathname.split("/")[1];
    return { ...pages.find((p) => p.key === (group2 === "web" ? "work-orders" : group2 === "worker" ? "tasks" : "profile")), detail: "order" };
  }
  if (/^\/mobile\/articles\/[^/]+$/.test(pathname)) return { ...pages.find((p) => p.key === "media"), detail: "article" };
  if (/^\/mobile\/services\/[^/]+$/.test(pathname)) return { ...pages.find((p) => p.key === "services"), detail: "service" };
  return null;
}

// src/data/seed.js
var statuses = { pending: "\u5F85\u6D3E\u53D1", assigned: "\u5F85\u63A5\u5355", accepted: "\u5DF2\u63A5\u5355", arrived: "\u5DF2\u5230\u8FBE", processing: "\u5904\u7406\u4E2D", completed: "\u5F85\u7F34\u8D39 / \u5F85\u8BC4\u4EF7", closed: "\u5DF2\u5F52\u6863", cancelled: "\u5DF2\u53D6\u6D88" };
var technicians = ["\u5F20\u5EFA\u56FD", "\u738B\u5FB7\u5229", "\u5218\u5EFA\u519B", "\u9648\u5927\u534E"];
var organization = {
  platform: { id: "shengbian", name: "\u58F0\u8FB9\u5E73\u53F0" },
  companies: [
    { id: "property-a", name: "\u7269\u4E1A\u516C\u53F8 A" },
    { id: "property-b", name: "\u7269\u4E1A\u516C\u53F8 B" },
    { id: "partner", name: "\u5176\u4ED6\u5408\u4F5C\u5C0F\u533A" }
  ],
  communities: [
    { id: "pengyi", name: "\u5F6D\u4E00\u5C0F\u533A", companyId: "property-a" },
    { id: "penger", name: "\u5F6D\u4E8C\u65B0\u6751", companyId: "property-a" },
    { id: "jinxiu", name: "\u9526\u7EE3\u534E\u5EAD", companyId: "property-a" },
    { id: "lvzhou", name: "\u7EFF\u6D32\u5BB6\u56ED", companyId: "property-b" }
  ]
};
var arrivalPolicies = {
  urgent: { minutes: 30, label: "\u52A0\u6025\u5DE5\u5355\u63A5\u5355\u540E 30 \u5206\u949F\u5185\u5230\u5C97" },
  standard: { minutes: 120, label: "\u5E38\u89C4\u5DE5\u5355\u63A5\u5355\u540E 120 \u5206\u949F\u5185\u5230\u5C97" }
};
var communityById = (id2, data = organization) => data.communities.find((c) => c.id === id2);
function isContentVisible(item, communityId) {
  const audience = item.audience || "community";
  return audience === "platform" || audience === "community" && (item.communityIds || ["pengyi"]).includes(communityId);
}
function contentAudienceText(item, data = organization) {
  if ((item.audience || "community") === "platform") return "\u58F0\u8FB9\u5E73\u53F0\u7EDF\u4E00\u53D1\u5E03";
  const communities = (item.communityIds || ["pengyi"]).map((id2) => communityById(id2, data)?.name || id2);
  return communities.length === 1 ? `${communities[0]}\u4E13\u5C5E\u5185\u5BB9` : `\u5B9A\u5411\u53D1\u5E03\u81F3 ${communities.join("\u3001")}`;
}
function arrivalStatus(order, at = Date.now()) {
  if (!order.acceptedAt || !order.arrivalDueAt) return { state: "not_started", text: "\u63A5\u5355\u540E\u5F00\u59CB\u8BA1\u7B97\u5230\u5C97\u65F6\u9650" };
  const dueAt = new Date(order.arrivalDueAt).getTime();
  const actualAt = order.checkinAt ? new Date(order.checkinAt).getTime() : at;
  const deltaMinutes = Math.max(0, Math.ceil(Math.abs(actualAt - dueAt) / 6e4));
  if (order.checkinAt) return actualAt <= dueAt ? { state: "on_time", text: `\u5DF2\u51C6\u65F6\u5230\u5C97\uFF08\u63D0\u524D ${deltaMinutes} \u5206\u949F\uFF09`, deltaMinutes } : { state: "overdue", text: `\u5DF2\u8D85\u65F6\u5230\u5C97 ${deltaMinutes} \u5206\u949F`, deltaMinutes };
  return at <= dueAt ? { state: "counting", text: `\u8DDD\u5230\u5C97\u65F6\u9650\u5269\u4F59 ${Math.ceil((dueAt - at) / 6e4)} \u5206\u949F`, dueAt: order.arrivalDueAt } : { state: "overdue", text: `\u5DF2\u8D85\u8FC7\u5230\u5C97\u65F6\u9650 ${deltaMinutes} \u5206\u949F`, deltaMinutes, dueAt: order.arrivalDueAt };
}
var products = [
  { id: "ac-group", name: "\u5168\u5C4B\u7A7A\u8C03\u6DF1\u5EA6\u62C6\u6D17\u6740\u83CC", price: 88, category: "\u5BB6\u7535\u62C6\u6D17\u517B\u62A4" },
  { id: "waterproof", name: "\u9633\u53F0\u7A97\u53F0\u9632\u6C34\u5FAE\u6392\u67E5", price: 0, category: "\u7A7A\u95F4\u5FAE\u6539\u7115\u65B0" },
  { id: "vegetables", name: "\u90BB\u91CC\u7279\u4F9B\u6709\u673A\u679C\u852C\u7BB1", price: 59, category: "\u4EA7\u5730\u7504\u9009\u751F\u9C9C" },
  { id: "dumplings", name: "\u674E\u963F\u59E8\u79C1\u623F\u6C34\u997A/\u70D8\u7119", price: 25, category: "\u90BB\u5C45\u95EA\u94FA" },
  { id: "computer", name: "\u738B\u5DE5\u7535\u8111\u88C5\u673A\u4E0E\u6E05\u7070", price: 30, category: "\u90BB\u5C45\u95EA\u94FA" },
  { id: "stroller", name: "\u8F7B\u4FBF\u905B\u5A03\u795E\u5668\u514D\u62BC\u79DF", price: 15, category: "\u90BB\u5C45\u95EA\u94FA" },
  { id: "pet", name: "\u8BFE\u4F59\u4EE3\u905B\u72D7/\u4E0A\u95E8\u5582\u5BA0", price: 18, category: "\u5EB7\u517B\u4E0E\u5BA0\u7269\u6258\u517B" },
  { id: "ac", name: "\u4E2D\u592E\u7A7A\u8C03\u9AD8\u6E29\u718F\u84B8\u6D88\u6740", price: 99, category: "\u5BB6\u7535\u62C6\u6D17\u517B\u62A4" },
  { id: "screen", name: "304\u91D1\u521A\u7F51\u7EB1\u7A97\u5B9A\u5236\u6362\u65B0", price: 120, category: "\u7A7A\u95F4\u5FAE\u6539\u7115\u65B0" },
  { id: "peach", name: "\u9AD8\u5C71\u871C\u6843\u793C\u76D2(8\u679A\u7279\u7EA7)", price: 68, category: "\u4EA7\u5730\u7504\u9009\u751F\u9C9C" }
];
var rewards = [
  { id: "coupon50", name: "50\u5143\u7269\u4E1A\u8D39\u62B5\u7528\u5238", points: 500, cash: 0, category: "deduction", coupon: 50 },
  { id: "cleaning", name: "\u6DF1\u5EA6\u6CB9\u70DF\u673A\u9AD8\u6E29\u6E05\u6D17", points: 1200, cash: 49, category: "convenience" },
  { id: "tools", name: "\u4FBF\u6C11\u4E94\u91D1\u5168\u5957\u5DE5\u5177\u7BB1", points: 100, cash: 0, category: "convenience" },
  { id: "parking30", name: "30\u5143\u4E34\u505C\u901A\u7528\u62B5\u6263\u5238", points: 300, cash: 0, category: "deduction", coupon: 30 },
  { id: "rice", name: "\u9ED1\u571F\u9999 \u4E94\u5E38\u5927\u7C73 5kg", points: 1500, cash: 0, category: "life" },
  { id: "oil", name: "\u9AD8\u5C71\u51B7\u538B\u91CE\u751F\u5C71\u8336\u6CB9 500ml", points: 1800, cash: 0, category: "life" },
  { id: "toy", name: "\u58F0\u8FB9FM\u9650\u91CF\u5B9A\u5236\u76F2\u76D2", points: 800, cash: 0, category: "culture" },
  { id: "movie", name: "\u793E\u533A\u9732\u5929\u7535\u5F71VIP\u5EA7\u7968", points: 200, cash: 0, category: "culture" }
];
var articles = [
  { id: "garden", title: "\u5C0F\u533A\u7EFF\u5316\u5347\u7EA7\u6539\u9020\u73B0\u573A\u76F4\u51FB\uFF1A\u5320\u5FC3\u4FEE\u526A\u5B9E\u5F55", body: "\u73AF\u5883\u7EFF\u5316\u90E8\u5B8C\u6210\u56ED\u533A\u7EFF\u7BF1\u4FEE\u526A\u4E0E\u82B1\u5349\u8865\u683D\u3002\u65BD\u5DE5\u533A\u57DF\u5DF2\u6E05\u7406\uFF0C\u6B65\u884C\u901A\u9053\u6062\u590D\u901A\u884C\u3002\u6B22\u8FCE\u5C45\u6C11\u901A\u8FC7\u90BB\u91CC\u5708\u63D0\u51FA\u5EFA\u8BAE\u3002", kind: "article", audience: "community", communityIds: ["pengyi"] },
  { id: "elevator", title: "\u7535\u68AF\u7EF4\u4FDD\u6DF1\u5EA6\u5B9E\u5F55\uFF1A\u5B88\u62A4\u5782\u76F4\u51FA\u884C\u7684\u6BCF\u4E00\u7A0B", body: "\u5DE5\u7A0B\u7EF4\u4FDD\u7EC4\u5B8C\u6210\u7535\u68AF\u5236\u52A8\u7CFB\u7EDF\u3001\u94A2\u4E1D\u7EF3\u548C\u5E94\u6025\u547C\u53EB\u8BBE\u5907\u4E13\u9879\u68C0\u67E5\uFF0C\u7EF4\u4FDD\u7ED3\u679C\u5DF2\u5907\u6848\u3002\u4E58\u68AF\u5F02\u5E38\u8BF7\u53CA\u65F6\u8054\u7CFB\u7269\u4E1A\u3002", kind: "video", audience: "platform", publisher: "\u58F0\u8FB9\u5E73\u53F0" },
  { id: "festival", title: "\u672C\u5468\u516D\u9732\u5929\u7535\u5F71\u8282\u4E0E\u8DF3\u86A4\u591C\u5E02\u644A\u4F4D\u62A5\u540D\u5F00\u542F", body: "\u65F6\u95F4\uFF1A\u672C\u5468\u516D 18:30\u3002\u5730\u70B9\uFF1A\u4E2D\u592E\u8349\u576A\u3002\u6BCF\u6237\u53EF\u9884\u8BA2\u4E00\u4E2A\u644A\u4F4D\uFF0C\u53C2\u4E0E\u5BB6\u5EAD\u8BF7\u81EA\u5907\u73AF\u4FDD\u6536\u7EB3\u888B\u3002\u96E8\u5929\u5C06\u63D0\u524D\u901A\u77E5\u987A\u5EF6\u3002", kind: "activity" },
  { id: "safety", title: "\u751F\u6D3B\u8D34\u58EB\uFF1A\u590F\u5B63\u7A7A\u8C03\u81EA\u6D01\u4E0E\u7528\u7535\u5B89\u5168\u6307\u5357", body: "\u6E05\u6D01\u7A7A\u8C03\u524D\u8BF7\u65AD\u5F00\u7535\u6E90\u3002\u8FC7\u6EE4\u7F51\u6D17\u51C0\u667E\u5E72\u540E\u518D\u5B89\u88C5\u3002\u9047\u5230\u5F02\u5473\u6216\u8DF3\u95F8\u5E94\u7ACB\u5373\u505C\u673A\uFF0C\u5E76\u8054\u7CFB\u6301\u8BC1\u5DE5\u7A0B\u5E08\u68C0\u67E5\u3002", kind: "audio", audience: "platform", publisher: "\u58F0\u8FB9\u5E73\u53F0" },
  { id: "storm", title: "\u53F0\u98CE\u5929\u91CC\u768424\u5C0F\u65F6\uFF1A\u7269\u4E1A\u9632\u6C5B\u9006\u884C\u65E5\u8BB0\uFF0C\u6BCF\u4E00\u4EFD\u5B89\u5FC3\u90FD\u6709\u4EBA\u5F7B\u591C\u672A\u7720", body: "\u66B4\u96E8\u503E\u76C6\u7684\u51CC\u6668\u4E24\u70B9\uFF0C\u5730\u4E0B\u8F66\u5E93\u6392\u6C34\u6CF5\u623F\u8B66\u62A5\u54CD\u8D77\u3002\u5DE5\u7A0B\u4E3B\u7BA1\u5E26\u9886\u73ED\u7EC4\u8FDE\u7EED\u594B\u6218\uFF0C\u6E05\u7406\u6392\u6C34\u53E3\u3001\u68C0\u67E5\u5E94\u6025\u7535\u6E90\u3001\u94FA\u8BBE\u6321\u6C34\u677F\u3002\u7BA1\u5BB6\u968F\u540E\u8D70\u8BBF\u4F4E\u5C42\u4F4F\u6237\uFF0C\u786E\u8BA4\u65E0\u6F0F\u6C34\u9690\u60A3\u3002", kind: "article" },
  { id: "plants", title: "\u6625\u5B63\u7EFF\u5316\u7FFB\u65B0\u8BA1\u5212\u516C\u5E03\uFF1A\u6211\u4EEC\u4E3A\u5C0F\u533A\u6DFB\u7F6E\u4E86800\u682A\u5F00\u82B1\u704C\u6728", body: "\u6625\u5B63\u66F4\u65B0\u4EE5\u672C\u5730\u8010\u9634\u690D\u7269\u4E3A\u4E3B\uFF0C\u5206\u533A\u9519\u5CF0\u65BD\u5DE5\uFF0C\u4FDD\u7559\u5C45\u6C11\u6D3B\u52A8\u7A7A\u95F4\u3002\u704C\u6728\u517B\u62A4\u671F\u8BF7\u52FF\u8E29\u8E0F\u7EFF\u5730\u3002", kind: "article" },
  { id: "tank", title: "3\u5206\u949F\u770B\u61C2\u4E8C\u6B21\u4F9B\u6C34\u6C34\u7BB1\u6DF1\u5EA6\u6E05\u6D17\u6D88\u6BD2\u5168\u8FC7\u7A0B", body: "\u4F5C\u4E1A\u5305\u542B\u6392\u7A7A\u3001\u6E05\u6D01\u3001\u6D88\u6BD2\u3001\u590D\u68C0\u56DB\u4E2A\u73AF\u8282\u3002\u6C34\u8D28\u68C0\u6D4B\u5408\u683C\u540E\u6062\u590D\u4F9B\u6C34\u3002\u539F\u8BBE\u8BA1\u672A\u9644\u89C6\u9891\u539F\u7247\uFF0C\u6B64\u5904\u4FDD\u7559\u56FE\u6587\u7EAA\u5B9E\u4E0E\u4E0A\u4F20\u89C6\u9891\u64AD\u653E\u5165\u53E3\u3002", kind: "video" },
  { id: "security", title: "\u4FDD\u5B89\u5C0F\u54E5\u7684\u6668\u95F4\u786C\u6838\u9632\u66B4\u6F14\u7EC3\uFF0C\u5B89\u5168\u611F\u76F4\u63A5\u62C9\u6EE1\uFF01", body: "\u79E9\u5E8F\u7EF4\u62A4\u961F\u5B8C\u6210\u6668\u95F4\u5E94\u6025\u6F14\u7EC3\uFF0C\u68C0\u67E5\u9632\u62A4\u88C5\u5907\u3001\u8054\u7EDC\u6D41\u7A0B\u4E0E\u758F\u6563\u8DEF\u7EBF\u3002\u539F\u8BBE\u8BA1\u672A\u9644\u89C6\u9891\u539F\u7247\u3002", kind: "video" },
  { id: "radio", title: "\u697C\u680B\u7BA1\u5BB6\u8001\u5F20\u7684\u5341\u5E74\u8BB0\u5FC6", body: "\u8FD9\u91CC\u662F\u58F0\u8FB9\u793E\u533A\u7535\u53F0\u3002\u5927\u5BB6\u597D\uFF0C\u6211\u662F\u60A8\u7684\u793E\u533A\u7BA1\u5BB6\u3002\u5341\u5E74\u6765\uFF0C\u4ECE\u4E00\u6B21\u6C34\u7BA1\u7EF4\u4FEE\u5230\u4E00\u573A\u90BB\u91CC\u6D3B\u52A8\uFF0C\u6211\u4EEC\u59CB\u7EC8\u8BA4\u771F\u5BF9\u5F85\u6BCF\u4E00\u4EF6\u5C0F\u4E8B\u3002\u4ECA\u65E5\u63D0\u9192\uFF1A\u5916\u51FA\u8BF7\u68C0\u67E5\u95E8\u7A97\u548C\u7535\u6E90\uFF0C\u9047\u5230\u7269\u4E1A\u95EE\u9898\u53EF\u4EE5\u5728\u7EBF\u63D0\u4EA4\u62A5\u4FEE\u3002\u611F\u8C22\u6BCF\u4E00\u4F4D\u90BB\u5C45\u7684\u7406\u89E3\u4E0E\u652F\u6301\u3002", kind: "audio" }
];
function initialState() {
  const now2 = (/* @__PURE__ */ new Date()).toISOString();
  const orders2 = [
    ["GD2024062801", "\u53A8\u623F\u4E3B\u6C34\u7BA1\u63A5\u53E3\u6E17\u6F0F", "16-2-502", "pending", "\u6C34\u6696\u536B\u6D74", true],
    ["GD2024062804", "\u5165\u6237\u603B\u7A7A\u5F00\u8DF3\u95F8\u540E\u65E0\u6CD5\u63A8\u4E0A", "08-1-1204", "pending", "\u5F3A\u5F31\u7535\u8DEF", true],
    ["GD2024062803", "\u5355\u5143\u4EBA\u8138\u8BC6\u522B\u95E8\u7981\u53CD\u5E94\u8FDF\u7F13", "22\u53F7\u697C\u897F\u95E8", "accepted", "\u95E8\u7981\u5B89\u9632", false],
    ["GD2024062802", "\u8FDE\u5ECA\u9632\u6ED1\u6761\u677E\u52A8\u52A0\u56FA", "\u4E2D\u5EAD\u9633\u5149\u8FDE\u5ECA", "processing", "\u516C\u533A\u4FEE\u7F2E", false],
    ["GD2024062788", "\u5EAD\u9662\u4E54\u6728\u67AF\u679D\u4FEE\u526A\u4E0E\u6E05\u7406", "12-2-101", "closed", "\u7EFF\u5316\u4FDD\u6D01", false],
    ["BX202407220038", "\u6C34\u9F99\u5934\u6E17\u6C34\u7EF4\u4FEE\u4E0E\u7BA1\u9053\u63A5\u53E3\u66F4\u6362", "16-2-502", "completed", "\u6C34\u6696\u536B\u6D74", false],
    ["SB20241028093", "\u5BA2\u5385\u5438\u9876\u706F\u5F00\u706F\u5373\u8DF3\u95F8", "8-1-301", "pending", "\u5F3A\u5F31\u7535\u8DEF", false],
    ["SB20241028094", "\u53A8\u623F\u51B7\u6C34\u89D2\u9600\u8001\u5316\u66F4\u6362", "12-4-102", "pending", "\u6C34\u6696\u536B\u6D74", false]
  ].map(([id2, title, room, status, category, urgent], i) => ({
    id: id2,
    title,
    description: title,
    room,
    status,
    category,
    urgent,
    contact: "\u674E\u5973\u58EB",
    phone: "13800006688",
    technician: status === "pending" ? "" : technicians[i % 4],
    appointment: now2.slice(0, 10) + " \u4E0B\u5348 14:00 - 16:30",
    createdAt: now2,
    amount: 0,
    paid: true,
    scope: i === 3 ? "public" : "private",
    photos: [],
    companyId: "property-a",
    communityId: "pengyi",
    sla: { arrivalMinutes: urgent ? arrivalPolicies.urgent.minutes : arrivalPolicies.standard.minutes },
    ...status === "accepted" || status === "arrived" || status === "processing" || status === "completed" || status === "closed" ? {
      acceptedAt: now2,
      arrivalDueAt: new Date(Date.now() + (urgent ? arrivalPolicies.urgent.minutes : arrivalPolicies.standard.minutes) * 6e4).toISOString()
    } : {},
    timeline: [{ status: "pending", label: "\u5C45\u6C11\u63D0\u4EA4\u62A5\u4FEE", at: now2 }, ...status !== "pending" ? [{ status, label: statuses[status], at: now2 }] : []]
  }));
  return {
    version: 2,
    organization: structuredClone(organization),
    contexts: { property: { companyId: "property-a", communityId: "pengyi" }, worker: { companyId: "property-a", communityId: "pengyi" } },
    user: { id: "resident-1", name: "\u674E\u5973\u58EB", phone: "13800006688", room: "16-2-502", area: 98, community: "\u5F6D\u4E00\u5C0F\u533A", communityId: "pengyi", verified: true, role: "owner", points: 2480 },
    orders: orders2,
    products,
    articles: structuredClone(articles),
    rewards,
    bills: [
      { id: "property-legacy", title: "2024\u5E74\u7B2C\u4E8C\u5B63\u5EA6\u7269\u4E1A\u670D\u52A1\u8D39", amount: 823.2, type: "property", book: "legacy" },
      { id: "parking-legacy", title: "2024\u5E745\u6708-6\u6708\u4EA7\u6743\u8F66\u4F4D\u7BA1\u7406\u8D39", amount: 160, type: "parking", book: "legacy" },
      { id: "property-current", title: "2024\u5E74\u7B2C\u4E09\u5B63\u5EA6\u7269\u4E1A\u670D\u52A1\u8D39\uFF08\u542B\u516C\u644A\uFF09", amount: 983.2, type: "property", book: "current" },
      { id: "parking-current", title: "2024\u5E74\u7B2C\u4E09\u5B63\u5EA6\u5730\u4E0B\u505C\u8F66\u670D\u52A1\u8D39", amount: 450, type: "parking", book: "current" },
      { id: "other-current", title: "2024\u5E747\u6708\u516C\u5171\u7EF4\u4FEE\u4E0E\u80FD\u8017\u4EE3\u6263", amount: 128.5, type: "others", book: "current" }
    ].map((b) => ({ ...b, paid: false, room: "16-2-502" })),
    payments: [],
    expenses: [],
    transfers: [],
    bookings: [],
    redemptions: [],
    coupons: [],
    reviews: [],
    pointsLog: [{ id: "opening", delta: 2480, reason: "\u671F\u521D\u6F14\u793A\u79EF\u5206", at: now2 }],
    notices: [{ id: "notice-initial", title: "\u5173\u4E8E\u793E\u533A\u4E8C\u6B21\u4F9B\u6C34\u6C34\u7BB1\u6E05\u6D17\u7684\u901A\u77E5", body: "\u672C\u5468\u56DB 14:00 \u81F3 18:00 \u5F00\u5C55\u6C34\u7BB1\u6E05\u6D17\uFF0C\u8BF7\u63D0\u524D\u50A8\u6C34\u3002\u6062\u590D\u4F9B\u6C34\u540E\u8BF7\u77ED\u6682\u653E\u6C34\uFF0C\u611F\u8C22\u914D\u5408\u3002", active: true, voice: true, at: now2, audience: "community", communityIds: ["pengyi"], publisher: "\u5F6D\u4E00\u5C0F\u533A\u7269\u4E1A\u670D\u52A1\u4E2D\u5FC3" }],
    posts: [{ id: "post-garden", body: "\u4ECA\u5929\u65E9\u8D77\u5E26\u5C0F\u670B\u53CB\u5728\u540E\u82B1\u56ED\u6563\u6B65\uFF0C\u7269\u4E1A\u8865\u79CD\u7684\u7EE3\u7403\u82B1\u5F00\u5F97\u592A\u60CA\u8273\u4E86\uFF01", author: "\u9648\u963F\u59E8", likes: 28 }, { id: "post-floor", body: "B\u533A\u5730\u5E93\u5730\u576A\u7FFB\u65B0\u5B8C\u6210\uFF0C\u9632\u6ED1\u51CF\u566A\uFF0C\u70B9\u8D5E\u7269\u4E1A\u5DE5\u7A0B\u5E08\u5085\u4EEC\uFF01", author: "\u5218\u5148\u751F", likes: 45 }],
    favorites: [],
    likes: [],
    shops: [],
    messages: [],
    logs: [],
    drafts: {},
    settings: { notifications: true, autoDispatch: false, listening: true },
    balances: { group: 189203405e-1, jinxiu: 1840200, pengyi: 92e4, penger: 1e4, lvzhou: 2e4 }
  };
}

// src/services/store.js
var STORAGE_KEY = "shengbian-demo-v1";
var id = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
var now = () => (/* @__PURE__ */ new Date()).toISOString();
var money = (value) => Number(value || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
var isPhone = (value) => /^1[3-9]\d{9}$/.test(value);
var isAmount = (value) => /^\d+(\.\d{1,2})?$/.test(String(value)) && Number(value) > 0 && Number(value) <= 1e8;
function createStore(storage, notify2 = () => {
}) {
  function migrate(state2) {
    state2.version = 2;
    state2.organization ||= structuredClone(organization);
    const legacyCompanyNames = { "\u793A\u8303\u7269\u4E1A\u516C\u53F8 A": "\u7269\u4E1A\u516C\u53F8 A", "\u5408\u4F5C\u7269\u4E1A\u516C\u53F8 B": "\u7269\u4E1A\u516C\u53F8 B" };
    state2.organization.companies?.forEach((company) => {
      if (legacyCompanyNames[company.name]) company.name = legacyCompanyNames[company.name];
    });
    state2.contexts ||= { property: { companyId: "property-a", communityId: "pengyi" }, worker: { companyId: "property-a", communityId: "pengyi" } };
    state2.user.communityId ||= "pengyi";
    state2.orders.forEach((order) => {
      order.communityId ||= state2.user.communityId;
      order.companyId ||= communityById(order.communityId, state2.organization)?.companyId || "property-a";
      order.sla ||= { arrivalMinutes: order.urgent ? arrivalPolicies.urgent.minutes : arrivalPolicies.standard.minutes };
      if (["accepted", "arrived", "processing", "completed", "closed"].includes(order.status) && !order.acceptedAt) {
        order.acceptedAt = order.timeline?.find((t) => t.status === "accepted")?.at || order.createdAt || now();
      }
      if (order.acceptedAt && !order.arrivalDueAt) {
        order.arrivalDueAt = new Date(new Date(order.acceptedAt).getTime() + order.sla.arrivalMinutes * 6e4).toISOString();
      }
      if (["arrived", "processing", "completed", "closed"].includes(order.status) && !order.checkinAt) {
        order.checkinAt = order.timeline?.find((t) => t.status === "arrived")?.at || order.acceptedAt;
      }
      if (order.checkinAt && !order.arrivalResult) order.arrivalResult = arrivalStatus(order, new Date(order.checkinAt).getTime());
    });
    state2.articles.forEach((article) => {
      if (!article.audience && ["elevator", "safety"].includes(article.id)) article.audience = "platform";
      article.audience ||= "community";
      if (article.audience === "community") article.communityIds ||= [state2.user.communityId];
      if (article.audience === "platform") article.communityIds = [];
      article.publisher ||= article.audience === "platform" ? "\u58F0\u8FB9\u5E73\u53F0" : `${state2.user.community}\u7269\u4E1A\u670D\u52A1\u4E2D\u5FC3`;
    });
    state2.notices.forEach((notice) => {
      notice.audience ||= "community";
      if (notice.audience === "community") notice.communityIds ||= [state2.user.communityId];
      notice.publisher ||= `${state2.user.community}\u7269\u4E1A\u670D\u52A1\u4E2D\u5FC3`;
    });
    return state2;
  }
  function read() {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const state3 = JSON.parse(raw);
        if ([1, 2].includes(state3.version) && Array.isArray(state3.orders) && state3.user) {
          const migrated = migrate(state3);
          storage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          return migrated;
        }
      } catch {
      }
    }
    const state2 = migrate(initialState());
    storage.setItem(STORAGE_KEY, JSON.stringify(state2));
    return state2;
  }
  function change(fn) {
    const state2 = read();
    const result = fn(state2);
    storage.setItem(STORAGE_KEY, JSON.stringify(state2));
    notify2(state2);
    return result;
  }
  function points(state2, delta, reason, key) {
    if (state2.pointsLog.some((p) => p.id === key)) return;
    if (state2.user.points + delta < 0) throw new Error("\u79EF\u5206\u4E0D\u8DB3\uFF0C\u8BF7\u5148\u5B8C\u6210\u79EF\u5206\u4EFB\u52A1");
    state2.user.points += delta;
    state2.pointsLog.unshift({ id: key, delta, reason, at: now() });
  }
  function log(state2, action, target) {
    state2.logs.unshift({ id: id("LOG"), action, target, at: now() });
  }
  return {
    read,
    change,
    createOrder(input) {
      if (!input.description?.trim() || input.description.trim().length < 5) throw new Error("\u8BF7\u586B\u5199\u81F3\u5C115\u4E2A\u5B57\u7684\u6545\u969C\u63CF\u8FF0");
      if (!input.room?.trim()) throw new Error("\u8BF7\u9009\u62E9\u62A5\u4FEE\u4F4D\u7F6E");
      if (!isPhone(input.phone)) throw new Error("\u8BF7\u8F93\u5165\u6709\u6548\u768411\u4F4D\u624B\u673A\u53F7\u7801");
      if (!input.appointment) throw new Error("\u8BF7\u9009\u62E9\u9884\u7EA6\u65F6\u95F4");
      return change((s) => {
        const communityId = s.user.communityId;
        const companyId = communityById(communityId, s.organization)?.companyId || s.contexts.property.companyId;
        const order = { ...input, id: id("BX"), title: input.description.trim().slice(0, 42), status: "pending", createdAt: now(), technician: "", amount: 0, paid: false, companyId, communityId, sla: { arrivalMinutes: input.urgent ? arrivalPolicies.urgent.minutes : arrivalPolicies.standard.minutes }, timeline: [{ label: "\u5C45\u6C11\u63D0\u4EA4\u62A5\u4FEE", status: "pending", at: now() }] };
        if (s.settings.autoDispatch) {
          order.status = "assigned";
          order.technician = "\u5F20\u5EFA\u56FD";
          order.timeline.push({ label: "\u7CFB\u7EDF\u81EA\u52A8\u6D3E\u53D1\u7ED9\u5F20\u5EFA\u56FD", status: "assigned", at: now() });
        }
        s.orders.unshift(order);
        log(s, "\u65B0\u5EFA\u62A5\u4FEE", order.id);
        return order;
      });
    },
    transition(orderId, next, extra = {}) {
      return change((s) => {
        const order = s.orders.find((o) => o.id === orderId);
        if (!order) throw new Error("\u5DE5\u5355\u4E0D\u5B58\u5728\u6216\u5DF2\u5220\u9664");
        if (order.status === next) return order;
        const allowed = { pending: ["assigned", "accepted", "cancelled"], assigned: ["accepted", "pending", "cancelled"], accepted: ["arrived", "assigned"], arrived: ["processing", "completed"], processing: ["completed"], completed: ["closed"] };
        if (!allowed[order.status]?.includes(next)) throw new Error(`\u5F53\u524D\u5DE5\u5355\u4E3A${statuses[order.status]}\uFF0C\u4E0D\u53EF\u6267\u884C\u6B64\u64CD\u4F5C`);
        if (next === "assigned" && !extra.technician) throw new Error("\u8BF7\u9009\u62E9\u7EF4\u4FEE\u5E08\u5085");
        if (next === "completed" && !extra.photos?.length) throw new Error("\u8BF7\u81F3\u5C11\u4E0A\u4F201\u5F20\u5B8C\u5DE5\u7167\u7247");
        if (next === "completed" && (!Number.isFinite(extra.amount) || extra.amount < 0)) throw new Error("\u7ED3\u7B97\u91D1\u989D\u4E0D\u6B63\u786E");
        const eventAt = next === "arrived" && extra.checkinAt ? extra.checkinAt : now();
        if (next === "accepted") {
          const minutes = order.sla?.arrivalMinutes || (order.urgent ? arrivalPolicies.urgent.minutes : arrivalPolicies.standard.minutes);
          extra.acceptedAt ||= eventAt;
          extra.arrivalDueAt ||= new Date(new Date(extra.acceptedAt).getTime() + minutes * 6e4).toISOString();
          extra.sla = { ...order.sla || {}, arrivalMinutes: minutes };
        }
        if (next === "arrived") {
          if (!order.acceptedAt || !order.arrivalDueAt) throw new Error("\u5DE5\u5355\u5C1A\u672A\u5B8C\u6210\u63A5\u5355\uFF0C\u4E0D\u80FD\u8FDB\u884C\u5230\u5C97\u6253\u5361");
          extra.checkinAt ||= eventAt;
          const snapshot = { ...order, ...extra };
          extra.arrivalResult = arrivalStatus(snapshot, new Date(extra.checkinAt).getTime());
        }
        Object.assign(order, extra, { status: next });
        const timelineLabel = next === "accepted" ? `\u5E08\u5085\u63A5\u5355\uFF0C\u5230\u5C97\u65F6\u9650 ${order.sla.arrivalMinutes} \u5206\u949F` : next === "arrived" ? `\u73B0\u573A\u5230\u5C97\u6253\u5361\uFF1A${order.arrivalResult.text}` : statuses[next];
        order.timeline.push({ status: next, label: timelineLabel, at: eventAt });
        if (next === "completed" && order.amount > 0 && !order.paid) {
          s.bills.push({ id: "repair-" + order.id, orderId: order.id, title: order.title + " \xB7 \u7EF4\u4FEE\u7ED3\u7B97", amount: order.amount, type: "others", book: "current", room: order.room, paid: false });
        }
        log(s, statuses[next], orderId);
        return order;
      });
    },
    pay(billIds, couponId) {
      return change((s) => {
        const bills = s.bills.filter((b) => billIds.includes(b.id) && !b.paid);
        if (!bills.length) throw new Error("\u8D26\u5355\u5DF2\u7F34\u6E05\uFF0C\u8BF7\u52FF\u91CD\u590D\u652F\u4ED8");
        if (bills.length !== new Set(billIds).size) throw new Error("\u8D26\u5355\u72B6\u6001\u5DF2\u53D8\u5316\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u65B0\u786E\u8BA4");
        let amount = Math.round(bills.reduce((sum, b) => sum + b.amount, 0) * 100) / 100;
        const coupon = couponId && s.coupons.find((c) => c.id === couponId && !c.used);
        if (couponId && !coupon) throw new Error("\u62B5\u6263\u5238\u5DF2\u5931\u6548");
        if (coupon && !bills.every((b) => b.type === coupon.type)) throw new Error("\u62B5\u6263\u5238\u4E0D\u9002\u7528\u4E8E\u6240\u9009\u8D26\u5355");
        const discount = coupon ? Math.min(coupon.amount, amount) : 0;
        amount = Math.round((amount - discount) * 100) / 100;
        const payment = { id: id("PAY"), billIds: bills.map((b) => b.id), amount, discount, at: now(), status: "paid" };
        bills.forEach((b) => {
          b.paid = true;
          b.paymentId = payment.id;
          b.paidAt = payment.at;
          const order = s.orders.find((o) => o.id === b.orderId);
          if (order) order.paid = true;
        });
        if (coupon) coupon.used = true;
        s.payments.unshift(payment);
        points(s, Math.floor(amount), "\u5728\u7EBF\u7F34\u8D39", payment.id);
        log(s, "\u6A21\u62DF\u652F\u4ED8\u6210\u529F", payment.id);
        return payment;
      });
    },
    review(orderId, input) {
      return change((s) => {
        const order = s.orders.find((o) => o.id === orderId);
        if (!order || !["completed", "closed"].includes(order.status)) throw new Error("\u4EC5\u5DF2\u5B8C\u5DE5\u7684\u5DE5\u5355\u53EF\u4EE5\u8BC4\u4EF7");
        if (s.reviews.some((r) => r.orderId === orderId)) throw new Error("\u8BE5\u5DE5\u5355\u5DF2\u8BC4\u4EF7\uFF0C\u79EF\u5206\u4E0D\u4F1A\u91CD\u590D\u53D1\u653E");
        if (!(input.rating >= 1 && input.rating <= 5)) throw new Error("\u8BF7\u9009\u62E91\u81F35\u661F\u8BC4\u5206");
        if (input.comment?.length > 300) throw new Error("\u8BC4\u4EF7\u4E0D\u80FD\u8D85\u8FC7300\u5B57");
        const review = { ...input, id: id("REV"), orderId, at: now() };
        s.reviews.push(review);
        points(s, 20, "\u5B8C\u6210\u7EF4\u4FEE\u670D\u52A1\u8BC4\u4EF7", "review-" + orderId);
        order.status = "closed";
        order.timeline.push({ status: "closed", label: "\u5C45\u6C11\u8BC4\u4EF7\u5E76\u5F52\u6863", at: now() });
        log(s, "\u63D0\u4EA4\u8BC4\u4EF7", orderId);
        return review;
      });
    },
    publishContent(input, actor = {}) {
      return change((s) => {
        const context = { ...s.contexts.property, ...actor };
        const audience = input.audience || "community";
        if (audience === "platform" && context.level !== "platform") throw new Error("\u5E73\u53F0\u7EDF\u4E00\u5185\u5BB9\u53EA\u80FD\u7531\u58F0\u8FB9\u5E73\u53F0\u53D1\u5E03");
        const communityIds = audience === "platform" ? [] : input.communityIds || [context.communityId];
        if (audience === "community" && (communityIds.length !== 1 || communityIds[0] !== context.communityId)) throw new Error("\u7269\u4E1A\u8FD0\u8425\u7AEF\u53EA\u80FD\u53D1\u5E03\u5230\u5F53\u524D\u7BA1\u7406\u5C0F\u533A");
        const publisher = audience === "platform" ? "\u58F0\u8FB9\u5E73\u53F0" : `${communityById(context.communityId, s.organization)?.name || "\u5F53\u524D\u5C0F\u533A"}\u7269\u4E1A\u670D\u52A1\u4E2D\u5FC3`;
        const article = { ...input, id: input.id || id("CONTENT"), audience, communityIds, companyId: context.companyId, publisher, at: input.at || now() };
        s.articles.unshift(article);
        log(s, audience === "platform" ? "\u53D1\u5E03\u5E73\u53F0\u7EDF\u4E00\u5185\u5BB9" : "\u53D1\u5E03\u5C0F\u533A\u4E13\u5C5E\u5185\u5BB9", article.id);
        return article;
      });
    },
    publishNotice(input) {
      return change((s) => {
        const context = s.contexts.property;
        const notice = { ...input, id: input.id || id("NOTICE"), audience: "community", communityIds: [context.communityId], companyId: context.companyId, publisher: `${communityById(context.communityId, s.organization)?.name || "\u5F53\u524D\u5C0F\u533A"}\u7269\u4E1A\u670D\u52A1\u4E2D\u5FC3`, at: input.at || now() };
        s.notices.forEach((n) => {
          if (n.active && n.audience === "community" && n.communityIds?.includes(context.communityId)) n.active = false;
        });
        s.notices = [notice, ...s.notices.filter((n) => n.id !== notice.id)];
        log(s, "\u53D1\u5E03\u5C0F\u533A\u7D27\u6025\u901A\u77E5", notice.id);
        return notice;
      });
    },
    redeem(rewardId, delivery, requestId, options = {}) {
      return change((s) => {
        if (s.redemptions.some((r) => r.requestId === requestId)) return s.redemptions.find((r) => r.requestId === requestId);
        const reward = rewards.find((r) => r.id === rewardId);
        if (!reward) throw new Error("\u5151\u6362\u5546\u54C1\u4E0D\u5B58\u5728");
        if (reward.cash && options.cashPayment !== "success") throw new Error("\u6A21\u62DF\u652F\u4ED8\u5931\u8D25\uFF0C\u79EF\u5206\u4E0E\u5151\u6362\u8BB0\u5F55\u5747\u672A\u6263\u51CF");
        const redemption = { ...reward, rewardId, id: id("EXCHANGE"), requestId, delivery, at: now(), code: String(Math.floor(1e5 + Math.random() * 9e5)), status: "\u5F85\u6838\u9500" };
        points(s, -reward.points, "\u5151\u6362" + reward.name, redemption.id);
        if (reward.cash) {
          const payment = { id: id("PAY"), billIds: [], redemptionId: redemption.id, amount: reward.cash, discount: 0, at: now(), status: "paid", kind: "redemption" };
          redemption.paymentId = payment.id;
          s.payments.unshift(payment);
          log(s, "\u79EF\u5206\u5151\u6362\u6A21\u62DF\u652F\u4ED8\u6210\u529F", payment.id);
        }
        s.redemptions.unshift(redemption);
        if (reward.coupon) s.coupons.push({ id: redemption.id, amount: reward.coupon, type: reward.id === "parking30" ? "parking" : "property", used: false });
        log(s, "\u79EF\u5206\u5151\u6362", redemption.id);
        return redemption;
      });
    },
    book(productId, input, requestId) {
      if (!isPhone(input.phone)) throw new Error("\u8BF7\u8F93\u5165\u6B63\u786E\u7684\u624B\u673A\u53F7\u7801");
      if (!Number.isInteger(Number(input.quantity)) || Number(input.quantity) < 1 || Number(input.quantity) > 99) throw new Error("\u6570\u91CF\u987B\u4E3A1\u81F399\u7684\u6574\u6570");
      if (!input.date || input.date < (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA")) throw new Error("\u9884\u7EA6\u65E5\u671F\u4E0D\u80FD\u65E9\u4E8E\u4ECA\u5929");
      return change((s) => {
        if (s.bookings.some((b) => b.requestId === requestId)) return s.bookings.find((b) => b.requestId === requestId);
        const product = products.find((p) => p.id === productId);
        if (!product) throw new Error("\u670D\u52A1\u5DF2\u4E0B\u67B6");
        const booking = { ...input, productId, title: product.name, amount: Number((product.price * input.quantity).toFixed(2)), id: id("BOOK"), requestId, at: now(), status: "\u5F85\u786E\u8BA4" };
        s.bookings.unshift(booking);
        log(s, "\u63D0\u4EA4\u670D\u52A1\u9884\u7EA6", booking.id);
        return booking;
      });
    },
    transfer(input) {
      if (!isAmount(input.amount)) throw new Error("\u8BF7\u8F93\u5165\u5927\u4E8E0\u4E14\u6700\u591A\u4E24\u4F4D\u5C0F\u6570\u7684\u91D1\u989D");
      if (input.from === input.to) throw new Error("\u8C03\u51FA\u4E0E\u63A5\u6536\u8D26\u6237\u4E0D\u80FD\u76F8\u540C");
      if (!input.reason?.trim()) throw new Error("\u8BF7\u586B\u5199\u8C03\u62E8\u539F\u7531\u4E0E\u5BA1\u6279\u6279\u6587\u53F7");
      return change((s) => {
        const amount = Number(input.amount);
        if (!(input.from in s.balances) || !(input.to in s.balances)) throw new Error("\u8D26\u6237\u4E0D\u5B58\u5728");
        if (s.balances[input.from] < amount) throw new Error("\u8C03\u51FA\u8D26\u6237\u4F59\u989D\u4E0D\u8DB3");
        s.balances[input.from] = Math.round((s.balances[input.from] - amount) * 100) / 100;
        s.balances[input.to] = Math.round((s.balances[input.to] + amount) * 100) / 100;
        const transfer = { ...input, amount, id: id("TR"), at: now(), status: "\u6A21\u62DF\u5165\u8D26" };
        s.transfers.unshift(transfer);
        log(s, "\u6A21\u62DF\u8DE8\u9879\u76EE\u8C03\u62E8", transfer.id);
        return transfer;
      });
    },
    award(delta, reason, key) {
      return change((s) => points(s, delta, reason, key));
    },
    saveDraft(key, value) {
      return change((s) => {
        s.drafts[key] = value;
      });
    },
    toggle(collection, key) {
      return change((s) => {
        const index = s[collection].indexOf(key);
        if (index < 0) s[collection].push(key);
        else s[collection].splice(index, 1);
        return index < 0;
      });
    },
    record(action, target) {
      return change((s) => log(s, action, target));
    }
  };
}

// src/services/files.js
var open = () => new Promise((resolve, reject) => {
  const req = indexedDB.open("shengbian-files", 1);
  req.onupgradeneeded = () => req.result.createObjectStore("files");
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(new Error("\u65E0\u6CD5\u6253\u5F00\u9644\u4EF6\u5B58\u50A8\uFF0C\u8BF7\u68C0\u67E5\u6D4F\u89C8\u5668\u5B58\u50A8\u6743\u9650"));
});
async function saveFile(file) {
  const db = await open();
  const id2 = crypto.randomUUID();
  await new Promise((resolve, reject) => {
    const tx = db.transaction("files", "readwrite");
    tx.objectStore("files").put(file, id2);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(new Error("\u9644\u4EF6\u4FDD\u5B58\u5931\u8D25\uFF0C\u53EF\u80FD\u5DF2\u8D85\u51FA\u5B58\u50A8\u914D\u989D"));
  });
  db.close();
  return { id: id2, name: file.name, type: file.type, size: file.size };
}
async function readFile(id2) {
  const db = await open();
  const file = await new Promise((resolve, reject) => {
    const request = db.transaction("files").objectStore("files").get(id2);
    request.onsuccess = () => resolve(request.result);
    request.onerror = reject;
  });
  db.close();
  return file;
}
async function deleteFile(id2) {
  const db = await open();
  await new Promise((resolve, reject) => {
    const tx = db.transaction("files", "readwrite");
    tx.objectStore("files").delete(id2);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(new Error("\u9644\u4EF6\u5220\u9664\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5"));
  });
  db.close();
}

// src/data/source.json
var source_default = {
  overview: {
    expenses: [],
    textareas: [],
    images: [
      {
        src: "/assets/ebdf2b56114265967b86.jpg",
        alt: "Close up photograph of a damaged PVC water pipe leaking under a clean stainless steel sink inside an apartment kitchen, realistic documentary lighting in soft tones"
      },
      {
        src: "/assets/f05fe32169f04b5e4c67.jpg",
        alt: "Residential tiled kitchen floor with a small puddle of clear water beside a cabinet baseboard, high detail texture"
      },
      {
        src: "/assets/7ad97d9f7abb312fdde3.jpg",
        alt: "Modern smart access control panel unit mounted on an apartment residential lobby wall, sleek jade aesthetic"
      },
      {
        src: "/assets/667037f89da2d90beaf5.jpg",
        alt: "Neatly manicured residential garden shrubs and trimmed trees in a modern Chinese apartment community garden, sunny day morning"
      }
    ],
    backgroundImages: [],
    tables: [
      {
        rows: [
          "\u6025 #GD2024062801 \u5F6D\u4E00\u5C0F\u533A 16\u53F7\u697C2\u5355\u5143502\u5BA4 (\u674E\u96C5\u6B23)",
          "\u53A8\u623F\u4E3B\u6C34\u7BA1\u63A5\u53E3\u6E17\u6F0F schedule\u9884\u7EA6\u4ECA\u65E5 14:00 (\u4F5935\u5206\u949F)",
          "+2",
          "\u5F85\u6D3E\u5DE5",
          "\u6D3E\u5DE5 (\u5F20\u5E08\u5085) more_vert",
          "\u4FEE #GD2024062803 \u5F6D\u4E00\u5C0F\u533A 8\u53F7\u697C1\u5355\u5143301\u5BA4",
          "\u5355\u5143\u697C\u9053\u667A\u80FD\u95E8\u7981\u673A\u5237\u5361\u65E0\u611F\u5E94 engineering\u9648\u5DE5 (\u5DF2\u643A\u5E26\u5907\u4EF6\u5230\u8FBE\u73B0\u573A)",
          "",
          "\u4E0A\u95E8\u5904\u7406\u4E2D",
          "\u67E5\u770B\u8F68\u8FF9 more_vert",
          "\u7EFF #GD2024062788 \u5F6D\u4E00\u5C0F\u533A 12\u53F7\u697C2\u5355\u5143101\u5BA4 (\u674E\u5148\u751F)",
          "\u4E00\u697C\u5EAD\u9662\u906E\u9633\u4E54\u6728\u67AF\u679D\u4FEE\u526A\u4E0E\u6E05\u7406 check_circle\u5DF2\u5B8C\u6210 \xB7 \u4E1A\u4E3B\u7ED9 5 \u661F\u597D\u8BC4",
          "",
          "\u5DF2\u5F52\u6863\u7ED3\u5355",
          "\u67E5\u770B\u56DE\u6267 more_vert"
        ]
      }
    ]
  },
  "work-orders": {
    expenses: [],
    textareas: [],
    images: [
      {
        src: "/assets/f00ecc526703cabd8955.jpg",
        alt: "A modern kitchen sink under-cabinet plumbing leak, glistening water droplets on brass valve fitting, warm interior lighting with emerald reflective accents, high resolution photography"
      },
      {
        src: "/assets/a1322f99c8680aa78071.jpg",
        alt: "Close-up of residential pipeline replacement tools and high durability replacement rubber gasket rings on a clean tool mat, crisp contrast, emerald tones, warm indoor lighting"
      },
      {
        src: "/assets/7f4f675d7e7a0eba803e.jpg",
        alt: "Post-repair finished residential water pipe valve installation, dry floor surface, spotless high standard maintenance completion, bright clean lighting"
      }
    ],
    backgroundImages: [],
    tables: []
  },
  expenses: {
    expenses: [
      {
        class: "expense-row group cursor-pointer bg-primary/10 transition-all",
        "data-amount": "\xA538,420.00",
        "data-budget": "22.8%",
        "data-channel": "\u4E0A\u6D77\u519C\u5546\u884C\u5BF9\u516C\u8F6C\u8D26 (\u5C3E\u53F7 4108)",
        "data-dept": "\u5DE5\u7A0B\u8FD0\u7EF4\u90E8 \xB7 \u5468\u5EFA\u56FD",
        "data-id": "1",
        "data-invoice": "FP-SH-990812401",
        "data-sn": "EX-20241024-001",
        "data-status": "paid",
        "data-title": "\u516C\u533A\u80FD\u8017\u6C34\u7535\uFF0810\u6708\u7535\u8D39\uFF09"
      },
      {
        class: "expense-row group cursor-pointer hover:bg-surface-container-low transition-all",
        "data-amount": "\xA512,800.00",
        "data-budget": "7.6%",
        "data-channel": "\u5EFA\u8BBE\u94F6\u884C\u57FA\u672C\u6237\u8F6C\u8D26",
        "data-dept": "\u73AF\u5883\u7EFF\u5316\u90E8 \xB7 \u9648\u963F\u59B9",
        "data-id": "2",
        "data-invoice": "FP-20249821-GR",
        "data-sn": "EX-20241022-045",
        "data-status": "pending",
        "data-title": "\u56ED\u533A\u79CB\u5B63\u82D7\u6728\u517B\u62A4\u4FEE\u526A\u53CA\u6D88\u6740\u670D\u52A1"
      },
      {
        class: "expense-row group cursor-pointer hover:bg-surface-container-low transition-all",
        "data-amount": "\xA54,350.00",
        "data-budget": "2.5%",
        "data-channel": "\u7BA1\u7406\u5904\u96F6\u7528\u5907\u7528\u91D1",
        "data-dept": "\u5DE5\u7A0B\u7EF4\u4FEE\u7EC4 \xB7 \u5218\u5E08\u5085",
        "data-id": "3",
        "data-invoice": "NO-INV-PUMP201",
        "data-sn": "EX-20241021-012",
        "data-status": "reviewing",
        "data-title": "12\u53F7\u697C\u9AD8\u533A\u52A0\u538B\u6C34\u6CF5\u5BC6\u5C01\u8F74\u627F\u66F4\u6362"
      },
      {
        class: "expense-row group cursor-pointer hover:bg-surface-container-low transition-all",
        "data-amount": "\xA57,450.00",
        "data-budget": "4.4%",
        "data-channel": "\u4E0A\u6D77\u519C\u5546\u884C\u5BF9\u516C\u8F6C\u8D26",
        "data-dept": "\u5B89\u5168\u4FDD\u536B\u90E8 \xB7 \u5B59\u6D69",
        "data-id": "4",
        "data-invoice": "FP-SAFE-202410",
        "data-sn": "EX-20241019-009",
        "data-status": "pending",
        "data-title": "\u6D88\u706B\u6813\u5E74\u68C0\u4E0E\u6C34\u538B\u6D4B\u8BD5\u68C0\u6D4B\u6280\u672F\u670D\u52A1\u8D39"
      },
      {
        class: "expense-row group cursor-pointer hover:bg-surface-container-low transition-all",
        "data-amount": "\xA51,640.00",
        "data-budget": "0.9%",
        "data-channel": "\u8D22\u52A1\u5FEB\u6377\u9884\u4ED8\u6B3E\u6263\u9664",
        "data-dept": "\u7EFC\u5408\u5BA2\u670D\u90E8 \xB7 \u738B\u6653",
        "data-id": "5",
        "data-invoice": "JD-ELEC-2024090",
        "data-sn": "EX-20241018-088",
        "data-status": "paid",
        "data-title": "\u5BA2\u670D\u7BA1\u5BB6\u79CB\u5B63\u65E5\u5E38\u529E\u516C\u8017\u6750\u4E0E\u5DE1\u68C0\u8BB0\u5F55\u672C\u91C7\u8D2D"
      },
      {
        class: "expense-row group cursor-pointer hover:bg-surface-container-low transition-all",
        "data-amount": "\xA568,500.00",
        "data-budget": "40.6%",
        "data-channel": "\u94F6\u884C\u5BF9\u516C\u6279\u91CF\u4EE3\u53D1",
        "data-dept": "\u4EBA\u4E8B\u884C\u653F\u90E8 \xB7 \u8D75\u654F",
        "data-id": "6",
        "data-invoice": "SB-SH-202409-HR",
        "data-sn": "EX-20241015-003",
        "data-status": "paid",
        "data-title": "\u5916\u8058\u79E9\u5E8F\u7EF4\u62A4\u54589\u6708\u4EFD\u793E\u4FDD\u4EE3\u7F34\u4E0E\u6D25\u8D34\u6838\u53D1"
      }
    ],
    textareas: [
      ""
    ],
    images: [
      {
        src: "/assets/9b52f8296aba72892f80.jpg",
        alt: "Clear high-definition photo of an official utility reimbursement invoice and bank transfer remittance receipt neatly stamped with red accounting seals on an ivory desk."
      }
    ],
    backgroundImages: [],
    tables: [
      {
        rows: [
          "",
          "EX-20241024-001",
          "bolt \u516C\u533A\u80FD\u8017\u6C34\u7535",
          "\xA538,420.00",
          "\u5DE5\u7A0B\u8FD0\u7EF4\u90E8 (\u5468\u5EFA\u56FD)",
          "2024-10-24",
          "\u94F6\u884C\u5BF9\u516C\u8F6C\u8D26",
          "\u5DF2\u4ED8\u6B3E",
          "",
          "EX-20241022-045",
          "park \u7EFF\u5316\u4FDD\u6D01\u5916\u5305",
          "\xA512,800.00",
          "\u73AF\u5883\u7EFF\u5316\u90E8 (\u9648\u963F\u59B9)",
          "2024-10-22",
          "\u94F6\u884C\u5BF9\u516C\u8F6C\u8D26",
          "\u5F85\u5BA1\u6279",
          "",
          "EX-20241021-012",
          "build \u5DE5\u7A0B\u7EF4\u4FDD\u96F6\u914D\u4EF6",
          "\xA54,350.00",
          "\u5DE5\u7A0B\u7EF4\u4FEE\u7EC4 (\u5218\u5E08\u5085)",
          "2024-10-21",
          "\u7BA1\u7406\u5904\u5907\u7528\u91D1",
          "\u5BA1\u6279\u4E2D",
          "",
          "EX-20241019-009",
          "local_fire_department \u6D88\u9632\u7EF4\u4FDD\u68C0\u6D4B",
          "\xA57,450.00",
          "\u5B89\u5168\u4FDD\u536B\u90E8 (\u5B59\u6D69)",
          "2024-10-19",
          "\u94F6\u884C\u5BF9\u516C\u8F6C\u8D26",
          "\u5F85\u5BA1\u6279",
          "",
          "EX-20241018-088",
          "description \u529E\u516C\u8017\u6750",
          "\xA51,640.00",
          "\u7EFC\u5408\u5BA2\u670D\u90E8 (\u738B\u6653)",
          "2024-10-18",
          "\u5FEB\u6377\u6263\u8D39",
          "\u5DF2\u4ED8\u6B3E",
          "",
          "EX-20241015-003",
          "badge \u4EBA\u5458\u85AA\u916C\u4E0E\u793E\u4FDD",
          "\xA568,500.00",
          "\u4EBA\u4E8B\u884C\u653F\u90E8 (\u8D75\u654F)",
          "2024-10-15",
          "\u94F6\u884C\u5BF9\u516C\u8F6C\u8D26",
          "\u5DF2\u4ED8\u6B3E"
        ]
      }
    ]
  },
  finance: {
    expenses: [],
    textareas: [],
    images: [],
    backgroundImages: [],
    tables: [
      {
        rows: [
          "12\u53F7\u697C-1602\u5BA4\u5F20\u5FB7\u6D77 (138****0921)",
          "142.8 \u33A1",
          "\xA53.80/\u33A1/\u6708",
          "\u6B20\u7F34 10\u4E2A\u6708",
          "\xA55,426.40",
          "10-18 (\u5FAE\u4FE1\u63A8\u9001)",
          "\u4E00\u952E\u50AC\u7F34 \u50AC\u544A\u51FD",
          "18\u53F7\u697C-0501\u5BA4\u738B\u79C0\u82B3 (139****4412)",
          "118.5 \u33A1",
          "\xA53.80/\u33A1/\u6708",
          "\u6B20\u7F34 8\u4E2A\u6708",
          "\xA53,602.40",
          "10-12 (\u7BA1\u5BB6\u7535\u8BDD)",
          "\u4E00\u952E\u50AC\u7F34 \u50AC\u544A\u51FD",
          "03\u53F7\u697C-2204\u5BA4\u6797\u632F\u5B87 (150****8831)",
          "89.2 \u33A1",
          "\xA53.80/\u33A1/\u6708",
          "\u6B20\u7F34 3\u4E2A\u6708",
          "\xA51,016.88",
          "09-28 (\u7CFB\u7EDF\u81EA\u52A8)",
          "\u4E00\u952E\u50AC\u7F34 \u660E\u7EC6",
          "07\u53F7\u697C-0302\u5BA4\u9648\u5EFA\u56FD (\u519B\u70C8\u5C5E\u4F18\u629A)",
          "95.0 \u33A1",
          "\xA53.80/\u33A1/\u6708",
          "\u4F18\u629A\u51CF\u514D\u6838\u51C6",
          "\xA50.00 (\u5DF2\u51CF\u514D50%)",
          "\u674E\u660E\u4E3B\u7BA1\u5DF2\u6279\u590D",
          "\u5BA1\u6279\u5355"
        ]
      },
      {
        rows: [
          "\u6CAAA\xB7D88192\u5730\u5E93A\u533A-A088",
          "\u4F55\u5C11\u534E (186****1120)",
          "\u56FA\u5B9A\u4EA7\u6743\u4F4D\u7BA1\u7406\u8D39",
          "2024-10-28 (\u52694\u5929)",
          "\xA5150/\u6708",
          "\u5373\u5C06\u5230\u671F",
          "\u5FAE\u4FE1\u63D0\u9192 \u7EED\u671F",
          "\u6CAAB\xB75K998\u5730\u5E93B\u533A-B142",
          "\u82CF\u666F\u7965 (137****9022)",
          "\u957F\u79DF\u56FA\u5B9A\u4F4D",
          "2024-09-30 (\u5DF2\u903E\u671F)",
          "\xA5450/\u6708 (\u6B20900)",
          "\u6B20\u8D39\u505C\u8FD0/\u9501\u95F8",
          "\u89E3\u7981/\u8865\u7F34 \u8BE6\u60C5",
          "\u82CFE\xB7910QA\u5730\u5E93A\u533A-A201",
          "\u9646\u96E8\u6B23 (159****3310)",
          "\u957F\u79DF\u56FA\u5B9A\u4F4D",
          "2025-06-30",
          "\xA5450/\u6708 (\u5DF2\u7F34\u5E74\u79DF)",
          "\u6B63\u5E38\u5728\u79DF",
          "\u53D1\u7968\u7535\u5B50\u8054"
        ]
      },
      {
        rows: [
          "\u5BA4\u5185\u88C5\u4FEE\u62BC\u91D1",
          "05\u53F7\u697C-1201\u5BA4 (\u65B9\u5929\u76DB)",
          "\xA55,000.00",
          "\xA55,000.00",
          "\u8D75\u7389\u534E",
          "\u7535\u5B50\u6536\u636E SJ24102101",
          "\u62BC\u91D1\u5728\u62BC\u6258\u7BA1",
          "\u7535\u68AF\u6846\u67B6\u5E7F\u544A\u5C4F Q4\u5B63\u5EA6\u79DF",
          "\u5206\u4F17\u4F20\u5A92 (\u4E0A\u6D77) \u8425\u9500\u90E8",
          "\xA536,000.00",
          "\xA536,000.00",
          "\u674E\u660E\u4E3B\u7BA1",
          "\u589E\u503C\u7A0E\u4E13\u7968\u5DF2\u5F00\u5177",
          "\u5DF2\u5168\u989D\u7ED3\u7B97",
          "\u88C5\u6F62\u5EFA\u7B51\u5783\u573E\u6E05\u8FD0\u4EE3\u8FD0\u8D39",
          "14\u53F7\u697C-0902\u5BA4 (\u90ED\u745E)",
          "\xA51,200.00",
          "\xA51,200.00",
          "\u5B59\u7ACB\u4F1F",
          "\u5FAE\u4FE1\u7535\u5B50\u51ED\u636E",
          "\u5DF2\u8FD0\u62B5\u6D88\u7EB3\u573A",
          "\u58F0\u8FB9\u597D\u7269\u95EA\u94FA\u5546\u6237\u6D41\u6C34\u62BD\u4F63",
          "\u5F6D\u4E00\u9C9C\u679C\u751F\u6D3B\u8D85\u5E02",
          "\xA54,820.50",
          "\u5F85\u6708\u7ED3\u5BF9\u8D26",
          "\u7CFB\u7EDF\u81EA\u52A8",
          "\u7CFB\u7EDF\u6C47\u603B\u5355",
          "25\u65E5\u81EA\u52A8\u5206\u8D26"
        ]
      }
    ]
  },
  weekly: {
    expenses: [],
    textareas: [
      "",
      ""
    ],
    images: [
      {
        src: "/assets/a529d4411d56c28051fd.jpg",
        alt: "Technicians inspecting elevator"
      },
      {
        src: "/assets/45fa6580929a357295ce.jpg",
        alt: "Gardening in community park"
      },
      {
        src: "/assets/c8940b7189e9333aa9fb.jpg",
        alt: "Night firefighting drill"
      },
      {
        src: "/assets/1ffcb60b399231cdb252.jpg",
        alt: "Staff helping elderly resident"
      }
    ],
    backgroundImages: [],
    tables: []
  },
  broadcast: {
    expenses: [],
    textareas: [
      "\u3010\u7D27\u6025\u505C\u6C34\u901A\u77E5\u3011\u5C0A\u656C\u7684\u5404\u4F4D\u4E1A\u4E3B\uFF1A\u56E016\u53F7\u697C\u524D\u5730\u4E0B\u4E3B\u7BA1\u7F51\u7A81\u53D1\u7834\u88C2\u9700\u7D27\u6025\u5F00\u6316\u62A2\u4FEE\uFF0C\u9884\u8BA1\u5C06\u4E8E\u4ECA\u65E5\uFF0810\u670825\u65E5\uFF0914:00\u81F318:00\u6682\u505C\u4F9B\u6C34\uFF0C\u8BF7\u76F8\u5173\u697C\u5B87\u4E1A\u4E3B\u63D0\u524D\u50A8\u6C34\u5E76\u5173\u95ED\u6C34\u9600\u3002\u62A2\u4FEE\u5B8C\u6BD5\u540E\u5C06\u7B2C\u4E00\u65F6\u95F4\u6062\u590D\u4F9B\u6C34\u3002\u7269\u4E1A24\u5C0F\u65F6\u503C\u73ED\u70ED\u7EBF\uFF1A400-880-6888\u3002"
    ],
    images: [
      {
        src: "/assets/56fcaed7eebd2944d388.jpg",
        alt: "A lush green eco-friendly modern residential apartment complex courtyard in Shanghai with blooming autumn trees, sunlight streaming through glass balconies, warm peaceful neighborhood lifestyle"
      }
    ],
    backgroundImages: [],
    tables: []
  },
  checkin: {
    expenses: [],
    textareas: [],
    images: [
      {
        src: "/assets/f9d4f8927ba09b920f4b.jpg",
        alt: "Close up photograph of a leaking indoor brass water pipe underneath a residential kitchen sink, water droplets actively spraying out from damaged valve thread, realistic documentary property inspection style, authentic lighting with sharp details"
      },
      {
        src: "/assets/3579ea7541990e915933.jpg",
        alt: "High detail macro photograph of a newly installed polished brass corner angle valve installed beneath a kitchen sink counter, clean plumbing workmanship, dry sparkling clean tile background, crisp lighting, soft jade reflection tones"
      },
      {
        src: "/assets/b7432cac117b895ca4eb.jpg",
        alt: "Clean closeup view of repaired white PPR domestic water pipe neatly wrapped with white Teflon plumber tape, completely dry and clean joint without any water leakage, bright modern utility room lighting, crisp professional quality"
      }
    ],
    backgroundImages: [],
    tables: []
  },
  tasks: {
    expenses: [],
    textareas: [],
    images: [
      {
        src: "/assets/7b8e5a2d15ef6cd339fa.jpg",
        alt: "A warm, confident Chinese master technician in his 40s wearing a clean dark emerald work vest and cap, warm natural lighting, professional and friendly portrait, modern smart community backdrop"
      },
      {
        src: "/assets/a98d1e7e323df13055f8.jpg",
        alt: "High quality close-up photo of a burst metal water pipe valve in a domestic bathroom, spraying water on modern gray ceramic floor tiles, sharp detail, dramatic ambient indoor lighting"
      },
      {
        src: "/assets/0edc5e6631c7640993ec.jpg",
        alt: "Modern Chinese residential apartment interior with a designer ceiling lamp fixture on a clean plaster ceiling, daylight streaming through large windows"
      },
      {
        src: "/assets/15447bb9b7ebd132d87a.jpg",
        alt: "Close up of modern kitchen sink plumbing pipe and brass angle stop valve under stainless steel sink, neat installation, bright neutral lighting"
      }
    ],
    backgroundImages: [],
    tables: []
  },
  group: {
    expenses: [],
    textareas: [],
    images: [],
    backgroundImages: [],
    tables: [
      {
        rows: [
          "\u5F6D\u4E00 \u5F6D\u4E00\u667A\u6167\u793E\u533A \u6807\u6746\u793A\u8303 \u9759\u5B89\u5F6D\u6D66 \xB7 \u667A\u6167\u6570\u5B57\u6539\u9020\u793A\u8303\u533A",
          "2,480 \u6237 \u5165\u9A7B\u7387 98.4%",
          "\xA584,210.00 320\u7B14 / \u79D2\u7EA7\u6E05\u7B97",
          "94.2% \u8D85\u96C6\u56E2\u6307\u6807 4.2%",
          "\xA512,400.00",
          "+\xA571,810.00",
          "\xA52,340,000",
          "\u6B63\u5E38\u8FD0\u8425",
          "visibility open_in_new swap_horiz",
          "\u5F6D\u4E8C \u5F6D\u4E8C\u65B0\u6751 \u8001\u65E7\u6539\u9020 \u8001\u9F84\u5316\u9AD8 / \u7EF4\u4FEE\u5355\u5BC6\u96C6",
          "1,860 \u6237 \u5165\u9A7B\u7387 91.2%",
          "\xA532,150.00 \u7EBF\u4E0B\u5C45\u59D4\u6536\u7F34\u8F6C\u63A5",
          "81.5% \u8DDD\u76EE\u6807\u5DEE 3.5%",
          "\xA528,600.00 \u4E3B\u4F9B\u6C34\u7BA1\u62A2\u4FEE\u51FA\u8D26",
          "+\xA53,550.00",
          "\xA5820,000",
          "\u62A2\u4FEE\u652F\u51FA\u504F\u9AD8",
          "visibility open_in_new swap_horiz",
          "\u9526\u7EE3 \u9526\u7EE3\u534E\u5EAD \u9AD8\u7AEF\u5546\u4E1A\u4F4F\u5B85 \u9AD8\u5C42\u53CC\u4F1A\u6240 \xB7 \u8F66\u4F4D\u6BD4 1:1.6",
          "3,200 \u6237 \u5165\u9A7B\u7387 99.1%",
          "\xA5142,800.00 \u5E74\u7F34\u4E1A\u4E3B\u96C6\u4E2D\u8FD4\u73B0",
          "96.8% \u5168\u96C6\u56E2\u7B2C\u4E00",
          "\xA518,900.00",
          "+\xA5123,900.00",
          "\xA55,180,000",
          "\u6781\u4F18\u8D44\u91D1\u6D41",
          "visibility open_in_new swap_horiz",
          "\u7EFF\u6D32 \u7EFF\u6D32\u5EB7\u57CE \u6B20\u8D39\u98CE\u9669 \u8FDE\u7EED\u4E24\u5B63\u5EA6\u4F4E\u4E8E 75% \u8B66\u6212\u7EBF",
          "1,420 \u6237 \u7A7A\u7F6E\u7387 14%",
          "\xA528,940.00 \u5C0F\u989D\u50AC\u7F34\u5165\u8D26",
          "73.2% \u9EC4\u724C\u50AC\u7F34\u6574\u6539",
          "\xA514,500.00",
          "+\xA514,440.00",
          "\xA5410,000 (\u8FD1\u9884\u8B66)",
          "\u50AC\u7F34\u9884\u8B66",
          "priority_high open_in_new \u7763\u529E\u6574\u6539",
          "\u6EE8\u6C5F \u6EE8\u6C5F\u96C5\u82D1 \u5F90\u6C47\u6CBF\u6C5F \xB7 \u4E2D\u578B\u54C1\u8D28\u76D8",
          "980 \u6237 \u5165\u9A7B\u7387 96.5%",
          "\xA541,200.00 \u5FAE\u4FE1\u5373\u65F6\u6E05\u7F34",
          "88.0% \u8FBE\u6807\u7A33\u5065",
          "\xA58,300.00",
          "+\xA532,900.00",
          "\xA51,920,000",
          "\u8FD0\u884C\u5E73\u7A33",
          "visibility open_in_new swap_horiz",
          "\u671B\u6C5F \u671B\u6C5F\u5E9C \u65B0\u4EA4\u4ED8\u671F \u4EA4\u4ED8\u9996\u5E74\u9884\u7F34\u6536\u7F34\u987A\u7545",
          "1,600 \u6237 \u4EA4\u4ED8\u7387 94.0%",
          "\xA557,220.80 \u88C5\u4FEE\u62BC\u91D1\u4E0E\u8F66\u4F4D\u7BA1\u8D39",
          "92.4% \u9996\u671F\u8FBE\u6807",
          "\xA59,730.00",
          "+\xA547,490.80",
          "\xA53,100,000",
          "\u826F\u597D\u63A8\u8FDB",
          "visibility open_in_new swap_horiz"
        ]
      }
    ]
  },
  home: {
    expenses: [],
    textareas: [],
    images: [],
    backgroundImages: [
      "background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAIjQfA8fFppEcAlnD3Uc4g4tNRr3gOq0vABRbpCbbWAGjHGUt4kCrhRelezt-4bvcR081ZSus3DIYRvr1HazqxyvPbSYQr2FJikrMYzYryeV038pY-5Q_0VyYB_ZgPYWhvGAiQzVKcMbCYU2b9mxd2lFrhScUq5LAzP33VJVHbQ_5w8I26EZ5u0WK_WM5f00RpQBpLd6ZqGLOw8U4IKrQkSSmyTLVB3U53vPwZIsjiQqOKmu-lsH3R')",
      "background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCSxWEbXU2_e13R8BzQEEqva0vvI5LKrDts0YHEV2yMPXcCTX9TajYBvXrkKXjiviwG1laZLnABm5vlOMxj7iq6sMOu9x2to36qYpeM9zOScmqvWa7SIqC5DkB34r3jYuO0AoJ_3olbQFcUOkBLarFvRkGh-lcl0aUWEC256mwGDOPMwVLD8PMnnVtTOyjEsnvVsk6U6FvrOyVOo8O-yVPwjAtEYiDswvFVn-oypQUFxy7klCJj9sUS')",
      "background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuC53Y82v8ImOwGO1Shtu3wcJVQoL5q_npojmwi2wd_BruqsdeperEJzU4EOwa77oMDTKhkDM_Z05ZzDc0ACulrQhh0BI5Ffsgm_heaW1gBn9bknm7U1dqVf0s34NSQwjsyzIx259xmltCHher8zaTT8dOfseG53z_-oH7CbQOptC9nMoh0UzouE7ZPE6LW-oVnOpm-yYxYEopSCHNQT_JUa0Uqwr6tUcC-Bx893WnqzA06DKJJQLouW')",
      "background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDTdPJ1COx0rCu8yW7NWq-GScTOjVUATc8lRnu4d5NaF4JPB2-TX2jkR8zYjpHaWHjn8F8aJML3d8ajaPP-j3O9bBZlVadvcSPIyDgpah38t-8z0vpjQVzwMc9T1B-w06n8U3HLQ6LJ6Q7gaQsAI-EHJQbzAELdEw6SvfvN5-PyIf3PXOT6sLs0Q1H6K4Y2Q_PjS2RS1x9qCk_gYBDG5P4T1Sk6pmHGVXKXNZLm05d4LYccZVZ1tI-I')",
      "background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuD6zF3dDZ0zbgehZDMB5RbzDaBy82almrdGllwEfoMcitBpKT9MM4aZv5pprnKeTuZA4vruxQE7KrXvdqy6sVbcjckHIcReMEjMNdUm-x5U3rcT3t3f6BdycjxXh-pEpRDeHTVrZdkpZzLKq39SZpArrF27Wsezc4VeaYNnRBaP3YeZPTwmYEnkrMgIX-y8aBDE1E0RnhUp9ZFD8DUNfoCOFrFLGTzps4r3IoGxEnpDDTRwSYbmh_4h')",
      "background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBS9Akb44sysodwYPLfE7p7sTUQvBjCwLu6f7MiB0fZ3qvP2kKfyoThU7gpOi8Poc-mrL6xP1lSzbxJXhz06QA-U2qp2gRLqQl0PQ3lBU4X4obAI15XGaESfw3t4M1iFHeG61G3QgB5Wy0h3MOdI-Aed5CChEYvH87g9OnzYEPhuoxhCM_r3yQZOceanRU38C2DRGmyItDaaNv0xmLNU_xBiSnHw75gNHLUulYjsV1GEw-uNvrmML1B')",
      "background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDeMUw9xY13ey1wMeWAwd5wlQBGE2YtiDT_2S5NDPCVSco-HExRm839QM7D9G-BihW9iakuWkpAP2qMmh1x-rnC36gytggXpDAOwJoa_pyUU7H6_XT8t0rvx28GOb6n_h_dP17gU0rtJcaoj_kVAIrReZoWkJSuPMIIGHOZVLWTHX_UejDQj1FZ0CSs7ICHOGjpi5e3imcEfoMhD6_E7u9dg1EP4VAmVdHs_iW9dAPn52XhQHtZ8OWG')"
    ],
    tables: []
  },
  login: {
    expenses: [],
    textareas: [],
    images: [],
    backgroundImages: [],
    tables: []
  },
  verify: {
    expenses: [],
    textareas: [],
    images: [
      {
        src: "/assets/d0d1114a9eaa87fdba21.jpg",
        alt: "Close-up photograph of Chinese real estate ownership certificate title deed booklet cover with green embossed emblem, lying on a clean wooden desk under warm morning lighting, architectural documentary photography."
      },
      {
        src: "/assets/9984cbb09a4ed950b78d.jpg",
        alt: "Macro macro detailed view of Chinese official property deed interior registration page showing official red seal stamp and clear property registry table, soft ambient office light."
      }
    ],
    backgroundImages: [],
    tables: []
  },
  review: {
    expenses: [],
    textareas: [
      ""
    ],
    images: [
      {
        src: "/assets/21dc9ebb33ce2c349202.jpg",
        alt: "A warm, smiling Asian professional maintenance craftsman wearing a neat emerald green utility work uniform with safety ID badge and clean demeanor, soft indoor daylight, cinematic natural portrait, high detail, friendly and reliable aura."
      },
      {
        src: "/assets/d78c09e1a9b16f472816.jpg",
        alt: "Close up photography of brand new sparkling chrome plumbing faucet and shiny PVC sink pipe installed properly without any leaks in a clean warm-toned apartment kitchen, bright daylight reflecting on porcelain tiles, sharp focus."
      }
    ],
    backgroundImages: [],
    tables: []
  },
  media: {
    expenses: [],
    textareas: [],
    images: [
      {
        src: "/assets/6d06b50456b95f0e5d62.jpg",
        alt: "A warm and cinematic documentary portrait of a smiling middle-aged Asian property manager wearing a smart emerald green uniform, standing in a lush sunlit modern residential garden courtyard, shallow depth of field, warm ambient morning light, authentic and comforting editorial atmosphere."
      },
      {
        src: "/assets/4d0ea3cf0aa95de90bb5.jpg",
        alt: "A cinematic, rain-soaked community scene at dusk showing property management heroes in high-visibility emerald green waterproof raincoats unclogging outdoor drainage grills to prevent flooding during a storm, dramatic storm lighting with warm streetlamps reflecting in clear puddles, documentary realism."
      },
      {
        src: "/assets/f1b304f62a62f235d0e9.jpg",
        alt: "Close up photograph of a beautifully maintained spring community garden with vibrant blooming marigolds and manicured bushes, bright cheerful natural sunlight, peaceful residential landscape."
      },
      {
        src: "/assets/b05b382caae1ef8de11b.jpg",
        alt: "A clean, industrial yet highly hygienic view of certified property maintenance workers in full sterile protective suits and headgear thoroughly sanitizing a sparkling clean stainless steel underground municipal water cistern, bright industrial white-blue lighting showcasing pristine hygiene standards."
      },
      {
        src: "/assets/9023e91ec87656813fb2.jpg",
        alt: "Energetic early morning martial arts and tactical emergency defense drill by handsome Asian security officers dressed in sleek modern tactical security uniforms inside a pristine contemporary upscale apartment complex plaza, crisp morning dawn light, disciplined formations."
      }
    ],
    backgroundImages: [],
    tables: []
  },
  services: {
    expenses: [],
    textareas: [],
    images: [
      {
        src: "/assets/e4d14ce3e2ae4f3adeb2.jpg",
        alt: "Fresh handmade Chinese dumplings on a bamboo steamer and artisanal home-baked pastries"
      },
      {
        src: "/assets/eb4e6e18f50fd7671e8d.jpg",
        alt: "A professional HVAC technician in a crisp emerald-trimmed uniform cleaning an indoor central air conditioning unit using steam equipment inside a clean modern living room, bright morning natural lighting, crisp details, high-end residential aesthetic."
      },
      {
        src: "/assets/d0bd6943b8f2d4513e3c.jpg",
        alt: "A modern apartment window installation showing sleek stainless steel anti-mosquito wire mesh screen, pristine finish, soft blurred residential park greenery background, warm afternoon daylight."
      },
      {
        src: "/assets/e4d14ce3e2ae4f3adeb2.jpg",
        alt: "A premium gift box of freshly picked pink honey peaches nestled in clean straw packaging on a wooden table, dewdrops visible, high quality gourmet food photography, bright soft warm lighting."
      }
    ],
    backgroundImages: [],
    tables: []
  },
  bills: {
    expenses: [],
    textareas: [],
    images: [],
    backgroundImages: [],
    tables: []
  },
  repair: {
    expenses: [],
    textareas: [
      ""
    ],
    images: [
      {
        src: "/assets/237eabbfdd058c36fde8.jpg",
        alt: "Close up photography of a domestic bathroom water pipe elbow joint with tiny droplets of fresh leaking water on glossy jade ceramic tiles, shot in clean natural morning soft ambient light with sharp mechanical details and high focus fidelity."
      }
    ],
    backgroundImages: [],
    tables: []
  },
  profile: {
    expenses: [],
    textareas: [],
    images: [
      {
        src: "/assets/1171588081b4f9785ab0.jpg",
        alt: "Warm friendly portrait of middle-aged male Chinese maintenance technician in neat emerald work uniform with polite smile, clean daylight background"
      },
      {
        src: "/assets/a481d394a10a5f9c9105.jpg",
        alt: "Portrait of pleasant young female Asian property manager in professional suit, warm natural smile, emerald necktie accent"
      }
    ],
    backgroundImages: [],
    tables: []
  },
  billing: {
    expenses: [],
    textareas: [],
    images: [],
    backgroundImages: [],
    tables: []
  },
  points: {
    expenses: [],
    textareas: [],
    images: [
      {
        src: "/assets/3c4b083f0f26f1b2e0d9.jpg",
        alt: "A professional home appliance maintenance technician wearing clean uniform with green accents meticulously cleaning a kitchen range hood, bright clean kitchen lighting, professional lifestyle photography, soft green aesthetic."
      },
      {
        src: "/assets/c605669a6d3ba919c008.jpg",
        alt: "An organized open household tool set with drills, screwdrivers, wrenches, hammer neatly aligned inside a sturdy emerald green carrying case, warm studio lighting, crisp product view."
      },
      {
        src: "/assets/a8a3a99bea797f5a30ae.jpg",
        alt: "A premium 5kg cloth bag of organic Wuchang rice resting on a rustic wooden table with natural morning light and gentle green botanical leaves nearby, clean organic food packaging."
      },
      {
        src: "/assets/a959d5ab1d24c9f868b5.jpg",
        alt: "An elegant glass bottle of cold pressed camellia oil with golden liquid glowing under soft natural sunlight, surrounded by delicate camellia seeds on an emerald textured background."
      },
      {
        src: "/assets/aa380591b2a2ec2e9097.jpg",
        alt: "A trendy minimalist art toy collectible vinyl figure designed with emerald headphones, holding a small radio, studio lighting on soft mint pastel background, collectible designer toy."
      },
      {
        src: "/assets/d79a519c668725edd237.jpg",
        alt: "Cozy neighborhood outdoor cinema lawn at dusk with fairy string lights, comfortable emerald deck chairs, a large projection screen displaying a warm movie scene, happy community ambiance."
      }
    ],
    backgroundImages: [],
    tables: []
  }
};

// src/ui.js
var $ = (selector, root = document) => root.querySelector(selector);
var $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
var escape = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
var label = (element) => {
  const clone = element.cloneNode(true);
  clone.querySelectorAll(".material-symbols-outlined,.nav-badge").forEach((e) => e.remove());
  return clone.textContent.replace(/\s+/g, " ").trim();
};
var icon = (name) => `<span class="material-symbols-outlined" aria-hidden="true">${name}</span>`;
function bind(element, action, fn) {
  if (!element) return;
  element.dataset.action = action;
  if (!["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA", "LABEL"].includes(element.tagName)) {
    element.tabIndex = 0;
    element.setAttribute("role", "button");
    element.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        element.click();
      }
    });
  }
  if (element.tagName === "BUTTON" && element.type !== "submit") element.type = "button";
  if (!label(element) && !element.getAttribute("aria-label")) {
    element.setAttribute("aria-label", element.title || action);
    element.title ||= action;
  }
  element.addEventListener("click", async (e) => {
    if (e.target.closest("[data-action]") !== element || element.disabled) return;
    if (element.tagName === "A") e.preventDefault();
    try {
      await fn(e);
    } catch (error) {
      toast(error.message || "\u64CD\u4F5C\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5", true);
    }
  });
}
function toast(text, error = false) {
  let box = $("#demo-toast");
  if (!box) {
    box = document.createElement("div");
    box.id = "demo-toast";
    box.className = "demo-toast";
    box.setAttribute("role", "status");
    document.body.append(box);
  }
  const dialog = $("#demo-dialog");
  if (dialog?.open && box.parentElement !== dialog) dialog.append(box);
  else if (!dialog && box.parentElement !== document.body) document.body.append(box);
  box.textContent = text;
  box.dataset.error = String(error);
  box.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    box.hidden = true;
  }, 4e3);
}
async function busy(button, fn) {
  if (button?.disabled) return;
  const html = button?.innerHTML;
  if (button) {
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    button.innerHTML = icon("progress_activity") + "\u5904\u7406\u4E2D...";
  }
  try {
    await new Promise((r) => setTimeout(r, 240));
    if (!navigator.onLine) throw new Error("\u7F51\u7EDC\u5DF2\u65AD\u5F00\uFF0C\u8BF7\u68C0\u67E5\u8FDE\u63A5\u540E\u91CD\u8BD5\uFF0C\u6570\u636E\u5C1A\u672A\u63D0\u4EA4");
    return await fn();
  } finally {
    if (button?.isConnected) {
      button.disabled = false;
      button.removeAttribute("aria-busy");
      button.innerHTML = html;
    }
  }
}
var lastFocus;
function closeModal() {
  const dlg = $("#demo-dialog");
  if (dlg) {
    const message = $("#demo-toast", dlg);
    if (message) document.body.append(message);
    dlg.close();
    dlg.remove();
    lastFocus?.focus?.();
  }
}
function modal(title, content, actions = []) {
  closeModal();
  lastFocus = document.activeElement;
  const dlg = document.createElement("dialog");
  dlg.id = "demo-dialog";
  dlg.className = "demo-dialog";
  dlg.setAttribute("aria-labelledby", "dialog-title");
  dlg.innerHTML = `<header><h2 id="dialog-title">${escape(title)}</h2><button type="button" class="demo-icon" aria-label="\u5173\u95ED">${icon("close")}</button></header><div class="demo-dialog-body">${content}</div><footer></footer>`;
  document.body.append(dlg);
  bind($("header button", dlg), "\u5173\u95ED\u5F39\u7A97", closeModal);
  for (const action of actions) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "demo-button" + (action.secondary ? " secondary" : "");
    btn.textContent = action.label;
    btn.disabled = !!action.disabled;
    $("footer", dlg).append(btn);
    bind(btn, action.label, () => action.run(btn));
  }
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg && (e.offsetX < 0 || e.offsetX > dlg.offsetWidth || e.offsetY < 0 || e.offsetY > dlg.offsetHeight)) closeModal();
  });
  dlg.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeModal();
  });
  dlg.showModal();
  return dlg;
}
function confirm(title, body, onConfirm, options = {}) {
  return modal(title, `<p>${escape(body)}</p>`, [
    { label: "\u53D6\u6D88", secondary: true, run: closeModal },
    { label: options.label || "\u786E\u8BA4", run: (btn) => busy(btn, async () => {
      const result = await onConfirm();
      closeModal();
      options.after?.(result);
    }) }
  ]);
}
function field(name, title, value = "", options = {}) {
  const attrs = `name="${escape(name)}" aria-label="${escape(title)}" ${options.required === false ? "" : "required"} ${options.min != null ? `min="${escape(options.min)}"` : ""} ${options.max != null ? `max="${escape(options.max)}"` : ""}`;
  let input;
  if (options.choices) input = `<select ${attrs}>${options.choices.map((c) => {
    const [val, text] = Array.isArray(c) ? c : [c, c];
    return `<option value="${escape(val)}" ${String(value) === String(val) ? "selected" : ""}>${escape(text)}</option>`;
  }).join("")}</select>`;
  else if (options.type === "textarea") input = `<textarea ${attrs} maxlength="${options.maxLength || 1e3}" rows="4">${escape(value)}</textarea>`;
  else input = `<input ${attrs} type="${options.type || "text"}" value="${escape(value)}" ${options.step ? `step="${options.step}"` : ""} ${options.pattern ? `pattern="${escape(options.pattern)}"` : ""} autocomplete="off">`;
  return `<label class="demo-field"><span>${escape(title)}</span>${input}</label>`;
}
function formModal(title, fields, onSubmit, buttonText = "\u786E\u8BA4\u63D0\u4EA4") {
  let dlg;
  const submit = (btn) => {
    const form = $("form", dlg);
    if (!form.reportValidity()) return;
    return busy(btn, async () => {
      const values = Object.fromEntries(new FormData(form));
      const result = await onSubmit(values);
      if (dlg.isConnected && result !== false) closeModal();
    }).catch((error) => {
      if (dlg.isConnected) $(".demo-form-error", dlg).textContent = error.message;
      toast(error.message, true);
    });
  };
  dlg = modal(title, `<form class="demo-form">${fields}<p class="demo-form-error" role="alert"></p><button type="submit" hidden></button></form>`, [
    { label: "\u53D6\u6D88", secondary: true, run: closeModal },
    { label: buttonText, run: submit }
  ]);
  $("form", dlg).addEventListener("submit", (e) => {
    e.preventDefault();
    submit($("footer button:last-child", dlg)).catch((error) => {
      $(".demo-form-error", dlg).textContent = error.message;
    });
  });
  return dlg;
}
function active(elements, selected) {
  for (const el of elements) {
    el.setAttribute("aria-pressed", String(el === selected));
    el.classList.toggle("demo-selected", el === selected);
    if (el !== selected) el.classList.remove("bg-primary", "text-on-primary", "bg-primary-container", "text-on-primary-container", "bg-surface-container-lowest", "shadow-sm");
  }
}
function download(filename, data, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
function csv(filename, rows) {
  download(filename, "\uFEFF" + rows.map((row) => row.map((v) => `"${String(v ?? "").replace(/^[=+@-]/, "'$&").replaceAll('"', '""')}"`).join(",")).join("\r\n"), "text/csv;charset=utf-8");
}
function empty(text = "\u6682\u65E0\u8BB0\u5F55") {
  return `<p class="demo-empty">${icon("inbox")}${escape(text)}</p>`;
}
function list(items, render) {
  return items.length ? `<div class="demo-list">${items.map(render).join("")}</div>` : empty();
}

// src/services/audio.js
function createRadio(onUpdate = () => {
}) {
  const audio = new Audio("/assets/community-radio.wav");
  audio.preload = "metadata";
  for (const event of ["timeupdate", "loadedmetadata", "play", "pause", "ended", "ratechange"]) audio.addEventListener(event, () => onUpdate(audio));
  audio.addEventListener("error", () => onUpdate(audio, new Error("\u97F3\u9891\u52A0\u8F7D\u5931\u8D25\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u8BD5")));
  const toggle = async () => {
    if (audio.paused) {
      if (audio.ended) audio.currentTime = 0;
      await audio.play();
    } else audio.pause();
  };
  const seek = (value) => {
    if (Number.isFinite(audio.duration)) audio.currentTime = Math.max(0, Math.min(audio.duration, value));
  };
  window.addEventListener("pagehide", () => audio.pause());
  return { audio, toggle, seek };
}

// src/pages/resident.js
var find = (text, root = document) => $$('button,a,[role="button"],.cursor-pointer', root).filter((e) => typeof text === "string" ? label(e) === text : text.test(label(e)));
var on = (text, fn) => find(text).forEach((el) => {
  if (!el.dataset.action) bind(el, label(el), () => fn(el));
});
var today = () => (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA");
function initResident(ctx) {
  const { route: route2, store: store2, state: state2, go: go2, qs: qs2, panel: panel2, requireAuth: requireAuth2 } = ctx;
  if (route2.key === "login") loginPage(ctx);
  if (route2.key === "verify") verifyPage(ctx);
  if (route2.key === "repair") repairPage(ctx);
  if (route2.key === "review") reviewPage(ctx);
  if (["bills", "billing"].includes(route2.key)) billingPage(ctx);
  if (route2.key === "points") pointsPage(ctx);
  if (route2.key === "services") servicesPage(ctx);
  if (route2.key === "profile") {
    const amount = $$("span,div").find((e) => e.children.length === 0 && e.textContent.trim() === "1,280 \u79EF\u5206");
    if (amount) {
      amount.dataset.points = "";
      amount.textContent = state2().user.points.toLocaleString("zh-CN");
    }
    const activeOrder = state2().orders.find((o) => !["closed", "cancelled"].includes(o.status) && o.room === state2().user.room);
    const card = $$("main div").find((e) => e.classList.contains("bg-surface-container-lowest") && e.textContent.includes("\u6B63\u5728\u4E3A\u60A8\u670D\u52A1"));
    if (card && activeOrder) {
      const title = $("h2,h3,h4", card);
      if (title) title.textContent = activeOrder.title;
      bind(card, "\u67E5\u770B\u8FDB\u884C\u4E2D\u5DE5\u5355", () => go2("/mobile/orders/" + activeOrder.id));
    }
    const buttons3 = document.createElement("div");
    buttons3.className = "demo-inline";
    buttons3.innerHTML = `<button class="demo-button secondary" data-profile="bookings">${icon("event_note")}\u9884\u7EA6\u8BB0\u5F55</button><button class="demo-button secondary" data-profile="account">${icon("manage_accounts")}\u8D26\u53F7\u8BBE\u7F6E</button><button class="demo-button secondary" data-profile="bills">${icon("receipt_long")}\u5386\u53F2\u8D26\u671F</button>`;
    $("main > div").append(buttons3);
    $$("[data-profile]").forEach((b) => bind(b, label(b), () => b.dataset.profile === "bills" ? go2("/mobile/bills") : panel2(b.dataset.profile)));
  }
  if (route2.group === "mobile") {
    on(/我要开闪铺|我要开铺|我也要开铺|入驻开店/, () => requireAuth2(() => shopForm(ctx)));
    on(/发布|说点什么|文字投稿/, () => requireAuth2(() => postForm(ctx)));
    on(/^我的报修/, () => panel2("orders"));
    on(/积分明细/, () => pointsHistory(ctx));
    on(/兑换记录/, () => redemptionHistory(ctx));
    on(/去逛邻里圈/, () => go2("/mobile/services?panel=community-feed"));
    if (qs2.get("panel") === "community-feed") communityFeed(ctx);
  }
}
function loginPage(ctx) {
  const { route: route2, qs: qs2, safeNext: safeNext2, go: go2, state: state2, role: role2 } = ctx;
  const account = $("#accountInput"), password = $("#passwordInput"), agreement = $("#agreementCheckbox");
  account.value = role2 === "group" ? "group-admin" : role2 === "admin" ? "admin" : role2 === "worker" ? "worker" : "13800006688";
  password.value = "demo123";
  password.autocomplete = "current-password";
  agreement.checked = false;
  if (role2 !== "resident") {
    const heading = $("header h1,header .font-headline-sm");
    if (heading) heading.textContent = role2 === "group" ? "\u96C6\u56E2\u7BA1\u7406\u5458\u767B\u5F55" : role2 === "admin" ? "\u7269\u4E1A\u7BA1\u7406\u5458\u767B\u5F55" : "\u7EF4\u4FEE\u5E08\u5085\u767B\u5F55";
  }
  bind($("#clearAccountBtn"), "\u6E05\u7A7A\u8D26\u53F7", () => {
    account.value = "";
    account.focus();
  });
  bind($("#togglePasswordBtn"), "\u663E\u793A\u6216\u9690\u85CF\u5BC6\u7801", () => {
    password.type = password.type === "password" ? "text" : "password";
    $("#eyeIcon").textContent = password.type === "password" ? "visibility_off" : "visibility";
  });
  $("#clearAccountBtn").classList.remove("opacity-0", "pointer-events-none");
  let mode = "password";
  on(/短信验证码登录/, (el) => {
    mode = mode === "password" ? "sms" : "password";
    password.type = mode === "sms" ? "text" : "password";
    password.value = mode === "sms" ? "123456" : "demo123";
    password.setAttribute("aria-label", mode === "sms" ? "\u6F14\u793A\u9A8C\u8BC1\u7801" : "\u767B\u5F55\u5BC6\u7801");
    el.innerHTML = icon("sms") + (mode === "sms" ? "\u8D26\u53F7\u5BC6\u7801\u767B\u5F55" : "\u77ED\u4FE1\u9A8C\u8BC1\u7801\u767B\u5F55");
    toast(mode === "sms" ? "\u6F14\u793A\u9A8C\u8BC1\u7801\u4E3A123456\uFF0C\u4E0D\u4F1A\u53D1\u9001\u771F\u5B9E\u77ED\u4FE1" : "\u5DF2\u5207\u6362\u5BC6\u7801\u767B\u5F55");
  });
  on(/忘记密码/, () => formModal("\u91CD\u7F6E\u6F14\u793A\u5BC6\u7801", field("phone", "\u624B\u673A\u53F7", "", { type: "tel", pattern: "1[3-9][0-9]{9}" }) + field("code", "\u6F14\u793A\u9A8C\u8BC1\u7801", "123456") + field("password", "\u65B0\u5BC6\u7801", "", { type: "password" }) + field("confirm", "\u786E\u8BA4\u5BC6\u7801", "", { type: "password" }), (v) => {
    if (v.code !== "123456") throw new Error("\u9A8C\u8BC1\u7801\u4E0D\u6B63\u786E");
    if (v.password.length < 6) throw new Error("\u5BC6\u7801\u81F3\u5C116\u4F4D");
    if (v.password !== v.confirm) throw new Error("\u4E24\u6B21\u5BC6\u7801\u8F93\u5165\u4E0D\u4E00\u81F4");
    sessionStorage.setItem("shengbian-password", v.password);
    toast("\u6F14\u793A\u5BC6\u7801\u5DF2\u66F4\u65B0");
  }));
  const submit = (btn) => busy(btn, () => {
    if (!agreement.checked) throw new Error("\u8BF7\u5148\u9605\u8BFB\u5E76\u540C\u610F\u670D\u52A1\u534F\u8BAE\u4E0E\u9690\u79C1\u653F\u7B56");
    const validAccount = ["admin", "worker", "group-admin"].includes(account.value.trim()) || isPhone(account.value.trim());
    if (!validAccount) throw new Error("\u8BF7\u8F93\u5165\u6709\u6548\u624B\u673A\u53F7\u6216\u6F14\u793A\u8D26\u53F7");
    if (mode === "password" && password.value !== (sessionStorage.getItem("shengbian-password") || "demo123")) throw new Error("\u8D26\u53F7\u6216\u5BC6\u7801\u4E0D\u6B63\u786E");
    if (mode === "sms" && password.value !== "123456") throw new Error("\u9A8C\u8BC1\u7801\u4E0D\u6B63\u786E");
    if (role2 === "admin" && account.value !== "admin") throw new Error("\u8BF7\u4F7F\u7528\u7BA1\u7406\u5458\u6F14\u793A\u8D26\u53F7 admin");
    if (role2 === "worker" && account.value !== "worker") throw new Error("\u8BF7\u4F7F\u7528\u7EF4\u4FEE\u5E08\u5085\u6F14\u793A\u8D26\u53F7 worker");
    if (role2 === "group" && account.value !== "group-admin") throw new Error("\u8BF7\u4F7F\u7528\u96C6\u56E2\u7BA1\u7406\u5458\u6F14\u793A\u8D26\u53F7 group-admin");
    sessionStorage.setItem("shengbian-auth-" + role2, "yes");
    go2(safeNext2(qs2.get("next") || (role2 === "group" ? "/web/group" : role2 === "admin" ? "/web/overview" : role2 === "worker" ? "/worker/tasks" : "/mobile/home")));
  });
  const submitButton = $('#loginForm button[type="submit"]');
  submitButton.dataset.action = "\u7ACB\u5373\u767B\u5F55";
  $("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    submit(submitButton).catch((error) => toast(error.message, true));
  });
  on("\u5FAE\u4FE1\u4E00\u952E\u5FEB\u6377\u767B\u5F55", (btn) => {
    if (!agreement.checked) return toast("\u8BF7\u5148\u540C\u610F\u670D\u52A1\u534F\u8BAE\u4E0E\u9690\u79C1\u653F\u7B56", true);
    confirm("\u5FAE\u4FE1\u6F14\u793A\u6388\u6743", "\u5C06\u4EE5\u6D4B\u8BD5\u5C45\u6C11\u8EAB\u4EFD\u767B\u5F55\uFF0C\u4E0D\u4F1A\u8BFB\u53D6\u771F\u5B9E\u5FAE\u4FE1\u4FE1\u606F\u3002", () => sessionStorage.setItem("shengbian-auth-resident", "yes"), { label: "\u786E\u8BA4\u6388\u6743", after: () => go2(safeNext2(qs2.get("next") || "/mobile/home")) });
  });
  on(/去办理/, () => go2("/mobile/verify"));
  const note = document.createElement("p");
  note.className = "demo-auth-note";
  note.textContent = "\u6F14\u793A\u73AF\u5883 \xB7 \u4F7F\u7528\u865A\u6784\u8D44\u6599 \xB7 \u65E0\u771F\u5B9E\u8EAB\u4EFD\u6838\u9A8C\u6216\u652F\u4ED8";
  $("#loginForm").after(note);
  const audio = $$("main div").find((e) => e.classList.contains("rounded-xl") && e.textContent.includes("\u793E\u533A\u90BB\u91CC\u6668\u64AD\u53F0"));
  if (audio) bind(audio, "\u6536\u542C\u6668\u95F4\u5E7F\u64AD", () => ctx.speech(void 0));
}
function verifyPage(ctx) {
  const { store: store2, state: state2, go: go2, upload: upload2 } = ctx;
  let role2 = "owner", method = 1;
  const nameInput = $('input[placeholder*="\u771F\u5B9E\u59D3\u540D"]'), idInput = $("#idCardInput");
  idInput.value = "110101199001010010";
  idInput.type = "password";
  bind($("#toggleIdMask"), "\u663E\u793A\u6216\u9690\u85CF\u8BC1\u4EF6\u53F7\u7801", () => {
    idInput.type = idInput.type === "password" ? "text" : "password";
    $("#eyeIcon").textContent = idInput.type === "password" ? "visibility_off" : "visibility";
  });
  const roleButtons = [$("#roleOwnerBtn"), $("#roleTenantBtn")];
  roleButtons.forEach((btn, i) => bind(btn, i ? "\u79DF\u5BA2\u5165\u4F4F" : "\u4E1A\u4E3B\u5165\u4F4F", () => {
    role2 = i ? "tenant" : "owner";
    active(roleButtons, btn);
    $("#ownerVerificationCard").classList.toggle("hidden", !!i);
    $("#tenantHintCard").classList.toggle("hidden", !i);
    $("#submitBtn").innerHTML = icon("verified_user") + (i ? "\u63D0\u4EA4\u79DF\u7EA6\u5E76\u7533\u8BF7\u8BA4\u8BC1" : "\u63D0\u4EA4\u786E\u6743\u5E76\u7ED1\u5B9A\u623F\u5C4B");
    if (i && !$("#tenant-upload")) {
      const button = document.createElement("button");
      button.id = "tenant-upload";
      button.className = "demo-button secondary";
      button.textContent = "\u4E0A\u4F20\u79DF\u7EA6";
      $("#tenantHintCard").append(button);
      bind(button, "\u4E0A\u4F20\u79DF\u7EA6", () => upload2(button, { accept: "image/*,.pdf" }));
    }
  }));
  for (let i = 1; i <= 3; i++) bind($("#tabMethod" + i), "\u8BA4\u8BC1\u65B9\u5F0F" + i, () => {
    method = i;
    for (let j = 1; j <= 3; j++) $("#methodContent" + j).classList.toggle("hidden", j !== i);
    active([1, 2, 3].map((j) => $("#tabMethod" + j)), $("#tabMethod" + i));
  });
  $$("main .material-symbols-outlined").filter((e) => ["keyboard_arrow_down", "expand_more"].includes(e.textContent.trim())).forEach((el) => {
    const row = el.parentElement;
    bind(row, "\u9009\u62E9\u623F\u5C4B\u4FE1\u606F", () => formModal("\u623F\u5C4B\u5750\u843D", field("room", "\u697C\u680B-\u5355\u5143-\u623F\u53F7", state2().user.room), (v) => {
      if (!/^\d{1,3}-\d{1,2}-\d{1,4}$/.test(v.room)) throw new Error("\u623F\u53F7\u683C\u5F0F\u4E3A16-2-502");
      store2.change((s) => s.user.room = v.room);
      toast("\u623F\u5C4B\u4FE1\u606F\u5DF2\u66F4\u65B0");
      row.querySelector("span").textContent = v.room;
    }));
  });
  $$("main .material-symbols-outlined").filter((e) => ["receipt_long", "task_alt"].includes(e.textContent.trim()) && e.closest('[id^="methodContent"]')).forEach((el) => {
    const card = el.parentElement;
    if (!card.closest("[data-action]")) bind(card, "\u4E0A\u4F20\u8BA4\u8BC1\u51ED\u8BC1", () => upload2(card, { accept: "image/*,.pdf" }));
  });
  bind($("#submitBtn"), "\u63D0\u4EA4\u623F\u5C4B\u8BA4\u8BC1", (btnEvent) => {
    const name = nameInput.value.trim();
    if (name.length < 2) throw new Error("\u8BF7\u8F93\u5165\u771F\u5B9E\u59D3\u540D\uFF08\u6F14\u793A\u8BF7\u4F7F\u7528\u865A\u6784\u59D3\u540D\uFF09");
    if (!/^\d{17}[\dXx]$/.test(idInput.value)) throw new Error("\u8EAB\u4EFD\u8BC1\u53F7\u7801\u987B\u4E3A18\u4F4D");
    if (!$("#agreementCheck").checked) throw new Error("\u8BF7\u786E\u8BA4\u5E76\u540C\u610F\u623F\u5C4B\u4FE1\u606F\u6388\u6743");
    const value = $(`#methodContent${method} input`)?.value.trim();
    if (role2 === "owner" && !value) throw new Error("\u8BF7\u586B\u5199\u6240\u9009\u8BA4\u8BC1\u65B9\u5F0F\u7684\u51ED\u8BC1\u7F16\u53F7");
    if (role2 === "owner" && method === 2 && !/^\d{20}$/.test(value)) throw new Error("\u7F51\u7B7E\u5408\u540C\u53F7\u987B\u4E3A20\u4F4D\u6570\u5B57");
    if (role2 === "tenant" && !(state2().drafts["uploads-verify"] || []).length) throw new Error("\u8BF7\u4E0A\u4F20\u79DF\u7EA6\u51ED\u8BC1");
    return confirm("\u63D0\u4EA4\u623F\u4EA7\u8BA4\u8BC1", "\u6B64\u64CD\u4F5C\u4EC5\u521B\u5EFA\u6F14\u793A\u8BA4\u8BC1\u8BB0\u5F55\uFF0C\u4E0D\u4F1A\u8C03\u7528\u771F\u5B9E\u516C\u5B89\u6216\u623F\u4EA7\u63A5\u53E3\u3002", () => {
      store2.change((s) => {
        s.user.name = name;
        s.user.verified = role2 === "owner";
        s.user.role = role2;
        s.logs.unshift({ id: id("VERIFY"), action: "\u63D0\u4EA4\u623F\u4EA7\u8BA4\u8BC1", target: `${name} \xB7 ${s.user.room} \xB7 ${role2 === "tenant" ? "\u79DF\u5BA2\u5F85\u5BA1\u6838" : "\u6F14\u793A\u786E\u6743"}`, at: now() });
      });
      sessionStorage.setItem("shengbian-auth-resident", "yes");
    }, { after: () => go2("/mobile/profile") });
  });
}
function repairPage(ctx) {
  const { store: store2, state: state2, go: go2, upload: upload2 } = ctx;
  let scope = "private", category = "\u7BA1\u9053\u758F\u901A", date = today(), slot = "\u4E0A\u5348\u65F6\u6BB5 09:00 - 11:30", callConfirm = true;
  const draft = state2().drafts.repair || {};
  if (draft.description) $("#issue-text").value = draft.description;
  const save = () => store2.saveDraft("repair", { description: $("#issue-text").value, scope, category, date, slot, callConfirm });
  $("#issue-text").maxLength = 1e3;
  $("#issue-text").addEventListener("input", save);
  [$("#tab-private"), $("#tab-public")].forEach((btn, i) => bind(btn, i ? "\u516C\u5171\u533A\u57DF\u62A5\u4FEE" : "\u5BA4\u5185\u4E13\u6709\u62A5\u4FEE", () => {
    scope = i ? "public" : "private";
    active([$("#tab-private"), $("#tab-public")], btn);
    save();
  }));
  $$("#category-group button").forEach((btn) => bind(btn, label(btn), () => {
    category = label(btn);
    active($$("#category-group button"), btn);
    save();
  }));
  $$("#date-selector button").forEach((btn, i) => {
    if (i < 3) {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() + i);
      const value = d.toLocaleDateString("en-CA");
      $("span:last-child", btn).textContent = `${d.getMonth() + 1}-${d.getDate()}`;
      bind(btn, ["\u4ECA\u5929", "\u660E\u5929", "\u540E\u5929"][i], () => {
        date = value;
        active($$("#date-selector button"), btn);
        save();
      });
    } else bind(btn, "\u81EA\u9009\u65E5\u671F", () => formModal("\u9009\u62E9\u9884\u7EA6\u65E5\u671F", field("date", "\u9884\u7EA6\u65E5\u671F", date, { type: "date", min: today() }), (v) => {
      date = v.date;
      active($$("#date-selector button"), btn);
      $("span:last-child", btn).textContent = date;
      save();
    }));
  });
  $$("#slot-selector button").forEach((btn) => bind(btn, label(btn), () => {
    slot = label(btn);
    active($$("#slot-selector button"), btn);
    save();
  }));
  bind($("#toggle-call"), "\u4E0A\u95E8\u524D\u7535\u8BDD\u786E\u8BA4", () => {
    callConfirm = !callConfirm;
    $("#toggle-call").setAttribute("aria-pressed", String(callConfirm));
    $("#toggle-call").style.background = callConfirm ? "#006544" : "#bdc9c0";
    $("#toggle-call span").style.transform = `translateX(${callConfirm ? 16 : 0}px)`;
    save();
  });
  bind($("#voice-record-btn"), "\u8BED\u97F3\u586B\u5199\u6545\u969C\u63CF\u8FF0", () => voiceInput(ctx, $("#issue-text")));
  on(/立即提交报修/, (btn) => {
    if ($("#issue-text").value.trim().length < 5) throw new Error("\u8BF7\u586B\u5199\u81F3\u5C115\u4E2A\u5B57\u7684\u6545\u969C\u63CF\u8FF0");
    formModal("\u786E\u8BA4\u62A5\u4FEE\u4FE1\u606F", `<p>${escape(category)} \xB7 ${escape(date)} \xB7 ${escape(slot)}</p>` + field("contact", "\u8054\u7CFB\u4EBA", state2().user.name) + field("phone", "\u8054\u7CFB\u7535\u8BDD", state2().user.phone, { type: "tel", pattern: "1[3-9][0-9]{9}" }) + field("room", scope === "public" ? "\u516C\u5171\u533A\u57DF\u5177\u4F53\u4F4D\u7F6E" : "\u62A5\u4FEE\u623F\u5C4B", scope === "public" ? "" : state2().user.room), (values) => {
      const photos = [
        ...$$("main img").map((img) => ({ src: img.src, name: "\u73B0\u573A\u793A\u4F8B\u7167\u7247" })),
        ...state2().drafts["uploads-repair"] || []
      ];
      const order = store2.createOrder({ ...values, scope, category, description: $("#issue-text").value.trim(), appointment: date + " " + slot, urgent: slot.includes("\u52A0\u6025"), callConfirm, photos });
      store2.saveDraft("repair", {});
      store2.saveDraft("uploads-repair", []);
      go2("/mobile/orders/" + order.id + "?submitted=1");
    }, "\u786E\u8BA4\u63D0\u4EA4\u62A5\u4FEE");
  });
}
function reviewPage(ctx) {
  const { state: state2, store: store2, qs: qs2, go: go2 } = ctx;
  const orderId = qs2.get("id") || "BX202407220038";
  const order = state2().orders.find((o) => o.id === orderId);
  let rating = 5;
  const subratings = { \u4E0A\u95E8\u51C6\u65F6\u6027: 5, \u6280\u672F\u4E13\u4E1A\u5EA6: 5, \u670D\u52A1\u6001\u5EA6: 5, \u73B0\u573A\u536B\u751F: 5 };
  const stars = $$("#main-star-group button");
  stars.forEach((btn, index) => bind(btn, `${index + 1}\u661F`, () => {
    rating = index + 1;
    stars.forEach((b, i) => {
      $("span", b).style.fontVariationSettings = `'FILL' ${i <= index ? 1 : 0}`;
      b.style.color = i <= index ? "#9d6300" : "#bdc9c0";
      b.setAttribute("aria-pressed", String(i <= index));
    });
    $("#rating-text span:last-child").textContent = ["\u975E\u5E38\u4E0D\u6EE1\u610F\uFF0C\u6709\u5F85\u6539\u8FDB", "\u8F83\u4E0D\u6EE1\u610F\uFF0C\u4F53\u9A8C\u6B20\u4F73", "\u4E00\u822C\uFF0C\u57FA\u672C\u7B26\u5408\u9884\u671F", "\u6EE1\u610F\uFF0C\u5E08\u5085\u6280\u672F\u53EF\u9760", "\u975E\u5E38\u6EE1\u610F\uFF0C\u8D85\u51FA\u9884\u671F\uFF01"][index];
  }));
  $$(".tag-chip").forEach((btn) => bind(btn, label(btn), () => {
    const selected = btn.dataset.selected !== "true";
    btn.dataset.selected = String(selected);
    btn.classList.toggle("demo-selected", selected);
    btn.setAttribute("aria-pressed", String(selected));
  }));
  $$(".material-symbols-outlined").filter((e) => e.textContent.trim() === "star" && !e.closest("button") && e.closest("main")).forEach((star) => {
    const row = star.parentElement.parentElement;
    const all = $$(".material-symbols-outlined", star.parentElement).filter((e) => e.textContent === "star");
    const key = Object.keys(subratings).find((k) => row.textContent.includes(k));
    if (key) bind(star, key + "\u8BC4\u5206", () => {
      subratings[key] = all.indexOf(star) + 1;
      all.forEach((s, i) => s.style.fontVariationSettings = `'FILL' ${i < subratings[key] ? 1 : 0}`);
    });
  });
  $("#comment-input").maxLength = 300;
  $("#comment-input").addEventListener("input", (e) => $("#char-counter").textContent = `${e.target.value.length}/300`);
  bind($("#voice-btn"), "\u8BED\u97F3\u586B\u5199\u8BC4\u4EF7", () => voiceInput(ctx, $("#comment-input")));
  bind($("#submit-review-btn"), "\u63D0\u4EA4\u8BC4\u4EF7\u5E76\u9886\u53D6\u79EF\u5206", () => confirm("\u63D0\u4EA4\u670D\u52A1\u8BC4\u4EF7", `\u7EFC\u5408\u8BC4\u5206\uFF1A${rating}\u661F\u3002\u8BC4\u4EF7\u540E\u53D1\u653E20\u79EF\u5206\uFF0C\u6BCF\u4E2A\u5DE5\u5355\u4EC5\u4E00\u6B21\u3002`, () => store2.review(orderId, {
    rating,
    subratings,
    comment: $("#comment-input").value,
    tags: $$('.tag-chip[data-selected="true"]').map(label),
    recommend: $$("main input[type=checkbox]")[0]?.checked || false,
    anonymous: $$("main input[type=checkbox]")[1]?.checked || false,
    photos: state2().drafts["uploads-review"] || []
  }), { after: () => {
    modal("\u8BC4\u4EF7\u5DF2\u63D0\u4EA4", "<p>\u611F\u8C22\u60A8\u7684\u771F\u5B9E\u53CD\u9988\uFF0C20\u79EF\u5206\u5DF2\u5165\u8D26\u3002</p>", [{ label: "\u67E5\u770B\u5DE5\u5355", run: () => go2("/mobile/orders/" + orderId) }, { label: "\u67E5\u770B\u79EF\u5206", secondary: true, run: () => go2("/mobile/points") }]);
  } }));
  if (!order || !["completed", "closed"].includes(order.status)) {
    $("#submit-review-btn").disabled = true;
    toast("\u8BE5\u5DE5\u5355\u4E0D\u5B58\u5728\u6216\u5C1A\u672A\u5B8C\u5DE5\uFF0C\u4E0D\u80FD\u8BC4\u4EF7", true);
  } else {
    const heading = $("main h2");
    if (heading) heading.textContent = order.title;
    if (state2().reviews.some((r) => r.orderId === orderId)) {
      $("#submit-review-btn").disabled = true;
      $("#submit-review-btn").textContent = "\u5DF2\u8BC4\u4EF7\uFF0C\u79EF\u5206\u5DF2\u5165\u8D26";
    }
  }
}
function billingPage(ctx) {
  const { route: route2, state: state2, qs: qs2, store: store2, go: go2 } = ctx;
  const book = route2.key === "bills" ? "legacy" : "current";
  let tab = ["property", "parking", "others"].includes(qs2.get("tab")) ? qs2.get("tab") : "property";
  const tabs = ["property", "parking", "others"];
  const topAmount = $("#topTotalAmount") || $$("main span").find((e) => e.textContent.trim() === "983.20");
  const topTitle = $("#totalTitleLabel");
  const summary = $("#payAllBtn");
  const update = () => {
    const bills = state2().bills.filter((b) => b.book === book);
    tabs.forEach((type) => {
      const content = $("#content-" + type);
      if (!content) return;
      content.classList.toggle("hidden", type !== tab);
      const bill = bills.find((b) => b.type === type);
      if (bill && book === "current") {
        const title = $("h2,h3,h4", content);
        if (title) title.textContent = bill.title;
      }
      if (bill) {
        const pendingLabel = $$("span", content).find((e) => /^待缴/.test(e.textContent.trim()) && e.children.length === 0);
        if (pendingLabel) {
          pendingLabel.textContent = bill.paid ? "\u5DF2\u7F34\u6E05" : "\u5F85\u7F34\u8D26\u5355";
          pendingLabel.dataset.billState = "";
        }
        $$("[data-bill-pay]", content).forEach((btn) => {
          btn.disabled = bill.paid;
          if (bill.paid) btn.textContent = "\u5DF2\u7F34\u6E05";
        });
      }
    });
    active(tabs.map((t) => $("#tab-" + t)), $("#tab-" + tab));
    const pending = bills.filter((b) => !b.paid && (book === "legacy" || b.type === tab));
    if (topAmount) topAmount.textContent = money(pending.reduce((sum, b) => sum + b.amount, 0));
    if (topTitle) topTitle.textContent = `\u5F53\u524D\u5F85\u7F34\u603B\u989D (${tab === "property" ? "\u7269\u4E1A\u670D\u52A1\u8D39" : tab === "parking" ? "\u8F66\u4F4D\u7BA1\u7406\u8D39" : "\u516C\u5171\u80FD\u8017\u4E0E\u7EF4\u4FEE\u8D39"})`;
    summary.disabled = !pending.length;
    const text = $("#payAllBtnText");
    if (text) text.textContent = !pending.length ? "\u672C\u9879\u5DF2\u7F34\u6E05" : `\u7F34\u7EB3${tab === "property" ? "\u7269\u4E1A\u8D39" : tab === "parking" ? "\u505C\u8F66\u8D39" : "\u5176\u4ED6\u8D39\u7528"}`;
    if (!pending.length && book === "legacy") summary.textContent = "\u8D26\u5355\u5DF2\u7F34\u6E05";
    const repairBills = bills.filter((b) => b.orderId);
    if (book === "current") {
      let box = $("#repair-bills");
      if (!box) {
        box = document.createElement("div");
        box.id = "repair-bills";
        $("#content-others").prepend(box);
      }
      box.innerHTML = list(repairBills, (b) => `<article><strong>${escape(b.title)}</strong><p>\xA5${money(b.amount)} \xB7 ${b.paid ? "\u5DF2\u7F34\u6E05" : "\u5F85\u7F34\u8D39"}</p><button class="demo-button" data-repair-pay="${b.id}" ${b.paid ? "disabled" : ""}>\u7F34\u7EB3\u7EF4\u4FEE\u8D39</button></article>`);
      $$("[data-repair-pay]", box).forEach((btn) => bind(btn, "\u7F34\u7EB3\u7EF4\u4FEE\u8D39", () => payDialog(ctx, [btn.dataset.repairPay], update)));
    }
  };
  tabs.forEach((type) => bind($("#tab-" + type), "\u5207\u6362" + type + "\u8D26\u5355", () => {
    tab = type;
    const url = new URL(location.href);
    url.searchParams.set("tab", tab);
    history.replaceState(null, "", url);
    update();
  }));
  bind(summary, "\u7F34\u7EB3\u5F53\u524D\u8D26\u5355", () => payDialog(ctx, state2().bills.filter((b) => b.book === book && !b.paid && (book === "legacy" || b.type === tab)).map((b) => b.id), update));
  tabs.forEach((type) => {
    const content = $("#content-" + type);
    if (!content) return;
    find(/立即缴费|缴车位费|缴纳停车费/, content).forEach((btn) => {
      btn.dataset.billPay = type;
      bind(btn, "\u7F34\u7EB3" + type + "\u8D26\u5355", () => payDialog(ctx, state2().bills.filter((b) => b.book === book && b.type === type && !b.paid && !b.orderId).map((b) => b.id), update));
    });
  });
  bind($("#houseDropdownBtn"), "\u9009\u62E9\u7F34\u8D39\u623F\u4EA7", () => {
    $("#houseDropdownMenu").classList.toggle("hidden");
    $("#houseDropdownBtn").setAttribute("aria-expanded", String(!$("#houseDropdownMenu").classList.contains("hidden")));
  });
  $$("#houseDropdownMenu > div").forEach((row, i) => bind(row, i ? "\u9009\u62E9\u8F66\u4F4D\u8D26\u5355" : "\u9009\u62E9\u4F4F\u5B85\u8D26\u5355", () => {
    tab = i ? "parking" : "property";
    $("#houseDropdownMenu").classList.add("hidden");
    update();
  }));
  on(/查看公示/, () => go2("/mobile/articles/garden"));
  update();
  window.addEventListener("demo:external", update);
  if (qs2.get("bill") && state2().bills.some((b) => b.id === qs2.get("bill") && !b.paid)) payDialog(ctx, [qs2.get("bill")], update);
}
function payDialog(ctx, billIds, after) {
  if (!billIds.length) return toast("\u5F53\u524D\u8D26\u5355\u5DF2\u7F34\u6E05");
  const bills = ctx.state().bills.filter((b) => billIds.includes(b.id));
  const amount = bills.reduce((sum, b) => sum + b.amount, 0);
  const coupons = ctx.state().coupons.filter((c) => !c.used && bills.every((b) => b.type === c.type));
  const couponField = field("coupon", "\u62B5\u6263\u5238", "", { required: false, choices: [["", "\u4E0D\u4F7F\u7528"], ...coupons.map((c) => [c.id, `\u62B5\u6263 \xA5${c.amount}`])] });
  formModal("\u786E\u8BA4\u7F34\u8D39\uFF08\u6A21\u62DF\u652F\u4ED8\uFF09", list(bills, (b) => `<div>${escape(b.title)}<strong>\xA5${money(b.amount)}</strong></div>`) + `<p>\u8D26\u5355\u5408\u8BA1\uFF1A<strong>\xA5${money(amount)}</strong></p>` + couponField + field("result", "\u652F\u4ED8\u7ED3\u679C", "success", { choices: [["success", "\u6A21\u62DF\u652F\u4ED8\u6210\u529F"], ["failure", "\u6A21\u62DF\u652F\u4ED8\u5931\u8D25"]] }), (values) => {
    if (values.result === "failure") throw new Error("\u6A21\u62DF\u652F\u4ED8\u5931\u8D25\uFF0C\u8D26\u5355\u672A\u6263\u6B3E\uFF0C\u53EF\u91CD\u65B0\u652F\u4ED8");
    const payment = ctx.store.pay(billIds, values.coupon || void 0);
    after();
    modal("\u7F34\u8D39\u6210\u529F", `<p>\u5B9E\u4ED8 \xA5${money(payment.amount)}\uFF0C\u62B5\u6263 \xA5${money(payment.discount)}</p><p>\u4EA4\u6613\u53F7\uFF1A${escape(payment.id)}</p><p>\u5DF2\u83B7${Math.floor(payment.amount)}\u79EF\u5206\u3002</p>`, [
      { label: "\u67E5\u770B\u7535\u5B50\u56DE\u5355", run: () => modal("\u7F34\u8D39\u7535\u5B50\u56DE\u5355\uFF08\u6F14\u793A\uFF09", `<p>\u4EA4\u6613\u53F7\uFF1A${payment.id}</p><p>\u5B9E\u4ED8\uFF1A\xA5${money(payment.amount)}</p><p>${new Date(payment.at).toLocaleString("zh-CN")}</p><p>\u672C\u51ED\u8BC1\u975E\u7A0E\u52A1\u53D1\u7968\u3002</p>`, [{ label: "\u4E0B\u8F7D\u56DE\u5355", run: () => download(payment.id + ".txt", JSON.stringify(payment, null, 2)) }]) },
      { label: "\u8FD4\u56DE\u8D26\u5355", secondary: true, run: closeModal }
    ]);
    return false;
  }, "\u786E\u8BA4\u6A21\u62DF\u652F\u4ED8");
}
function pointsPage(ctx) {
  const { store: store2, state: state2, go: go2, requireAuth: requireAuth2 } = ctx;
  const balance = $$("main span").find((e) => e.textContent.trim() === "2,480");
  if (balance) {
    balance.dataset.points = "";
    balance.textContent = state2().user.points.toLocaleString("zh-CN");
  }
  const taskButtons = find(/做任务快速赚分/);
  taskButtons.forEach((btn) => bind(btn, "\u67E5\u770B\u79EF\u5206\u4EFB\u52A1", () => $("#taskSection").scrollIntoView({ behavior: "smooth" })));
  on(/去评价/, () => {
    const order = state2().orders.find((o) => o.status === "completed" && !state2().reviews.some((r) => r.orderId === o.id));
    if (!order) return modal("\u670D\u52A1\u8BC4\u4EF7", empty("\u6682\u65E0\u5F85\u8BC4\u4EF7\u5DE5\u5355"));
    go2("/mobile/review?id=" + order.id);
  });
  on(/报名参与/, () => formModal("\u5468\u672B\u7EFF\u690D\u5171\u5EFA\u62A5\u540D", field("name", "\u53C2\u4E0E\u4EBA\u59D3\u540D", state2().user.name) + field("phone", "\u624B\u673A\u53F7\u7801", state2().user.phone, { type: "tel", pattern: "1[3-9][0-9]{9}" }) + field("count", "\u53C2\u52A0\u4EBA\u6570", "1", { type: "number", min: 1, max: 10 }), (values) => {
    store2.change((s) => {
      if (s.bookings.some((b) => b.productId === "garden-activity" && b.status !== "\u5DF2\u53D6\u6D88")) throw new Error("\u5DF2\u62A5\u540D\u672C\u671F\u6D3B\u52A8\uFF0C\u8BF7\u52FF\u91CD\u590D\u63D0\u4EA4");
      s.bookings.unshift({ ...values, id: id("ACT"), productId: "garden-activity", title: "\u5468\u672B\u7EFF\u690D\u5171\u5EFA", date: "\u672C\u5468\u516D 09:00", status: "\u62A5\u540D\u6210\u529F\uFF0C\u5F85\u73B0\u573A\u7B7E\u5230", amount: 0, at: now() });
    });
    toast("\u62A5\u540D\u6210\u529F\uFF0C\u53C2\u4E0E\u6D3B\u52A8\u540E\u53D1\u653E50\u79EF\u5206");
  }));
  $$(".category-tab").forEach((btn) => bind(btn, "\u7B5B\u9009" + label(btn), () => {
    const category = btn.dataset.originalOnclick.match(/filterTab\('([^']+)'/)?.[1] || "all";
    active($$(".category-tab"), btn);
    $$(".product-item").forEach((item) => item.hidden = category !== "all" && !item.classList.contains(category));
  }));
  $$(".product-item").forEach((item, index) => {
    const reward = rewards[index];
    if (!reward) return;
    const btn = $("button", item);
    bind(btn, "\u5151\u6362" + reward.name, () => {
      const requestId = id("REQ");
      const paymentField = reward.cash ? field("cashPayment", "\u652F\u4ED8\u7ED3\u679C", "success", { choices: [["success", "\u6A21\u62DF\u652F\u4ED8\u6210\u529F"], ["failure", "\u6A21\u62DF\u652F\u4ED8\u5931\u8D25"]] }) : "";
      formModal("\u786E\u8BA4\u79EF\u5206\u5151\u6362", `<h3>${escape(reward.name)}</h3><p>\u6263\u9664 ${reward.points}\u79EF\u5206${reward.cash ? ` + \xA5${reward.cash}\uFF08\u6A21\u62DF\u652F\u4ED8\uFF09` : ""}\uFF0C\u5F53\u524D\u53EF\u7528 ${state2().user.points}\u79EF\u5206</p>` + field("delivery", "\u9886\u53D6\u65B9\u5F0F", "\u7269\u4E1A\u670D\u52A1\u4E2D\u5FC3\u81EA\u63D0", { choices: ["\u7269\u4E1A\u670D\u52A1\u4E2D\u5FC3\u81EA\u63D0", "\u914D\u9001\u81F3\u5DF2\u7ED1\u5B9A\u623F\u5C4B"] }) + paymentField, (values) => {
        const result = store2.redeem(reward.id, values.delivery, requestId, { cashPayment: values.cashPayment || "success" });
        if (balance) balance.textContent = state2().user.points.toLocaleString("zh-CN");
        const payment = result.paymentId && state2().payments.find((p) => p.id === result.paymentId);
        modal("\u5151\u6362\u6210\u529F", `<p>${escape(result.name)}</p><h3>\u6838\u9500\u7801\uFF1A${result.code}</h3><p>${escape(result.delivery)}</p>${payment ? `<p>\u6A21\u62DF\u652F\u4ED8\uFF1A\xA5${money(payment.amount)} \xB7 \u4EA4\u6613\u53F7 ${escape(payment.id)}</p>` : ""}`, [
          { label: "\u67E5\u770B\u5151\u6362\u8BB0\u5F55", run: () => redemptionHistory(ctx) },
          { label: "\u8FD4\u56DE\u79EF\u5206\u4E2D\u5FC3", secondary: true, run: closeModal }
        ]);
        return false;
      }, "\u786E\u8BA4\u5151\u6362");
    });
  });
  let accumulated = Number(state2().drafts["listened-" + today()] || 0), previous = Date.now();
  const radio = createRadio((audio, error) => {
    if (error) return toast(error.message, true);
    $("#radioIcon").textContent = audio.paused ? "play_arrow" : "pause";
    $("#radioText").textContent = audio.paused ? "\u542C\u64AD\u8D5A\u5206" : "\u6536\u542C\u4E2D...";
  });
  radio.audio.loop = true;
  const timer = setInterval(() => {
    const elapsed = Math.min(1e3, Date.now() - previous);
    previous = Date.now();
    if (!radio.audio.paused && !radio.audio.seeking && radio.audio.readyState >= 3 && !document.hidden) {
      accumulated += elapsed;
      if (accumulated >= 12e4) {
        store2.award(15, "\u6BCF\u65E5\u6536\u542C\u5E7F\u64AD", "radio-" + today());
        $("#radioText").textContent = "\u4ECA\u65E5\u79EF\u5206\u5DF2\u5165\u8D26";
        clearInterval(timer);
      }
      store2.saveDraft("listened-" + today(), accumulated);
    }
  }, 1e3);
  window.addEventListener("pagehide", () => clearInterval(timer));
  bind($("#radioPlayBtn"), "\u6536\u542C\u793E\u533A\u5E7F\u64AD\u8D5A\u79EF\u5206", radio.toggle);
}
function pointsHistory(ctx) {
  modal("\u79EF\u5206\u660E\u7EC6", list(ctx.state().pointsLog, (p) => `<article><strong>${p.delta > 0 ? "+" : ""}${p.delta} \u5206 \xB7 ${escape(p.reason)}</strong><small>${new Date(p.at).toLocaleString("zh-CN")}</small></article>`));
}
function redemptionHistory(ctx) {
  modal("\u5151\u6362\u8BB0\u5F55", list(ctx.state().redemptions, (r) => `<article><strong>${escape(r.name)}</strong><p>${r.points}\u79EF\u5206 \xB7 \u6838\u9500\u7801 ${r.code} \xB7 ${escape(r.status)}</p><small>${escape(r.delivery)} \xB7 ${new Date(r.at).toLocaleString("zh-CN")}</small></article>`));
}
function servicesPage(ctx) {
  const { go: go2, qs: qs2 } = ctx;
  const buttons3 = find(/立即拼团|预约排班|立即预订|^预约$|免押借|一键快捷预约|免费量尺预约|立即抢鲜|^联系$/);
  const ids = ["ac-group", "waterproof", "vegetables", "dumplings", "computer", "stroller", "pet", "ac", "screen", "peach"];
  buttons3.forEach((btn, i) => bind(btn, "\u67E5\u770B\u670D\u52A1\u8BE6\u60C5", () => go2("/mobile/services/" + ids[i])));
  $$(".cursor-pointer").filter((e) => /全屋开荒|油烟机|墙面补漆|闲置代管|冷链到家|老人助餐/.test(e.textContent)).forEach((el, i) => bind(el, "\u67E5\u770B\u670D\u52A1\u5206\u7C7B", () => {
    const choices = i === 0 ? [products[7]] : i === 1 ? [products[0], products[7]] : i === 2 ? [products[1], products[8]] : i === 3 ? [] : i === 4 ? [products[2], products[9]] : [products[6]];
    const dlg = modal(label(el).split(" ")[0], list(choices, (p) => `<button data-product="${p.id}"><strong>${p.name}</strong><small>\xA5${money(p.price)}</small></button>`), choices.length ? [] : [{ label: "\u767B\u8BB0\u79DF\u552E\u9700\u6C42", run: () => formModal("\u8F66\u4F4D\u4E0E\u4ED3\u50A8\u9700\u6C42", field("description", "\u9700\u6C42\u8BF4\u660E", "", { type: "textarea" }), (v) => {
      ctx.notify("\u79DF\u552E\u9700\u6C42\u5DF2\u767B\u8BB0", v.description);
    }) }]);
    $$("[data-product]", dlg).forEach((btn) => bind(btn, "\u670D\u52A1\u8BE6\u60C5", () => go2("/mobile/services/" + btn.dataset.product)));
  }));
  if (ctx.route.detail === "service") serviceDetail(ctx, decodeURIComponent(location.pathname.split("/").pop()));
}
function serviceDetail(ctx, productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return modal("\u670D\u52A1\u4E0D\u5B58\u5728", empty("\u8BE5\u670D\u52A1\u4E0D\u5B58\u5728\u6216\u5DF2\u4E0B\u67B6"), [{ label: "\u8FD4\u56DE\u670D\u52A1\u5217\u8868", run: () => ctx.go("/mobile/services") }]);
  modal("\u670D\u52A1\u8BE6\u60C5", `<h3>${escape(product.name)}</h3><p>${escape(product.category)}</p><h3>\xA5${money(product.price)} / \u6B21\uFF08\u4EFD\uFF09</h3><p>\u7531\u7269\u4E1A\u670D\u52A1\u4E2D\u5FC3\u534F\u8C03\uFF0C\u63D0\u4EA4\u540E\u7BA1\u5BB6\u5C06\u786E\u8BA4\u65F6\u95F4\u53CA\u670D\u52A1\u8303\u56F4\u3002\u6750\u6599\u589E\u9879\u987B\u53E6\u884C\u786E\u8BA4\u3002</p>`, [
    { label: "\u7ACB\u5373\u9884\u7EA6", run: () => ctx.requireAuth(() => {
      const requestId = id("REQ");
      formModal("\u786E\u8BA4\u9884\u7EA6", field("date", "\u9884\u7EA6\u65E5\u671F", today(), { type: "date", min: today() }) + field("time", "\u9884\u7EA6\u65F6\u6BB5", "14:00-16:30", { choices: ["09:00-11:30", "14:00-16:30", "17:30-19:30"] }) + field("quantity", "\u6570\u91CF", "1", { type: "number", min: 1, max: 99 }) + field("phone", "\u8054\u7CFB\u7535\u8BDD", ctx.state().user.phone, { type: "tel", pattern: "1[3-9][0-9]{9}" }) + field("address", "\u670D\u52A1/\u914D\u9001\u5730\u5740", ctx.state().user.room), (values) => {
        const booking = ctx.store.book(productId, values, requestId);
        modal("\u9884\u7EA6\u6210\u529F", `<p>${escape(booking.title)}</p><p>${escape(booking.date)} \xB7 ${escape(booking.time)}</p><p>\u9884\u7EA6\u91D1\u989D \xA5${money(booking.amount)}\uFF0C\u5F85\u7BA1\u5BB6\u786E\u8BA4\u3002</p><small>${booking.id}</small>`, [
          { label: "\u67E5\u770B\u9884\u7EA6\u8BB0\u5F55", run: () => ctx.panel("bookings") },
          { label: "\u8FD4\u56DE\u670D\u52A1\u5217\u8868", secondary: true, run: () => ctx.go("/mobile/services") }
        ]);
        return false;
      }, "\u63D0\u4EA4\u9884\u7EA6");
    }) },
    { label: ctx.state().favorites.includes(productId) ? "\u53D6\u6D88\u6536\u85CF" : "\u6536\u85CF\u670D\u52A1", secondary: true, run: () => {
      ctx.store.toggle("favorites", productId);
      serviceDetail(ctx, productId);
    } }
  ]);
}
function shopForm(ctx) {
  formModal("\u90BB\u5C45\u95EA\u94FA\u5165\u9A7B\u7533\u8BF7", field("name", "\u5E97\u94FA\u540D\u79F0") + field("category", "\u7ECF\u8425\u7C7B\u76EE", "\u4FBF\u6C11\u670D\u52A1", { choices: ["\u4FBF\u6C11\u670D\u52A1", "\u624B\u4F5C\u98DF\u54C1", "\u7269\u54C1\u79DF\u8D41", "\u751F\u6D3B\u96F6\u552E"] }) + field("phone", "\u8054\u7CFB\u7535\u8BDD", ctx.state().user.phone, { type: "tel", pattern: "1[3-9][0-9]{9}" }) + field("description", "\u670D\u52A1\u7B80\u4ECB", "", { type: "textarea" }), (v) => {
    ctx.store.change((s) => {
      if (!s.user.verified) throw new Error("\u8BF7\u5148\u5B8C\u6210\u623F\u5C4B\u8BA4\u8BC1");
      s.shops.unshift({ ...v, id: id("SHOP"), status: "\u5F85\u7269\u4E1A\u5BA1\u6838", at: now() });
    });
    toast("\u5165\u9A7B\u7533\u8BF7\u5DF2\u63D0\u4EA4\uFF0C\u5F85\u7269\u4E1A\u5BA1\u6838");
  });
}
function postForm(ctx) {
  formModal("\u53D1\u5E03\u90BB\u91CC\u52A8\u6001", field("body", "\u52A8\u6001\u5185\u5BB9", "", { type: "textarea", maxLength: 500 }), (v) => {
    ctx.store.change((s) => s.posts.unshift({ id: id("POST"), body: v.body, author: s.user.name, likes: 0, at: now() }));
    toast("\u52A8\u6001\u5DF2\u53D1\u5E03");
    setTimeout(() => communityFeed(ctx), 0);
  }, "\u53D1\u5E03");
}
function communityFeed(ctx) {
  const dlg = modal("\u6211\u7684\u751F\u6D3B\u5708", list(ctx.state().posts, (p) => `<article><strong>${escape(p.author)}</strong><p>${escape(p.body)}</p><button class="demo-button secondary" data-like-post="${p.id}">${ctx.state().likes.includes(p.id) ? "\u53D6\u6D88\u70B9\u8D5E" : "\u70B9\u8D5E"} ${p.likes + (ctx.state().likes.includes(p.id) ? 1 : 0)}</button></article>`), [{ label: "\u53D1\u5E03\u52A8\u6001", run: () => ctx.requireAuth(() => postForm(ctx)) }]);
  $$("[data-like-post]", dlg).forEach((btn) => bind(btn, "\u70B9\u8D5E\u52A8\u6001", () => {
    ctx.store.toggle("likes", btn.dataset.likePost);
    communityFeed(ctx);
  }));
}
function voiceInput(ctx, target) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    return formModal("\u8BED\u97F3\u8F93\u5165\u6682\u4E0D\u53EF\u7528", `<p>\u5F53\u524D\u6D4F\u89C8\u5668\u672A\u63D0\u4F9B\u8BED\u97F3\u8BC6\u522B\uFF0C\u53EF\u76F4\u63A5\u586B\u5199\u5185\u5BB9\u3002</p>` + field("text", "\u586B\u5199\u5185\u5BB9", target.value, { type: "textarea" }), (v) => {
      target.value = v.text;
      target.dispatchEvent(new Event("input"));
    });
  }
  const recognition = new Recognition();
  recognition.lang = "zh-CN";
  recognition.interimResults = false;
  recognition.onresult = (e) => {
    target.value = (target.value + e.results[0][0].transcript).slice(0, target.maxLength > 0 ? target.maxLength : 1e3);
    target.dispatchEvent(new Event("input"));
    toast("\u8BED\u97F3\u8BC6\u522B\u5B8C\u6210");
  };
  recognition.onerror = (e) => toast(e.error === "not-allowed" ? "\u9EA6\u514B\u98CE\u6743\u9650\u672A\u83B7\u6388\u6743\uFF0C\u53EF\u76F4\u63A5\u8F93\u5165\u6587\u5B57" : "\u8BED\u97F3\u8BC6\u522B\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u6216\u8F93\u5165\u6587\u5B57", true);
  recognition.start();
  toast("\u6B63\u5728\u6536\u542C\uFF0C\u8BF7\u8BF4\u51FA\u5185\u5BB9");
}

// src/pages/operations.js
var buttons = (rx) => $$("button,a").filter((b) => rx.test(label(b)));
var on2 = (rx, fn) => buttons(rx).forEach((b) => {
  if (!b.dataset.action) bind(b, label(b), () => fn(b));
});
var glyphs = (glyph2) => $$("button").filter((b) => $(".material-symbols-outlined", b)?.textContent.trim() === glyph2 && !label(b));
var orderAction = (ctx, order) => {
  formModal("\u6307\u6D3E\u7EF4\u4FEE\u5E08\u5085", `<p>${escape(order.title)} \xB7 ${escape(order.room)}</p>` + field("technician", "\u7EF4\u4FEE\u5E08\u5085", order.technician || technicians[0], { choices: technicians }), (values) => {
    if (order.status === "assigned") ctx.store.change((s) => {
      const current = s.orders.find((o) => o.id === order.id);
      current.technician = values.technician;
      current.timeline.push({ at: now(), status: "assigned", label: "\u6539\u6D3E\u7ED9" + values.technician });
    });
    else ctx.store.transition(order.id, "assigned", values);
    toast("\u5DF2\u6D3E\u53D1\u7ED9" + values.technician);
    window.dispatchEvent(new Event("demo:orders"));
  }, "\u786E\u8BA4\u6D3E\u5DE5");
};
function initOperations(ctx) {
  if (["overview", "work-orders"].includes(ctx.route.key)) orders(ctx);
  if (ctx.route.key === "tasks") tasks(ctx);
  if (ctx.route.key === "checkin") checkin(ctx);
  if (ctx.route.key === "expenses") expenses(ctx);
  if (ctx.route.key === "finance") finance(ctx);
  if (ctx.route.key === "group") group(ctx);
}
function orders(ctx) {
  const { route: route2, state: state2, store: store2, go: go2 } = ctx;
  const overview = route2.key === "overview";
  let page = 1, status = "", category = "", term = "", urgent = false, technician = "", day = "";
  const size = overview ? 3 : 4;
  const originalArticles = $$("main article");
  const queue = overview ? $("main tbody") : originalArticles[0].parentElement;
  const template = overview ? $("tr", queue).cloneNode(true) : originalArticles[0].cloneNode(true);
  const pagination = overview ? queue.parentElement.parentElement.nextElementSibling : originalArticles.at(-1).nextElementSibling;
  const cardKeys = [];
  function render() {
    let all = state2().orders.filter((o) => (!status || (status === "completed" ? ["completed", "closed"].includes(o.status) : status === o.status)) && (!category || o.category === category || category === "\u6C34\u6696\u536B\u6D74" && /管|水/.test(o.category)) && (!urgent || o.urgent) && (!technician || o.technician === technician) && (!day || o.createdAt.slice(0, 10) === day) && (!term || `${o.id} ${o.room} ${o.title} ${o.contact}`.toLowerCase().includes(term.toLowerCase())));
    const totalPages = Math.max(1, Math.ceil(all.length / size));
    page = Math.max(1, Math.min(page, totalPages));
    if (overview) queue.replaceChildren();
    else $$("article[data-order-card], article:not([data-order-card])", queue).forEach((e) => e.remove());
    cardKeys.length = 0;
    for (const o of all.slice((page - 1) * size, page * size)) {
      const card = template.cloneNode(true);
      card.dataset.orderCard = o.id;
      if (overview) {
        const cells = $$("td", card);
        cells[0].innerHTML = `<strong class="text-headline-sm">#${escape(o.id)}</strong><div class="text-label-sm">${escape(o.room)} \xB7 ${escape(o.contact)}</div>`;
        cells[1].innerHTML = `<div>${escape(o.title)}</div><small>${escape(o.appointment)}</small>`;
        cells[2].innerHTML = o.photos?.[0]?.src ? `<img class="w-10 h-10 rounded-lg object-cover" src="${escape(o.photos[0].src)}" alt="\u62A5\u4FEE\u73B0\u573A">` : `<span class="text-label-sm">${o.photos?.length || 0} \u4EFD\u9644\u4EF6</span>`;
        cells[3].innerHTML = `<span class="px-2 py-1 rounded-full bg-surface-container text-primary">${statuses[o.status]}</span>`;
        cells[4].innerHTML = `<button class="px-3 py-1 rounded-full bg-primary text-on-primary text-label-md" data-dispatch>${o.status === "pending" ? "\u6D3E\u5DE5" : "\u67E5\u770B\u8BE6\u60C5"}</button>`;
        queue.append(card);
      } else {
        const identity = $("span.font-headline-sm", card);
        identity.textContent = "#" + o.id;
        const paragraphs = $$("p", card);
        if (paragraphs[0]) paragraphs[0].textContent = o.description;
        const address = $(".font-semibold.text-on-surface", card);
        if (address) address.textContent = o.room;
        const pillRow = identity.parentElement;
        $$(":scope > span", pillRow).slice(1).forEach((e) => e.remove());
        pillRow.insertAdjacentHTML("beforeend", `<span class="px-2 py-1 rounded bg-surface-container text-primary text-label-sm">${escape(o.category)}</span><span class="px-2 py-1 rounded bg-secondary-container text-on-secondary-container text-label-sm">${statuses[o.status]}</span>`);
        const snapshot = card.lastElementChild;
        snapshot.innerHTML = `<div class="flex items-center gap-2"><div class="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center">${escape((o.technician || "\u5F85")[0])}</div><div><strong>${escape(o.technician || "\u7B49\u5F85\u6307\u6D3E")}</strong><p class="text-label-sm">${escape(o.appointment)}</p></div></div><div class="flex gap-2"><button class="px-3 py-1 rounded bg-primary text-on-primary text-label-md" data-dispatch>${o.status === "pending" ? "\u7ACB\u5373\u6307\u6D3E\u5E08\u5085" : "\u67E5\u770B\u8F68\u8FF9\u8BE6\u60C5"}</button></div>`;
        queue.insertBefore(card, pagination);
      }
      const b = $("[data-dispatch]", card);
      bind(b, o.status === "pending" ? "\u7ACB\u5373\u6307\u6D3E\u5E08\u5085" : "\u67E5\u770B\u5DE5\u5355\u8BE6\u60C5", () => o.status === "pending" ? orderAction(ctx, o) : go2("/web/orders/" + o.id));
      bind(card, "\u6253\u5F00\u5DE5\u5355\u8BE6\u60C5", () => go2("/web/orders/" + o.id));
      cardKeys.push(o.id);
    }
    let emptyBox = $("#orders-empty");
    if (emptyBox) emptyBox.remove();
    if (!all.length) {
      emptyBox = document.createElement(overview ? "tr" : "div");
      emptyBox.id = "orders-empty";
      emptyBox.innerHTML = overview ? `<td colspan="5">${empty("\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u5DE5\u5355")}</td>` : empty("\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u5DE5\u5355");
      overview ? queue.append(emptyBox) : queue.insertBefore(emptyBox, pagination);
    }
    if (pagination) {
      pagination.innerHTML = `<span>\u5171 ${all.length} \u6761\u5DE5\u5355\uFF0C\u5F53\u524D\u7B2C ${page}/${totalPages} \u9875</span><div class="flex items-center gap-1"><button aria-label="\u4E0A\u4E00\u9875" class="demo-icon" data-page-prev ${page === 1 ? "disabled" : ""}>${icon("chevron_left")}</button>${Array.from({ length: totalPages }, (_, i) => `<button class="px-2 py-1 rounded ${page === i + 1 ? "bg-primary text-on-primary" : "bg-surface-container"}" data-page-number="${i + 1}">${i + 1}</button>`).join("")}<button aria-label="\u4E0B\u4E00\u9875" class="demo-icon" data-page-next ${page === totalPages ? "disabled" : ""}>${icon("chevron_right")}</button></div>`;
      bind($("[data-page-prev]", pagination), "\u4E0A\u4E00\u9875", () => {
        page--;
        render();
      });
      bind($("[data-page-next]", pagination), "\u4E0B\u4E00\u9875", () => {
        page++;
        render();
      });
      $$("[data-page-number]", pagination).forEach((btn) => bind(btn, "\u7B2C" + btn.dataset.pageNumber + "\u9875", () => {
        page = Number(btn.dataset.pageNumber);
        render();
      }));
    }
  }
  const filters = overview ? buttons(/^(全部工单|紧急报修|水暖电路|公区维保)/) : buttons(/^(全部 \(|待派发|已接单|已到达|处理中|已完工验收)/);
  filters.forEach((btn, i) => bind(btn, "\u5DE5\u5355\u7B5B\u9009" + label(btn), () => {
    if (overview) {
      urgent = i === 1;
      category = i === 2 ? "\u6C34\u6696\u536B\u6D74" : i === 3 ? "\u516C\u533A\u4FEE\u7F2E" : "";
    } else status = ["", "pending", "accepted", "arrived", "processing", "completed"][i] || "";
    active(filters, btn);
    page = 1;
    render();
  }));
  const search = overview ? $("main input") : $("main input[placeholder]");
  if (search) {
    search.dataset.action = "\u7B5B\u9009\u5DE5\u5355";
    search.addEventListener("input", () => {
      term = search.value.trim();
      page = 1;
      render();
    });
  }
  const selects = $$("main select");
  selects.forEach((select, i) => select.addEventListener("change", () => {
    if (i === 0) category = select.selectedIndex === 0 ? "" : select.value;
    if (i === 1) urgent = select.selectedIndex === 1;
    if (i === 2) technician = select.selectedIndex === 0 ? "" : select.value.split(" ")[0];
    page = 1;
    render();
  }));
  const dayInput = $$("main input").find((e) => !e.placeholder);
  if (dayInput) {
    dayInput.type = "date";
    dayInput.value = "";
    dayInput.addEventListener("change", () => {
      day = dayInput.value;
      render();
    });
  }
  on2(/高级筛选/, () => formModal("\u9AD8\u7EA7\u5DE5\u5355\u7B5B\u9009", field("status", "\u5DE5\u5355\u72B6\u6001", status, { choices: [["", "\u5168\u90E8"], ...Object.entries(statuses)] }) + field("category", "\u62A5\u4FEE\u5206\u7C7B", category, { choices: [["", "\u5168\u90E8"], "\u6C34\u6696\u536B\u6D74", "\u5F3A\u5F31\u7535\u8DEF", "\u95E8\u7981\u5B89\u9632", "\u516C\u533A\u4FEE\u7F2E"] }), (v) => {
    status = v.status;
    category = v.category;
    page = 1;
    render();
  }));
  on2(/智能一键分派/, () => confirm("\u6279\u91CF\u6D3E\u53D1\u5DE5\u5355", `\u5C06\u4E3A${state2().orders.filter((o) => o.status === "pending").length}\u4E2A\u5F85\u6D3E\u5DE5\u5355\u5206\u914D\u5728\u5C97\u5E08\u5085\u3002`, () => {
    state2().orders.filter((o) => o.status === "pending").forEach((o, i) => store2.transition(o.id, "assigned", { technician: technicians[i % technicians.length] }));
    render();
  }));
  on2(/一键派发|指派此人|排队顺延|发起转单/, () => {
    const order = state2().orders.find((o) => o.status === "pending");
    if (!order) return toast("\u5F53\u524D\u6CA1\u6709\u5F85\u6D3E\u5DE5\u5355");
    orderAction(ctx, order);
  });
  on2(/进入财务对账专区/, () => go2("/web/finance"));
  on2(/导出调度表/, () => csv("\u5DE5\u5355\u8C03\u5EA6\u8868.csv", [["\u5DE5\u5355\u53F7", "\u623F\u53F7", "\u5185\u5BB9", "\u72B6\u6001", "\u5E08\u5085"], ...state2().orders.map((o) => [o.id, o.room, o.title, statuses[o.status], o.technician])]));
  render();
  window.addEventListener("demo:orders", render);
  window.addEventListener("demo:external", render);
}
function tasks(ctx) {
  const { state: state2, store: store2, go: go2, qs: qs2 } = ctx;
  const current = state2().orders.find((o) => ["pending", "assigned"].includes(o.status));
  const initialCard = $("#acceptOrderBtn").closest("main > div > div.relative");
  const listSection = $$("main > div > div").find((s) => s.textContent.includes("\u5F85\u63A5\u666E\u901A\u4EFB\u52A1"));
  let mode = qs2.get("status") || "pending";
  const tabButtons = buttons(/^(待接新单|待到岗\/进行中|完工待结)/);
  function render() {
    const select = (o) => mode === "pending" ? ["pending", "assigned"].includes(o.status) : mode === "accepted" ? ["accepted", "arrived", "processing"].includes(o.status) : ["completed", "closed"].includes(o.status);
    const orders2 = state2().orders.filter(select);
    const mainOrder = orders2[0];
    if (initialCard) {
      initialCard.hidden = !mainOrder;
      if (mainOrder) {
        $("h2", initialCard).textContent = `${mainOrder.room} \xB7 ${mainOrder.title}`;
        const desc = $$("p", initialCard)[0];
        if (desc) desc.textContent = mainOrder.description;
        const policy = mainOrder.sla?.arrivalMinutes || (mainOrder.urgent ? arrivalPolicies.urgent.minutes : arrivalPolicies.standard.minutes);
        const sla = arrivalStatus(mainOrder);
        $("#orderCountdown").textContent = mode === "pending" ? `\u63A5\u5355\u540E ${policy} \u5206\u949F\u5230\u5C97` : sla.text;
        $("#acceptOrderBtn").innerHTML = icon(mode === "pending" ? "bolt" : "pending_actions") + `<span>${mode === "pending" ? "\u7ACB\u5373\u63A5\u5355" : "\u67E5\u770B\u5C65\u7EA6\u8BE6\u60C5"}</span>`;
        $("#acceptOrderBtn").disabled = mode === "pending" && !state2().settings.listening;
        initialCard.dataset.orderId = mainOrder.id;
      }
    }
    if (listSection) {
      listSection.innerHTML = `<div class="flex justify-between"><strong>${mode === "pending" ? "\u5F85\u63A5\u4EFB\u52A1" : mode === "accepted" ? "\u8FDB\u884C\u4E2D\u4EFB\u52A1" : "\u5B8C\u5DE5\u8BB0\u5F55"} (${orders2.length})</strong><button class="text-label-md text-primary" data-task-sort>\u6309\u521B\u5EFA\u65F6\u95F4\u6392\u5E8F ${icon("sort")}</button></div>` + (orders2.slice(1).length ? orders2.slice(1).map((o) => {
        const policy = o.sla?.arrivalMinutes || (o.urgent ? arrivalPolicies.urgent.minutes : arrivalPolicies.standard.minutes);
        const timing = mode === "pending" ? `\u63A5\u5355\u540E ${policy} \u5206\u949F\u5185\u5230\u5C97` : arrivalStatus(o).text;
        return `<article class="bg-surface-container-lowest rounded-xl p-card-padding mt-3 shadow-sm"><h3 class="text-headline-sm">${escape(o.title)}</h3><p>${escape(o.room)} \xB7 ${statuses[o.status]}</p><p class="text-label-sm">${escape(o.appointment)} \xB7 ${escape(timing)}</p><div class="flex gap-2 mt-3"><button class="demo-button secondary" data-task-detail="${o.id}">\u67E5\u770B\u8BE6\u60C5</button>${mode === "pending" ? `<button class="demo-button" data-task-accept="${o.id}" ${!state2().settings.listening ? "disabled" : ""}>\u62A2\u6B64\u5355</button>` : ""}</div></article>`;
      }).join("") : empty(orders2.length ? "\u6682\u65E0\u66F4\u591A\u4EFB\u52A1" : "\u5F53\u524D\u5206\u7C7B\u6CA1\u6709\u4EFB\u52A1"));
      $$("[data-task-detail]", listSection).forEach((btn) => bind(btn, "\u67E5\u770B\u8BE6\u60C5", () => go2("/worker/orders/" + btn.dataset.taskDetail)));
      $$("[data-task-accept]", listSection).forEach((btn) => bind(btn, "\u62A2\u6B64\u5355", () => accept(btn.dataset.taskAccept)));
      bind($("[data-task-sort]", listSection), "\u4EFB\u52A1\u6392\u5E8F", () => {
        store2.change((s) => s.orders.reverse());
        render();
        toast("\u5DF2\u5207\u6362\u4EFB\u52A1\u987A\u5E8F");
      });
    }
    active(tabButtons, tabButtons[mode === "pending" ? 0 : mode === "accepted" ? 1 : 2]);
  }
  function accept(orderId) {
    if (!state2().settings.listening) throw new Error("\u542C\u5355\u5DF2\u6682\u505C\uFF0C\u8BF7\u5148\u5F00\u542F\u542C\u5355");
    const order = state2().orders.find((o) => o.id === orderId);
    const minutes = order?.sla?.arrivalMinutes || (order?.urgent ? arrivalPolicies.urgent.minutes : arrivalPolicies.standard.minutes);
    confirm("\u786E\u8BA4\u63A5\u5355", `\u63A5\u5355\u540E\u5C06\u542F\u52A8\u5230\u5C97\u8BA1\u65F6\uFF0C\u8BF7\u5728 ${minutes} \u5206\u949F\u5185\u5B8C\u6210\u73B0\u573A\u6253\u5361\u3002`, () => store2.transition(orderId, "accepted", { technician: "\u5F20\u5EFA\u56FD" }), { after: () => go2("/worker/checkin?id=" + orderId) });
  }
  tabButtons.forEach((btn, i) => bind(btn, label(btn), () => {
    mode = ["pending", "accepted", "completed"][i];
    const url = new URL(location.href);
    url.searchParams.set("status", mode);
    history.replaceState(null, "", url);
    render();
  }));
  bind($("#acceptOrderBtn"), "\u7ACB\u5373\u63A5\u5355", () => {
    const orderId = initialCard.dataset.orderId;
    return mode === "pending" ? accept(orderId) : go2("/worker/orders/" + orderId);
  });
  bind($("#dispatchToggle"), "\u5207\u6362\u542C\u5355\u72B6\u6001", () => {
    store2.change((s) => s.settings.listening = !s.settings.listening);
    $("#dispatchText").textContent = state2().settings.listening ? "\u542C\u5355\u4E2D" : "\u5DF2\u6682\u505C";
    render();
  });
  $("#dispatchText").textContent = state2().settings.listening ? "\u542C\u5355\u4E2D" : "\u5DF2\u6682\u505C";
  bind($("#voicePlayer"), "\u6536\u542C\u62A5\u4FEE\u8BED\u97F3", () => ctx.speech(state2().orders.find((o) => o.id === initialCard?.dataset.orderId)?.description, $("button", $("#voicePlayer"))));
  render();
  window.addEventListener("demo:external", render);
  const timer = window.setInterval(() => {
    if (document.visibilityState === "visible" && mode === "accepted") render();
  }, 3e4);
  window.addEventListener("pagehide", () => clearInterval(timer), { once: true });
}
function checkin(ctx) {
  const { store: store2, state: state2, go: go2, qs: qs2 } = ctx;
  const orderId = qs2.get("id") || state2().orders.find((o2) => ["accepted", "arrived", "processing"].includes(o2.status))?.id;
  const getOrder = () => state2().orders.find((o2) => o2.id === orderId);
  let payment = "online";
  const extras = [];
  const o = getOrder();
  if (!o) {
    modal("\u672A\u627E\u5230\u8FDB\u884C\u4E2D\u5DE5\u5355", empty("\u8BF7\u5148\u63A5\u5355"), [{ label: "\u8FD4\u56DE\u4EFB\u52A1\u63A5\u5355", run: () => go2("/worker/tasks") }]);
    return;
  }
  $("main h2").textContent = `${o.room} \xB7 ${o.title}`;
  const sn = $$("main span").find((e) => e.textContent.includes("\u5DE5\u5355\u53F7:"));
  if (sn) sn.textContent = "\u5DE5\u5355\u53F7: " + orderId;
  const coordinate = $$("main p").find((e) => e.textContent.includes("GPS"));
  if (coordinate) coordinate.textContent = "\u6F14\u793A\u6253\u5361\u70B9\uFF1A" + o.room + "\uFF08\u672A\u91C7\u96C6\u771F\u5B9EGPS\uFF09";
  const slaPanel = document.createElement("div");
  slaPanel.id = "arrival-sla";
  slaPanel.className = "demo-arrival-sla";
  const checkinContainer = $("#checkin-container");
  checkinContainer?.before(slaPanel);
  const update = () => {
    const order = getOrder();
    const checked = ["arrived", "processing", "completed", "closed"].includes(order.status);
    const sla = arrivalStatus(order);
    const due = order.arrivalDueAt ? new Date(order.arrivalDueAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) : "";
    slaPanel.innerHTML = `${icon("timer")}<div><strong>${escape(sla.text)}</strong><small>${due ? `\u5230\u5C97\u622A\u6B62\uFF1A${due}\uFF1B\u4EE5\u5E08\u5085\u6210\u529F\u63A5\u5355\u65F6\u523B\u5F00\u59CB\u8BA1\u7B97\u3002` : "\u5B8C\u6210\u63A5\u5355\u540E\u7CFB\u7EDF\u4F1A\u751F\u6210\u5230\u5C97\u622A\u6B62\u65F6\u95F4\u3002"}</small></div>`;
    slaPanel.dataset.state = sla.state;
    $("#checked-state").classList.toggle("hidden", !checked);
    $("#checkin-btn").classList.toggle("hidden", checked);
    $("#service-timer").textContent = checked ? sla.text : "\u7B49\u5F85\u5230\u5C97";
    if (checked) {
      const text = $$("span", $("#checked-state")).find((e) => e.textContent.includes("\u5DF2\u6210\u529F"));
      if (text) text.textContent = `${new Date(order.checkinAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })} \u5DF2\u6210\u529F\u5230\u5C97\u6253\u5361`;
    }
  };
  bind($("#checkin-btn"), "\u73B0\u573A\u5230\u5C97\u6253\u5361", () => {
    const sla = arrivalStatus(getOrder());
    confirm("\u73B0\u573A\u5230\u5C97\u6253\u5361", `\u786E\u8BA4\u5DF2\u5230\u8FBE ${getOrder().room}\uFF1F${sla.text}\u3002\u6B64\u6B21\u6253\u5361\u4E3A\u6F14\u793A\u5B9A\u4F4D\u3002`, () => store2.transition(orderId, "arrived", { checkinAt: now() }), { after: update });
  });
  $$(".payment-option").forEach((el) => bind(el, label(el).split(" ")[0], () => {
    if (el.dataset.pay === "public" && getOrder().scope !== "public") throw new Error("\u5C45\u6C11\u5BA4\u5185\u4E13\u6709\u7EF4\u4FEE\u4E0D\u80FD\u8BB0\u5165\u516C\u5171\u7EF4\u4FEE\u57FA\u91D1");
    payment = el.dataset.pay;
    $$(".payment-option").forEach((item) => {
      item.classList.toggle("demo-selected", item === el);
      $(".option-check", item).textContent = item === el ? "radio_button_checked" : "radio_button_unchecked";
      item.setAttribute("aria-checked", String(item === el));
      item.setAttribute("role", "radio");
    });
  }));
  const submit = buttons(/提交完工/)[0];
  on2(/添加其他明码标价/, () => formModal("\u6DFB\u52A0\u8017\u6750\u9879\u76EE", field("name", "\u8017\u6750\u540D\u79F0") + field("price", "\u5355\u4EF7\uFF08\u5143\uFF09", "", { type: "number", min: 0.01, step: ".01" }) + field("quantity", "\u6570\u91CF", 1, { type: "number", min: 1, max: 99 }), (v) => {
    if (!isAmount(v.price) || !Number.isInteger(Number(v.quantity))) throw new Error("\u8BF7\u8F93\u5165\u6709\u6548\u5355\u4EF7\u548C\u6574\u6570\u6570\u91CF");
    extras.push({ name: v.name, amount: Number(v.price) * Number(v.quantity) });
    const amount = 68 + extras.reduce((sum, e) => sum + e.amount, 0);
    submit.innerHTML = icon("check_circle") + `<span>\u63D0\u4EA4\u5B8C\u5DE5\u5E76\u63A8\u9001\u8D26\u5355 (\xA5${money(amount)})</span>`;
    const box = document.createElement("div");
    box.className = "demo-inline";
    box.textContent = `${v.name} \xD7 ${v.quantity} \xB7 \xA5${money(Number(v.price) * Number(v.quantity))}`;
    buttons(/添加其他明码标价/)[0].before(box);
    const total = $$("main .font-display-lg").find((e) => e.textContent.trim() === "68.00");
    if (total) total.textContent = money(amount);
  }));
  bind(submit, "\u63D0\u4EA4\u5B8C\u5DE5\u5E76\u63A8\u9001\u8D26\u5355", () => {
    const order = getOrder();
    if (!["arrived", "processing"].includes(order.status)) throw new Error("\u8BF7\u5148\u5B8C\u6210\u73B0\u573A\u5230\u5C97\u6253\u5361");
    const images = $$("main .grid img").map((img) => ({ src: img.src, name: "\u5B8C\u5DE5\u7167\u7247" }));
    const photos = [...images, ...state2().drafts["uploads-checkin"] || []];
    if (!photos.length) throw new Error("\u8BF7\u81F3\u5C11\u4E0A\u4F201\u5F20\u5B8C\u5DE5\u7167\u7247");
    const amount = Number((68 + extras.reduce((sum, e) => sum + e.amount, 0)).toFixed(2));
    confirm("\u786E\u8BA4\u5B8C\u5DE5\u7ED3\u7B97", `\u7EF4\u4FEE\u603B\u8BA1 \xA5${money(amount)}\u3002${payment === "online" ? "\u5C06\u751F\u6210\u5C45\u6C11\u5F85\u7F34\u7EF4\u4FEE\u8D26\u5355\u3002" : payment === "offline" ? "\u786E\u8BA4\u5DF2\u5728\u7EBF\u4E0B\u6536\u6B3E\uFF0C\u767B\u8BB0\u6A21\u62DF\u6536\u6B3E\u56DE\u6267\u3002" : "\u8D39\u7528\u5C06\u8BB0\u5165\u516C\u533A\u7EF4\u62A4\u652F\u51FA\u53F0\u8D26\u3002"}`, () => {
      store2.transition(orderId, "completed", { photos, amount, payment, paid: payment !== "online", extras });
      if (payment === "public") store2.change((s) => s.expenses.unshift({ id: id("EX"), title: order.title, amount, dept: order.technician, status: "pending", fund: "maintenance", channel: "\u516C\u5171\u7EF4\u62A4\u8BB0\u8D26" }));
      if (payment === "offline") store2.record("\u7EF4\u4FEE\u7EBF\u4E0B\u6536\u6B3E", orderId);
    }, { label: "\u786E\u8BA4\u5B8C\u5DE5", after: () => go2("/worker/orders/" + orderId) });
  });
  if (["completed", "closed"].includes(o.status)) {
    submit.disabled = true;
    submit.textContent = "\u5DE5\u5355\u5DF2\u5B8C\u5DE5\uFF0C\u8BF7\u52FF\u91CD\u590D\u63D0\u4EA4";
  }
  update();
}
function expenses(ctx) {
  const { store: store2, state: state2, qs: qs2 } = ctx;
  const fund = qs2.get("fund") === "maintenance" ? "maintenance" : "operations";
  let selected = null, term = "", category = "", historical = false;
  const tbody = $("#expense-tbody");
  const template = $("tr", tbody).cloneNode(true);
  const panelFields = { "panel-title": "title", "panel-sn": "id", "panel-handler": "dept", "panel-invoice": "invoice", "panel-channel": "channel" };
  function select(expense) {
    selected = expense.id;
    for (const [element, key] of Object.entries(panelFields)) if ($("#" + element)) $("#" + element).textContent = expense[key] || "\u672A\u586B\u5199";
    $("#panel-amount").textContent = "\xA5" + money(expense.amount);
    $("#panel-status-pill").textContent = { paid: "\u5DF2\u4ED8\u6B3E\u6838\u9500", pending: "\u5F85\u4E3B\u7BA1\u5BA1\u6279", processing: "\u8D22\u52A1\u5BA1\u6838\u4E2D", rejected: "\u5DF2\u9A73\u56DE" }[expense.status] || expense.status;
    $("#panel-primary-btn-label").textContent = expense.status === "paid" ? "\u67E5\u770B\u6838\u9500\u51ED\u8BC1" : expense.status === "rejected" ? "\u67E5\u770B\u9A73\u56DE\u8BB0\u5F55" : "\u5BA1\u6279\u652F\u51FA";
    $$("tr", tbody).forEach((row) => {
      row.classList.toggle("bg-primary/10", row.dataset.expenseId === selected);
      $("input", row).checked = row.dataset.expenseId === selected;
    });
  }
  function render() {
    const rows = state2().expenses.filter((e) => e.fund === fund && (!term || JSON.stringify(e).toLowerCase().includes(term.toLowerCase())) && (!category || e.title.includes(category)) && (!historical || e.status === "paid"));
    tbody.replaceChildren();
    rows.forEach((e) => {
      const row = template.cloneNode(true);
      row.dataset.expenseId = e.id;
      const values = ["", e.id, e.title, "\xA5" + money(e.amount), e.dept, (e.at || "2024-10-24").slice(0, 10), e.channel, { paid: "\u5DF2\u4ED8\u6B3E", pending: "\u5F85\u5BA1\u6279", processing: "\u5BA1\u6279\u4E2D", rejected: "\u5DF2\u9A73\u56DE" }[e.status]];
      $$("td", row).forEach((td, i) => {
        if (i) td.textContent = values[i] || "";
      });
      $("input", row).checked = false;
      tbody.append(row);
      bind(row, "\u67E5\u770B\u652F\u51FA\u8BE6\u60C5", () => select(e));
    });
    if (!rows.length) tbody.innerHTML = `<tr><td colspan="8">${empty("\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u652F\u51FA")}</td></tr>`;
    const chosen = rows.find((e) => e.id === selected) || rows[0];
    if (chosen) select(chosen);
    else {
      selected = null;
      $("#panel-title").textContent = "\u6682\u65E0\u652F\u51FA\u8BB0\u5F55";
      $("#panel-amount").textContent = "\xA50.00";
      $("#panel-status-pill").textContent = "\u65E0\u8BB0\u5F55";
    }
    $("#btn-action-primary").disabled = !chosen;
  }
  $("#search-input").addEventListener("input", (e) => {
    term = e.target.value;
    render();
  });
  const filter = $$("main select").find((s) => !s.id);
  filter?.addEventListener("change", () => {
    category = filter.selectedIndex ? filter.value : "";
    render();
  });
  const timeButtons = buttons(/^(本月记账|历史账单)$/);
  timeButtons.forEach((b, i) => bind(b, label(b), () => {
    historical = !!i;
    active(timeButtons, b);
    render();
  }));
  bind($("#btn-action-primary"), "\u5BA1\u6279\u5F53\u524D\u652F\u51FA", () => {
    const e = state2().expenses.find((e2) => e2.id === selected);
    if (!e) return;
    if (["paid", "rejected"].includes(e.status)) return modal("\u652F\u51FA\u8BE6\u60C5", `<h3>${escape(e.title)}</h3><p>\xA5${money(e.amount)} \xB7 ${escape(e.status === "paid" ? "\u5DF2\u6838\u9500" : "\u5DF2\u9A73\u56DE")}</p><p>${escape(e.reason || "")}</p>`, [{ label: "\u4E0B\u8F7D\u8BB0\u5F55", run: () => csv(e.id + ".csv", [["\u7F16\u53F7", "\u7528\u9014", "\u91D1\u989D", "\u72B6\u6001"], [e.id, e.title, e.amount, e.status]]) }]);
    formModal("\u652F\u51FA\u5BA1\u6279", `<p>${escape(e.title)} \xB7 \xA5${money(e.amount)}</p>` + field("decision", "\u5BA1\u6279\u51B3\u5B9A", "paid", { choices: [["paid", "\u6279\u51C6\u6838\u9500\uFF08\u6A21\u62DF\u4ED8\u6B3E\uFF09"], ["rejected", "\u9A73\u56DE"]] }) + field("reason", "\u5BA1\u6279\u610F\u89C1", "", { type: "textarea" }), (v) => {
      store2.change((s) => Object.assign(s.expenses.find((x) => x.id === e.id), { status: v.decision, reason: v.reason, approvedAt: now() }));
      store2.record("\u652F\u51FA\u5BA1\u6279" + (v.decision === "paid" ? "\u901A\u8FC7" : "\u9A73\u56DE"), e.id);
      render();
      toast("\u5BA1\u6279\u7ED3\u679C\u5DF2\u4FDD\u5B58");
    }, "\u786E\u8BA4\u5BA1\u6279");
  });
  const form = $("#new-expense-form");
  ["amount", "applicant", "payee", "remark"].forEach((key) => $("#form-" + key).required = true);
  $("#form-amount").min = "0.01";
  $("#form-amount").step = ".01";
  $("#form-remark").maxLength = 500;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    busy($("button[type=submit]", form), () => {
      const amount = $("#form-amount").value;
      if (!isAmount(amount)) throw new Error("\u8BF7\u8F93\u5165\u5927\u4E8E0\u4E14\u6700\u591A\u4E24\u4F4D\u5C0F\u6570\u7684\u91D1\u989D");
      const expense = {
        id: id("EX"),
        amount: Number(amount),
        title: $("#form-category").value + " \xB7 " + $("#form-remark").value.trim(),
        dept: $("#form-dept").value + " \xB7 " + $("#form-applicant").value.trim(),
        payee: $("#form-payee").value.trim(),
        channel: $("#form-channel").value,
        invoice: $("#form-taxno").value,
        status: "pending",
        fund,
        at: now(),
        files: state2().drafts["uploads-expenses"] || []
      };
      store2.change((s) => s.expenses.unshift(expense));
      store2.record("\u5F55\u5165\u652F\u51FA", expense.id);
      selected = expense.id;
      form.reset();
      render();
      toast("\u652F\u51FA\u5DF2\u63D0\u4EA4\u5BA1\u6279\uFF0C\u6D41\u6C34\u53F7 " + expense.id);
    }).catch((e) => toast(e.message, true));
  });
  $("button[type=submit]", form).dataset.action = "\u63D0\u4EA4\u652F\u51FA\u6838\u9500\u4E0E\u5BA1\u6279\u6D41";
  bind($("#btn-reset-form"), "\u6E05\u7A7A\u652F\u51FA\u8868\u5355", () => form.reset());
  $$("main button").filter((b) => /^[<>]$/.test(label(b)) || ["chevron_left", "chevron_right"].includes($(".material-symbols-outlined", b)?.textContent.trim())).forEach((b) => {
    b.disabled = true;
    b.dataset.action = "\u5168\u90E8\u8BB0\u5F55\u5DF2\u663E\u793A";
  });
  const selectAll = $("thead input");
  if (selectAll) {
    selectAll.type = "checkbox";
    selectAll.addEventListener("change", () => $$("tbody input").forEach((i) => i.checked = selectAll.checked));
  }
  if (fund === "maintenance") {
    const h = $("main h2");
    if (h) h.textContent = "\u65B0\u589E\u7EF4\u4FEE\u57FA\u91D1\u652F\u51FA";
  }
  render();
  window.addEventListener("demo:external", render);
}
function finance(ctx) {
  const { state: state2, store: store2, go: go2 } = ctx;
  let tab = ctx.qs.get("tab") || "property";
  const keys = ["property", "parking", "other"];
  function changeTab(key) {
    tab = keys.includes(key) ? key : "property";
    keys.forEach((k) => $("#tab-content-" + k).classList.toggle("hidden", k !== tab));
    active(keys.map((k) => $("#tab-btn-" + k)), $("#tab-btn-" + tab));
    const url = new URL(location.href);
    url.searchParams.set("tab", tab);
    history.replaceState(null, "", url);
  }
  keys.forEach((key) => bind($("#tab-btn-" + key), "\u5207\u6362\u8D22\u52A1" + key, () => changeTab(key)));
  const ledger = document.createElement("section");
  ledger.className = "demo-inline-section";
  ledger.id = "live-payments";
  $("main > div").append(ledger);
  const render = () => {
    ledger.innerHTML = `<h3 class="text-headline-sm">\u5C45\u6C11\u7AEF\u5B9E\u65F6\u7F34\u8D39\u8BB0\u5F55</h3>` + list(state2().payments, (p) => `<article><strong>${escape(p.id)} \xB7 \u5B9E\u6536 \xA5${money(p.amount)}</strong><small>${new Date(p.at).toLocaleString("zh-CN")} \xB7 ${escape(p.billIds.join("\u3001"))}</small></article>`);
  };
  on2(/补录线下缴费/, () => formModal("\u8865\u5F55\u7EBF\u4E0B\u7F34\u8D39", field("bill", "\u5F85\u7F34\u8D26\u5355", "", { choices: state2().bills.filter((b) => !b.paid).map((b) => [b.id, `${b.room} \xB7 ${b.title} \xB7 \xA5${money(b.amount)}`]) }) + field("receipt", "\u7EBF\u4E0B\u6536\u6B3E\u51ED\u8BC1\u53F7"), (v) => {
    store2.pay([v.bill]);
    store2.record("\u8865\u5F55\u7EBF\u4E0B\u7F34\u8D39\u51ED\u8BC1", v.receipt);
    render();
    toast("\u7EBF\u4E0B\u7F34\u8D39\u5DF2\u5165\u8D26");
  }));
  on2(/登记新收费项/, () => formModal("\u767B\u8BB0\u6536\u8D39\u9879\u76EE", field("title", "\u6536\u8D39\u540D\u79F0") + field("room", "\u623F\u53F7", state2().user.room) + field("amount", "\u5E94\u6536\u91D1\u989D", "", { type: "number", min: ".01", step: ".01" }), (v) => {
    if (!isAmount(v.amount)) throw new Error("\u91D1\u989D\u683C\u5F0F\u4E0D\u6B63\u786E");
    store2.change((s) => s.bills.unshift({ ...v, id: id("BILL"), amount: Number(v.amount), type: "others", book: "current", paid: false }));
    toast("\u6536\u8D39\u9879\u76EE\u5DF2\u767B\u8BB0\uFF0C\u5C45\u6C11\u7AEF\u5176\u4ED6\u8D39\u7528\u4E2D\u53EF\u89C1");
  }));
  on2(/派发走访/, () => formModal("\u6B20\u8D39\u8D70\u8BBF\u4EFB\u52A1", field("staff", "\u8D1F\u8D23\u7BA1\u5BB6", "\u674E\u660E") + field("note", "\u8D70\u8BBF\u8303\u56F4\u4E0E\u4E8B\u9879", "16-20\u53F7\u697C\u79DF\u6237\u8D39\u7528\u4EA4\u63A5\u6838\u5B9E", { type: "textarea" }), (v) => {
    store2.record("\u6D3E\u53D1\u8D70\u8BBF", v.staff + " \xB7 " + v.note);
    toast("\u8D70\u8BBF\u4EFB\u52A1\u5DF2\u4FDD\u5B58");
  }));
  on2(/续期|解禁\/补缴/, (el) => formModal("\u8F66\u4F4D\u7EED\u671F\u4E0E\u8865\u7F34", `<p>${escape(el.closest("tr")?.innerText || "")}</p>` + field("months", "\u7EED\u671F\u6708\u6570", "1", { type: "number", min: 1, max: 24 }), (v) => {
    if (!Number.isInteger(Number(v.months))) throw new Error("\u7EED\u671F\u6708\u6570\u987B\u4E3A\u6574\u6570");
    store2.record("\u8F66\u4F4D\u7EED\u671F", v.months + "\u4E2A\u6708");
    toast("\u7EED\u671F\u7533\u8BF7\u5DF2\u767B\u8BB0\uFF0C\u5F85\u8D22\u52A1\u6838\u5BF9");
  }));
  on2(/^(明细|详情|审批单)$/, (el) => modal("\u8D26\u76EE\u660E\u7EC6", `<p>${escape(el.closest("tr")?.innerText)}</p>`));
  const parkingTabs = buttons(/^(全部车位|临停流水)$/);
  parkingTabs.forEach((b, i) => bind(b, label(b), () => {
    active(parkingTabs, b);
    if (i) ctx.panel("logs");
  }));
  const year = $("main select");
  year?.addEventListener("change", () => {
    const rows = $$("tbody tr", $("#tab-content-" + tab));
    rows.forEach((r, i) => r.hidden = year.selectedIndex === 1 && i > 1);
    toast(`\u5DF2\u5207\u6362${year.value}`);
  });
  const pagination = buttons(/^[1238]$/);
  pagination.forEach((b) => {
    b.disabled = true;
    b.title = "\u6F14\u793A\u53F0\u8D26\u5F53\u524D\u5DF2\u663E\u793A\u5168\u90E8\u8BB0\u5F55";
    b.dataset.action = "\u5168\u90E8\u8BB0\u5F55\u5DF2\u663E\u793A";
  });
  changeTab(tab);
  render();
  window.addEventListener("demo:external", render);
}
function group(ctx) {
  const { state: state2, store: store2, go: go2, qs: qs2 } = ctx;
  const groupState = state2();
  const org = groupState.organization;
  const groupOverview = document.createElement("section");
  groupOverview.className = "demo-group-overview";
  groupOverview.id = "group-organization";
  const companyTree = org.companies.map((company) => {
    const communities = org.communities.filter((community) => community.companyId === company.id);
    const communityRows = communities.length ? communities.map((community) => {
      const orderCount = groupState.orders.filter((order) => order.communityId === community.id && !["closed", "cancelled"].includes(order.status)).length;
      const contentCount = groupState.articles.filter((article) => article.audience === "community" && article.communityIds?.includes(community.id)).length;
      return `<li><span>${escape(community.name)}</span><small>${orderCount} \u4E2A\u8FDB\u884C\u4E2D\u5DE5\u5355 \xB7 ${contentCount} \u6761\u5C0F\u533A\u5185\u5BB9</small></li>`;
    }).join("") : "<li><span>\u5F85\u63A5\u5165\u5C0F\u533A</span><small>\u53EF\u7531\u96C6\u56E2\u65B0\u589E\u5408\u4F5C\u9879\u76EE</small></li>";
    return `<article class="demo-group-company"><div><span class="demo-tree-branch">\u7269\u4E1A\u516C\u53F8</span><h3>${escape(company.name)}</h3></div><button class="demo-button secondary" data-group-company="${escape(company.id)}">\u67E5\u770B\u7BA1\u8F96</button><ul>${communityRows}</ul></article>`;
  }).join("");
  const platformContent = groupState.articles.filter((article) => article.audience === "platform");
  const communityContent = groupState.articles.filter((article) => article.audience === "community");
  groupOverview.innerHTML = `<div class="demo-group-heading"><div><span class="demo-tree-kicker">\u58F0\u8FB9\u96C6\u56E2</span><h2>\u96C6\u56E2\u8FD0\u8425\u4E2D\u67A2</h2><p>\u96C6\u56E2\u7EDF\u4E00\u6CBB\u7406\u7269\u4E1A\u516C\u53F8\u3001\u5C0F\u533A\u8FD0\u8425\u4E0E\u58F0\u8FB9\u5185\u5BB9\u5206\u53D1\u3002</p></div><div class="demo-group-actions"><button class="demo-button" data-group-content>\u67E5\u770B\u5185\u5BB9\u77E9\u9635</button><button class="demo-button secondary" data-group-orders>\u67E5\u770B\u5728\u7BA1\u5DE5\u5355</button></div></div><div class="demo-group-metrics"><article><strong>${org.companies.length}</strong><span>\u7269\u4E1A\u516C\u53F8</span></article><article><strong>${org.communities.length}</strong><span>\u5728\u7BA1\u5C0F\u533A</span></article><article><strong>${platformContent.length}</strong><span>\u5E73\u53F0\u7EDF\u4E00\u5185\u5BB9</span></article><article><strong>${communityContent.length}</strong><span>\u5C0F\u533A\u4E13\u5C5E\u5185\u5BB9</span></article></div><div class="demo-group-tree"><div class="demo-platform-root">${icon("graphic_eq")}<strong>\u58F0\u8FB9\u5E73\u53F0</strong><small>\u7EDF\u4E00\u5185\u5BB9\u53D1\u5E03\u3001\u7EC4\u7EC7\u6CBB\u7406\u3001\u8DE8\u5C0F\u533A\u8FD0\u8425\u6C47\u603B</small></div><div class="demo-company-grid">${companyTree}</div></div>`;
  $("main > div")?.prepend(groupOverview);
  $$("[data-group-company]", groupOverview).forEach((button) => bind(button, "\u67E5\u770B\u7269\u4E1A\u516C\u53F8\u7BA1\u8F96\u5C0F\u533A", () => {
    const company = org.companies.find((item) => item.id === button.dataset.groupCompany);
    const communities = org.communities.filter((community) => community.companyId === company.id);
    modal(company.name + " \xB7 \u5728\u7BA1\u5C0F\u533A", list(communities, (community) => {
      const orders2 = groupState.orders.filter((order) => order.communityId === community.id && !["closed", "cancelled"].includes(order.status)).length;
      const contents = groupState.articles.filter((article) => article.audience === "community" && article.communityIds?.includes(community.id)).length;
      return `<article><strong>${escape(community.name)}</strong><small>\u8FDB\u884C\u4E2D\u5DE5\u5355 ${orders2} \u4E2A \xB7 \u5C0F\u533A\u4E13\u5C5E\u5185\u5BB9 ${contents} \u6761</small></article>`;
    }));
  }));
  bind($("[data-group-content]", groupOverview), "\u67E5\u770B\u96C6\u56E2\u5185\u5BB9\u77E9\u9635", () => modal("\u96C6\u56E2\u5185\u5BB9\u77E9\u9635", list(groupState.articles, (article) => `<article><strong>${escape(article.title)}</strong><small>${escape(contentAudienceText(article, org))} \xB7 \u53D1\u5E03\u65B9\uFF1A${escape(article.publisher || "\u7269\u4E1A\u670D\u52A1\u4E2D\u5FC3")}</small></article>`)));
  bind($("[data-group-orders]", groupOverview), "\u67E5\u770B\u96C6\u56E2\u5728\u7BA1\u5DE5\u5355", () => modal("\u96C6\u56E2\u5728\u7BA1\u5DE5\u5355", list(groupState.orders.filter((order) => !["closed", "cancelled"].includes(order.status)), (order) => `<article><strong>${escape(order.title)}</strong><small>${escape(org.communities.find((community) => community.id === order.communityId)?.name || "\u672A\u5F52\u5C5E\u5C0F\u533A")} \xB7 ${statuses[order.status]}</small></article>`)));
  bind($("#btn-reconcile"), "\u94F6\u884C\u4E00\u952E\u5BF9\u8D26", (btnEvent) => busy($("#btn-reconcile"), () => {
    const actual = state2().payments.reduce((sum, p) => sum + p.amount, 0);
    store2.record("\u6A21\u62DF\u94F6\u884C\u5BF9\u8D26", `${state2().payments.length}\u7B14\uFF0C\u5171\xA5${money(actual)}`);
    modal("\u5BF9\u8D26\u7ED3\u679C\uFF08\u6F14\u793A\uFF09", `<p>\u6A21\u62DF\u652F\u4ED8\u6D41\u6C34\uFF1A${state2().payments.length}\u7B14</p><p>\u603B\u5B9E\u6536\uFF1A\xA5${money(actual)}</p><p>\u5F53\u524D\u6F14\u793A\u8D26\u5355\u4E0E\u6536\u6B3E\u6D41\u6C34\u5DF2\u6838\u5BF9\u3002</p>`, [{ label: "\u4E0B\u8F7D\u5BF9\u8D26\u5355", run: () => csv("\u96C6\u56E2\u5BF9\u8D26.csv", [["\u4EA4\u6613\u53F7", "\u91D1\u989D", "\u65F6\u95F4"], ...state2().payments.map((p) => [p.id, p.amount, p.at])]) }]);
  }));
  const accountNames = {
    group: "\u96C6\u56E2\u5F52\u96C6\u8D26\u6237",
    jinxiu: "\u9526\u7EE3\u534E\u5EAD\u9879\u76EE\u8D26\u6237",
    pengyi: "\u5F6D\u4E00\u5C0F\u533A\u9879\u76EE\u8D26\u6237",
    penger: "\u5F6D\u4E8C\u65B0\u6751\u9879\u76EE\u8D26\u6237",
    lvzhou: "\u7EFF\u6D32\u5BB6\u56ED\u9879\u76EE\u8D26\u6237"
  };
  glyphs("swap_horiz").forEach((btn) => bind(btn, "\u53D1\u8D77\u8D44\u91D1\u8C03\u62E8", () => {
    const accounts = Object.keys(state2().balances).map((key) => [key, `${accountNames[key]}\uFF08\u4F59\u989D \xA5${money(state2().balances[key])}\uFF09`]);
    formModal(
      "\u53D1\u8D77\u8D44\u91D1\u8C03\u62E8\uFF08\u6F14\u793A\uFF09",
      field("from", "\u8C03\u51FA\u8D26\u6237", "group", { choices: accounts }) + field("to", "\u63A5\u6536\u8D26\u6237", "pengyi", { choices: accounts }) + field("amount", "\u5212\u62E8\u91D1\u989D", "", { type: "number", min: "0.01", step: "0.01" }) + field("reason", "\u8C03\u62E8\u539F\u7531\u4E0E\u5BA1\u6279\u6279\u6587\u53F7", "", { type: "textarea", maxLength: 200 }),
      (values) => {
        const transfer = store2.transfer({ ...values, amount: Number(values.amount) });
        modal("\u6A21\u62DF\u8C03\u62E8\u6210\u529F", `<p>\u8C03\u62E8\u7F16\u53F7\uFF1A${escape(transfer.id)}</p><p>${escape(accountNames[transfer.from])}\u5DF2\u5411${escape(accountNames[transfer.to])}\u6A21\u62DF\u5212\u62E8 \xA5${money(transfer.amount)}\u3002</p><p class="demo-muted">\u4EC5\u4FDD\u5B58\u5230\u5F53\u524D\u6D4F\u89C8\u5668\u7684\u6F14\u793A\u8BB0\u5F55\uFF0C\u672A\u8FDE\u63A5\u94F6\u884C\u3001\u771F\u5B9E\u8D26\u52A1\u6216\u4EFB\u4F55\u5916\u90E8\u7CFB\u7EDF\u3002</p>`);
        return false;
      },
      "\u786E\u8BA4\u6A21\u62DF\u8C03\u62E8"
    );
  }));
  const rows = $$("#matrix-table tbody tr");
  const matrix = $("#matrix-table");
  const analysisHeading = $$("h3").find((h) => h.textContent.includes("\u591A\u9879\u76EE\u805A\u5408\u6536\u5165\u4E0E\u652F\u51FA\u6784\u6210"));
  const analysis = analysisHeading?.closest(".lg\\:col-span-5");
  if (analysis) analysis.id = "group-analysis";
  if (qs2.get("view") === "expenditure") {
    const heading = matrix?.querySelector("h2");
    const description = matrix?.querySelector("h2 + p");
    if (heading) heading.textContent = "\u96C6\u56E2\u9879\u76EE\u652F\u51FA\u5BF9\u8D26\uFF08\u5168\u5C0F\u533A\uFF09";
    if (description) description.textContent = "\u5148\u6309\u5C0F\u533A\u67E5\u770B\u652F\u51FA\u660E\u7EC6\uFF0C\u518D\u67E5\u770B\u5E95\u90E8\u7684\u5168\u90E8\u5C0F\u533A\u805A\u5408\u5206\u6790\uFF1B\u4E0D\u4F1A\u8DF3\u8F6C\u5230\u5355\u4E2A\u7269\u4E1A\u540E\u53F0\u3002";
  }
  const showProject = (row) => {
    const cells = $$("td", row).map((td) => td.innerText.replace(/\s+/g, " ").trim());
    const project = cells[0] || "\u5F53\u524D\u5C0F\u533A";
    const detail = `<dl class="demo-meta"><dt>\u5C0F\u533A\u5B9E\u9645\u60C5\u51B5</dt><dd>${escape(project)}</dd><dt>\u7BA1\u7406\u4F53\u91CF</dt><dd>${escape(cells[1] || "\u6682\u65E0")}</dd><dt>\u4ECA\u65E5\u5B9E\u65F6\u6536\u6B3E</dt><dd>${escape(cells[2] || "\u6682\u65E0")}</dd><dt>\u672C\u6708\u7EFC\u5408\u6536\u7F34\u7387</dt><dd>${escape(cells[3] || "\u6682\u65E0")}</dd><dt>\u4ECA\u65E5\u652F\u51FA\u5BA1\u6279</dt><dd>${escape(cells[4] || "\u6682\u65E0")}</dd><dt>\u5F53\u65E5\u51C0\u73B0\u91D1\u6D41</dt><dd>${escape(cells[5] || "\u6682\u65E0")}</dd><dt>\u7EF4\u4FEE\u91D1\u4E13\u6237\u7ED3\u4F59</dt><dd>${escape(cells[6] || "\u6682\u65E0")}</dd><dt>\u98CE\u63A7\u5065\u5EB7\u5EA6</dt><dd>${escape(cells[7] || "\u6682\u65E0")}</dd></dl><p>\u4EE5\u4E0A\u4E3A\u96C6\u56E2\u8D22\u52A1\u4E2D\u67A2\u5F53\u524D\u6C47\u603B\u7684\u8BE5\u5C0F\u533A\u5B9E\u9645\u7ECF\u8425\u6570\u636E\uFF0C\u5305\u542B\u6536\u6B3E\u3001\u652F\u51FA\u3001\u73B0\u91D1\u6D41\u548C\u7EF4\u4FEE\u91D1\u4F59\u989D\u3002</p>`;
    modal(project + " \xB7 \u5B9E\u9645\u7ECF\u8425\u60C5\u51B5", detail, [{ label: "\u67E5\u770B\u5168\u90E8\u5C0F\u533A\u5206\u6790", run: () => {
      closeModal();
      analysis?.scrollIntoView({ behavior: "smooth", block: "center" });
    } }]);
  };
  rows.forEach((row) => {
    row.classList.add("cursor-pointer");
    bind(row, "\u67E5\u770B\u5C0F\u533A\u5B9E\u9645\u60C5\u51B5", (e) => {
      if (e.target.closest("button,a")) return;
      showProject(row);
    });
  });
  const search = $('main input[placeholder*="\u641C\u7D22\u5C0F\u533A"]');
  search?.addEventListener("input", () => rows.forEach((r) => r.hidden = !r.textContent.includes(search.value.trim())));
  on2(/过滤状态/, (b) => formModal("\u9879\u76EE\u72B6\u6001\u7B5B\u9009", field("filter", "\u98CE\u63A7\u72B6\u6001", "all", { choices: [["all", "\u5168\u90E8\u9879\u76EE"], ["risk", "\u98CE\u9669\u9884\u8B66"], ["normal", "\u6B63\u5E38\u8FD0\u8425"]] }), (v) => {
    rows.forEach((r) => {
      const risk = /欠费风险|抢修支出偏高/.test(r.textContent);
      r.hidden = v.filter === "risk" ? !risk : v.filter === "normal" ? risk : false;
    });
    b.textContent = "\u8FC7\u6EE4\u72B6\u6001: " + { all: "\u5168\u90E8\u9879\u76EE", risk: "\u98CE\u9669\u9884\u8B66", normal: "\u6B63\u5E38\u8FD0\u8425" }[v.filter];
  }));
  glyphs("visibility").forEach((b) => bind(b, "\u9879\u76EE\u652F\u51FA\u5BF9\u8D26\u8BE6\u60C5", () => {
    showProject(b.closest("tr"));
  }));
  glyphs("open_in_new").forEach((b) => bind(b, "\u6253\u5F00\u5C0F\u533A\u5BF9\u8D26\u660E\u7EC6", () => {
    showProject(b.closest("tr"));
  }));
  on2(/穿透核查明细/, () => {
    rows.forEach((r) => r.hidden = !/欠费风险|抢修支出偏高/.test(r.textContent));
    $("#matrix-table").scrollIntoView({ behavior: "smooth" });
  });
  glyphs("priority_high").forEach((b) => bind(b, "\u98CE\u9669\u9879\u76EE\u8BE6\u60C5", () => modal("\u98CE\u9669\u9879\u76EE", `<p>${escape(b.closest("tr").innerText)}</p>`)));
  const ranges = buttons(/^(今日实时|本周|本月|本季度|年度)$/);
  ranges.forEach((b) => bind(b, "\u5207\u6362\u7EDF\u8BA1\u5468\u671F", () => {
    active(ranges, b);
    modal(label(b) + "\u6536\u652F\u660E\u7EC6", list(state2().payments, (p) => `<article>${p.id} \xB7 \xA5${money(p.amount)} \xB7 ${new Date(p.at).toLocaleDateString("zh-CN")}</article>`));
  }));
  $$("header button").filter((b) => $(".material-symbols-outlined", b)?.textContent.trim() === "warning").forEach((b) => bind(b, "\u67E5\u770B\u98CE\u63A7\u9884\u8B66", () => {
    modal("\u98CE\u63A7\u9884\u8B66", list(rows.filter((r) => /欠费风险|抢修支出偏高/.test(r.textContent)), (r) => `<article>${escape(r.innerText)}</article>`));
  }));
}

// src/pages/content.js
var buttons2 = (rx) => $$("button,a").filter((b) => rx.test(label(b)));
var on3 = (rx, fn) => buttons2(rx).forEach((b) => {
  if (!b.dataset.action) bind(b, label(b), () => fn(b));
});
var glyph = (text) => $$("button").filter((b) => !label(b) && $(".material-symbols-outlined", b)?.textContent.trim() === text);
function initContent(ctx) {
  if (ctx.route.key === "weekly") weekly(ctx);
  if (ctx.route.key === "broadcast") broadcast(ctx);
  if (ctx.route.key === "home") home(ctx);
  if (ctx.route.key === "media") media(ctx);
}
function weekly(ctx) {
  const { route: route2, state: state2, store: store2, go: go2 } = ctx;
  const propertyContext = state2().contexts.property;
  const currentCommunity = communityById(propertyContext.communityId, state2().organization);
  const scope = `${currentCommunity?.name || "\u5F53\u524D\u5C0F\u533A"}\u4E13\u5C5E\u5185\u5BB9`;
  const scopeBox = document.createElement("section");
  scopeBox.className = "demo-scope-banner";
  scopeBox.innerHTML = `${icon("location_city")}<div><strong>\u672C\u6B21\u53D1\u5E03\u8303\u56F4\uFF1A${escape(scope)}</strong><small>\u7269\u4E1A\u8FD0\u8425\u7AEF\u53EA\u53EF\u53D1\u5E03\u672C\u5C0F\u533A\u5185\u5BB9\uFF1B\u201C\u58F0\u8FB9\u5E73\u53F0\u7EDF\u4E00\u53D1\u5E03\u201D\u7531\u5E73\u53F0\u7AEF\u540E\u7EED\u7BA1\u7406\u3002</small></div>`;
  $("main > div")?.prepend(scopeBox);
  const inputs = $$("main input,main select,main textarea").filter((e) => !e.closest("#mobile-preview-modal"));
  const text = $("main textarea");
  const title = $("main input[placeholder]");
  const draftKey = "weekly";
  const draft = state2().drafts[draftKey];
  const textareas = $$("main textarea");
  const counters = $$("[data-editor-counter]");
  const updateCounters = () => counters.forEach((counter, index) => {
    counter.textContent = `\u5DF2\u8F93\u5165 ${textareas[index]?.value.length || 0} \u5B57`;
  });
  if (draft) inputs.forEach((e, i) => {
    if (draft[i] !== void 0) e.value = draft[i];
  });
  updateCounters();
  const save = () => {
    store2.saveDraft(draftKey, inputs.map((e) => e.value));
    toast("\u8349\u7A3F\u5DF2\u4FDD\u5B58");
  };
  on3(/保存草稿/, save);
  inputs.forEach((e) => e.addEventListener("input", () => {
    store2.saveDraft(draftKey, inputs.map((e2) => e2.value));
    updateCounters();
  }));
  const publish = () => {
    if (!text.value.trim()) throw new Error("\u8BF7\u586B\u5199\u672C\u5468\u5DE5\u4F5C\u603B\u7ED3");
    if (title && !title.value.trim()) throw new Error("\u8BF7\u586B\u5199\u5468\u62A5\u6807\u9898");
    if (route2.key === "weekly" && !$$("main textarea")[1].value.trim()) throw new Error("\u8BF7\u586B\u5199\u4E0B\u5468\u5DE5\u4F5C\u8BA1\u5212");
    confirm("\u53D1\u5E03\u5DE5\u4F5C\u5468\u62A5", `\u5C06\u4EE5\u201C${scope}\u201D\u53D1\u5E03\u81F3\u5C45\u6C11\u7AEF\u58F0\u8FB9\u89C6\u542C\uFF0C\u5176\u4ED6\u5C0F\u533A\u5C45\u6C11\u4E0D\u53EF\u89C1\u3002`, () => {
      return store2.publishContent({ id: id("WEEK"), title: title?.value.trim() || "\u7269\u4E1A\u670D\u52A1\u5DE5\u4F5C\u5468\u62A5", body: text.value, plan: $$("main textarea")[1]?.value || "", kind: "article", author: "\u7269\u4E1A\u670D\u52A1\u4E2D\u5FC3", files: state2().drafts["uploads-" + route2.key] || [] });
    }, { label: "\u786E\u8BA4\u53D1\u5E03", after: (article) => modal("\u53D1\u5E03\u6210\u529F", `<p>${escape(article.title)}</p><p>\u53D1\u5E03\u8303\u56F4\uFF1A${escape(contentAudienceText(article, state2().organization))}\u3002</p>`, [{ label: "\u67E5\u770B\u5C45\u6C11\u7AEF\u5185\u5BB9", run: () => go2("/mobile/articles/" + article.id) }, { label: "\u7EE7\u7EED\u91C7\u7F16", secondary: true, run: closeModal }]) });
  };
  on3(/提交并同步|提交发布/, publish);
  on3(/确认上传/, () => {
    save();
    toast("\u5468\u62A5\u4E0E\u9644\u4EF6\u5DF2\u4FDD\u5B58\uFF0C\u5C1A\u672A\u53D1\u5E03");
  });
  const preview = $("#mobile-preview-modal");
  if (preview) {
    bind($("#preview-trigger-btn"), "\u624B\u673A\u7AEF\u5448\u73B0\u9884\u89C8", () => {
      $("h2,h3,h4", preview).textContent = title.value;
      const paragraph = $$("p", preview).at(-1);
      if (paragraph) paragraph.textContent = text.value;
      preview.classList.remove("hidden");
      preview.setAttribute("role", "dialog");
      preview.setAttribute("aria-modal", "true");
      $("#close-preview-modal-btn").focus();
    });
    bind($("#close-preview-modal-btn"), "\u5173\u95ED\u6A21\u62DF\u9884\u89C8", () => preview.classList.add("hidden"));
    preview.addEventListener("click", (e) => {
      if (e.target === preview) preview.classList.add("hidden");
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") preview.classList.add("hidden");
    });
  }
  on3(/^\[(工程维保|环境保洁|安全消控|便民客服|社区文化)\]$/, (b) => {
    text.value += `
\u3010${label(b).slice(1, -1)}\u3011
`;
    text.focus();
    store2.saveDraft(draftKey, inputs.map((e) => e.value));
    updateCounters();
  });
  const formats = { format_bold: ["**", "**"], title: ["## ", ""], format_list_bulleted: ["- ", ""], format_list_numbered: ["1. ", ""], format_quote: ["> ", ""] };
  for (const [name, [before, after]] of Object.entries(formats)) glyph(name).forEach((b) => bind(b, "\u6587\u672C\u683C\u5F0F" + name, () => {
    const start2 = text.selectionStart, end = text.selectionEnd;
    text.setRangeText(before + (text.value.slice(start2, end) || "\u5185\u5BB9") + after, start2, end, "select");
    text.dispatchEvent(new Event("input"));
    text.focus();
  }));
  on3(/AI 润色|重新生成音频/, (b) => {
    if (label(b).includes("\u97F3\u9891")) return ctx.speech(text.value, b);
    text.value = text.value.trim().replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");
    text.dispatchEvent(new Event("input"));
    toast("\u5DF2\u6574\u7406\u6BB5\u843D\u4E0E\u7A7A\u683C\uFF08\u672C\u5730\u89C4\u5219\u5904\u7406\uFF09");
  });
  on3(/切换音色/, () => formModal("\u64AD\u62A5\u97F3\u8272", field("voice", "\u97F3\u8272", state2().settings.voice || "default", { choices: [["default", "\u7CFB\u7EDF\u9ED8\u8BA4\u4E2D\u6587\u97F3\u8272"], ...speechSynthesis.getVoices().filter((v) => v.lang.startsWith("zh")).map((v) => [v.name, v.name])] }), (v) => {
    store2.change((s) => s.settings.voice = v.voice);
    toast("\u97F3\u8272\u5DF2\u66F4\u65B0");
  }));
  glyph("calendar_month").forEach((b) => bind(b, "\u5468\u62A5\u5468\u671F", () => formModal("\u5468\u62A5\u5468\u671F", field("start", "\u5F00\u59CB\u65E5\u671F", now().slice(0, 10), { type: "date" }) + field("end", "\u7ED3\u675F\u65E5\u671F", now().slice(0, 10), { type: "date" }), (v) => {
    if (v.end < v.start) throw new Error("\u7ED3\u675F\u65E5\u671F\u4E0D\u80FD\u65E9\u4E8E\u5F00\u59CB\u65E5\u671F");
    store2.saveDraft("weekly-period", v);
    toast(`\u5468\u671F\u5DF2\u8BBE\u7F6E\u4E3A${v.start}\u81F3${v.end}`);
  })));
  const archive = buttons2(/全部归档/)[0];
  if (archive) bind(archive, "\u5168\u90E8\u5468\u62A5\u5F52\u6863", () => articleList(ctx, state2().articles.filter((a) => a.kind === "article")));
  glyph("visibility").forEach((b, i) => bind(b, "\u67E5\u770B\u5386\u53F2\u5468\u62A5", () => articleDetail(ctx, state2().articles.filter((a) => a.kind === "article")[i % state2().articles.filter((a) => a.kind === "article").length].id)));
}
function broadcast(ctx) {
  const { state: state2, store: store2 } = ctx;
  const propertyContext = state2().contexts.property;
  const currentCommunity = communityById(propertyContext.communityId, state2().organization);
  const scopeBox = document.createElement("section");
  scopeBox.className = "demo-scope-banner";
  scopeBox.innerHTML = `${icon("campaign")}<div><strong>\u7D27\u6025\u901A\u77E5\u4EC5\u4E0B\u53D1\u81F3\uFF1A${escape(currentCommunity?.name || "\u5F53\u524D\u5C0F\u533A")}</strong><small>\u8BE5\u901A\u77E5\u4E0D\u4F1A\u8986\u76D6\u5176\u4ED6\u7269\u4E1A\u516C\u53F8\u6216\u5408\u4F5C\u5C0F\u533A\u3002</small></div>`;
  $("main > div")?.prepend(scopeBox);
  const title = $("#noticeTitle"), body = $("#noticeContent");
  const template = { title: title.value, body: body.value };
  let hours = 24, category = "\u5E38\u89C4\u7D27\u6025\u901A\u77E5", editing = null;
  const updatePreview = () => {
    $("#charCounter").textContent = `${body.value.length} / 300 \u5B57`;
    $("#previewMarqueeText").textContent = body.value || "\u6682\u65E0\u901A\u77E5\u5185\u5BB9";
  };
  const live = () => {
    const notice = state2().notices.find((n) => n.active && isContentVisible(n, propertyContext.communityId) && (!n.expiresAt || n.expiresAt > now()));
    $("#currentActiveTitle").textContent = notice?.title || "\u6682\u65E0\u751F\u6548\u4E2D\u7684\u5E7F\u64AD";
    $("#currentActiveSnippet").textContent = notice?.body || "\u901A\u77E5\u5DF2\u4E0B\u7EBF";
  };
  body.addEventListener("input", updatePreview);
  $$(".category-pill").forEach((btn) => bind(btn, label(btn), () => {
    category = label(btn);
    active($$(".category-pill"), btn);
  }));
  const durations = buttons2(/^(24小时自动结束|48小时|直到管家手动撤回)$/);
  durations.forEach((b, i) => bind(b, label(b), () => {
    hours = [24, 48, 0][i];
    active(durations, b);
  }));
  on3(/追加客服热线|追加抢修范围|追加应急取水点/, (b) => {
    const phrases = { \u8FFD\u52A0\u5BA2\u670D\u70ED\u7EBF: " \u7269\u4E1A\u670D\u52A1\u70ED\u7EBF\uFF1A400-880-6899\u3002", \u8FFD\u52A0\u62A2\u4FEE\u8303\u56F4: " \u62A2\u4FEE\u8303\u56F4\uFF1A16\u53F7\u697C\u5730\u4E0B\u4E3B\u7BA1\u7F51\u3002", \u8FFD\u52A0\u5E94\u6025\u53D6\u6C34\u70B9: " \u4E34\u65F6\u53D6\u6C34\u70B9\uFF1A\u4E2D\u592E\u82B1\u56ED\u5C0F\u5E7F\u573A\u3002" };
    const phrase = phrases[label(b)];
    if (body.value.length + phrase.length > 300) throw new Error("\u5185\u5BB9\u8D85\u8FC7300\u5B57\u4E0A\u9650");
    body.value += phrase;
    updatePreview();
  });
  on3(/清空重写/, () => {
    body.value = "";
    updatePreview();
  });
  on3(/恢复默认抢修模板/, () => {
    title.value = template.title;
    body.value = template.body;
    editing = null;
    updatePreview();
  });
  on3(/语气更亲和|更严肃专业|精简通顺|AI 润色/, (b) => {
    const prefix = label(b).includes("\u4EB2\u548C") ? "\u4EB2\u7231\u7684\u90BB\u5C45\u4EEC\uFF0C" : label(b).includes("\u4E25\u8083") ? "\u91CD\u8981\u901A\u77E5\uFF1A" : "";
    body.value = (prefix + body.value.trim().replace(/\s+/g, " ")).slice(0, 300);
    updatePreview();
    toast("\u5DF2\u5E94\u7528\u672C\u5730\u63AA\u8F9E\u89C4\u5219");
  });
  on3(/编辑内容/, () => {
    const n = state2().notices.find((n2) => n2.active);
    if (!n) throw new Error("\u5F53\u524D\u6CA1\u6709\u5728\u7EBF\u901A\u77E5");
    editing = n.id;
    title.value = n.title;
    body.value = n.body;
    updatePreview();
    title.focus();
    title.scrollIntoView({ behavior: "smooth", block: "center" });
  });
  on3(/下线撤回/, () => confirm("\u64A4\u56DE\u5F53\u524D\u5E7F\u64AD", `\u786E\u8BA4\u5C06${currentCommunity?.name || "\u5F53\u524D\u5C0F\u533A"}\u7684\u901A\u77E5\u4ECE\u5C45\u6C11\u9996\u9875\u4E0B\u7EBF\uFF1F`, () => store2.change((s) => s.notices.forEach((n) => {
    if (n.active && n.audience === "community" && n.communityIds?.includes(propertyContext.communityId)) n.active = false;
  })), { after: live }));
  on3(/对焦居民端预览/, () => {
    updatePreview();
    $("#mobileFrame").scrollIntoView({ behavior: "smooth", block: "center" });
  });
  on3(/AI语音引擎调试/, (b) => ctx.speech(body.value, b));
  bind($("#publishBtn"), "\u7ACB\u5373\u53D1\u5E03\u5E76\u540C\u6B65\u6EDA\u52A8", () => {
    if (!title.value.trim() || !body.value.trim()) throw new Error("\u8BF7\u586B\u5199\u901A\u77E5\u6807\u9898\u548C\u6B63\u6587");
    if (body.value.length > 300) throw new Error("\u6B63\u6587\u4E0D\u80FD\u8D85\u8FC7300\u5B57");
    confirm("\u53D1\u5E03\u793E\u533A\u901A\u77E5", `\u53D1\u5E03\u540E\u4EC5\u5728${currentCommunity?.name || "\u5F53\u524D\u5C0F\u533A"}\u5C45\u6C11\u9996\u9875\u663E\u793A\uFF0C\u4E0D\u4F1A\u5411\u771F\u5B9E\u4F4F\u6237\u6216\u5587\u53ED\u53D1\u9001\u6D88\u606F\u3002`, () => {
      const notice = store2.publishNotice({ id: editing || id("NOTICE"), title: title.value.trim(), body: body.value.trim(), category, voice: $("#voiceToggle").checked, active: true, expiresAt: hours ? new Date(Date.now() + hours * 36e5).toISOString() : null });
      live();
      return notice;
    }, { after: () => toast("\u5C0F\u533A\u5E7F\u64AD\u5DF2\u53D1\u5E03\uFF0C\u5C45\u6C11\u9996\u9875\u540C\u6B65\u5B8C\u6210") });
  });
  on3(/广播下发历史/, () => modal("\u5E7F\u64AD\u5386\u53F2", list(state2().notices.filter((n) => isContentVisible(n, propertyContext.communityId)), (n) => `<article><strong>${escape(n.title)}</strong><p>${escape(n.body)}</p><small>${escape(contentAudienceText(n, state2().organization))} \xB7 ${n.active ? "\u53D1\u5E03\u4E2D" : "\u5DF2\u4E0B\u7EBF"} \xB7 ${new Date(n.at).toLocaleString("zh-CN")}</small></article>`)));
  updatePreview();
  live();
  window.addEventListener("demo:external", live);
}
function home(ctx) {
  const { state: state2, go: go2, store: store2 } = ctx;
  const radio = $("#radioPlayBtn");
  bind(radio, "\u64AD\u653E\u793E\u533A\u5E7F\u64AD", () => ctx.speech(state2().notices.find((n) => n.active && isContentVisible(n, state2().user.communityId))?.body, radio));
  glyph("chevron_right").forEach((b) => bind(b, "\u67E5\u770B\u5E7F\u64AD\u5185\u5BB9", () => articleDetail(ctx, "radio")));
  const banner = $$("main div").find((e) => e.classList.contains("relative") && e.classList.contains("overflow-hidden") && e.textContent.includes("\u97F3\u4E50\u8282"));
  if (banner) bind(banner, "\u67E5\u770B\u793E\u533A\u97F3\u4E50\u8282", () => go2("/mobile/articles/festival"));
  const names = ["garden", "elevator", "festival", "safety"];
  const ids = ["\u5C0F\u533A\u7EFF\u5316\u5347\u7EA7", "\u7535\u68AF\u7EF4\u4FDD\u6DF1\u5EA6", "\u672C\u5468\u516D\u9732\u5929", "\u751F\u6D3B\u8D34\u58EB"];
  ids.forEach((title, i) => {
    const node = $$("main h2,main h3,main h4,main p").find((e) => e.textContent.trim().startsWith(title));
    if (node) bind(node.closest("article") || node.parentElement, "\u67E5\u770B" + node.textContent, () => go2("/mobile/articles/" + names[i]));
  });
  const likes = glyph("favorite").concat(buttons2(/^\d+$/).filter((b) => $(".material-symbols-outlined", b)?.textContent === "favorite"));
  likes.forEach((b, i) => {
    const key = i === 0 ? "post-garden" : "post-floor";
    const count = state2().posts.find((p) => p.id === key)?.likes || 0;
    const update = () => {
      b.innerHTML = icon("favorite") + " " + (count + (state2().likes.includes(key) ? 1 : 0));
      b.setAttribute("aria-pressed", String(state2().likes.includes(key)));
    };
    bind(b, "\u70B9\u8D5E\u90BB\u91CC\u52A8\u6001", () => {
      ctx.requireAuth(() => {
        store2.toggle("likes", key);
        update();
      });
    });
    update();
  });
  const feed = $$("h2,h3").find((e) => e.textContent.trim() === "\u6211\u7684\u751F\u6D3B\u5708");
  if (feed) bind(feed, "\u6253\u5F00\u751F\u6D3B\u5708", () => go2("/mobile/services?panel=community-feed"));
  on3(/^彭一小区/, () => ctx.panel("community"));
  const noticeBox = document.createElement("div");
  noticeBox.className = "bg-surface-container-lowest rounded-xl px-3 py-2 text-body-sm";
  noticeBox.id = "active-broadcast";
  $("main > div").prepend(noticeBox);
  const render = () => {
    const n = state2().notices.find((n2) => n2.active && isContentVisible(n2, state2().user.communityId) && (!n2.expiresAt || n2.expiresAt > now()));
    noticeBox.hidden = !n;
    noticeBox.innerHTML = n ? `<button class="flex items-center gap-2 w-full text-left text-primary">${icon("campaign")}<span>${escape(n.title)}</span>${icon("chevron_right")}</button>` : "";
    if (n) bind($("button", noticeBox), "\u67E5\u770B\u793E\u533A\u901A\u77E5", () => modal(n.title, `<p>${escape(n.body)}</p>`, n.voice ? [{ label: "\u8BED\u97F3\u64AD\u62A5", run: (b) => ctx.speech(n.body, b) }] : []));
  };
  render();
  window.addEventListener("demo:external", render);
}
function media(ctx) {
  const { state: state2, store: store2, go: go2, route: route2 } = ctx;
  bind($("#favorite-btn"), "\u6536\u85CF\u793E\u533A\u7535\u53F0", () => {
    ctx.requireAuth(() => {
      const fav = store2.toggle("favorites", "radio");
      $("#favorite-btn").setAttribute("aria-pressed", String(fav));
      $("span", $("#favorite-btn")).style.fontVariationSettings = `'FILL' ${fav ? 1 : 0}`;
      toast(fav ? "\u5DF2\u6536\u85CF\u7535\u53F0" : "\u5DF2\u53D6\u6D88\u6536\u85CF");
    });
  });
  let speed = 1;
  const play = $("#main-play-btn");
  $("#play-icon").textContent = "play_arrow";
  const time = (value) => `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
  const radio = createRadio((audio, error) => {
    if (error) return toast(error.message, true);
    $("#play-icon").textContent = audio.paused ? "play_arrow" : "pause";
    $("#progress-fill").style.width = (audio.duration ? audio.currentTime / audio.duration * 100 : 0) + "%";
    $("#current-time").textContent = time(audio.currentTime);
    const duration = $("#current-time").nextElementSibling;
    if (duration && Number.isFinite(audio.duration)) duration.textContent = time(audio.duration);
    $$("#waveform-container span").forEach((bar) => bar.style.animationPlayState = audio.paused ? "paused" : "running");
  });
  bind(play, "\u64AD\u653E\u6216\u6682\u505C\u793E\u533A\u7535\u53F0", radio.toggle);
  bind($("#speed-btn"), "\u5207\u6362\u64AD\u653E\u500D\u901F", () => {
    speed = speed === 1 ? 1.25 : speed === 1.25 ? 1.5 : 1;
    $("#speed-btn").textContent = speed.toFixed(2) + "X";
    radio.audio.playbackRate = speed;
  });
  glyph("replay_10").forEach((b) => bind(b, "\u540E\u900010\u79D2", () => radio.seek(radio.audio.currentTime - 10)));
  glyph("forward_30").forEach((b) => bind(b, "\u524D\u8FDB30\u79D2", () => radio.seek(radio.audio.currentTime + 30)));
  bind($("#progress-bar-wrapper"), "\u8C03\u6574\u64AD\u653E\u8FDB\u5EA6", (e) => {
    const rect = $("#progress-bar-wrapper").getBoundingClientRect();
    radio.seek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * radio.audio.duration);
  });
  const visibleArticles = () => state2().articles.filter((a) => isContentVisible(a, state2().user.communityId));
  bind($("#playlist-btn"), "\u793E\u533A\u7535\u53F0\u64AD\u653E\u5217\u8868", () => articleList(ctx, visibleArticles().filter((a) => ["audio", "article"].includes(a.kind))));
  const mediaSections = $$("main section");
  $$(".tab-pill").forEach((b, i) => bind(b, "\u7B5B\u9009" + label(b), () => {
    active($$(".tab-pill"), b);
    if (i === 0) {
      mediaSections.forEach((s) => s.hidden = false);
      articleList(ctx, visibleArticles());
    } else articleList(ctx, visibleArticles().filter((a) => a.kind === ["all", "audio", "article", "video", "activity"][i]));
  }));
  on3(/全部专栏/, () => articleList(ctx, visibleArticles()));
  on3(/进入微信阅读/, () => go2("/mobile/articles/storm"));
  on3(/朗读全文/, (b) => ctx.speech(state2().articles.find((a) => a.id === "storm").body, b));
  const plants = $$("main h4,main h5").find((e) => e.textContent.includes("\u6625\u5B63\u7EFF\u5316"));
  if (plants) bind(plants.parentElement.parentElement, "\u9605\u8BFB\u7EFF\u5316\u8BA1\u5212", () => go2("/mobile/articles/plants"));
  const videoCards = $$(".cursor-pointer").filter((e) => /3分钟看懂|保安小哥/.test(e.textContent));
  videoCards.forEach((card, i) => bind(card, "\u6253\u5F00\u5FAE\u7EAA\u5F55\u8BE6\u60C5", () => go2("/mobile/articles/" + (i === 0 ? "tank" : "security"))));
  bind($("#post-voice-btn"), "\u6295\u9012\u58F0\u97F3\u4F5C\u54C1", () => ctx.requireAuth(() => {
    formModal("\u6709\u58F0\u5171\u521B\u6295\u7A3F", field("title", "\u4F5C\u54C1\u6807\u9898") + field("body", "\u4F5C\u54C1\u7B80\u4ECB", "", { type: "textarea" }), (v) => {
      store2.change((s) => s.articles.unshift({ ...v, id: id("SUBMISSION"), kind: "audio", status: "\u5F85\u5BA1\u6838", at: now() }));
      toast("\u58F0\u97F3\u4F5C\u54C1\u7B80\u4ECB\u5DF2\u63D0\u4EA4\uFF0C\u53EF\u5728\u7D20\u6750\u4E0A\u4F20\u5904\u8865\u5145\u9644\u4EF6");
    });
  }));
  const submissions = visibleArticles().filter((a) => a.at && a.status !== "\u5F85\u5BA1\u6838");
  if (submissions.length) {
    const box = document.createElement("section");
    box.className = "demo-inline-section";
    box.innerHTML = `<h3 class="text-headline-sm">\u6700\u65B0\u7269\u4E1A\u5468\u62A5</h3>` + list(submissions, (a) => `<button data-new-article="${a.id}"><strong>${escape(a.title)}</strong><small>${new Date(a.at).toLocaleDateString("zh-CN")}</small></button>`);
    $("main > div").prepend(box);
    $$("[data-new-article]", box).forEach((b) => bind(b, "\u67E5\u770B\u7269\u4E1A\u5468\u62A5", () => go2("/mobile/articles/" + b.dataset.newArticle)));
  }
  if (route2.detail === "article") articleDetail(ctx, decodeURIComponent(location.pathname.split("/").pop()));
}
function articleList(ctx, articles2) {
  const dlg = modal("\u793E\u533A\u5185\u5BB9", list(articles2, (a) => `<button data-article="${escape(a.id)}"><strong>${escape(a.title)}</strong><small>${escape(contentAudienceText(a, ctx.state().organization))} \xB7 ${{ article: "\u56FE\u6587", audio: "\u7535\u53F0", video: "\u5FAE\u7EAA\u5F55", activity: "\u6D3B\u52A8" }[a.kind]} ${a.status || ""}</small></button>`));
  $$("[data-article]", dlg).forEach((b) => bind(b, "\u6253\u5F00\u5185\u5BB9\u8BE6\u60C5", () => ctx.go("/mobile/articles/" + b.dataset.article)));
}
function articleDetail(ctx, articleId) {
  const article = ctx.state().articles.find((a) => a.id === articleId && isContentVisible(a, ctx.state().user.communityId));
  if (!article) return modal("\u5185\u5BB9\u4E0D\u5B58\u5728", empty("\u8BE5\u5185\u5BB9\u4E0D\u5B58\u5728\u6216\u5DF2\u4E0B\u7EBF"), [{ label: "\u8FD4\u56DE\u58F0\u8FB9\u89C6\u542C", run: () => ctx.go("/mobile/media") }]);
  const imageIndex = { radio: 0, storm: 1, garden: 2, plants: 2, tank: 3, security: 4 };
  const image = ctx.source.media.images[imageIndex[article.id]];
  const actions = [
    { label: ctx.state().favorites.includes(article.id) ? "\u53D6\u6D88\u6536\u85CF" : "\u6536\u85CF", secondary: true, run: () => ctx.requireAuth(() => {
      ctx.store.toggle("favorites", article.id);
      articleDetail(ctx, articleId);
    }) },
    { label: "\u5206\u4EAB", secondary: true, run: () => ctx.share(location.origin + "/mobile/articles/" + article.id) },
    { label: "\u6717\u8BFB\u5168\u6587", run: (b) => ctx.speech(article.body, b) }
  ];
  if (article.kind === "activity") actions.push({ label: "\u7ACB\u5373\u62A5\u540D", run: () => ctx.requireAuth(() => formModal("\u793E\u533A\u6D3B\u52A8\u62A5\u540D", field("name", "\u59D3\u540D", ctx.state().user.name) + field("phone", "\u8054\u7CFB\u7535\u8BDD", ctx.state().user.phone, { pattern: "1[3-9][0-9]{9}", type: "tel" }) + field("quantity", "\u53C2\u4E0E\u4EBA\u6570", 1, { type: "number", min: 1, max: 10 }), (v) => {
    ctx.store.change((s) => {
      if (s.bookings.some((b) => b.productId === article.id && b.status !== "\u5DF2\u53D6\u6D88")) throw new Error("\u8BE5\u6D3B\u52A8\u5DF2\u62A5\u540D\uFF0C\u8BF7\u5728\u9884\u7EA6\u8BB0\u5F55\u67E5\u770B");
      s.bookings.unshift({ ...v, id: id("ACT"), productId: article.id, title: article.title, date: "\u672C\u5468\u516D", amount: 0, status: "\u62A5\u540D\u6210\u529F", at: now() });
    });
    toast("\u62A5\u540D\u6210\u529F");
    setTimeout(() => ctx.panel("bookings"), 0);
  })) });
  const dlg = modal(article.title, (image ? `<img class="demo-detail-image" src="${escape(image.src)}" alt="${escape(article.title)}">` : "") + `<p class="demo-content-audience">${escape(contentAudienceText(article, ctx.state().organization))} \xB7 \u53D1\u5E03\u65B9\uFF1A${escape(article.publisher || "\u7269\u4E1A\u670D\u52A1\u4E2D\u5FC3")}</p><p style="white-space:pre-wrap">${escape(article.body)}</p>${article.plan ? `<h3>\u4E0B\u5468\u5DE5\u4F5C\u8BA1\u5212</h3><p>${escape(article.plan)}</p>` : ""}${article.kind === "video" ? '<p class="demo-muted">\u539F\u59CB\u8BBE\u8BA1\u672A\u63D0\u4F9B\u89C6\u9891\u539F\u7247\uFF0C\u5F53\u524D\u5C55\u793A\u7EAA\u5B9E\u56FE\u6587\u3002</p>' : ""}` + list(article.files || [], (f) => `<button data-article-file="${escape(f.id)}">${escape(f.name)}</button>`), actions);
  $$("[data-article-file]", dlg).forEach((b) => bind(b, "\u6253\u5F00\u5468\u62A5\u9644\u4EF6", () => ctx.showFile(article.files.find((f) => f.id === b.dataset.articleFile))));
}

// src/app.js
var route = matchRoute(location.pathname) || pages.find((p) => p.key === document.documentElement.dataset.page);
document.documentElement.dataset.group = route.group;
var store = createStore(localStorage, () => window.dispatchEvent(new Event("demo:change")));
var state = () => store.read();
var qs = new URLSearchParams(location.search);
var role = route.key === "group" || route.key === "login" && qs.get("role") === "group" ? "group" : route.group === "web" ? "admin" : route.group === "worker" ? "worker" : "resident";
var sessionKey = "shengbian-auth-" + role;
var signedIn = () => sessionStorage.getItem(sessionKey) === "yes";
function safeNext(next) {
  return typeof next === "string" && /^\/(mobile|web|worker)\//.test(next) && !next.includes("\\") ? next : "/mobile/home";
}
function go(url) {
  location.assign(safeNext(url));
}
function login() {
  const base = location.pathname === "/web/group" || role === "group" ? "/web/login?role=group&" : `/${route.group}/login?`;
  go(base + `next=${encodeURIComponent(location.pathname + location.search)}`);
}
function requireAuth(fn) {
  if (!signedIn()) return login();
  return fn();
}
function back() {
  if (document.referrer.startsWith(location.origin) && history.length > 1) history.back();
  else go(route.group === "web" ? "/web/overview" : route.group === "worker" ? "/worker/tasks" : "/mobile/home");
}
function signOut() {
  confirm("\u9000\u51FA\u767B\u5F55", "\u786E\u8BA4\u9000\u51FA\u5F53\u524D\u6F14\u793A\u8D26\u53F7\uFF1F\u4E1A\u52A1\u8BB0\u5F55\u4F1A\u7EE7\u7EED\u4FDD\u5B58\u5728\u6B64\u6D4F\u89C8\u5668\u3002", () => {
    sessionStorage.removeItem(sessionKey);
  }, { after: () => go(role === "group" ? "/web/login?role=group" : `/${route.group}/login`) });
}
if (!route.public && !signedIn()) {
  login();
} else {
  start();
}
function start() {
  document.title = `${route.name} | \u58F0\u8FB9\u7269\u4E1A`;
  const ctx = { route, qs, role, source: source_default, store, state, go, back, login, signedIn, requireAuth, panel, orderDetail, showOrders, upload, showFile, speech, share, contact, notify, signOut, safeNext };
  if (!state().expenses.length && !state().logs.some((l) => l.action === "\u521D\u59CB\u5316\u652F\u51FA\u53F0\u8D26")) {
    store.change((s) => {
      s.expenses = source_default.expenses.expenses.map((a) => ({
        id: a["data-sn"],
        title: a["data-title"],
        amount: Number(a["data-amount"].replace(/[¥,]/g, "")),
        dept: a["data-dept"],
        invoice: a["data-invoice"],
        channel: a["data-channel"],
        status: a["data-status"],
        budget: a["data-budget"],
        fund: "operations"
      }));
      s.logs.push({ id: id("LOG"), action: "\u521D\u59CB\u5316\u652F\u51FA\u53F0\u8D26", target: "", at: now() });
    });
  }
  $$("a[data-path]").forEach((a) => {
    const path = navRoutes[a.dataset.path];
    a.href = path;
    a.removeAttribute("aria-current");
    a.classList.remove("bg-primary-container", "text-on-primary-container", "text-primary-container", "font-headline-sm");
    const current = new URL(path, location.origin);
    if (current.pathname === location.pathname && current.search === location.search) {
      a.setAttribute("aria-current", "page");
      a.classList.add(a.closest("aside") ? "demo-selected" : "text-primary-container");
    }
    bind(a, a.title || label(a), () => a.dataset.path === "login" ? signOut() : go(path));
  });
  if (route.key === "group") {
    $$('a[data-path="converged-media"], a[data-path="capital-pool"]').forEach((a) => a.remove());
  }
  if (route.group === "web" && route.key !== "group" && $("aside nav")) {
    const nav = $("aside nav");
    const legacyMedia = $('a[data-path="media-editor"]', nav);
    if (legacyMedia) {
      legacyMedia.dataset.path = "weekly-media";
      legacyMedia.href = "/web/media";
      const glyph2 = $(".material-symbols-outlined", legacyMedia);
      if (glyph2) glyph2.textContent = "upload_file";
      const name = $$("span", legacyMedia).find((span) => span.textContent.trim() === "\u58F0\u8FB9\u878D\u5A92\u4F53\u91C7\u7F16");
      if (name) name.textContent = "\u5468\u62A5\u9644\u4EF6\u4E0A\u4F20";
      const badgeText = $$("span", legacyMedia).find((span) => span.textContent.trim() === "\u91C7\u7F16");
      if (badgeText) badgeText.parentElement.remove();
    }
    const financeCenter = $('a[data-path="finance-center"]', nav);
    const financeAliases = ["expense-management", "property-expenses", "property-expenditure", "maintenance-fund", "maintenance-fund-expenses", "reserve-fund-expense"];
    $$("a[data-path]", nav).filter((a) => financeAliases.includes(a.dataset.path)).forEach((a) => a.remove());
    if (financeCenter) {
      let after = financeCenter;
      for (const [key, text, href, glyph2] of [
        ["expense-management", "\u7269\u4E1A\u652F\u51FA\u7BA1\u7406", "/web/expenses", "payments"],
        ["maintenance-fund", "\u7EF4\u4FEE\u57FA\u91D1\u652F\u51FA\u7BA1\u7406", "/web/expenses?fund=maintenance", "home_repair_service"]
      ]) {
        const a = financeCenter.cloneNode(true);
        a.dataset.path = key;
        a.href = href;
        a.removeAttribute("aria-current");
        a.classList.remove("bg-primary-container", "text-on-primary-container", "text-primary-container", "font-headline-sm", "demo-selected");
        const iconNode = $(".material-symbols-outlined", a);
        if (iconNode) iconNode.textContent = glyph2;
        const textNode = $$("span", a).find((span) => span.textContent.trim() === "\u7269\u4E1A\u8D22\u52A1\u6536\u7F34\u4E2D\u5FC3");
        if (textNode) textNode.textContent = text;
        if (new URL(href, location.origin).pathname === location.pathname && new URL(href, location.origin).search === location.search) {
          a.setAttribute("aria-current", "page");
          a.classList.add("demo-selected");
        }
        after.after(a);
        after = a;
        bind(a, text, () => go(href));
      }
    }
    const webMenu = [
      ["overview", "\u8C03\u5EA6\u6982\u89C8\u5DE5\u4F5C\u53F0", "/web/overview", "space_dashboard"],
      ["work-orders", "\u5DE5\u5355\u6D3E\u53D1\u4E0E\u8C03\u5EA6", "/web/work-orders", "assignment_turned_in"],
      ["finance-center", "\u7269\u4E1A\u8D22\u52A1\u6536\u7F34\u4E2D\u5FC3", "/web/finance", "account_balance_wallet"],
      ["expense-management", "\u7269\u4E1A\u652F\u51FA\u7BA1\u7406", "/web/expenses", "payments"],
      ["maintenance-fund", "\u7EF4\u4FEE\u57FA\u91D1\u652F\u51FA\u7BA1\u7406", "/web/expenses?fund=maintenance", "home_repair_service"],
      ["weekly-media", "\u5468\u62A5\u9644\u4EF6\u4E0A\u4F20", "/web/media", "upload_file"],
      ["broadcast-dispatcher", "\u7D27\u6025\u901A\u77E5\u4E0E\u5E7F\u64AD", "/web/broadcast", "campaign"],
      ["property-residents", "\u623F\u4EA7\u4E0E\u5C45\u6C11\u7BA1\u7406", "/web/overview?panel=residents", "domain"],
      ["system-settings", "\u7CFB\u7EDF\u4E0E\u6743\u9650\u8BBE\u7F6E", "/web/overview?panel=settings", "manage_accounts"],
      ["messages", "\u6D88\u606F\u901A\u77E5", "/web/overview?panel=messages", "notifications"],
      ["group-center", "\u96C6\u56E2\u8FD0\u8425\u4E2D\u67A2", "/web/group", "account_tree"],
      ["worker-tasks", "\u7EF4\u4FEE\u5E08\u5085\u7AEF", "/worker/tasks", "engineering"],
      ["resident-home", "\u5C45\u6C11\u7AEF", "/mobile/home", "smartphone"]
    ];
    for (const [key, text, href, glyph2] of webMenu) {
      if ($$("a[data-path]", nav).some((a2) => a2.dataset.path === key && a2.textContent.includes(text))) continue;
      const a = document.createElement("a");
      a.href = href;
      a.className = "flex items-center gap-2 px-3 py-2 rounded-xl text-on-surface-variant text-body-sm";
      a.innerHTML = icon(glyph2) + escape(text);
      a.dataset.path = key;
      nav.append(a);
      bind(a, text, () => go(href));
    }
    const button = document.createElement("button");
    button.className = "demo-icon demo-mobile-only";
    button.innerHTML = icon("menu");
    document.body.append(button);
    bind(button, "\u6253\u5F00\u5BFC\u822A\u83DC\u5355", () => {
      document.body.classList.toggle("demo-menu-open");
      button.setAttribute("aria-expanded", String(document.body.classList.contains("demo-menu-open")));
    });
  }
  initResident(ctx);
  initOperations(ctx);
  initContent(ctx);
  common(ctx);
  annotate();
  restoreUploads();
  hydrateProfile();
  if (route.detail === "order") orderDetail(decodeURIComponent(location.pathname.split("/").pop()));
  if (qs.get("panel") && qs.get("panel") !== "community-feed") panel(qs.get("panel"));
  if (qs.get("section")) setTimeout(() => document.getElementById(qs.get("section"))?.scrollIntoView({ behavior: "smooth" }), 50);
  window.addEventListener("storage", (e) => {
    if (e.key === "shengbian-demo-v1") {
      hydrateProfile();
      window.dispatchEvent(new Event("demo:external"));
    }
  });
  window.addEventListener("demo:change", hydrateProfile);
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) location.reload();
  });
  window.demoAudit = () => ({
    page: route.key,
    unbound: $$('button,a,.cursor-pointer,[role="button"]').filter((e) => !e.dataset.action && !e.closest("dialog") && !e.closest("[data-action]") && !e.matches("input,select,label") && !e.getAttribute("href")?.startsWith("tel:")).map((e) => ({ text: label(e), id: e.id, tag: e.tagName })),
    deadLinks: $$("a").filter((e) => !e.getAttribute("href") || ["#", "javascript:void(0)"].includes(e.getAttribute("href"))).length
  });
}
function hydrateProfile() {
  const s = state();
  $$("[data-points]").forEach((e) => e.textContent = s.user.points.toLocaleString("zh-CN"));
  $$("[data-user-room]").forEach((e) => e.textContent = `${s.user.community} ${s.user.room}`);
  $$("[data-user-name]").forEach((e) => e.textContent = s.user.name);
}
function notify(title, body = "") {
  store.change((s) => s.messages.unshift({ id: id("MSG"), title, body, at: now(), read: false }));
  toast(title);
}
function contact() {
  modal("\u8054\u7CFB\u7269\u4E1A\u670D\u52A1\u4E2D\u5FC3", '<p>\u5F6D\u4E00\u7269\u4E1A\u7BA1\u5BB6\u670D\u52A1\u53F0</p><p><a class="demo-button" href="tel:4008806899">400-880-6899</a></p><p class="demo-muted">\u7D27\u6025\u60C5\u51B5\u8BF7\u76F4\u63A5\u62E8\u6253\u73B0\u5B9E\u4E2D\u7684\u7269\u4E1A\u6216\u5E94\u6025\u7535\u8BDD\uFF0CDemo \u4E0D\u4F1A\u5411\u771F\u5B9E\u7BA1\u5BB6\u53D1\u9001\u901A\u77E5\u3002</p>', [
    { label: "\u53D1\u9001\u7559\u8A00", run: () => formModal("\u7ED9\u7BA1\u5BB6\u7559\u8A00", field("message", "\u7559\u8A00\u5185\u5BB9", "", { type: "textarea" }), (values) => {
      store.change((s) => s.messages.unshift({ id: id("MSG"), title: "\u5DF2\u63D0\u4EA4\u7BA1\u5BB6\u7559\u8A00", body: values.message, at: now(), read: true }));
      toast("\u7559\u8A00\u5DF2\u4FDD\u5B58\uFF0C\u5F85\u7BA1\u5BB6\u5904\u7406\uFF08\u6F14\u793A\uFF09");
    }) },
    { label: "\u590D\u5236\u4F01\u4E1A\u5FAE\u4FE1\u53F7", secondary: true, run: () => share("SB_Butler_Lin", true) }
  ]);
}
async function share(value = location.href, plain = false) {
  try {
    await navigator.clipboard.writeText(value);
    toast(plain ? "\u5DF2\u590D\u5236" : "\u94FE\u63A5\u5DF2\u590D\u5236");
  } catch {
    modal("\u5206\u4EAB", `<input class="demo-field" readonly value="${escape(value)}" aria-label="\u5206\u4EAB\u5185\u5BB9">`);
  }
}
var utterance;
function speech(text, button) {
  if (!("speechSynthesis" in window)) return modal("\u8BED\u97F3\u6587\u672C", `<p>${escape(text)}</p>`);
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    if (button) $("span.material-symbols-outlined", button)?.replaceChildren(document.createTextNode("play_arrow"));
    return;
  }
  utterance = new SpeechSynthesisUtterance(text || state().articles.find((a) => a.id === "radio").body);
  utterance.lang = "zh-CN";
  utterance.rate = Number(button?.dataset.speed || 1);
  utterance.voice = speechSynthesis.getVoices().find((v) => v.name === state().settings.voice) || null;
  if (button) $("span.material-symbols-outlined", button)?.replaceChildren(document.createTextNode("pause"));
  const finish = () => {
    if (button) $("span.material-symbols-outlined", button)?.replaceChildren(document.createTextNode("play_arrow"));
  };
  utterance.onend = finish;
  utterance.onerror = finish;
  speechSynthesis.speak(utterance);
}
async function upload(trigger, options = {}) {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  input.accept = options.accept || (/(文件|附件|发票|凭证)/.test(label(trigger)) ? "image/*,.pdf,.doc,.docx,.xls,.xlsx" : /视频/.test(label(trigger)) ? "image/*,video/*" : "image/*");
  input.dataset.action = "\u9009\u62E9\u9644\u4EF6";
  const processFiles = async (files) => {
    const saved = [];
    try {
      const previous = state().drafts["uploads-" + route.key] || [];
      if (previous.length + files.length > (options.limit || 6)) throw new Error(`\u6700\u591A\u4E0A\u4F20${options.limit || 6}\u4E2A\u9644\u4EF6`);
      for (const file of files) {
        if (file.size > (file.type.startsWith("video/") ? 50 : 10) * 1024 * 1024) throw new Error("\u56FE\u7247/\u6587\u6863\u4E0A\u965010MB\uFF0C\u89C6\u9891\u4E0A\u965050MB");
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/") && !/\.(pdf|docx?|xlsx?)$/i.test(file.name)) throw new Error("\u4E0D\u652F\u6301\u6B64\u6587\u4EF6\u7C7B\u578B");
      }
      for (const file of files) saved.push(await saveFile(file));
      store.saveDraft("uploads-" + route.key, [...previous, ...saved]);
      restoreUploads();
      toast(`\u5DF2\u4FDD\u5B58${saved.length}\u4E2A\u9644\u4EF6`);
      options.after?.(saved);
    } catch (error) {
      await Promise.allSettled(saved.map((file) => deleteFile(file.id)));
      toast(error.message, true);
    }
  };
  input.addEventListener("change", () => processFiles([...input.files]));
  if (options.files) await processFiles(options.files);
  else input.click();
}
function restoreUploads() {
  let box = $("#saved-attachments");
  const files = state().drafts["uploads-" + route.key] || [];
  if (!box && files.length) {
    box = document.createElement("section");
    box.id = "saved-attachments";
    box.className = "demo-inline-section";
    $("main > div")?.append(box);
  }
  if (box) {
    box.innerHTML = `<h3 class="text-headline-sm">\u5DF2\u4FDD\u5B58\u9644\u4EF6 (${files.length})</h3><div class="demo-inline">${files.map((f) => `<button class="demo-button secondary" data-upload-id="${f.id}">${escape(f.name)}</button>`).join("")}</div>`;
    $$("[data-upload-id]", box).forEach((btn) => bind(btn, "\u67E5\u770B\u4E0A\u4F20\u9644\u4EF6", () => showFile(files.find((f) => f.id === btn.dataset.uploadId))));
  }
  $$("[data-action]").filter((el) => /上传|拍照|照片\/视频/.test(el.dataset.action)).forEach((el) => {
    if (el.dataset.dropReady) return;
    el.dataset.dropReady = "true";
    el.addEventListener("dragover", (e) => e.preventDefault());
    el.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      upload(el, { files: [...e.dataTransfer.files] });
    });
  });
}
async function showFile(file) {
  const blob = await readFile(file.id);
  if (!blob) throw new Error("\u9644\u4EF6\u672A\u627E\u5230\uFF0C\u8BF7\u91CD\u65B0\u4E0A\u4F20");
  const url = URL.createObjectURL(blob);
  const dlg = modal(file.name, file.type.startsWith("image/") ? `<img class="demo-detail-image" src="${url}" alt="${escape(file.name)}">` : file.type.startsWith("video/") ? `<video controls style="width:100%" src="${url}"></video>` : `<p>${escape(file.name)} \xB7 ${Math.ceil(file.size / 1024)} KB</p>`, [
    { label: "\u4E0B\u8F7D\u9644\u4EF6", run: () => {
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
    } },
    { label: "\u5220\u9664\u9644\u4EF6", secondary: true, run: () => confirm("\u5220\u9664\u9644\u4EF6", `\u786E\u8BA4\u79FB\u9664\u201C${file.name}\u201D\uFF1F`, async () => {
      await deleteFile(file.id);
      store.saveDraft("uploads-" + route.key, (state().drafts["uploads-" + route.key] || []).filter((f) => f.id !== file.id));
    }, { after: () => location.reload() }) }
  ]);
  dlg.addEventListener("close", () => URL.revokeObjectURL(url), { once: true });
}
function showOrders(filter) {
  const orders2 = state().orders.filter((o) => !filter || filter(o));
  const canReview = (o) => route.group === "mobile" && o.status === "completed" && !state().reviews.some((r) => r.orderId === o.id);
  const dlg = modal("\u6211\u7684\u5DE5\u5355\u8BB0\u5F55", list(orders2, (o) => `<article><button data-order="${escape(o.id)}"><strong>${escape(o.title)}</strong><small>${escape(o.id)} \xB7 ${escape(o.room)} \xB7 ${canReview(o) ? "\u670D\u52A1\u5DF2\u5B8C\u6210\uFF0C\u5F85\u8BC4\u4EF7" : statuses[o.status]}</small></button>${canReview(o) ? `<button class="demo-button" data-review-order="${escape(o.id)}">\u8BC4\u4EF7\u670D\u52A1</button>` : ""}</article>`), [{ label: "\u65B0\u5EFA\u62A5\u4FEE", run: () => go("/mobile/repair") }]);
  $$("[data-order]", dlg).forEach((btn) => bind(btn, "\u5DE5\u5355\u8BE6\u60C5", () => go(`/${route.group}/orders/${btn.dataset.order}`)));
  $$("[data-review-order]", dlg).forEach((btn) => bind(btn, "\u8BC4\u4EF7\u7EF4\u4FEE\u670D\u52A1", () => go("/mobile/review?id=" + btn.dataset.reviewOrder)));
}
function orderDetail(orderId) {
  const order = state().orders.find((o) => o.id === orderId);
  if (!order) return modal("\u5DE5\u5355\u4E0D\u5B58\u5728", empty("\u672A\u627E\u5230\u8BE5\u5DE5\u5355\uFF0C\u8BF7\u8FD4\u56DE\u5DE5\u5355\u5217\u8868"), [{ label: "\u8FD4\u56DE\u5DE5\u5355\u5217\u8868", run: () => go(route.group === "web" ? "/web/work-orders" : route.group === "worker" ? "/worker/tasks" : "/mobile/profile?panel=orders") }]);
  const actions = [];
  if (route.group === "web" && ["pending", "accepted", "assigned"].includes(order.status)) actions.push({ label: "\u6307\u6D3E\u5E08\u5085", run: () => assign(order) });
  if (route.group === "worker" && ["pending", "assigned"].includes(order.status)) {
    const minutes = order.sla?.arrivalMinutes || (order.urgent ? 30 : 120);
    actions.push({ label: "\u786E\u8BA4\u63A5\u5355", run: () => confirm("\u786E\u8BA4\u63A5\u5355", `${order.title}\u3002\u63A5\u5355\u540E\u8BF7\u5728 ${minutes} \u5206\u949F\u5185\u5B8C\u6210\u5230\u5C97\u6253\u5361\u3002`, () => store.transition(order.id, "accepted", { technician: "\u5F20\u5EFA\u56FD" }), { after: () => go(`/worker/checkin?id=${order.id}`) }) });
  }
  if (route.group === "worker" && ["accepted", "arrived", "processing"].includes(order.status)) actions.push({ label: "\u524D\u5F80\u73B0\u573A\u6253\u5361", run: () => go(`/worker/checkin?id=${order.id}`) });
  if (route.group === "mobile" && order.status === "pending") actions.push({ label: "\u53D6\u6D88\u62A5\u4FEE", secondary: true, run: () => confirm("\u53D6\u6D88\u62A5\u4FEE", "\u786E\u8BA4\u53D6\u6D88\u5C1A\u672A\u6D3E\u53D1\u7684\u62A5\u4FEE\uFF1F", () => store.transition(order.id, "cancelled"), { after: () => orderDetail(order.id) }) });
  if (route.group === "mobile" && ["completed", "closed"].includes(order.status) && !state().reviews.some((r) => r.orderId === order.id)) actions.push({ label: "\u8BC4\u4EF7\u670D\u52A1", run: () => go(`/mobile/review?id=${order.id}`) });
  if (route.group === "mobile" && order.amount > 0 && !order.paid) actions.push({ label: "\u7F34\u7EB3\u7EF4\u4FEE\u8D39", run: () => go(`/mobile/billing?tab=others&bill=repair-${order.id}`) });
  actions.push({ label: "\u8FD4\u56DE", secondary: true, run: back });
  const sla = arrivalStatus(order);
  const due = order.arrivalDueAt ? new Date(order.arrivalDueAt).toLocaleString("zh-CN") : "\u63A5\u5355\u540E\u751F\u6210";
  const dlg = modal("\u5DE5\u5355\u8BE6\u60C5", `<h3>${escape(order.title)}</h3><dl class="demo-meta"><dt>\u5DE5\u5355\u53F7</dt><dd>${escape(order.id)}</dd><dt>\u72B6\u6001</dt><dd>${statuses[order.status]}</dd><dt>\u623F\u5C4B/\u4F4D\u7F6E</dt><dd>${escape(order.room)}</dd><dt>\u9884\u7EA6\u65F6\u95F4</dt><dd>${escape(order.appointment)}</dd><dt>\u5230\u5C97\u65F6\u9650</dt><dd>${escape(order.sla?.arrivalMinutes || (order.urgent ? 30 : 120))} \u5206\u949F\uFF1B\u622A\u6B62 ${escape(due)}</dd><dt>\u5C65\u7EA6\u72B6\u6001</dt><dd>${escape(sla.text)}</dd><dt>\u7EF4\u4FEE\u5E08\u5085</dt><dd>${escape(order.technician || "\u7B49\u5F85\u6D3E\u5DE5")}</dd><dt>\u5E94\u4ED8\u91D1\u989D</dt><dd>\xA5${money(order.amount)} ${order.amount ? order.paid ? "\u5DF2\u7F34\u6E05" : "\u5F85\u7F34\u8D39" : ""}</dd></dl><p>${escape(order.description)}</p><ol class="demo-timeline">${order.timeline.map((t) => `<li>${escape(t.label)}<time>${new Date(t.at).toLocaleString("zh-CN")}</time></li>`).join("")}</ol><div class="demo-inline">${(order.photos || []).map((f, i) => f.src ? `<img src="${escape(f.src)}" alt="\u62A5\u4FEE\u7167\u7247">` : `<button data-file-index="${i}" class="demo-button secondary">${escape(f.name)}</button>`).join("")}</div>`, actions);
  $$("[data-file-index]", dlg).forEach((btn) => bind(btn, "\u67E5\u770B\u5DE5\u5355\u9644\u4EF6", () => showFile(order.photos[btn.dataset.fileIndex])));
}
function assign(order) {
  formModal("\u6307\u6D3E\u7EF4\u4FEE\u5E08\u5085", field("technician", "\u7EF4\u4FEE\u5E08\u5085", order.technician || "\u5F20\u5EFA\u56FD", { choices: ["\u5F20\u5EFA\u56FD", "\u738B\u5FB7\u5229", "\u5218\u5EFA\u519B", "\u9648\u5927\u534E"] }), (values) => {
    if (order.status === "assigned") store.change((s) => {
      const o = s.orders.find((o2) => o2.id === order.id);
      o.technician = values.technician;
      o.timeline.push({ label: "\u6539\u6D3E\u7ED9" + values.technician, status: "assigned", at: now() });
    });
    else store.transition(order.id, "assigned", values);
    toast("\u5DE5\u5355\u5DF2\u6D3E\u53D1");
    setTimeout(() => location.reload(), 300);
  });
}
function panel(name) {
  if (name === "orders") return showOrders();
  if (name === "account") return modal("\u4E2A\u4EBA\u4E2D\u5FC3", `<h3>${escape(role === "admin" ? "\u674E\u660E \xB7 \u7269\u4E1A\u9AD8\u7EA7\u4E3B\u7BA1" : role === "worker" ? "\u5F20\u5EFA\u56FD \xB7 \u7EF4\u4FEE\u5DE5\u7A0B\u5E08" : state().user.name)}</h3><p>${escape(state().user.community)} ${escape(state().user.room)}</p>`, [
    { label: "\u7F16\u8F91\u8D44\u6599", run: () => formModal("\u7F16\u8F91\u4E2A\u4EBA\u8D44\u6599", field("name", "\u59D3\u540D", state().user.name) + field("phone", "\u624B\u673A\u53F7\u7801", state().user.phone, { type: "tel", pattern: "1[3-9][0-9]{9}" }), (v) => {
      store.change((s) => Object.assign(s.user, v));
      toast("\u8D44\u6599\u5DF2\u66F4\u65B0");
    }) },
    { label: "\u9000\u51FA\u767B\u5F55", secondary: true, run: signOut }
  ]);
  if (name === "messages") {
    const messages = [...state().messages, ...state().notices.filter((n) => n.active).map((n) => ({ ...n, body: n.body }))];
    store.change((s) => s.messages.forEach((m) => m.read = true));
    return modal("\u6D88\u606F\u901A\u77E5", list(messages, (m) => `<article><strong>${escape(m.title)}</strong><p>${escape(m.body)}</p><small>${new Date(m.at).toLocaleString("zh-CN")}</small></article>`));
  }
  if (name === "settings") return formModal("\u7CFB\u7EDF\u4E0E\u6743\u9650\u8BBE\u7F6E", field("notifications", "\u6D88\u606F\u63D0\u9192", String(state().settings.notifications), { choices: [["true", "\u5F00\u542F"], ["false", "\u5173\u95ED"]] }) + field("autoDispatch", "\u81EA\u52A8\u6D3E\u5355", String(state().settings.autoDispatch), { choices: [["true", "\u5F00\u542F"], ["false", "\u5173\u95ED"]] }), (v) => {
    store.change((s) => {
      s.settings.notifications = v.notifications === "true";
      s.settings.autoDispatch = v.autoDispatch === "true";
    });
    toast("\u8BBE\u7F6E\u5DF2\u4FDD\u5B58");
  });
  if (name === "residents") {
    const dlg = modal("\u623F\u4EA7\u4E0E\u5C45\u6C11\u7BA1\u7406", list([state().user], (u) => `<article><strong>${escape(u.name)} \xB7 ${escape(u.room)}</strong><p>${escape(u.phone)} \xB7 ${u.verified ? "\u5DF2\u8BA4\u8BC1" : "\u5F85\u5BA1\u6838"} \xB7 ${u.area}\u33A1</p></article>`), [
      { label: "\u7F16\u8F91\u5C45\u6C11\u6863\u6848", run: () => formModal("\u5C45\u6C11\u6863\u6848", field("name", "\u59D3\u540D", state().user.name) + field("phone", "\u624B\u673A\u53F7", state().user.phone, { type: "tel", pattern: "1[3-9][0-9]{9}" }) + field("room", "\u623F\u53F7", state().user.room), (v) => {
        store.change((s) => Object.assign(s.user, v));
        toast("\u6863\u6848\u5DF2\u66F4\u65B0");
      }) },
      { label: "\u8BA4\u8BC1\u7533\u8BF7", run: () => modal("\u623F\u4EA7\u786E\u6743\u7533\u8BF7", list(state().logs.filter((l) => l.action === "\u63D0\u4EA4\u623F\u4EA7\u8BA4\u8BC1"), (l) => `<article>${escape(l.target)} \xB7 \u5F85\u5BA1\u6838</article>`), [{ label: "\u901A\u8FC7\u6F14\u793A\u8BA4\u8BC1", run: () => {
        store.change((s) => s.user.verified = true);
        toast("\u8BA4\u8BC1\u5DF2\u901A\u8FC7");
        closeModal();
      } }]) }
    ]);
    return dlg;
  }
  if (name === "bookings") {
    const dlg = modal("\u670D\u52A1\u9884\u7EA6\u8BB0\u5F55", list(state().bookings, (b) => `<article><strong>${escape(b.title)}</strong><p>${escape(b.date)} \xB7 ${escape(b.time || "")} \xB7 \xA5${money(b.amount)} \xB7 ${escape(b.status)}</p><small>${escape(b.id)}</small>${b.status !== "\u5DF2\u53D6\u6D88" ? `<button class="demo-button secondary" data-cancel-booking="${b.id}">\u53D6\u6D88\u9884\u7EA6</button>` : ""}</article>`));
    $$("[data-cancel-booking]", dlg).forEach((btn) => bind(btn, "\u53D6\u6D88\u9884\u7EA6", () => confirm("\u53D6\u6D88\u9884\u7EA6", "\u786E\u8BA4\u53D6\u6D88\u8BE5\u670D\u52A1\u9884\u7EA6\uFF1F", () => store.change((s) => s.bookings.find((b) => b.id === btn.dataset.cancelBooking).status = "\u5DF2\u53D6\u6D88"), { after: () => panel("bookings") })));
    return;
  }
  if (name === "logs") return modal("\u64CD\u4F5C\u4E0E\u6536\u652F\u6D41\u6C34", list(state().logs, (l) => `<article><strong>${escape(l.action)}</strong><small>${escape(l.target)} \xB7 ${new Date(l.at).toLocaleString("zh-CN")}</small></article>`), [{ label: "\u5BFC\u51FA\u6D41\u6C34", run: () => csv("\u64CD\u4F5C\u6D41\u6C34.csv", [["\u65F6\u95F4", "\u64CD\u4F5C", "\u5173\u8054\u7F16\u53F7"], ...state().logs.map((l) => [l.at, l.action, l.target])]) }]);
  if (name === "house") return formModal("\u5207\u6362\u623F\u5C4B", field("room", "\u623F\u5C4B", state().user.room, { choices: [["16-2-502", "\u5F6D\u4E00\u5C0F\u533A 16\u53F7\u697C2\u5355\u5143502\u5BA4"], ["16-2-502", "\u5F6D\u4E00\u5C0F\u533A \u5730\u4E0B\u8F66\u4F4D B1-108\uFF08\u5173\u8054502\u5BA4\uFF09"]] }), (v) => {
    store.change((s) => s.user.room = v.room);
    toast("\u5DF2\u5207\u6362\u5173\u8054\u623F\u4EA7");
  });
  if (name === "community") return formModal("\u9009\u62E9\u793E\u533A", field("community", "\u793E\u533A", state().user.community, { choices: ["\u5F6D\u4E00\u5C0F\u533A", "\u5F6D\u4E8C\u65B0\u6751", "\u9526\u7EE3\u534E\u5EAD"] }), (v) => {
    store.change((s) => s.user.community = v.community);
    toast("\u5F53\u524D\u793E\u533A\u5DF2\u5207\u6362");
  });
  if (name === "policy") return modal("\u670D\u52A1\u534F\u8BAE\u4E0E\u9690\u79C1\u653F\u7B56", "<p>\u672C\u5730\u4EA7\u54C1\u6F14\u793A\u4EC5\u7528\u4E8E\u4F53\u9A8C\u7269\u4E1A\u670D\u52A1\u6D41\u7A0B\u3002\u8BF7\u4F7F\u7528\u865A\u6784\u59D3\u540D\u3001\u6D4B\u8BD5\u624B\u673A\u53F7\u548C\u6F14\u793A\u8BC1\u4EF6\uFF0C\u4E0D\u8981\u586B\u5199\u771F\u5B9E\u8EAB\u4EFD\u8BC1\u6216\u4EA7\u6743\u8D44\u6599\u3002</p><p>\u4E1A\u52A1\u6570\u636E\u4FDD\u5B58\u5728\u5F53\u524D\u6D4F\u89C8\u5668\uFF0C\u9644\u4EF6\u4FDD\u5B58\u5728 IndexedDB\uFF1B\u672A\u63A5\u5165\u5FAE\u4FE1\u3001\u94F6\u884C\u3001\u516C\u5B89\u3001\u623F\u4EA7\u6838\u9A8C\u6216\u771F\u5B9E\u7269\u4E1A\u7CFB\u7EDF\u3002\u6CA1\u6709\u771F\u5B9E\u4ED8\u6B3E\u3001\u5E7F\u64AD\u4E0B\u53D1\u6216\u8EAB\u4EFD\u8BA4\u8BC1\u3002</p><p>\u5220\u9664\u6D4F\u89C8\u5668\u7AD9\u70B9\u6570\u636E\u53EF\u6E05\u9664\u6F14\u793A\u8BB0\u5F55\u3002</p>");
  return modal("\u670D\u52A1\u8BB0\u5F55", empty("\u5F53\u524D\u6682\u65E0\u6B64\u7C7B\u8BB0\u5F55"));
}
function common(ctx) {
  const textRules = [
    [/一键紧急广播/, () => go("/web/broadcast")],
    [/新建工单/, () => formModal("\u65B0\u5EFA\u5DE5\u5355", field("description", "\u6545\u969C\u63CF\u8FF0", "", { type: "textarea" }) + field("room", "\u62A5\u4FEE\u4F4D\u7F6E", state().user.room) + field("phone", "\u8054\u7CFB\u7535\u8BDD", state().user.phone) + field("appointment", "\u9884\u7EA6\u65F6\u95F4", now().slice(0, 10) + " \u4E0B\u5348") + field("category", "\u6545\u969C\u7C7B\u578B", "\u6C34\u6696\u536B\u6D74", { choices: ["\u6C34\u6696\u536B\u6D74", "\u5F3A\u5F31\u7535\u8DEF", "\u95E8\u7981\u5B89\u9632", "\u516C\u533A\u4FEE\u7F2E"] }), (v) => {
      const o = store.createOrder(v);
      go("/web/orders/" + o.id);
    })],
    [/我要缴费|我的缴费|在线缴物业费|^立即缴费$|去抵扣/, () => requireAuth(() => go("/mobile/billing"))],
    [/我要报修/, () => requireAuth(() => go("/mobile/repair"))],
    [/我的报修|进度实时查/, () => requireAuth(() => panel("orders"))],
    [/我要服务|全部服务/, () => go("/mobile/services")],
    [/我的积分/, () => requireAuth(() => go("/mobile/points"))],
    [/^(切换房屋|切换|home_pin)|选择房屋/, () => panel("house")],
    [/专属管家|金牌管家在岗|联系师傅|联系业主|电联业主|联系|财务咨询|客服|热线/, contact],
    [/消息通知/, () => panel("messages")],
    [/用户服务协议|隐私政策|服务公约|管理细则|保障细则|预缴政策|积分权益说明|规则/, () => panel("policy")],
    [/^(保存草稿)$/, () => {
      store.saveDraft(route.key, $$("main input,main textarea,main select").map((e) => e.value));
      toast("\u8349\u7A3F\u5DF2\u4FDD\u5B58");
    }],
    [/取消|关闭|我知道了/, () => {
      const native = $$("[id]").find((e) => /modal|dialog/i.test(e.id) && !e.classList.contains("hidden"));
      if (native) native.classList.add("hidden");
      else closeModal();
    }],
    [/上传|拍照|照片\/视频|添加更多工作/, (el) => upload(el)],
    [/打印|凭证|凭据|发票|回单|催告函/, (el) => receipt(el)],
    [/导出|下载|审计汇总/, () => csv("\u7269\u4E1A\u4E1A\u52A1\u8BB0\u5F55.csv", [["\u7C7B\u578B", "\u7F16\u53F7", "\u91D1\u989D", "\u72B6\u6001"], ...state().orders.map((o) => ["\u5DE5\u5355", o.id, o.amount, statuses[o.status]]), ...state().expenses.map((e) => ["\u652F\u51FA", e.id, e.amount, e.status])])],
    [/催缴|催促|微信提醒|提醒续费|督办|催办/, (el) => confirm("\u53D1\u9001\u6F14\u793A\u63D0\u9192", "\u5411\u5F53\u524D\u5BF9\u8C61\u521B\u5EFA\u63D0\u9192\u8BB0\u5F55\uFF1F\u4E0D\u4F1A\u53D1\u9001\u771F\u5B9E\u77ED\u4FE1\u6216\u5FAE\u4FE1\u6D88\u606F\u3002", () => notify("\u63D0\u9192\u5DF2\u52A0\u5165\u5F85\u529E", label(el)))],
    [/银行流水|流水明细|归档|广播下发历史/, () => panel("logs")],
    [/权限|参数设置/, () => panel("settings")],
    [/微信联系/, () => share("SB_Butler_Lin", true)],
    [/分享|转发/, () => share()],
    [/朗读|收听|语音|听简报/, (el) => speech(void 0, el)]
  ];
  const iconRules = {
    arrow_back: back,
    arrow_back_ios: back,
    arrow_back_ios_new: back,
    notifications: () => panel("messages"),
    lock: () => {
      sessionStorage.removeItem(sessionKey);
      login();
    },
    logout: signOut,
    person: () => requireAuth(() => panel("account")),
    account_circle: () => requireAuth(() => panel("account")),
    fullscreen: async () => {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    },
    mic: () => route.group === "web" ? go("/web/media") : contact(),
    hearing: () => speech(void 0),
    headset_mic: contact,
    support_agent: contact,
    phone_in_talk: contact,
    call: contact,
    play_arrow: (el) => speech(void 0, el),
    pause: (el) => speech(void 0, el),
    play_circle: (el) => speech(void 0, el),
    volume_up: (el) => speech(void 0, el),
    share: () => share(),
    qr_code_scanner: () => formModal("\u626B\u7801\u670D\u52A1", field("code", "\u95E8\u724C/\u5DE5\u5355\u7F16\u53F7", "16-2-502"), (v) => {
      const o = state().orders.find((o2) => o2.id === v.code);
      if (o) go("/mobile/orders/" + o.id);
      else if (v.code === state().user.room) go("/mobile/repair");
      else throw new Error("\u672A\u8BC6\u522B\u5230\u623F\u53F7\u6216\u5DE5\u5355\uFF0C\u8BF7\u91CD\u65B0\u8F93\u5165");
    }),
    add_photo_alternate: (el) => upload(el),
    sync: () => {
      store.record("\u5237\u65B0\u6570\u636E", route.key);
      location.reload();
    },
    refresh: (el) => upload(el),
    download: () => panel("logs"),
    file_download: () => csv("\u53F0\u8D26.csv", [["\u5355\u53F7", "\u91D1\u989D"], ...state().expenses.map((e) => [e.id, e.amount])]),
    print: (el) => receipt(el),
    zoom_in: (el) => previewImage(el),
    visibility: () => panel("logs"),
    open_in_new: () => go("/web/finance"),
    warning: () => panel("messages"),
    more_vert: (el) => contextMenu(el),
    more_horiz: (el) => contextMenu(el),
    delete: (el) => removeAttachment(el),
    close: (el) => removeAttachment(el)
  };
  $$('button,a,.cursor-pointer,[role="button"]').forEach((el) => {
    if (el.dataset.action || el.closest("dialog") || el.matches("input,select,label")) return;
    if (el.closest("[data-action]")) return;
    if (el.tagName === "A" && el.getAttribute("href")?.startsWith("tel:")) {
      el.dataset.action = "\u62E8\u6253\u7535\u8BDD";
      return;
    }
    if (el.tagName === "IMG") {
      bind(el, "\u67E5\u770B\u56FE\u7247", () => previewImage(el));
      return;
    }
    const text = label(el);
    const glyph2 = $(".material-symbols-outlined", el)?.textContent.trim();
    const rule = textRules.find(([rx]) => rx.test(text));
    if (rule) bind(el, text, () => rule[1](el));
    else if (!text && iconRules[glyph2]) bind(el, el.title || glyph2, () => iconRules[glyph2](el));
    else if (el.tagName === "A" && el.getAttribute("href")?.startsWith("#") && el.getAttribute("href") !== "#") {
      const target = el.getAttribute("href").slice(1);
      bind(el, text, () => document.getElementById(target)?.scrollIntoView({ behavior: "smooth" }));
    }
  });
  $$("header .material-symbols-outlined,aside .material-symbols-outlined").forEach((el) => {
    if (el.closest("button,a,[data-action]")) return;
    const glyph2 = el.textContent.trim();
    if (glyph2 === "person") bind(el.parentElement, "\u4E2A\u4EBA\u4E2D\u5FC3", () => requireAuth(() => panel("account")));
    if (glyph2 === "graphic_eq") bind(el.parentElement.parentElement, "\u8FD4\u56DE\u9996\u9875", () => go(route.group === "web" ? "/web/overview" : "/mobile/home"));
    if (glyph2 === "location_city") bind(el.closest(".cursor-pointer") || el.parentElement, "\u9009\u62E9\u793E\u533A", () => panel("community"));
  });
  $$("header input").forEach((input) => {
    if (input.dataset.action) return;
    input.dataset.action = "\u5168\u5C40\u641C\u7D22";
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const term = input.value.trim().toLowerCase();
        const orders2 = state().orders.filter((o) => JSON.stringify(o).toLowerCase().includes(term));
        const dlg = modal("\u641C\u7D22\u7ED3\u679C", list(orders2, (o) => `<button data-search-order="${o.id}"><strong>${escape(o.title)}</strong><small>${escape(o.room)} \xB7 ${o.id}</small></button>`));
        $$("[data-search-order]", dlg).forEach((btn) => bind(btn, "\u6253\u5F00\u641C\u7D22\u7ED3\u679C", () => go(`/${route.group}/orders/${btn.dataset.searchOrder}`)));
      }
    });
  });
}
function contextMenu(el) {
  const text = el.closest("tr,article")?.innerText || "";
  const o = state().orders.find((o2) => text.includes(o2.id)) || state().orders[0];
  modal("\u5DE5\u5355\u64CD\u4F5C", `<p>${escape(o.title)}</p>`, [{ label: "\u67E5\u770B\u8BE6\u60C5", run: () => go(`/${route.group}/orders/${o.id}`) }, ...route.group === "web" && o.status === "pending" ? [{ label: "\u6D3E\u53D1\u5DE5\u5355", run: () => assign(o) }] : []]);
}
function previewImage(el) {
  const img = el.tagName === "IMG" ? el : el.parentElement.querySelector("img");
  if (img) modal("\u73B0\u573A\u56FE\u7247", `<img class="demo-detail-image" src="${escape(img.src)}" alt="${escape(img.alt)}">`);
}
function removeAttachment(el) {
  const container = el.closest(".aspect-square,.aspect-\\[4\\/3\\]") || el.parentElement;
  if (el.closest('[id*="Modal"],[id*="modal"],[id*="dialog"]')) {
    el.closest('[id*="Modal"],[id*="modal"],[id*="dialog"]').classList.add("hidden");
    return;
  }
  confirm("\u79FB\u9664\u9644\u4EF6", "\u786E\u8BA4\u79FB\u9664\u5F53\u524D\u9644\u4EF6\uFF1F", () => {
    container.remove();
    store.record("\u79FB\u9664\u9644\u4EF6", route.key);
  });
}
function receipt(el) {
  let container = el.closest("tr,article");
  if (!container) {
    container = el.parentElement;
    for (let i = 0; i < 4 && container && !/[¥￥]|缴费时间|流水号/.test(container.textContent); i++) container = container.parentElement;
  }
  const text = container && container.textContent.length < 2500 ? container.innerText : label(el);
  modal("\u7535\u5B50\u51ED\u8BC1\uFF08\u6F14\u793A\uFF09", `<h3>\u58F0\u8FB9\u7269\u4E1A\u4E1A\u52A1\u51ED\u8BC1</h3><p>${escape(text)}</p><p>\u51ED\u8BC1\u751F\u6210\u65F6\u95F4\uFF1A${(/* @__PURE__ */ new Date()).toLocaleString("zh-CN")}</p><p class="demo-muted">\u4EC5\u4F9B Demo \u5C55\u793A\uFF0C\u4E0D\u662F\u6709\u6548\u7A0E\u52A1\u53D1\u7968\u6216\u94F6\u884C\u56DE\u6267\u3002</p>`, [
    { label: "\u4E0B\u8F7D\u51ED\u8BC1", run: () => download("\u58F0\u8FB9\u6F14\u793A\u51ED\u8BC1.txt", `\u58F0\u8FB9\u7269\u4E1A\u6F14\u793A\u51ED\u8BC1
${text}
\u4EC5\u4F9B\u4EA7\u54C1\u6F14\u793A\uFF0C\u4E0D\u4F5C\u4E3A\u8D22\u52A1\u6216\u7A0E\u52A1\u51ED\u8BC1\u3002`) },
    { label: "\u6253\u5370", secondary: true, run: () => window.print() }
  ]);
}
function annotate() {
  $$("a").forEach((a) => {
    if (!a.getAttribute("href") || a.getAttribute("href") === "#" || a.getAttribute("href").startsWith("javascript:")) {
      a.href = a.dataset.action === "\u53BB\u529E\u7406" ? "/mobile/verify" : `${location.pathname}?panel=${/协议|隐私|公约|细则/.test(label(a)) ? "policy" : a.dataset.action === "\u4E2A\u4EBA\u4E2D\u5FC3" ? "account" : "logs"}`;
    }
  });
  $$("input,textarea,select").forEach((el, i) => {
    el.setAttribute("aria-label", el.getAttribute("aria-label") || el.getAttribute("placeholder") || el.closest("label")?.innerText || el.id || `\u5B57\u6BB5${i + 1}`);
    el.dataset.action ||= "\u7F16\u8F91\u5B57\u6BB5";
  });
  $$("img").forEach((img) => {
    if (!img.closest("[data-action]")) bind(img, "\u67E5\u770B\u56FE\u7247", () => previewImage(img));
  });
}
//# sourceMappingURL=app.js.map
