export const pages = [
  { key: 'overview', path: '/web/overview', file: 'web/_1/code.html', name: '调度概览工作台', group: 'web', level: 1 },
  { key: 'work-orders', path: '/web/work-orders', file: 'web/_2/code.html', name: '工单派发与调度', group: 'web', level: 1 },
  { key: 'expenses', path: '/web/expenses', file: 'web/_3/code.html', name: '物业支出管理', group: 'web', level: 1 },
  { key: 'finance', path: '/web/finance', file: 'web/_4/code.html', name: '物业财务收缴中心', group: 'web', level: 1 },
  { key: 'weekly', path: '/web/media', file: 'web/_6/code.html', name: '周报附件上传', group: 'web', level: 1 },
  { key: 'broadcast', path: '/web/broadcast', file: 'web/_7/code.html', name: '紧急通知与广播', group: 'web', level: 1 },
  { key: 'checkin', path: '/worker/checkin', file: 'web/_8/code.html', name: '现场打卡与完工结算', group: 'worker', level: 2 },
  { key: 'tasks', path: '/worker/tasks', file: 'web/_9/code.html', name: '师傅任务接单', group: 'worker', level: 1 },
  { key: 'group', path: '/web/group', file: 'web/_10/code.html', name: '集团运营中枢', group: 'web', level: 1 },
  { key: 'home', path: '/mobile/home', file: '小程序/_1/code.html', name: '居民首页', group: 'mobile', level: 1, public: true },
  { key: 'login', path: '/mobile/login', file: '小程序/_2/code.html', name: '居民登录', group: 'mobile', level: 2, public: true },
  { key: 'verify', path: '/mobile/verify', file: '小程序/_3/code.html', name: '实名与房屋确权', group: 'mobile', level: 2, public: true },
  { key: 'review', path: '/mobile/review', file: '小程序/_4/code.html', name: '维修服务评价', group: 'mobile', level: 3 },
  { key: 'media', path: '/mobile/media', file: '小程序/_5/code.html', name: '声边视听', group: 'mobile', level: 1, public: true },
  { key: 'services', path: '/mobile/services', file: '小程序/_6/code.html', name: '物业便利与邻居闪铺', group: 'mobile', level: 1, public: true },
  { key: 'bills', path: '/mobile/bills', file: '小程序/_7/code.html', name: '合并缴费账单', group: 'mobile', level: 2 },
  { key: 'repair', path: '/mobile/repair', file: '小程序/_8/code.html', name: '在线报修', group: 'mobile', level: 2 },
  { key: 'profile', path: '/mobile/profile', file: '小程序/_9/code.html', name: '服务与我的', group: 'mobile', level: 1 },
  { key: 'billing', path: '/mobile/billing', file: '小程序/_10/code.html', name: '分项收费账单', group: 'mobile', level: 2 },
  { key: 'points', path: '/mobile/points', file: '小程序/_11/code.html', name: '声边积分与兑换', group: 'mobile', level: 2 }
];

export const navRoutes = {
  overview: '/web/overview', 'work-orders': '/web/work-orders', 'finance-center': '/web/finance',
  'expense-management': '/web/expenses', 'property-expenses': '/web/expenses', 'property-expenditure': '/web/expenses',
  'reserve-fund-expense': '/web/expenses?fund=maintenance', 'maintenance-fund-expenses': '/web/expenses?fund=maintenance',
  'maintenance-fund': '/web/expenses?fund=maintenance', 'media-editor': '/web/media', 'weekly-media': '/web/media',
  'broadcast-dispatcher': '/web/broadcast', 'property-residents': '/web/overview?panel=residents',
  'system-settings': '/web/overview?panel=settings', login: '/web/login',
  home: '/mobile/home', 'media-audio': '/mobile/media', 'neighborhood-community': '/mobile/services',
  'services-profile': '/mobile/profile', 'task-orders': '/worker/tasks', 'ongoing-tasks': '/worker/tasks?status=accepted',
  'completed-records': '/worker/tasks?status=completed', 'profile-center': '/worker/tasks?panel=account',
  'financial-overview': '/web/group', 'collection-comparison': '/web/group?section=matrix-table',
  'expenditure-reconciliation': '/web/group?section=matrix-table&view=expenditure', 'capital-pool': '/web/group?section=capital',
  'project-matrix': '/web/group?section=matrix-table', 'work-order-kanban': '/web/work-orders',
  'converged-media': '/web/media', 'organization-permissions': '/web/group?panel=settings', 'group-center': '/web/group'
};

export function matchRoute(pathname) {
  const direct = pages.find(p => p.path === pathname);
  if (direct) return direct;
  if (pathname === '/web/login' || pathname === '/worker/login') return { ...pages.find(p => p.key === 'login'), path: pathname, group: pathname.split('/')[1] };
  if (/^\/(mobile|web|worker)\/orders\/[^/]+$/.test(pathname)) {
    const group = pathname.split('/')[1];
    return { ...pages.find(p => p.key === (group === 'web' ? 'work-orders' : group === 'worker' ? 'tasks' : 'profile')), detail: 'order' };
  }
  if (/^\/mobile\/articles\/[^/]+$/.test(pathname)) return { ...pages.find(p => p.key === 'media'), detail: 'article' };
  if (/^\/mobile\/services\/[^/]+$/.test(pathname)) return { ...pages.find(p => p.key === 'services'), detail: 'service' };
  return null;
}
