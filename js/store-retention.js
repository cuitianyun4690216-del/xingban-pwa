/* ==========================================================================
   星伴学园 · 留存骨架（照料 / 签到 / 心愿 / 周目标 / 称号 / 记忆台词）
   基调：治愈、鼓励、不惩罚
   ========================================================================== */

(function () {
  const s = XB.state;
  const H = XB.helpers;

  const FOODS = [
    { id: 'meal-rice', name: '南瓜饭', kind: 'meal', cost: 60, hunger: 34, mood: 6, icon: 'leaf', desc: '热乎乎的，吃完很踏实' },
    { id: 'meal-fish', name: '香煎小鱼', kind: 'meal', cost: 80, hunger: 30, mood: 10, icon: 'sun', desc: '香气能飘满整个房间' },
    { id: 'snack-seed', name: '向日葵籽', kind: 'snack', cost: 40, hunger: 8, mood: 14, icon: 'sun', desc: '一颗一颗，嘎嘣脆' },
    { id: 'snack-cookie', name: '黄油小饼干', kind: 'snack', cost: 50, hunger: 10, mood: 16, icon: 'sparkle', desc: '刚出炉，还带着温度' },
    { id: 'sweet-cake', name: '星星蛋糕', kind: 'sweet', cost: 120, hunger: 12, mood: 28, icon: 'crown', desc: '甜到心里，但要留着慢慢吃' },
    { id: 'sweet-pudding', name: '云朵布丁', kind: 'sweet', cost: 100, hunger: 10, mood: 24, icon: 'gift', desc: '轻轻一碰就会晃' },
  ];

  const LIKE = {
    capybara: ['sweet', 'meal'],
    hamster: ['snack', 'sweet'],
  };

  const CHECKIN_REWARDS = [
    { coins: 20, stars: 2 },
    { coins: 30, stars: 3 },
    { coins: 40, stars: 4 },
    { coins: 50, stars: 5 },
    { coins: 60, stars: 6 },
    { coins: 80, stars: 8 },
    { coins: 120, stars: 12 },
  ];

  const TITLES = [
    { id: 'newcomer', name: '新同学', need: () => true },
    { id: 'reader', name: '小小阅读家', need: (st) => st.reading >= 5 },
    { id: 'steady', name: '每天一点点', need: (st) => st.streak >= 3 },
    { id: 'focused', name: '专注小灯', need: (st) => st.minutes >= 120 },
    { id: 'patient', name: '耐心陪伴者', need: (st) => st.streak >= 7 },
    { id: 'star', name: '星光同行者', need: (st) => st.tasks >= 30 },
    { id: 'gentle', name: '温柔守护者', need: (st) => st.affection >= 500 },
  ];

  const WEEKLY_GOAL = 5;

  function dateKey() {
    return H.dateKey();
  }
  function weekKey(d) {
    const t = d ? new Date(d) : new Date();
    const onejan = new Date(t.getFullYear(), 0, 1);
    const week = Math.ceil(((t - onejan) / 86400000 + onejan.getDay() + 1) / 7);
    return t.getFullYear() + '-W' + week;
  }

  /* ---------------- 状态补齐 ---------------- */
  if (!s.care) s.care = { hunger: 72, mood: 74, energy: 76, fedToday: 0, sweetToday: 0, updated: Date.now() };
  if (!s.checkin) s.checkin = { streak: 0, total: 0, last: '', history: [] };
  if (!s.wish) s.wish = { date: '', foodId: '', done: false };
  if (!s.weekly) s.weekly = { key: weekKey(), tasks: 0, goal: WEEKLY_GOAL, claimed: false };
  if (!s.titles) s.titles = { current: 'newcomer', owned: ['newcomer'] };
  if (!s.memory) s.memory = { lastVisit: Date.now(), visits: 0 };

  /* ---------------- 时间流逝 ---------------- */
  function tick() {
    const now = Date.now();
    const hours = Math.max(0, (now - (s.care.updated || now)) / 3600000);
    if (hours > 0.05) {
      s.care.hunger = Math.max(0, Math.round(s.care.hunger - hours * 3.2));
      s.care.mood = Math.max(0, Math.round(s.care.mood - hours * 1.4));
      s.care.energy = Math.max(0, Math.round(s.care.energy - hours * 2.0));
      s.care.updated = now;
    }
    if (s.wish.date !== dateKey()) {
      const pool = FOODS.filter((f) => f.kind === 'sweet' || f.kind === 'snack');
      const pick = pool[Math.floor(Math.random() * pool.length)];
      s.wish = { date: dateKey(), foodId: pick.id, done: false };
    }
    if (s.weekly.key !== weekKey()) {
      s.weekly = { key: weekKey(), tasks: 0, goal: WEEKLY_GOAL, claimed: false };
    }
    s.care.fedToday = s.care.fedToday || 0;
    s.care.sweetToday = s.care.sweetToday || 0;
    refreshTitle();
  }

  /* ---------------- 喂食 ---------------- */
  function feed(foodId) {
    const food = FOODS.find((f) => f.id === foodId);
    if (!food) return { ok: false, reason: '没有这种食物' };
    if (s.player.coins < food.cost) return { ok: false, reason: '金币不够，再攒一点点' };
    if (food.kind === 'sweet' && s.care.sweetToday >= 2) return { ok: false, reason: '甜点一天最多两份，明天再来呀' };

    s.player.coins -= food.cost;
    const hungry = s.care.hunger < 35;
    const liked = (LIKE[s.activePetId] || []).indexOf(food.kind) >= 0;
    const hungerGain = Math.round(food.hunger * (hungry ? 1.35 : 1));
    const moodGain = food.mood + (liked ? 6 : 0) + (hungry ? 4 : 0);

    s.care.hunger = Math.min(100, s.care.hunger + hungerGain);
    s.care.mood = Math.min(100, s.care.mood + moodGain);
    s.care.fedToday += 1;
    if (food.kind === 'sweet') s.care.sweetToday += 1;
    s.care.updated = Date.now();

    const pet = s.pets[s.activePetId];
    if (pet) {
      pet.intimacy = Math.min(100, pet.intimacy + 2);
      pet.exp = Math.min(pet.expMax, pet.exp + 6);
    }

    let wishDone = false;
    if (s.wish.foodId === food.id && !s.wish.done) {
      s.wish.done = true;
      wishDone = true;
      s.player.stars += 3;
      if (pet) pet.intimacy = Math.min(100, pet.intimacy + 3);
    }

    if (window.XBAudio) XBAudio.sfx('feed');
    refreshTitle();
    return { ok: true, food: food, hungerGain: hungerGain, moodGain: moodGain, wishDone: wishDone, hungry: hungry, liked: liked };
  }

  /* ---------------- 签到 ---------------- */
  function checkin() {
    const today = dateKey();
    if (s.checkin.last === today) return { ok: false, reason: '今天已经签过啦，明天见' };
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    const yKey = yest.getFullYear() + '-' + String(yest.getMonth() + 1).padStart(2, '0') + '-' + String(yest.getDate()).padStart(2, '0');
    const continued = s.checkin.last === yKey;
    s.checkin.streak = continued ? s.checkin.streak + 1 : 1;
    s.checkin.total += 1;
    s.checkin.last = today;
    s.checkin.history = (s.checkin.history || []).concat(today).slice(-60);

    const day = ((s.checkin.streak - 1) % 7) + 1;
    const reward = CHECKIN_REWARDS[day - 1];
    s.player.coins += reward.coins;
    s.player.stars += reward.stars;
    s.care.mood = Math.min(100, s.care.mood + 6);
    refreshTitle();
    return { ok: true, day: day, streak: s.checkin.streak, continued: continued, reward: reward };
  }

  /* ---------------- 周目标 ---------------- */
  function weeklyInfo() {
    return {
      done: Math.min(s.weekly.tasks, s.weekly.goal),
      goal: s.weekly.goal,
      percent: Math.min(100, Math.round((s.weekly.tasks / s.weekly.goal) * 100)),
      claimed: s.weekly.claimed,
      complete: s.weekly.tasks >= s.weekly.goal,
    };
  }
  function claimWeekly() {
    const w = weeklyInfo();
    if (!w.complete) return { ok: false, reason: '还差 ' + (w.goal - w.done) + ' 个任务' };
    if (s.weekly.claimed) return { ok: false, reason: '本周奖励已经领过啦' };
    s.weekly.claimed = true;
    s.player.stars += 10;
    s.player.coins += 80;
    return { ok: true, stars: 10, coins: 80 };
  }

  /* ---------------- 称号 ---------------- */
  function statsForTitle() {
    const reading = (s.records || []).filter((r) => r.category === 'reading').length;
    const minutes = H.todayMinutes ? (s.sessions || []).reduce((a, x) => a + (x.minutes || 0), 0) : 0;
    return {
      reading: reading,
      streak: s.checkin.streak,
      minutes: minutes,
      tasks: (s.records || []).length,
      affection: (s.pets.capybara ? s.pets.capybara.intimacy : 0) + (s.pets.hamster ? s.pets.hamster.intimacy : 0),
    };
  }
  function refreshTitle() {
    const st = statsForTitle();
    const owned = TITLES.filter((t) => t.need(st)).map((t) => t.id);
    s.titles.owned = owned;
    const order = TITLES.map((t) => t.id);
    const best = owned.sort((a, b) => order.indexOf(b) - order.indexOf(a))[0] || 'newcomer';
    s.titles.current = best;
  }
  function currentTitle() {
    const t = TITLES.find((x) => x.id === s.titles.current) || TITLES[0];
    return t.name;
  }

  /* ---------------- 记忆台词 ---------------- */
  function memoryLine(petId) {
    const now = new Date();
    const hour = now.getHours();
    const last = s.memory.lastVisit || Date.now();
    const days = Math.floor((Date.now() - last) / 86400000);
    const name = s.pets[petId] ? H.petMeta(petId).name : '我';

    if (s.care.hunger < 30) return name + '饿了，肚子在咕咕叫……';
    if (s.care.energy < 25) return '有点困啦，但还想陪着你。';
    if (days >= 2) return '你回来啦！我一直在等你。';
    if (s.checkin.streak >= 7) return '连续第 ' + s.checkin.streak + ' 天啦，你真了不起。';
    if (hour >= 21) return '夜深了，今天也辛苦啦。';
    if (hour < 9) return '早上好，今天的风很轻。';
    if (s.care.mood > 80) return '今天心情很好，想和你一起玩。';
    return '';
  }
  function markVisit() {
    const now = Date.now();
    const days = Math.floor((now - (s.memory.lastVisit || now)) / 86400000);
    s.memory.visits = (s.memory.visits || 0) + 1;
    s.memory.lastVisit = now;
    return days;
  }

  /* ---------------- 与任务联动 ---------------- */
  function bumpWeekly() {
    if (s.weekly.key !== weekKey()) s.weekly = { key: weekKey(), tasks: 0, goal: WEEKLY_GOAL, claimed: false };
    s.weekly.tasks += 1;
  }
  const origComplete = XB.actions.completeQuest;
  XB.actions.completeQuest = function (id) {
    const res = origComplete(id);
    if (res && res.ok) bumpWeekly();
    return res;
  };

  /* ---------------- 初始化 ---------------- */
  markVisit();
  tick();

  Object.assign(XB.actions, {
    careTick: tick,
    feedPet: feed,
    checkIn: checkin,
    claimWeekly: claimWeekly,
    titleRefresh: refreshTitle,
  });

  Object.assign(XB.helpers, {
    foods: () => FOODS.slice(),
    foodById: (id) => FOODS.find((f) => f.id === id),
    careInfo: () => ({
      hunger: s.care.hunger,
      mood: s.care.mood,
      energy: s.care.energy,
      sweetToday: s.care.sweetToday,
      hungry: s.care.hunger < 35,
    }),
    wishInfo: () => ({ food: FOODS.find((f) => f.id === s.wish.foodId) || FOODS[4], done: s.wish.done, date: s.wish.date }),
    weeklyInfo: weeklyInfo,
    currentTitle: currentTitle,
    memoryLine: memoryLine,
    checkinInfo: () => ({ streak: s.checkin.streak, total: s.checkin.total, last: s.checkin.last, today: dateKey() === s.checkin.last }),
  });
})();
