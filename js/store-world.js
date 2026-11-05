/* ==========================================================================
   星伴学园 · 世界层（装扮 / 家园 / 进化 / 成就 / 探索 / 统计 / 日记 / 家长）
   依赖 store.js 的 XB 对象，在其之上扩展状态与能力
   ========================================================================== */

(function () {
  const W = window.XB_WORLD;
  const WR = window.XB_WARDROBE;
  const CAT = window.XB_CATALOG;
  const s = XB.state;
  const H = XB.helpers;

  /* ---------------- 状态补齐（兼容旧存档） ---------------- */
  if (!s.inventory) s.inventory = { costumes: [], furniture: [], stardust: 3, dustProgress: 0 };
  if (!s.equipped) s.equipped = { capybara: {}, hamster: {} };
  if (!s.home) s.home = { scene: 'bedroom', placed: [] };
  if (!s.evolution) s.evolution = { capybara: 0, hamster: 0 };
  if (!s.achievements) s.achievements = { unlocked: {} };
  if (!s.diary) s.diary = [];
  if (!s.explore) s.explore = { cleared: [] };
  if (!s.parent)
    s.parent = {
      goalTasks: 5,
      goalMinutes: 30,
      templates: [
        { id: 'tpl-1', title: '每日阅读 30 分钟', category: 'reading', minutes: 30, difficulty: 'easy', exp: 50, coins: 100, repeat: 'daily' },
        { id: 'tpl-2', title: '口算练习 20 题', category: 'math', minutes: 20, difficulty: 'normal', exp: 62, coins: 120, repeat: 'daily' },
        { id: 'tpl-3', title: '户外运动 20 分钟', category: 'sport', minutes: 20, difficulty: 'normal', exp: 55, coins: 110, repeat: 'daily' },
      ],
    };
  ['capybara', 'hamster'].forEach((id) => {
    if (!s.equipped[id]) s.equipped[id] = {};
    if (s.evolution[id] == null) s.evolution[id] = 0;
  });
  if (!XB.ui.mode) XB.ui.mode = 'child';
  if (XB.ui.wardrobe == null) XB.ui.wardrobe = false;
  if (!s.home.seeded) {
    s.home.seeded = true;
    if (!s.inventory.furniture.length) {
      s.inventory.furniture.push('cushion', 'plant');
    }
  }

  /* ---------------- 通用 ---------------- */
  const todayKey = H.dateKey;
  const clamp = H.clamp;

  function petLevel(petId) {
    return s.pets[petId].level;
  }

  function hasAchievement(id) {
    return !!s.achievements.unlocked[id];
  }

  /* ---------------- 装扮 ---------------- */
  function costumeUnlocked(item) {
    const u = item.unlock || { type: 'shop' };
    if (u.type === 'shop') return true;
    if (u.type === 'level') return s.pets.capybara.level >= u.value || s.pets.hamster.level >= u.value;
    if (u.type === 'achievement') return hasAchievement(u.value);
    return true;
  }

  function ownsCostume(id) {
    return s.inventory.costumes.indexOf(id) >= 0;
  }

  function buyCostume(id) {
    const item = WR.byId(id);
    if (!item) return { ok: false, reason: '装扮不存在' };
    if (ownsCostume(id)) return { ok: false, reason: '已经拥有了' };
    if (!costumeUnlocked(item)) return { ok: false, reason: '还不满足解锁条件' };
    const price = item.price || { currency: 'coins', amount: 0 };
    if (price.currency === 'stars') {
      if (s.player.stars < price.amount) return { ok: false, reason: '星星不够' };
      s.player.stars -= price.amount;
    } else {
      if (s.player.coins < price.amount) return { ok: false, reason: '金币不够' };
      s.player.coins -= price.amount;
    }
    s.inventory.costumes.push(id);
    checkAchievements();
    return { ok: true, item: item };
  }

  function equipCostume(petId, id) {
    const item = WR.byId(id);
    if (!item) return { ok: false };
    if (!ownsCostume(id)) return { ok: false, reason: '还没有这件装扮' };
    s.equipped[petId] = s.equipped[petId] || {};
    s.equipped[petId][item.slot] = id;
    return { ok: true, item: item };
  }

  function unequipCostume(petId, slot) {
    if (s.equipped[petId]) delete s.equipped[petId][slot];
    return { ok: true };
  }

  function equippedItems(petId) {
    const eq = s.equipped[petId] || {};
    return Object.keys(eq)
      .map((slot) => WR.byId(eq[slot]))
      .filter(Boolean);
  }

  function equippedItem(petId, slot) {
    const eq = s.equipped[petId] || {};
    return eq[slot] ? WR.byId(eq[slot]) : null;
  }

  /* ---------------- 家园 ---------------- */
  function homeLevel() {
    return clamp(1 + Math.floor(s.inventory.furniture.length / 3), 1, 6);
  }

  function sceneUnlocked(scene) {
    return homeLevel() >= (scene.level || 1);
  }

  function buyFurniture(id) {
    const item = W.furnitureById(id);
    if (!item) return { ok: false, reason: '家具不存在' };
    if (s.inventory.furniture.indexOf(id) >= 0) return { ok: false, reason: '已经拥有这件家具' };
    if (s.player.coins < item.price) return { ok: false, reason: '金币不够' };
    s.player.coins -= item.price;
    s.inventory.furniture.push(id);
    checkAchievements();
    return { ok: true, item: item };
  }

  function placeFurniture(itemId, x, y) {
    const item = W.furnitureById(itemId);
    if (!item) return { ok: false };
    if (s.inventory.furniture.indexOf(itemId) < 0) return { ok: false, reason: '还没有这件家具' };
    s.home.placed.push({
      uid: 'f-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      itemId: itemId,
      x: clamp(x, 6, 94),
      y: clamp(y, 30, 92),
    });
    checkAchievements();
    return { ok: true };
  }

  function moveFurniture(uid, x, y) {
    const p = s.home.placed.find((i) => i.uid === uid);
    if (!p) return;
    p.x = clamp(x, 6, 94);
    p.y = clamp(y, 30, 92);
  }

  function removeFurniture(uid) {
    const i = s.home.placed.findIndex((p) => p.uid === uid);
    if (i >= 0) s.home.placed.splice(i, 1);
  }

  function setScene(id) {
    const scene = W.sceneById(id);
    if (!sceneUnlocked(scene)) return { ok: false, reason: '家园等级不足' };
    s.home.scene = id;
    return { ok: true, scene: scene };
  }

  /* ---------------- 进化 ---------------- */
  function evolutionInfo(petId) {
    const stage = s.evolution[petId] || 0;
    const next = W.evolution[stage + 1] || null;
    const level = petLevel(petId);
    const dust = s.inventory.stardust;
    let can = false;
    let reason = '';
    if (!next) reason = '已经抵达最终形态';
    else if (level < next.level) reason = '需要 Lv.' + next.level;
    else if (dust < next.dust) reason = '需要星屑 ×' + next.dust;
    else can = true;
    return { stage, next, can, reason, dust };
  }

  function evolvePet(petId) {
    const info = evolutionInfo(petId);
    if (!info.can) return { ok: false, reason: info.reason };
    s.inventory.stardust -= info.next.dust;
    s.evolution[petId] = info.next.stage;
    if (info.next.unlock && s.inventory.costumes.indexOf(info.next.unlock) < 0) {
      s.inventory.costumes.push(info.next.unlock);
    }
    const conf = window.XingPets.byId(petId);
    s.pets[petId].history.unshift({
      id: 'evo-' + Date.now(),
      ts: Date.now(),
      type: 'evolve',
      text: '进化为 ' + info.next.name,
    });
    s.pets[petId].mood = 'proud';
    checkAchievements();
    return { ok: true, stage: info.next, petName: conf.name };
  }

  function petForm(petId) {
    return (s.evolution[petId] || 0) >= 3 ? 'evolved' : 'base';
  }

  /* ---------------- 成就 ---------------- */
  function achievementProgress(id) {
    const recs = s.records;
    const byCat = (c) => recs.filter((r) => r.category === c).length;
    switch (id) {
      case 'learning_master':
        return recs.length;
      case 'reading_explorer':
        return byCat('reading');
      case 'math_adventurer':
        return byCat('math');
      case 'sport_brave':
        return byCat('sport');
      case 'persistent':
        return H.totalMinutes();
      case 'pet_collector':
        return s.inventory.costumes.length;
      case 'home_designer':
        return s.home.placed.length;
      case 'dual_trainer':
        return (s.pets.capybara.level >= 10 ? 1 : 0) + (s.pets.hamster.level >= 10 ? 1 : 0);
      default:
        return 0;
    }
  }

  function achievementList() {
    return W.achievements.map((a) => {
      const progress = Math.min(achievementProgress(a.id), a.target);
      return Object.assign({}, a, {
        progress: progress,
        percent: Math.round((progress / a.target) * 100),
        unlocked: !!s.achievements.unlocked[a.id],
        ts: s.achievements.unlocked[a.id] || null,
      });
    });
  }

  function checkAchievements() {
    const unlocked = [];
    W.achievements.forEach((a) => {
      if (!s.achievements.unlocked[a.id] && achievementProgress(a.id) >= a.target) {
        s.achievements.unlocked[a.id] = Date.now();
        s.inventory.stardust += 1;
        s.player.coins += a.reward.coins;
        s.player.stars += a.reward.stars;
        s.rewards.history.unshift({
          id: 'ach-' + a.id,
          ts: Date.now(),
          date: todayKey(),
          type: 'achievement',
          title: '成就 · ' + a.name,
          exp: 0,
          coins: a.reward.coins,
          stars: a.reward.stars,
          petId: s.activePetId,
        });
        unlocked.push(a);
        XB.actions.pushReward({
          kind: 'achievement',
          title: '成就解锁',
          subtitle: a.name,
          icon: a.icon,
          coins: a.reward.coins,
          stars: a.reward.stars,
          petExp: 0,
          capped: false,
        });
      }
    });
    return unlocked;
  }

  /* ---------------- 探索地图 ---------------- */
  function regionProgress(region) {
    const c = region.cond;
    if (c.type === 'tasks') return Math.min(s.records.length, c.value);
    if (c.type === 'category') return Math.min(s.records.filter((r) => r.category === c.value).length, c.count);
    if (c.type === 'minutes') return Math.min(H.totalMinutes(), c.value);
    if (c.type === 'petLevel') return Math.max(petLevel('capybara'), petLevel('hamster'));
    return 0;
  }

  function regionTarget(region) {
    const c = region.cond;
    if (c.type === 'category') return c.count;
    if (c.type === 'petLevel') return c.value;
    return c.value;
  }

  function regionList() {
    return W.regions.map((r) => {
      const progress = regionProgress(r);
      const target = regionTarget(r);
      return Object.assign({}, r, {
        progress: progress,
        target: target,
        unlocked: progress >= target,
        cleared: s.explore.cleared.indexOf(r.id) >= 0,
        percent: Math.min(100, Math.round((progress / target) * 100)),
      });
    });
  }

  function claimRegion(id) {
    const r = W.regionById(id);
    if (!r) return { ok: false };
    if (s.explore.cleared.indexOf(id) >= 0) return { ok: false, reason: '已经探索过了' };
    const list = regionList();
    const me = list.find((x) => x.id === id);
    if (!me || !me.unlocked) return { ok: false, reason: '区域还未解锁' };
    s.explore.cleared.push(id);
    s.player.coins += r.reward.coins;
    s.player.stars += r.reward.stars;
    s.inventory.stardust += r.reward.stardust;
    s.rewards.history.unshift({
      id: 'region-' + id,
      ts: Date.now(),
      date: todayKey(),
      type: 'region',
      title: '探索 · ' + r.name,
      exp: 0,
      coins: r.reward.coins,
      stars: r.reward.stars,
      petId: s.activePetId,
    });
    return { ok: true, region: r, reward: r.reward };
  }

  /* ---------------- 统计 ---------------- */
  function startOfWeek() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  }

  function dayDate(key) {
    return new Date(key + 'T00:00:00');
  }

  function stats() {
    const today = todayKey();
    const weekStart = startOfWeek();
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const sum = (arr, f) => arr.reduce((a, b) => a + (f ? f(b) : b), 0);
    const sessions = s.sessions;
    const minutesToday = sum(sessions.filter((x) => x.date === today).map((x) => x.minutes));
    const minutesWeek = sum(sessions.filter((x) => dayDate(x.date) >= weekStart).map((x) => x.minutes));
    const minutesMonth = sum(sessions.filter((x) => dayDate(x.date) >= monthStart).map((x) => x.minutes));
    const minutesAll = sum(sessions.map((x) => x.minutes));

    const subjects = CAT.categories.map((c) => {
      const recs = s.records.filter((r) => r.category === c.id);
      return {
        id: c.id,
        name: c.name,
        icon: c.icon,
        tint: c.tint,
        count: recs.length,
        minutes: sum(recs.map((r) => r.minutes)),
      };
    });
    const totalSubject = sum(subjects.map((x) => x.count)) || 1;
    subjects.forEach((x) => {
      x.percent = Math.round((x.count / totalSubject) * 100);
    });

    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = todayKey(d);
      const tasks = s.records.filter((r) => r.date === key).length;
      const mins = sum(sessions.filter((x) => x.date === key).map((x) => x.minutes));
      trend.push({ key, label: d.getMonth() + 1 + '/' + d.getDate(), tasks, minutes: mins });
    }
    const maxTasks = Math.max(1, ...trend.map((t) => t.tasks));
    const maxMinutes = Math.max(1, ...trend.map((t) => t.minutes));

    const habit = s.records.filter((r) => r.category === 'habit').length;

    return {
      minutesToday,
      minutesWeek,
      minutesMonth,
      minutesAll,
      tasksToday: s.records.filter((r) => r.date === today).length,
      tasksWeek: s.records.filter((r) => dayDate(r.date) >= weekStart).length,
      tasksMonth: s.records.filter((r) => dayDate(r.date) >= monthStart).length,
      tasksAll: s.records.length,
      subjects,
      trend,
      maxTasks,
      maxMinutes,
      habit,
      sessions: s.sessions.length,
      days: new Set(s.records.map((r) => r.date)).size,
      pets: [
        { id: 'capybara', name: '卡卡', level: s.pets.capybara.level, exp: Math.round((s.pets.capybara.exp / s.pets.capybara.expMax) * 100), intimacy: s.pets.capybara.intimacy },
        { id: 'hamster', name: '米粒', level: s.pets.hamster.level, exp: Math.round((s.pets.hamster.exp / s.pets.hamster.expMax) * 100), intimacy: s.pets.hamster.intimacy },
      ],
    };
  }

  /* ---------------- 成长日记 ---------------- */
  function diaryToday() {
    return s.diary.find((d) => d.date === todayKey()) || null;
  }

  function saveDiary(entry) {
    const date = todayKey();
    const idx = s.diary.findIndex((d) => d.date === date);
    const payload = {
      id: idx >= 0 ? s.diary[idx].id : 'd-' + Date.now().toString(36),
      date: date,
      done: (entry.done || '').slice(0, 200),
      learned: (entry.learned || '').slice(0, 200),
      happy: (entry.happy || '').slice(0, 200),
      hard: (entry.hard || '').slice(0, 200),
      tomorrow: (entry.tomorrow || '').slice(0, 200),
      mood: entry.mood || 'calm',
      ts: Date.now(),
    };
    if (idx >= 0) s.diary.splice(idx, 1, payload);
    else s.diary.unshift(payload);
    if (s.diary.length > 120) s.diary.length = 120;
    return payload;
  }

  /* ---------------- 家长模式 ---------------- */
  function addTemplate(data) {
    s.parent.templates.unshift({
      id: 'tpl-' + Date.now().toString(36),
      title: data.title,
      category: data.category,
      minutes: data.minutes,
      difficulty: data.difficulty,
      exp: data.exp,
      coins: data.coins,
      repeat: data.repeat || 'daily',
    });
  }

  function applyTemplate(id) {
    const t = s.parent.templates.find((x) => x.id === id);
    if (!t) return { ok: false };
    XB.actions.createQuest({
      title: t.title,
      category: t.category,
      desc: '来自家长模板',
      minutes: t.minutes,
      difficulty: t.difficulty,
      exp: t.exp,
      coins: t.coins,
      repeat: t.repeat,
    });
    return { ok: true, title: t.title };
  }

  function removeTemplate(id) {
    const i = s.parent.templates.findIndex((x) => x.id === id);
    if (i >= 0) s.parent.templates.splice(i, 1);
  }

  function calendar(monthOffset) {
    const now = new Date();
    const base = new Date(now.getFullYear(), now.getMonth() + (monthOffset || 0), 1);
    const days = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    const firstWeekday = (base.getDay() + 6) % 7;
    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= days; d++) {
      const key = base.getFullYear() + '-' + String(base.getMonth() + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      const tasks = s.records.filter((r) => r.date === key).length;
      const mins = s.sessions.filter((x) => x.date === key).reduce((a, b) => a + b.minutes, 0);
      cells.push({ day: d, key, tasks, minutes: mins, today: key === todayKey() });
    }
    return { year: base.getFullYear(), month: base.getMonth() + 1, cells };
  }

  /* ---------------- 覆盖 / 包装原有动作 ---------------- */
  const origComplete = XB.actions.completeQuest;
  XB.actions.completeQuest = function (id) {
    const res = origComplete(id);
    if (res.ok) {
      s.inventory.dustProgress = (s.inventory.dustProgress || 0) + 1;
      if (s.inventory.dustProgress % 5 === 0) s.inventory.stardust += 1;
      checkAchievements();
    }
    return res;
  };

  const origTimer = XB.actions.finishTimer;
  XB.actions.finishTimer = function (mode) {
    const res = origTimer(mode);
    if (res.ok) checkAchievements();
    return res;
  };

  const origInteract = XB.actions.interact;
  XB.actions.interact = function (petId, actionId) {
    const res = origInteract(petId, actionId);
    if (res.ok) checkAchievements();
    return res;
  };

  const origChest = XB.actions.claimDailyChest;
  XB.actions.claimDailyChest = function () {
    const res = origChest();
    if (res.ok) {
      s.inventory.stardust += 1;
      checkAchievements();
    }
    return res;
  };

  const origGoal = XB.helpers.goal;
  XB.helpers.goal = function () {
    const total = s.parent.goalTasks || 5;
    const done = Math.min(XB.helpers.doneToday(), total);
    return { done: done, total: total, percent: Math.round((done / total) * 100) };
  };

  /* ---------------- 导出 ---------------- */
  Object.assign(XB.actions, {
    buyCostume: buyCostume,
    equipCostume: equipCostume,
    unequipCostume: unequipCostume,
    buyFurniture: buyFurniture,
    placeFurniture: placeFurniture,
    moveFurniture: moveFurniture,
    removeFurniture: removeFurniture,
    setScene: setScene,
    evolvePet: evolvePet,
    claimRegion: claimRegion,
    checkAchievements: checkAchievements,
    saveDiary: saveDiary,
    addTemplate: addTemplate,
    applyTemplate: applyTemplate,
    removeTemplate: removeTemplate,
  });

  Object.assign(XB.helpers, {
    wardrobe: WR.items,
    rarity: WR.rarity,
    costumeUnlocked: costumeUnlocked,
    ownsCostume: ownsCostume,
    equippedItems: equippedItems,
    equippedItem: equippedItem,
    homeLevel: homeLevel,
    sceneUnlocked: sceneUnlocked,
    evolutionInfo: evolutionInfo,
    petForm: petForm,
    achievementList: achievementList,
    achievementProgress: achievementProgress,
    regionList: regionList,
    regionProgress: regionProgress,
    stats: stats,
    diaryToday: diaryToday,
    calendar: calendar,
    world: W,
  });

  window.XBWorld = { ready: true };
})();
