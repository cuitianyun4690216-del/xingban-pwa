/* ==========================================================================
   星伴学园 · 数据层（任务 / 成长 / 奖励 / 计时 / 存档）
   全局对象：window.XB = { state, ui, helpers, actions }
   存档：localStorage（key: xingban.save.v2），写入防抖 260ms
   ========================================================================== */

(function () {
  const { reactive, watch } = Vue;
  const CAT = window.XB_CATALOG;
  const LEGACY_KEY = 'xingban.save.v2';
  const PAGE_KEY = (window.XBStorage && window.XBStorage.key && window.XBStorage.key()) || LEGACY_KEY;
  function SAVE_KEY() {
    return PAGE_KEY;
  }
  window.XB_PAGE_KEY = PAGE_KEY;
  const VERSION = 2;

  const CAP = { exp: 600, coins: 3000, stars: 120, petExp: 800 };
  const GOAL = 5;

  /* ---------------- 时间工具 ---------------- */
  const pad = (n) => String(n).padStart(2, '0');

  function dateKey(d) {
    const t = d ? new Date(d) : new Date();
    return t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
  }

  function weekKey(d) {
    const t = d ? new Date(d) : new Date();
    const date = new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
    return date.getUTCFullYear() + '-W' + pad(weekNo);
  }

  function uid(prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  /* ---------------- 初始存档 ---------------- */
  function defaultState() {
    return {
      version: VERSION,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      player: {
        name: '小星',
        title: '星之旅人',
        level: 12,
        exp: 520,
        expMax: 1000,
        stars: 1280,
        coins: 24680,
      },
      settings: { sound: true },
    flags: { onboarded: false },
      activePetId: 'capybara',
      pets: {
        capybara: {
          id: 'capybara',
          level: 8,
          exp: 320,
          expMax: CAT.expForLevel(8),
          intimacy: 85,
          mood: 'calm',
          stage: 'growth',
          wardrobe: [],
          interactions: [],
          history: [],
        },
        hamster: {
          id: 'hamster',
          level: 7,
          exp: 280,
          expMax: CAT.expForLevel(7),
          intimacy: 90,
          mood: 'happy',
          stage: 'growth',
          wardrobe: [],
          interactions: [],
          history: [],
        },
      },
      quests: CAT.defaultQuests.map((q) => Object.assign({ archived: false }, q)),
      records: [],
      sessions: [],
      rewards: { history: [], dailyDate: null },
      timer: { totalSec: 1500, remaining: 1500, running: false, endsAt: null, startedAt: null, preset: 25 },
      today: { date: dateKey(), exp: 0, coins: 0, stars: 0, petExp: 0, interactions: 0 },
      cooldowns: {},
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY());
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.version !== VERSION || !data.pets || !data.quests) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  const state = reactive(load() || defaultState());
  try {
    const tmpS = localStorage.getItem('xingban.tmp.settings');
    const tmpP = localStorage.getItem('xingban.tmp.parent');
    if (tmpS) { Object.assign(state.settings, JSON.parse(tmpS)); localStorage.removeItem('xingban.tmp.settings'); }
    if (tmpP) { Object.assign(state.parent, JSON.parse(tmpP)); localStorage.removeItem('xingban.tmp.parent'); }
  } catch (e) {}
  if (state.parent && state.parent.password) state.parent.password = null;
  if (!state.flags) state.flags = { onboarded: false };

  /* ---------------- 持久化 ---------------- */
  let saveTimer = null;
  function saveNow() {
    clearTimeout(saveTimer);
    try {
      state.updatedAt = Date.now();
      localStorage.setItem(SAVE_KEY(), JSON.stringify(state));
    } catch (e) {
      /* 存储不可用时静默降级 */
    }
  }
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 260);
  }
  watch(state, scheduleSave, { deep: true });
  window.addEventListener('beforeunload', saveNow);

  /* ---------------- UI 状态 ---------------- */
  const ui = reactive({
    tab: 'home',
    toast: null,
    rewards: [],
    levels: [],
    questEditor: null,
    settings: false,
    confirm: null,
    history: false,
  });

  let toastTimer = null;
  function toast(text, icon) {
    clearTimeout(toastTimer);
    ui.toast = { id: Date.now(), text: text, icon: icon || 'sparkle' };
    toastTimer = setTimeout(() => {
      ui.toast = null;
    }, 2600);
  }

  function pushReward(payload) {
    ui.rewards.push(payload);
  }
  function closeReward() {
    ui.rewards.shift();
  }
  function pushLevelUp(payload) {
    ui.levels.push(payload);
  }
  function closeLevelUp() {
    ui.levels.shift();
  }

  /* ---------------- 日期刷新 ---------------- */
  function ensureToday() {
    const today = dateKey();
    if (state.today.date !== today) {
      state.today = { date: today, exp: 0, coins: 0, stars: 0, petExp: 0, interactions: 0 };
    }
  }
  setInterval(ensureToday, 60000);

  /* ---------------- 查询辅助 ---------------- */
  function petOf(id) {
    return state.pets[id || state.activePetId];
  }

  function isQuestDone(q, dk) {
    const day = dk || dateKey();
    const wk = weekKey(day);
    return state.records.some(function (r) {
      if (r.questId !== q.id) return false;
      if (q.repeat === 'daily') return r.date === day;
      if (q.repeat === 'weekly') return r.week === wk;
      return true;
    });
  }

  function isDueToday(q) {
    if (q.archived) return false;
    if (q.repeat === 'daily') return true;
    return !isQuestDone(q);
  }

  function todayQuests() {
    return state.quests.filter(isDueToday);
  }

  function doneToday() {
    const day = dateKey();
    return state.records.filter((r) => r.date === day).length;
  }

  function goal() {
    const done = Math.min(doneToday(), GOAL);
    return { done: done, total: GOAL, percent: Math.round((done / GOAL) * 100) };
  }

  function todayGain() {
    ensureToday();
    return state.today;
  }

  function petStageName(petId) {
    const p = petOf(petId);
    return CAT.stageName(petId, p.level);
  }

  function recentRecords(limit) {
    return state.records.slice(0, limit || 8);
  }

  function todaySessions() {
    const day = dateKey();
    return state.sessions.filter((s) => s.date === day);
  }

  function todayMinutes() {
    return todaySessions().reduce((sum, s) => sum + s.minutes, 0);
  }

  function totalMinutes() {
    return state.sessions.reduce((sum, s) => sum + s.minutes, 0);
  }

  /* ---------------- 奖励发放（含每日上限） ---------------- */
  function grant(input) {
    ensureToday();
    const t = state.today;
    const exp = Math.min(input.exp || 0, Math.max(0, CAP.exp - t.exp));
    const coins = Math.min(input.coins || 0, Math.max(0, CAP.coins - t.coins));
    const stars = Math.min(input.stars || 0, Math.max(0, CAP.stars - t.stars));
    const petExp = Math.min(input.petExp || 0, Math.max(0, CAP.petExp - t.petExp));

    t.exp += exp;
    t.coins += coins;
    t.stars += stars;
    t.petExp += petExp;

    state.player.coins += coins;
    state.player.stars += stars;
    addPlayerExp(Math.round(exp * 0.35));

    const petId = state.activePetId;
    const levelUps = petExp > 0 ? addPetExp(petId, petExp) : [];
    const intimacy = input.intimacy || 0;
    if (intimacy) addIntimacy(petId, intimacy);

    const capped = exp < (input.exp || 0) || coins < (input.coins || 0) || stars < (input.stars || 0) || petExp < (input.petExp || 0);

    return {
      exp: exp,
      coins: coins,
      stars: stars,
      petExp: petExp,
      intimacy: intimacy,
      petId: petId,
      levelUps: levelUps,
      capped: capped,
    };
  }

  function addPlayerExp(n) {
    if (!n) return;
    const p = state.player;
    p.exp += n;
    let guard = 0;
    while (p.exp >= p.expMax && guard++ < 20) {
      p.exp -= p.expMax;
      p.level += 1;
      p.expMax = 400 + p.level * 50;
    }
  }

  function addPetExp(petId, n) {
    const pet = state.pets[petId];
    const ups = [];
    pet.exp += n;
    let guard = 0;
    while (pet.exp >= pet.expMax && guard++ < 20) {
      pet.exp -= pet.expMax;
      pet.level += 1;
      pet.expMax = CAT.expForLevel(pet.level);
      pet.stage = CAT.stageOf(pet.level).key;
      const stageName = CAT.stageName(petId, pet.level);
      ups.push({ level: pet.level, stage: pet.stage, stageName: stageName });
      pet.history.unshift({
        id: uid('h'),
        ts: Date.now(),
        type: 'levelup',
        text: '升到 Lv.' + pet.level + ' · ' + stageName,
      });
    }
    if (pet.history.length > 30) pet.history.length = 30;
    if (ups.length) pet.intimacy = Math.min(100, pet.intimacy + 2);
    return ups;
  }

  function addIntimacy(petId, n) {
    const pet = state.pets[petId];
    pet.intimacy = clamp(pet.intimacy + n, 0, 100);
  }

  /* ---------------- 任务 ---------------- */
  function questReward(minutes, difficulty) {
    const d = CAT.difficultyById(difficulty);
    return {
      exp: Math.max(10, Math.round(minutes * 2 * d.exp)),
      coins: Math.max(20, Math.round(minutes * 4 * d.coins)),
      stars: d.stars > 0 ? 1 : 0,
    };
  }

  function completeQuest(id) {
    ensureToday();
    const q = state.quests.find((x) => x.id === id);
    if (!q) return { ok: false, reason: '任务不存在' };
    if (isQuestDone(q)) return { ok: false, reason: '这个任务今天已经完成啦' };

    const diff = CAT.difficultyById(q.difficulty);
    const baseExp = Math.round(q.exp * diff.exp);
    const baseCoins = Math.round(q.coins * diff.coins);
    const baseStars = (q.stars || 0) + (diff.stars > 0 ? 1 : 0);

    const gain = grant({
      exp: baseExp,
      coins: baseCoins,
      stars: baseStars,
      petExp: baseExp,
      intimacy: 1 + (q.difficulty === 'hard' ? 1 : 0),
    });

    const rec = {
      id: uid('r'),
      questId: q.id,
      title: q.title,
      category: q.category,
      minutes: q.minutes,
      date: dateKey(),
      week: weekKey(),
      ts: Date.now(),
      petId: gain.petId,
      petName: petOf().name,
      exp: gain.exp,
      coins: gain.coins,
      stars: gain.stars,
      capped: gain.capped,
    };
    state.records.unshift(rec);
    if (state.records.length > 400) state.records.length = 400;

    state.rewards.history.unshift({
      id: uid('rh'),
      ts: rec.ts,
      date: rec.date,
      type: 'quest',
      title: q.title,
      exp: gain.exp,
      coins: gain.coins,
      stars: gain.stars,
      petId: gain.petId,
    });
    if (state.rewards.history.length > 200) state.rewards.history.length = 200;

    petOf().mood = 'proud';

    return {
      ok: true,
      quest: q,
      reward: {
        kind: 'quest',
        title: '任务完成',
        subtitle: q.title,
        icon: CAT.categoryById(q.category).icon,
        exp: gain.exp,
        coins: gain.coins,
        stars: gain.stars,
        petExp: gain.petExp,
        petName: petOf().name,
        capped: gain.capped,
      },
      levelUps: gain.levelUps,
    };
  }

  /** 取消今日完成：撤回记录与本次奖励，避免刷奖励 */
  function undoQuest(questId) {
    ensureToday();
    const idx = state.records.findIndex(function (r) {
      return r.questId === questId && r.date === dateKey();
    });
    if (idx < 0) return { ok: false, reason: '只能取消今天的完成记录' };
    const rec = state.records[idx];
    state.records.splice(idx, 1);

    state.player.coins = Math.max(0, state.player.coins - (rec.coins || 0));
    state.player.stars = Math.max(0, state.player.stars - (rec.stars || 0));
    const playerExpBack = Math.round((rec.exp || 0) * 0.35);
    state.player.exp = Math.max(0, state.player.exp - playerExpBack);

    const pet = state.pets[rec.petId] || petOf();
    pet.exp = Math.max(0, pet.exp - (rec.exp || 0));

    const today = state.today;
    today.exp = Math.max(0, today.exp - (rec.exp || 0));
    today.coins = Math.max(0, today.coins - (rec.coins || 0));
    today.stars = Math.max(0, today.stars - (rec.stars || 0));
    today.petExp = Math.max(0, today.petExp - (rec.exp || 0));

    const rhIdx = state.rewards.history.findIndex(function (h) {
      return h.type === 'quest' && h.ts === rec.ts;
    });
    if (rhIdx >= 0) state.rewards.history.splice(rhIdx, 1);

    return { ok: true, quest: state.quests.find((q) => q.id === questId) };
  }

  function createQuest(data) {    const r = questReward(data.minutes, data.difficulty);
    const q = {
      id: uid('q'),
      title: (data.title || '未命名任务').trim().slice(0, 30),
      category: data.category || 'custom',
      desc: (data.desc || '').trim().slice(0, 80),
      minutes: clamp(Math.round(data.minutes || 15), 5, 180),
      difficulty: data.difficulty || 'easy',
      exp: clamp(Math.round(data.exp || r.exp), 0, 999),
      coins: clamp(Math.round(data.coins || r.coins), 0, 9999),
      stars: clamp(Math.round(data.stars || 0), 0, 9),
      repeat: data.repeat || 'daily',
      createdAt: Date.now(),
      archived: false,
    };
    state.quests.unshift(q);
    return q;
  }

  function updateQuest(id, data) {
    const q = state.quests.find((x) => x.id === id);
    if (!q) return null;
    Object.assign(q, {
      title: (data.title || q.title).trim().slice(0, 30),
      category: data.category || q.category,
      desc: (data.desc || '').trim().slice(0, 80),
      minutes: clamp(Math.round(data.minutes || q.minutes), 5, 180),
      difficulty: data.difficulty || q.difficulty,
      exp: clamp(Math.round(data.exp == null ? q.exp : data.exp), 0, 999),
      coins: clamp(Math.round(data.coins == null ? q.coins : data.coins), 0, 9999),
      stars: clamp(Math.round(data.stars == null ? q.stars : data.stars), 0, 9),
      repeat: data.repeat || q.repeat,
    });
    return q;
  }

  function deleteQuest(id) {
    const i = state.quests.findIndex((x) => x.id === id);
    if (i >= 0) state.quests.splice(i, 1);
  }

  /* ---------------- 互动 ---------------- */
  function interact(petId, actionId) {
    ensureToday();
    const cfg = CAT.interactions[actionId];
    if (!cfg) return { ok: false, reason: '未知互动' };
    const pet = petOf(petId);
    const key = pet.id + ':' + actionId;
    const now = Date.now();
    if (now - (state.cooldowns[key] || 0) < 6000) {
      return { ok: false, reason: '它还在回味刚才的互动' };
    }
    state.cooldowns[key] = now;
    state.today.interactions += 1;
    if (window.XBAudio) {
      XBAudio.sfx(actionId === 'feed' ? 'feed' : actionId === 'play' ? 'pet' : 'pat');
    }

    const gain = grant({ petExp: cfg.exp, intimacy: cfg.intimacy });
    pet.mood = cfg.mood;
    pet.interactions.unshift({
      id: uid('i'),
      ts: now,
      action: actionId,
      text: cfg.line,
    });
    if (pet.interactions.length > 30) pet.interactions.length = 30;

    return { ok: true, action: cfg, gain: gain, levelUps: gain.levelUps, pet: pet };
  }

  /* ---------------- 每日成长奖励 ---------------- */
  function claimDailyChest() {
    ensureToday();
    const day = dateKey();
    if (state.rewards.dailyDate === day) {
      return { ok: false, reason: '今天的成长奖励已经领过了' };
    }
    state.rewards.dailyDate = day;
    const gain = grant({ coins: 200, stars: 20, petExp: 30, intimacy: 2 });
    state.rewards.history.unshift({
      id: uid('rh'),
      ts: Date.now(),
      date: day,
      type: 'daily',
      title: '成长奖励',
      exp: 0,
      coins: gain.coins,
      stars: gain.stars,
      petId: gain.petId,
    });
    return {
      ok: true,
      reward: {
        kind: 'daily',
        title: '成长奖励',
        subtitle: '今天的陪伴也值得被记住',
        icon: 'chest',
        exp: 0,
        coins: gain.coins,
        stars: gain.stars,
        petExp: gain.petExp,
        petName: petOf().name,
        capped: gain.capped,
      },
      levelUps: gain.levelUps,
    };
  }

  /* ---------------- 计时器 ---------------- */
  function remainingSec() {
    const t = state.timer;
    if (t.running && t.endsAt) return Math.max(0, Math.round((t.endsAt - Date.now()) / 1000));
    return t.remaining;
  }

  function startTimer(minutes) {
    const total = clamp(Math.round(minutes * 60), 60, 7200);
    state.timer = {
      totalSec: total,
      remaining: total,
      running: true,
      endsAt: Date.now() + total * 1000,
      startedAt: Date.now(),
      preset: minutes,
    };
    return state.timer;
  }

  function pauseTimer() {
    const t = state.timer;
    if (!t.running) return;
    t.remaining = remainingSec();
    t.running = false;
    t.endsAt = null;
  }

  function resumeTimer() {
    const t = state.timer;
    if (t.running || t.remaining <= 0) return;
    t.running = true;
    t.endsAt = Date.now() + t.remaining * 1000;
  }

  function resetTimer() {
    state.timer = {
      totalSec: state.timer.totalSec,
      remaining: state.timer.totalSec,
      running: false,
      endsAt: null,
      startedAt: null,
      preset: state.timer.preset,
    };
  }

  function finishTimer(mode) {
    const t = state.timer;
    const left = remainingSec();
    const elapsed = mode === 'complete' ? t.totalSec : Math.max(0, t.totalSec - left);
    const minutes = Math.round(elapsed / 60);

    if (minutes < 1) {
      resetTimer();
      return { ok: false, reason: '不足 1 分钟，本次不记录' };
    }

    ensureToday();
    const petId = state.activePetId;
    const exp = Math.round(minutes * 3);
    const coins = Math.round(minutes * 2);
    const stars = Math.floor(minutes / 10);

    const gain = grant({ exp: 0, coins: coins, stars: stars, petExp: exp, intimacy: 2 });
    state.sessions.unshift({
      id: uid('s'),
      date: dateKey(),
      ts: Date.now(),
      minutes: minutes,
      exp: exp,
      coins: gain.coins,
      stars: gain.stars,
      petId: petId,
      mode: mode,
    });
    if (state.sessions.length > 300) state.sessions.length = 300;

    state.rewards.history.unshift({
      id: uid('rh'),
      ts: Date.now(),
      date: dateKey(),
      type: 'focus',
      title: '专注 ' + minutes + ' 分钟',
      exp: exp,
      coins: gain.coins,
      stars: gain.stars,
      petId: petId,
    });

    resetTimer();

    return {
      ok: true,
      minutes: minutes,
      reward: {
        kind: 'focus',
        title: mode === 'complete' ? '专注完成' : '专注结束',
        subtitle: '专注 ' + minutes + ' 分钟',
        icon: 'hourglass',
        exp: 0,
        coins: gain.coins,
        stars: gain.stars,
        petExp: gain.petExp,
        petName: petOf().name,
        capped: gain.capped,
      },
      levelUps: gain.levelUps,
    };
  }

  /* ---------------- UI 反馈：奖励 + 升级 ---------------- */
  function presentResult(res) {
    if (!res || !res.ok) return;
    if (res.levelUps && res.levelUps.length) {
      const pet = petOf();
      const conf = window.XingPets.byId(pet.id);
      const last = res.levelUps[res.levelUps.length - 1];
      pushLevelUp({
        petId: pet.id,
        name: conf.name,
        level: last.level,
        stageName: last.stageName,
      });
    }
    if (res.reward) pushReward(res.reward);
  }

  /* ---------------- 初始化：处理离线 / 过期计时 ---------------- */
  let bootResult = null;
  function init() {
    ensureToday();
    const t = state.timer;
    if (t.running && t.endsAt && t.endsAt <= Date.now()) {
      bootResult = finishTimer('complete');
    }
  }

  /* ---------------- 设置 ---------------- */
  function resetAll() {
    try {
      localStorage.removeItem(SAVE_KEY());
    } catch (e) {}
    location.reload();
  }

  /* ---------------- 导出 ---------------- */
  function petMeta(petId) {
    const conf = window.XingPets.byId(petId);
    const pet = state.pets[petId];
    return {
      id: petId,
      name: conf.name,
      species: conf.species,
      title: conf.title,
      latin: conf.latin,
      role: conf.role,
      traits: conf.traits,
      intro: conf.intro,
      level: pet.level,
      exp: pet.exp,
      expMax: pet.expMax,
      intimacy: pet.intimacy,
      mood: pet.mood,
      stage: pet.stage,
      stageName: CAT.stageName(petId, pet.level),
      conf: conf,
    };
  }

  window.XB = {
    state: state,
    ui: ui,
    caps: CAP,
    goalTotal: GOAL,
    init: init,
    bootResult: function () {
      return bootResult;
    },
    helpers: {
      dateKey: dateKey,
      weekKey: weekKey,
      uid: uid,
      clamp: clamp,
      petOf: petOf,
      petMeta: petMeta,
      isQuestDone: isQuestDone,
      isDueToday: isDueToday,
      todayQuests: todayQuests,
      doneToday: doneToday,
      goal: goal,
      todayGain: todayGain,
      recentRecords: recentRecords,
      todaySessions: todaySessions,
      todayMinutes: todayMinutes,
      totalMinutes: totalMinutes,
      remainingSec: remainingSec,
      petStageName: petStageName,
      stage: CAT.stageOf,
      category: CAT.categoryById,
      difficulty: CAT.difficultyById,
      moodOf: function (id) {
        return CAT.moods[id] || CAT.moods.calm;
      },
      isChestClaimed: function () {
        return state.rewards.dailyDate === dateKey();
      },
    },
    actions: {
      toast: toast,
      pushReward: pushReward,
      closeReward: closeReward,
      pushLevelUp: pushLevelUp,
      closeLevelUp: closeLevelUp,
      ensureToday: ensureToday,
      completeQuest: completeQuest,
      undoQuest: undoQuest,
      createQuest: createQuest,
      updateQuest: updateQuest,
      deleteQuest: deleteQuest,
      questReward: questReward,
      interact: interact,
      claimDailyChest: claimDailyChest,
      startTimer: startTimer,
      pauseTimer: pauseTimer,
      resumeTimer: resumeTimer,
      resetTimer: resetTimer,
      finishTimer: finishTimer,
      presentResult: presentResult,
      resetAll: resetAll,
    flush: function () { saveNow(); },
      addPetExp: addPetExp,
      addIntimacy: addIntimacy,
      saveNow: saveNow,
      setActivePet: function (id) {
        if (state.pets[id]) state.activePetId = id;
      },
    },
  };
})();
