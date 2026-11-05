/* ==========================================================================
   星伴学园 · 数据管理与重置中心
   所有操作真实生效；危险操作由家长端二次确认后调用
   ========================================================================== */

(function () {
  const s = XB.state;
  const C = window.XB_CATALOG;

  const DEFAULT_QUESTS = [
    { title: '阅读 30 分钟', category: 'reading', minutes: 30, difficulty: 'easy' },
    { title: '数学口算练习', category: 'math', minutes: 20, difficulty: 'normal' },
    { title: '英语单词 15 个', category: 'english', minutes: 15, difficulty: 'easy' },
    { title: '语文朗读一篇', category: 'chinese', minutes: 15, difficulty: 'easy' },
    { title: '户外运动 20 分钟', category: 'sport', minutes: 20, difficulty: 'normal' },
    { title: '整理书桌与书包', category: 'life', minutes: 10, difficulty: 'easy' },
  ];

  const DEFAULT_SHOP = [
    { id: 'rw-1', name: '周末多玩 30 分钟', cost: 500, icon: 'hourglass', stock: 5, desc: '家长确认后可兑换' },
    { id: 'rw-2', name: '挑一部电影', cost: 800, icon: 'star', stock: 3, desc: '周末家庭电影之夜' },
    { id: 'rw-3', name: '喜欢的零食一份', cost: 300, icon: 'leaf', stock: 0, desc: '库存 0 表示不限量' },
    { id: 'rw-4', name: '一次公园之行', cost: 1200, icon: 'flag', stock: 2, desc: '和宠物一起出门' },
  ];

  const PET_START = { level: 1, exp: 0, intimacy: 60, mood: 'calm', stage: 'growth' };

  function today() {
    return XB.helpers.dateKey();
  }

  /* 1. 重置任务 */
  function resetTasks() {
    const oldIds = s.quests.map((q) => q.id);
    const day = today();
    s.quests = DEFAULT_QUESTS.map((d, i) => {
      const r = C.questReward ? C.questReward(d.minutes, d.difficulty) : { exp: 40, coins: 60 };
      return {
        id: 'q-def-' + i + '-' + Date.now().toString(36),
        title: d.title,
        category: d.category,
        desc: '',
        minutes: d.minutes,
        difficulty: d.difficulty,
        exp: r.exp,
        coins: r.coins,
        stars: 0,
        repeat: 'daily',
        createdAt: Date.now(),
        archived: false,
        owner: 'parent',
        condition: 'manual',
      };
    });
    // 清掉这些任务“今天”的完成记录，历史记录保留
    s.records = s.records.filter((r) => !(r.date === day && oldIds.indexOf(r.questId) >= 0));
    s.approvals = [];
    return { ok: true, count: s.quests.length };
  }

  function clearTodayQuestState() {
    const day = today();
    const ids = s.quests.map((q) => q.id);
    s.records = s.records.filter((r) => !(r.date === day && ids.indexOf(r.questId) >= 0));
    s.approvals = [];
    return { ok: true };
  }

  function clearApprovals() {
    s.approvals = [];
    return { ok: true };
  }

  /* 2. 重置宠物 */
  function resetPet(id) {
    const ids = id === 'all' ? ['capybara', 'hamster'] : [id];
    ids.forEach((pid) => {
      const p = s.pets[pid];
      if (!p) return;
      p.level = PET_START.level;
      p.exp = PET_START.exp;
      p.expMax = C.expForLevel ? C.expForLevel(PET_START.level) : 300;
      p.intimacy = PET_START.intimacy;
      p.mood = PET_START.mood;
      p.stage = PET_START.stage;
      p.history = [];
      p.interactions = [];
      p.wardrobe = [];
      s.equipped[pid] = {};
      s.evolution[pid] = 0;
    });
    return { ok: true };
  }

  /* 3. 金币与奖励 */
  function resetCoins() {
    s.player.coins = 0;
    s.today.coins = 0;
    return { ok: true };
  }

  function resetInventory() {
    s.inventory.costumes = [];
    s.inventory.furniture = [];
    s.inventory.stardust = 0;
    s.inventory.dustProgress = 0;
    s.equipped = { capybara: {}, hamster: {} };
    s.home.placed = [];
    return { ok: true };
  }

  function resetRedemptions() {
    s.parent.redemptions = [];
    s.rewards.history = s.rewards.history.filter((h) => h.type !== 'redeem');
    return { ok: true };
  }

  function resetRewardConfig() {
    s.parent.rewardShop = DEFAULT_SHOP.map((x) => Object.assign({}, x));
    return { ok: true };
  }

  /* 4. 学习记录 */
  function resetStudy() {
    s.records = [];
    s.sessions = [];
    s.rewards.history = [];
    s.today = { date: today(), exp: 0, coins: 0, stars: 0, petExp: 0, interactions: 0, chest: false };
    s.approvals = [];
    return { ok: true };
  }

  function resetDiary() {
    s.diary = [];
    return { ok: true };
  }

  /* 新档案 / 完整重置后的初始状态 */
  function applyFreshIfNeeded() {
    try {
      if (!localStorage.getItem('xingban.tmp.fresh')) return;
      localStorage.removeItem('xingban.tmp.fresh');
      s.player.level = 1;
      s.player.exp = 0;
      s.player.expMax = 600;
      s.player.coins = 300;
      s.player.stars = 20;
      ['capybara', 'hamster'].forEach(function (id) {
        var p = s.pets[id];
        if (!p) return;
        p.level = 1;
        p.exp = 0;
        p.expMax = C.expForLevel ? C.expForLevel(1) : 300;
        p.intimacy = 60;
        p.mood = 'calm';
        p.stage = 'growth';
        p.history = [];
        p.interactions = [];
        p.wardrobe = [];
        s.equipped[id] = {};
        s.evolution[id] = 0;
      });
      s.records = [];
      s.sessions = [];
      s.rewards.history = [];
      s.approvals = [];
      s.diary = [];
      s.inventory = { costumes: [], furniture: [], stardust: 0, dustProgress: 0 };
      s.home.placed = [];
      resetTasks();
      s.today = { date: today(), exp: 0, coins: 0, stars: 0, petExp: 0, interactions: 0, chest: false };
      XB.actions.flush && XB.actions.flush();
    } catch (e) {}
  }

  /* 5. 完整重置（保留家长密码、声音设置、备份能力） */
  function resetProfileKeepSettings() {
    try {
      localStorage.setItem('xingban.tmp.fresh', '1');
      localStorage.setItem('xingban.tmp.settings', JSON.stringify(s.settings || {}));
      localStorage.setItem('xingban.tmp.parent', JSON.stringify({ goalTasks: s.parent.goalTasks, goalMinutes: s.parent.goalMinutes, dailyLimit: s.parent.dailyLimit, approvalMode: s.parent.approvalMode }));
    } catch (e) {}
    try {
      localStorage.removeItem(window.XB_PAGE_KEY || (window.XBStorage && XBStorage.key()) || 'xingban.save.v2');
    } catch (e) {}
    return { ok: true, reload: true };
  }

  function factoryReset() {
    try {
      localStorage.setItem('xingban.tmp.fresh', '1');
      const keep = ['xingban.profiles.v1', 'xingban.parent.v1'];
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
      keys.forEach((k) => {
        if (k && k.indexOf('xingban.') === 0 && keep.indexOf(k) < 0) localStorage.removeItem(k);
      });
      localStorage.removeItem('xingban.parent.v1');
      localStorage.removeItem('xingban.profiles.v1');
      localStorage.removeItem('xingban.legacy.v2');
    } catch (e) {}
    return { ok: true, reload: true };
  }

  /* 测试环境工具 */
  function simulateTask() {
    if (!window.XBProfiles || !XBProfiles.isTest()) return { ok: false, reason: '仅测试档案可用' };
    const q = s.quests.find((x) => !XB.helpers.isQuestDone(x));
    if (!q) return { ok: false, reason: '没有可完成的任务' };
    return XB.actions.completeQuest(q.id);
  }

  function simulateLevelUp() {
    if (!window.XBProfiles || !XBProfiles.isTest()) return { ok: false, reason: '仅测试档案可用' };
    const pet = XB.helpers.activePet ? XB.helpers.activePet() : s.pets[s.activePetId];
    const need = Math.max(1, (pet.expMax || 300) - (pet.exp || 0));
    return XB.actions.interact(s.activePetId, 'play');
  }

  function simulateCoins(n) {
    if (!window.XBProfiles || !XBProfiles.isTest()) return { ok: false, reason: '仅测试档案可用' };
    s.player.coins += n || 500;
    return { ok: true, coins: s.player.coins };
  }

  applyFreshIfNeeded();

  Object.assign(XB.actions, {
    resetTasks: resetTasks,
    clearTodayQuestState: clearTodayQuestState,
    clearApprovals: clearApprovals,
    resetPet: resetPet,
    resetCoins: resetCoins,
    resetInventory: resetInventory,
    resetRedemptions: resetRedemptions,
    resetRewardConfig: resetRewardConfig,
    resetStudy: resetStudy,
    resetDiary: resetDiary,
    resetProfileKeepSettings: resetProfileKeepSettings,
    factoryReset: factoryReset,
    simulateTask: simulateTask,
    simulateCoins: simulateCoins,
    simulateLevelUp: simulateLevelUp,
  });
})();
