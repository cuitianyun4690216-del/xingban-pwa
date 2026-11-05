/* ==========================================================================
   星伴学园 · 家长权限与业务闭环（密码 / 审核 / 兑换 / 限额 / 备份）
   加载顺序：store.js → store-world.js → store-parent.js
   ========================================================================== */

(function () {
  const s = XB.state;
  const H = XB.helpers;
  const todayKey = H.dateKey;

  /* ---------------- 状态补齐 ---------------- */
  if (!s.parent.password) s.parent.password = null;
  if (s.parent.approvalMode == null) s.parent.approvalMode = 'review';
  if (s.parent.dailyLimit == null) s.parent.dailyLimit = 0;
  if (!s.parent.rewardShop)
    s.parent.rewardShop = [
      { id: 'rw-1', name: '周末多玩 30 分钟', cost: 500, icon: 'hourglass', stock: 5, desc: '家长确认后可兑换' },
      { id: 'rw-2', name: '挑一部电影', cost: 800, icon: 'star', stock: 3, desc: '周末家庭电影之夜' },
      { id: 'rw-3', name: '喜欢的零食一份', cost: 300, icon: 'leaf', stock: 0, desc: '库存 0 表示不限量' },
      { id: 'rw-4', name: '一次公园之行', cost: 1200, icon: 'flag', stock: 2, desc: '和宠物一起出门' },
    ];
  if (!s.parent.redemptions) s.parent.redemptions = [];
  if (!s.approvals) s.approvals = [];
  if (s.parent.defaultPasswordSet == null) s.parent.defaultPasswordSet = false;
  if (XB.ui.parentGate == null) XB.ui.parentGate = false;
  if (XB.ui.redeem == null) XB.ui.redeem = false;
  if (XB.ui.parentAuthed == null) XB.ui.parentAuthed = false;
  if (XB.ui.onboarding == null) XB.ui.onboarding = false;

  /* ---------------- 密码（WebCrypto PBKDF2，失败回退迭代哈希） ---------------- */
  const enc = new TextEncoder();
  function buf2hex(buf) {
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  function fallbackHash(pw, salt, rounds) {
    let h1 = 0x811c9dc5, h2 = 0x1000193;
    const str = salt + '|' + pw;
    for (let r = 0; r < rounds; r++) {
      for (let i = 0; i < str.length; i++) {
        h1 ^= str.charCodeAt(i) + r;
        h1 = Math.imul(h1, 16777619) >>> 0;
        h2 = (Math.imul(h2 ^ h1, 2246822519) + i) >>> 0;
      }
    }
    return (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16);
  }
  async function hashPassword(pw, salt, iterations) {
    if (window.crypto && window.crypto.subtle) {
      try {
        const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
        const bits = await crypto.subtle.deriveBits(
          { name: 'PBKDF2', salt: enc.encode(salt), iterations: iterations, hash: 'SHA-256' },
          key,
          256
        );
        return 'pbkdf2:' + buf2hex(bits);
      } catch (e) {
        /* 回退 */
      }
    }
    return 'fallback:' + fallbackHash(pw, salt, 8000);
  }
  function parentRecord() {
    if (window.XBProfiles) return XBProfiles.parentRecord();
    return s.parent.password || null;
  }
  function putParentRecord(rec) {
    if (window.XBProfiles) XBProfiles.setParentRecord(rec);
    s.parent.password = null;
  }
  async function setPassword(pw) {
    const salt = buf2hex(crypto.getRandomValues(new Uint8Array(12)));
    const iterations = 120000;
    const hash = await hashPassword(pw, salt, iterations);
    putParentRecord({ v: 1, salt: salt, iterations: iterations, hash: hash, createdAt: Date.now() });
    s.parent.defaultPasswordSet = false;
    return { ok: true };
  }
  async function verifyPassword(pw) {
    let p = parentRecord();
    if (!p) {
      await setPassword('1234');
      p = parentRecord();
    }
    const hash = await hashPassword(pw, p.salt, p.iterations);
    return hash === p.hash;
  }

  let attempts = 0;
  let lockUntil = 0;
  async function unlock(pw) {
    if (Date.now() < lockUntil) return { ok: false, reason: '尝试次数过多，请稍后再试' };
    const ok = await verifyPassword(pw);
    if (ok) {
      attempts = 0;
      XB.ui.parentAuthed = true;
      XB.ui.mode = 'parent';
      return { ok: true };
    }
    attempts++;
    if (attempts >= 5) {
      lockUntil = Date.now() + 60000;
      attempts = 0;
      return { ok: false, reason: '连续错误 5 次，已锁定 1 分钟' };
    }
    return { ok: false, reason: '密码不对，还可以试 ' + (5 - attempts) + ' 次' };
  }
  function lockParent() {
    XB.ui.parentAuthed = false;
    XB.ui.mode = 'child';
    XB.ui.tab = 'home';
  }

  /* ---------------- 任务：审核 / 条件 ---------------- */
  function isPending(questId) {
    return s.approvals.some((a) => a.questId === questId && a.status === 'pending');
  }
  function dueMinutes() {
    return H.todayMinutes();
  }
  function canSubmit(quest) {
    if (H.isQuestDone(quest)) return { ok: false, reason: '这个任务已经完成啦' };
    if (isPending(quest.id)) return { ok: false, reason: '已经提交，等家长确认' };
    if (quest.condition === 'focus') {
      const need = quest.minMinutes || quest.minutes || 15;
      if (dueMinutes() < need) return { ok: false, reason: '需要先专注 ' + need + ' 分钟（今日已 ' + dueMinutes() + ' 分钟）' };
    }
    return { ok: true };
  }
  function submitQuest(id) {
    const q = s.quests.find((x) => x.id === id);
    if (!q) return { ok: false, reason: '任务不存在' };
    const can = canSubmit(q);
    if (!can.ok) return can;
    const mode = s.parent.approvalMode;
    const needReview = mode === 'review' || q.condition === 'review';
    if (!needReview) {
      const res = XB.actions.completeQuest(id);
      return res;
    }
    s.approvals.unshift({
      id: 'ap-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      questId: q.id,
      title: q.title,
      minutes: q.minutes,
      ts: Date.now(),
      date: todayKey(),
      petId: s.activePetId,
      status: 'pending',
      note: '',
    });
    if (s.approvals.length > 300) s.approvals.length = 300;
    return { ok: true, pending: true, quest: q };
  }
  function approve(id) {
    const a = s.approvals.find((x) => x.id === id);
    if (!a || a.status !== 'pending') return { ok: false };
    const res = XB.actions.completeQuest(a.questId);
    a.status = 'approved';
    a.decidedAt = Date.now();
    a.result = res.ok;
    return res;
  }
  function reject(id, note) {
    const a = s.approvals.find((x) => x.id === id);
    if (!a || a.status !== 'pending') return { ok: false };
    a.status = 'rejected';
    a.decidedAt = Date.now();
    a.note = note || '家长未通过，稍后再试';
    return { ok: true };
  }
  function pendingApprovals() {
    return s.approvals.filter((a) => a.status === 'pending');
  }

  /* ---------------- 奖励兑换 ---------------- */
  function addRewardItem(data) {
    s.parent.rewardShop.unshift({
      id: 'rw-' + Date.now().toString(36),
      name: data.name,
      cost: Math.max(1, Math.round(data.cost)),
      icon: data.icon || 'gift',
      stock: Math.max(0, Math.round(data.stock || 0)),
      desc: data.desc || '',
    });
  }
  function removeRewardItem(id) {
    const i = s.parent.rewardShop.findIndex((x) => x.id === id);
    if (i >= 0) s.parent.rewardShop.splice(i, 1);
  }
  function redeem(itemId) {
    const item = s.parent.rewardShop.find((x) => x.id === itemId);
    if (!item) return { ok: false, reason: '奖励不存在' };
    if (s.player.coins < item.cost) return { ok: false, reason: '金币不够，再攒一攒' };
    if (item.stock === 0) return { ok: false, reason: '这件奖励暂时没有库存' };
    if (s.parent.redemptions.some((r) => r.itemId === itemId && r.status === 'pending'))
      return { ok: false, reason: '已经提交过，等家长确认' };
    s.parent.redemptions.unshift({
      id: 'rd-' + Date.now().toString(36),
      itemId: itemId,
      name: item.name,
      cost: item.cost,
      ts: Date.now(),
      date: todayKey(),
      status: 'pending',
    });
    return { ok: true };
  }
  function decideRedemption(id, approveIt) {
    const r = s.parent.redemptions.find((x) => x.id === id);
    if (!r || r.status !== 'pending') return { ok: false };
    if (approveIt) {
      if (s.player.coins < r.cost) return { ok: false, reason: '孩子金币已不足' };
      s.player.coins -= r.cost;
      const item = s.parent.rewardShop.find((x) => x.id === r.itemId);
      if (item && item.stock > 0) item.stock -= 1;
      r.status = 'approved';
      s.rewards.history.unshift({
        id: 'rh-' + r.id,
        ts: Date.now(),
        date: todayKey(),
        type: 'redeem',
        title: '兑换 · ' + r.name,
        exp: 0,
        coins: -r.cost,
        stars: 0,
        petId: s.activePetId,
      });
    } else {
      r.status = 'rejected';
    }
    r.decidedAt = Date.now();
    return { ok: true };
  }
  function pendingRedemptions() {
    return s.parent.redemptions.filter((r) => r.status === 'pending');
  }

  /* ---------------- 学习时长限额 ---------------- */
  function limitInfo() {
    const limit = s.parent.dailyLimit || 0;
    const used = H.todayMinutes();
    return { limit: limit, used: used, left: limit ? Math.max(0, limit - used) : -1, blocked: !!limit && used >= limit };
  }

  /* ---------------- 备份 / 恢复 ---------------- */
  function exportJSON() {
    return JSON.stringify({ app: 'xingban', schema: 3, exportedAt: Date.now(), state: s }, null, 2);
  }
  function importJSON(text) {
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return { ok: false, reason: '文件不是有效的备份' };
    }
    const st = data && data.state ? data.state : data;
    if (!st || !st.player || !st.pets || !st.quests) return { ok: false, reason: '备份内容不完整' };
    localStorage.setItem('xingban.save.v2', JSON.stringify(st));
    return { ok: true };
  }
  function restoreSnapshot(st) {
    localStorage.setItem('xingban.save.v2', JSON.stringify(st));
    location.reload();
  }

  /* ---------------- 包装：学生端只读限制 ---------------- */
  const origCreate = XB.actions.createQuest;
  XB.actions.createQuest = function (data) {
    const q = origCreate(data);
    q.owner = data.owner || 'parent';
    if (data.condition) q.condition = data.condition;
    if (data.minMinutes) q.minMinutes = data.minMinutes;
    return q;
  };
  const origUpdate = XB.actions.updateQuest;
  XB.actions.updateQuest = function (id, data) {
    const q = origUpdate(id, data);
    if (q) {
      if (data.condition) q.condition = data.condition;
      if (data.minMinutes != null) q.minMinutes = data.minMinutes;
      q.owner = q.owner || 'parent';
    }
    return q;
  };

  /* ---------------- 默认密码提示 ---------------- */
  function ensureDefaultPassword() {
    if (!parentRecord()) {
      setPassword('1234').then(() => {
        s.parent.defaultPasswordSet = true;
      });
    }
  }

  /* ---------------- 导出 ---------------- */
  Object.assign(XB.actions, {
    unlockParent: unlock,
    lockParent: lockParent,
    setParentPassword: async function (oldPw, newPw) {
      const ok = await verifyPassword(oldPw);
      if (!ok) return { ok: false, reason: '原密码不正确' };
      if (!newPw || newPw.length < 4) return { ok: false, reason: '新密码至少 4 位' };
      await setPassword(newPw);
      s.parent.defaultPasswordSet = false;
      return { ok: true };
    },
    submitQuest: submitQuest,
    approveSubmission: approve,
    rejectSubmission: reject,
    addRewardItem: addRewardItem,
    removeRewardItem: removeRewardItem,
    redeem: redeem,
    decideRedemption: decideRedemption,
    exportJSON: exportJSON,
    importJSON: importJSON,
    restoreSnapshot: restoreSnapshot,
    ensureDefaultPassword: ensureDefaultPassword,
  });
  Object.assign(XB.helpers, {
    isPending: isPending,
    pendingApprovals: pendingApprovals,
    pendingRedemptions: pendingRedemptions,
    limitInfo: limitInfo,
    canSubmit: canSubmit,
    verifyParentPassword: verifyPassword,
  });

  ensureDefaultPassword();
})();
