export const statuses = { pending: '待派发', assigned: '待接单', accepted: '已接单', arrived: '已到达', processing: '处理中', completed: '待缴费 / 待评价', closed: '已归档', cancelled: '已取消' };
export const technicians = ['张建国', '王德利', '刘建军', '陈大华'];
export const organization = {
  platform: { id: 'shengbian', name: '声边平台' },
  companies: [
    { id: 'property-a', name: '物业公司 A' },
    { id: 'property-b', name: '物业公司 B' },
    { id: 'partner', name: '其他合作小区' }
  ],
  communities: [
    { id: 'pengyi', name: '彭一小区', companyId: 'property-a' },
    { id: 'penger', name: '彭二新村', companyId: 'property-a' },
    { id: 'jinxiu', name: '锦绣华庭', companyId: 'property-a' },
    { id: 'lvzhou', name: '绿洲家园', companyId: 'property-b' }
  ]
};
export const arrivalPolicies = {
  urgent: { minutes: 30, label: '加急工单接单后 30 分钟内到岗' },
  standard: { minutes: 120, label: '常规工单接单后 120 分钟内到岗' }
};
export const communityById = (id, data = organization) => data.communities.find(c => c.id === id);
export const companyById = (id, data = organization) => data.companies.find(c => c.id === id);
export function isContentVisible(item, communityId) {
  const audience = item.audience || 'community';
  return audience === 'platform' || (audience === 'community' && (item.communityIds || ['pengyi']).includes(communityId));
}
export function contentAudienceText(item, data = organization) {
  if ((item.audience || 'community') === 'platform') return '声边平台统一发布';
  const communities = (item.communityIds || ['pengyi']).map(id => communityById(id, data)?.name || id);
  return communities.length === 1 ? `${communities[0]}专属内容` : `定向发布至 ${communities.join('、')}`;
}
export function arrivalStatus(order, at = Date.now()) {
  if (!order.acceptedAt || !order.arrivalDueAt) return { state: 'not_started', text: '接单后开始计算到岗时限' };
  const dueAt = new Date(order.arrivalDueAt).getTime();
  const actualAt = order.checkinAt ? new Date(order.checkinAt).getTime() : at;
  const deltaMinutes = Math.max(0, Math.ceil(Math.abs(actualAt - dueAt) / 60000));
  if (order.checkinAt) return actualAt <= dueAt
    ? { state: 'on_time', text: `已准时到岗（提前 ${deltaMinutes} 分钟）`, deltaMinutes }
    : { state: 'overdue', text: `已超时到岗 ${deltaMinutes} 分钟`, deltaMinutes };
  return at <= dueAt
    ? { state: 'counting', text: `距到岗时限剩余 ${Math.ceil((dueAt - at) / 60000)} 分钟`, dueAt: order.arrivalDueAt }
    : { state: 'overdue', text: `已超过到岗时限 ${deltaMinutes} 分钟`, deltaMinutes, dueAt: order.arrivalDueAt };
}
export const products = [
  { id: 'ac-group', name: '全屋空调深度拆洗杀菌', price: 88, category: '家电拆洗养护' },
  { id: 'waterproof', name: '阳台窗台防水微排查', price: 0, category: '空间微改焕新' },
  { id: 'vegetables', name: '邻里特供有机果蔬箱', price: 59, category: '产地甄选生鲜' },
  { id: 'dumplings', name: '李阿姨私房水饺/烘焙', price: 25, category: '邻居闪铺' },
  { id: 'computer', name: '王工电脑装机与清灰', price: 30, category: '邻居闪铺' },
  { id: 'stroller', name: '轻便遛娃神器免押租', price: 15, category: '邻居闪铺' },
  { id: 'pet', name: '课余代遛狗/上门喂宠', price: 18, category: '康养与宠物托养' },
  { id: 'ac', name: '中央空调高温熏蒸消杀', price: 99, category: '家电拆洗养护' },
  { id: 'screen', name: '304金刚网纱窗定制换新', price: 120, category: '空间微改焕新' },
  { id: 'peach', name: '高山蜜桃礼盒(8枚特级)', price: 68, category: '产地甄选生鲜' }
];
export const rewards = [
  { id: 'coupon50', name: '50元物业费抵用券', points: 500, cash: 0, category: 'deduction', coupon: 50 },
  { id: 'cleaning', name: '深度油烟机高温清洗', points: 1200, cash: 49, category: 'convenience' },
  { id: 'tools', name: '便民五金全套工具箱', points: 100, cash: 0, category: 'convenience' },
  { id: 'parking30', name: '30元临停通用抵扣券', points: 300, cash: 0, category: 'deduction', coupon: 30 },
  { id: 'rice', name: '黑土香 五常大米 5kg', points: 1500, cash: 0, category: 'life' },
  { id: 'oil', name: '高山冷压野生山茶油 500ml', points: 1800, cash: 0, category: 'life' },
  { id: 'toy', name: '声边FM限量定制盲盒', points: 800, cash: 0, category: 'culture' },
  { id: 'movie', name: '社区露天电影VIP座票', points: 200, cash: 0, category: 'culture' }
];
export const articles = [
  { id: 'garden', title: '小区绿化升级改造现场直击：匠心修剪实录', body: '环境绿化部完成园区绿篱修剪与花卉补栽。施工区域已清理，步行通道恢复通行。欢迎居民通过邻里圈提出建议。', kind: 'article', audience: 'community', communityIds: ['pengyi'] },
  { id: 'elevator', title: '电梯维保深度实录：守护垂直出行的每一程', body: '工程维保组完成电梯制动系统、钢丝绳和应急呼叫设备专项检查，维保结果已备案。乘梯异常请及时联系物业。', kind: 'video', audience: 'platform', publisher: '声边平台' },
  { id: 'festival', title: '本周六露天电影节与跳蚤夜市摊位报名开启', body: '时间：本周六 18:30。地点：中央草坪。每户可预订一个摊位，参与家庭请自备环保收纳袋。雨天将提前通知顺延。', kind: 'activity' },
  { id: 'safety', title: '生活贴士：夏季空调自洁与用电安全指南', body: '清洁空调前请断开电源。过滤网洗净晾干后再安装。遇到异味或跳闸应立即停机，并联系持证工程师检查。', kind: 'audio', audience: 'platform', publisher: '声边平台' },
  { id: 'storm', title: '台风天里的24小时：物业防汛逆行日记，每一份安心都有人彻夜未眠', body: '暴雨倾盆的凌晨两点，地下车库排水泵房警报响起。工程主管带领班组连续奋战，清理排水口、检查应急电源、铺设挡水板。管家随后走访低层住户，确认无漏水隐患。', kind: 'article' },
  { id: 'plants', title: '春季绿化翻新计划公布：我们为小区添置了800株开花灌木', body: '春季更新以本地耐阴植物为主，分区错峰施工，保留居民活动空间。灌木养护期请勿踩踏绿地。', kind: 'article' },
  { id: 'tank', title: '3分钟看懂二次供水水箱深度清洗消毒全过程', body: '作业包含排空、清洁、消毒、复检四个环节。水质检测合格后恢复供水。原设计未附视频原片，此处保留图文纪实与上传视频播放入口。', kind: 'video' },
  { id: 'security', title: '保安小哥的晨间硬核防暴演练，安全感直接拉满！', body: '秩序维护队完成晨间应急演练，检查防护装备、联络流程与疏散路线。原设计未附视频原片。', kind: 'video' },
  { id: 'radio', title: '楼栋管家老张的十年记忆', body: '这里是声边社区电台。大家好，我是您的社区管家。十年来，从一次水管维修到一场邻里活动，我们始终认真对待每一件小事。今日提醒：外出请检查门窗和电源，遇到物业问题可以在线提交报修。感谢每一位邻居的理解与支持。', kind: 'audio' }
];
export function initialState() {
  const now = new Date().toISOString();
  const orders = [
    ['GD2024062801', '厨房主水管接口渗漏', '16-2-502', 'pending', '水暖卫浴', true],
    ['GD2024062804', '入户总空开跳闸后无法推上', '08-1-1204', 'pending', '强弱电路', true],
    ['GD2024062803', '单元人脸识别门禁反应迟缓', '22号楼西门', 'accepted', '门禁安防', false],
    ['GD2024062802', '连廊防滑条松动加固', '中庭阳光连廊', 'processing', '公区修缮', false],
    ['GD2024062788', '庭院乔木枯枝修剪与清理', '12-2-101', 'closed', '绿化保洁', false],
    ['BX202407220038', '水龙头渗水维修与管道接口更换', '16-2-502', 'completed', '水暖卫浴', false],
    ['SB20241028093', '客厅吸顶灯开灯即跳闸', '8-1-301', 'pending', '强弱电路', false],
    ['SB20241028094', '厨房冷水角阀老化更换', '12-4-102', 'pending', '水暖卫浴', false]
  ].map(([id, title, room, status, category, urgent], i) => ({
    id, title, description: title, room, status, category, urgent, contact: '李女士', phone: '13800006688',
    technician: status === 'pending' ? '' : technicians[i % 4], appointment: now.slice(0, 10) + ' 下午 14:00 - 16:30',
    createdAt: now, amount: 0, paid: true, scope: i === 3 ? 'public' : 'private', photos: [],
    companyId: 'property-a', communityId: 'pengyi',
    sla: { arrivalMinutes: urgent ? arrivalPolicies.urgent.minutes : arrivalPolicies.standard.minutes },
    ...(status === 'accepted' || status === 'arrived' || status === 'processing' || status === 'completed' || status === 'closed' ? {
      acceptedAt: now,
      arrivalDueAt: new Date(Date.now() + (urgent ? arrivalPolicies.urgent.minutes : arrivalPolicies.standard.minutes) * 60000).toISOString()
    } : {}),
    timeline: [{ status: 'pending', label: '居民提交报修', at: now }, ...(status !== 'pending' ? [{ status, label: statuses[status], at: now }] : [])]
  }));
  return {
    version: 2,
    organization: structuredClone(organization),
    contexts: { property: { companyId: 'property-a', communityId: 'pengyi' }, worker: { companyId: 'property-a', communityId: 'pengyi' } },
    user: { id: 'resident-1', name: '李女士', phone: '13800006688', room: '16-2-502', area: 98, community: '彭一小区', communityId: 'pengyi', verified: true, role: 'owner', points: 2480 },
    orders, products, articles: structuredClone(articles), rewards,
    bills: [
      { id: 'property-legacy', title: '2024年第二季度物业服务费', amount: 823.2, type: 'property', book: 'legacy' },
      { id: 'parking-legacy', title: '2024年5月-6月产权车位管理费', amount: 160, type: 'parking', book: 'legacy' },
      { id: 'property-current', title: '2024年第三季度物业服务费（含公摊）', amount: 983.2, type: 'property', book: 'current' },
      { id: 'parking-current', title: '2024年第三季度地下停车服务费', amount: 450, type: 'parking', book: 'current' },
      { id: 'other-current', title: '2024年7月公共维修与能耗代扣', amount: 128.5, type: 'others', book: 'current' }
    ].map(b => ({ ...b, paid: false, room: '16-2-502' })),
    payments: [], expenses: [], transfers: [], bookings: [], redemptions: [], coupons: [], reviews: [],
    pointsLog: [{ id: 'opening', delta: 2480, reason: '期初演示积分', at: now }],
    notices: [{ id: 'notice-initial', title: '关于社区二次供水水箱清洗的通知', body: '本周四 14:00 至 18:00 开展水箱清洗，请提前储水。恢复供水后请短暂放水，感谢配合。', active: true, voice: true, at: now, audience: 'community', communityIds: ['pengyi'], publisher: '彭一小区物业服务中心' }],
    posts: [{ id: 'post-garden', body: '今天早起带小朋友在后花园散步，物业补种的绣球花开得太惊艳了！', author: '陈阿姨', likes: 28 }, { id: 'post-floor', body: 'B区地库地坪翻新完成，防滑减噪，点赞物业工程师傅们！', author: '刘先生', likes: 45 }],
    favorites: [], likes: [], shops: [], messages: [], logs: [], drafts: {}, settings: { notifications: true, autoDispatch: false, listening: true },
    balances: { group: 18920340.5, jinxiu: 1840200, pengyi: 920000, penger: 10000, lvzhou: 20000 }
  };
}
