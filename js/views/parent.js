/* ==========================================================================
   星伴学园 · 家长管理中心（任务 / 审核 / 奖励 / 记录 / 设置 / 备份）
   ========================================================================== */

(function () {
  const CAT = window.XB_CATALOG;

  const XBParentView = {
    name: 'XBParentView',
    data() {
      return {
        tab: 'overview',
        monthOffset: 0,
        goalTasks: XB.state.parent.goalTasks,
        goalMinutes: XB.state.parent.goalMinutes,
        limit: XB.state.parent.dailyLimit,
        approvalMode: XB.state.parent.approvalMode,
        pwOld: '',
        pwNew: '',
        pwNew2: '',
        newReward: { name: '', cost: 300, stock: 1, desc: '' },
        backupText: '',
        renaming: null,
        renameText: '',
        newName: '',
      };
    },
    computed: {
      state() {
        return XB.state;
      },
      tabs() {
        return [
          { id: 'overview', name: '概览' },
          { id: 'tasks', name: '任务' },
          { id: 'templates', name: '模板' },
          { id: 'review', name: '审核' },
          { id: 'rewards', name: '奖励' },
          { id: 'records', name: '记录' },
          { id: 'stats', name: '统计' },
          { id: 'goals', name: '目标' },
          { id: 'profiles', name: '档案' },
          { id: 'data', name: '数据' },
          { id: 'tests', name: '测试' },
          { id: 'settings', name: '设置' },
        ];
      },
      stats() {
        return XB.helpers.stats();
      },
      quests() {
        return this.state.quests.filter((q) => !q.archived);
      },
      templates() {
        return this.state.parent.templates;
      },
      records() {
        return this.state.records.slice(0, 15);
      },
      pendingApprovals() {
        return XB.helpers.pendingApprovals();
      },
      decidedApprovals() {
        return this.state.approvals.filter((a) => a.status !== 'pending').slice(0, 10);
      },
      pendingRedemptions() {
        return XB.helpers.pendingRedemptions();
      },
      redeemHistory() {
        return this.state.parent.redemptions.filter((r) => r.status !== 'pending').slice(0, 10);
      },
      shop() {
        return this.state.parent.rewardShop;
      },
      calendar() {
        return XB.helpers.calendar(this.monthOffset);
      },
      weekdays() {
        return ['一', '二', '三', '四', '五', '六', '日'];
      },
      pets() {
        return ['capybara', 'hamster'].map((id) => XB.helpers.petMeta(id));
      },
      todayPending() {
        return this.pendingApprovals.length + this.pendingRedemptions.length;
      },
      profiles() {
        return window.XBProfiles ? XBProfiles.list() : [];
      },
      currentProfile() {
        return window.XBProfiles ? XBProfiles.active() : { id: '', name: '默认' };
      },
      isTestProfile() {
        return window.XBProfiles ? XBProfiles.isTest() : false;
      },
    },
    methods: {
      exit() {
        XB.actions.lockParent();
      },
      /* ---------------- 档案 ---------------- */
      switchProfile(p) {
        if (!window.XBProfiles || p.id === XBProfiles.activeId()) return;
        XB.actions.flush && XB.actions.flush();
        XBProfiles.switchTo(p.id);
        location.reload();
      },
      createProfile(type) {
        if (!window.XBProfiles) return;
        const name = (this.newName || '').trim() || (type === 'test' ? '测试档案' : '新同学');
        const p = XBProfiles.create(name, type);
        this.newName = '';
        XB.actions.flush && XB.actions.flush();
        XB.actions.toast('已创建「' + p.name + '」，正在切换…', 'user');
        XBProfiles.switchTo(p.id);
        setTimeout(() => location.reload(), 500);
      },
      startRename(p) {
        this.renaming = p.id;
        this.renameText = p.name;
      },
      doRename(p) {
        if (!this.renameText.trim()) return;
        XBProfiles.rename(p.id, this.renameText.trim());
        this.renaming = null;
        XB.actions.toast('档案已重命名', 'edit');
      },
      askRemoveProfile(p) {
        XB.ui.confirm = {
          title: '删除档案',
          text: '「' + p.name + '」的全部数据（宠物、金币、任务、记录）都会被删除，无法恢复。',
          okText: '删除',
          danger: true,
          onOk: () => {
            const res = XBProfiles.remove(p.id);
            if (!res.ok) {
              XB.actions.toast(res.reason, 'info');
              return;
            }
            XB.actions.flush && XB.actions.flush();
            if (res.active !== XBProfiles.activeId()) {
              XBProfiles.switchTo(res.active);
              location.reload();
            } else {
              location.reload();
            }
          },
        };
      },
      catName(id) {
        return CAT.categoryById(id).name;
      },
      newTask() {
        XB.ui.questEditor = { mode: 'create', quest: null };
      },
      editTask(q) {
        XB.ui.questEditor = { mode: 'edit', quest: q };
      },
      applyTemplate(t) {
        const res = XB.actions.applyTemplate(t.id);
        if (res.ok) XB.actions.toast('已添加到今日任务：' + res.title, 'plus');
      },
      removeTemplate(t) {
        XB.actions.removeTemplate(t.id);
        XB.actions.toast('模板已删除', 'trash');
      },
      saveTemplateFromTask(q) {
        XB.actions.addTemplate(q);
        XB.actions.toast('已保存为模板', 'bookmark');
      },
      approve(a) {
        const res = XB.actions.approveSubmission(a.id);
        if (!res.ok) {
          XB.actions.toast(res.reason || '无法通过', 'info');
          return;
        }
        XB.actions.toast('已通过「' + a.title + '」并发放奖励', 'check');
      },
      reject(a) {
        XB.actions.rejectSubmission(a.id, '家长未通过，请再努力一下');
        XB.actions.toast('已退回「' + a.title + '」', 'close');
      },
      decideRedeem(r, yes) {
        const res = XB.actions.decideRedemption(r.id, yes);
        if (!res.ok) {
          XB.actions.toast(res.reason || '无法处理', 'info');
          return;
        }
        XB.actions.toast(yes ? '已确认兑换「' + r.name + '」' : '已拒绝兑换', yes ? 'gift' : 'close');
      },
      addReward() {
        if (!this.newReward.name.trim()) {
          XB.actions.toast('先填写奖励名称', 'info');
          return;
        }
        XB.actions.addRewardItem(this.newReward);
        this.newReward = { name: '', cost: 300, stock: 1, desc: '' };
        XB.actions.toast('奖励已上架', 'gift');
      },
      removeReward(item) {
        XB.ui.confirm = {
          title: '下架奖励',
          text: '「' + item.name + '」将从兑换商店移除，已提交的申请不受影响。',
          okText: '下架',
          danger: true,
          onOk: () => XB.actions.removeRewardItem(item.id),
        };
      },
      saveGoal() {
        this.state.parent.goalTasks = Math.max(1, Math.min(10, Math.round(this.goalTasks)));
        this.state.parent.goalMinutes = Math.max(5, Math.min(180, Math.round(this.goalMinutes)));
        XB.actions.toast('学习目标已更新', 'target');
      },
      saveLimit() {
        this.state.parent.dailyLimit = Math.max(0, Math.min(600, Math.round(this.limit)));
        XB.actions.toast(this.state.parent.dailyLimit ? '每日学习上限：' + this.state.parent.dailyLimit + ' 分钟' : '已取消每日上限', 'hourglass');
      },
      setMode(mode) {
        this.state.parent.approvalMode = mode;
        XB.actions.toast(mode === 'auto' ? '任务将直接完成并发奖' : '任务需家长审核后发奖', 'lock');
      },
      async changePw() {
        if (this.pwNew !== this.pwNew2) {
          XB.actions.toast('两次输入的新密码不一致', 'info');
          return;
        }
        const res = await XB.actions.setParentPassword(this.pwOld, this.pwNew);
        if (!res.ok) {
          XB.actions.toast(res.reason, 'info');
          return;
        }
        this.pwOld = this.pwNew = this.pwNew2 = '';
        XB.actions.toast('家长密码已更新', 'lock');
      },
      exportProfileFile() {
        if (!window.XBProfiles) return;
        const text = JSON.stringify(XBProfiles.exportProfile(), null, 2);
        this.backupText = text;
        try {
          const blob = new Blob([text], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'xingban-profile-' + new Date().toISOString().slice(0, 10) + '.json';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 2000);
          XB.actions.toast('当前档案已导出', 'bookmark');
        } catch (e) {
          XB.actions.toast('导出失败，请复制备份码', 'info');
        }
      },
      exportFile() {
        this.backupText = window.XBProfiles ? JSON.stringify(XBProfiles.exportAll(), null, 2) : XB.actions.exportJSON();
        try {
          const blob = new Blob([this.backupText], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'xingban-backup-' + new Date().toISOString().slice(0, 10) + '.json';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 2000);
          XB.actions.toast('备份文件已导出', 'bookmark');
        } catch (e) {
          XB.actions.toast('导出失败，请复制下方备份码', 'info');
        }
      },
      copyBackup() {
        this.backupText = window.XBProfiles ? JSON.stringify(XBProfiles.exportAll(), null, 2) : XB.actions.exportJSON();
        try {
          navigator.clipboard.writeText(this.backupText);
          XB.actions.toast('备份码已复制', 'bookmark');
        } catch (e) {
          XB.actions.toast('请长按选择复制', 'info');
        }
      },
      async importFile(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const text = await file.text();
        let stamp = '';
        try {
          const meta = JSON.parse(text);
          if (meta && meta.exportedAt) stamp = new Date(meta.exportedAt).toLocaleString();
        } catch (e) {}
        const res = window.XBProfiles ? XBProfiles.importAll(text) : XB.actions.importJSON(text);
        if (!res.ok) {
          XB.actions.toast(res.reason, 'info');
          return;
        }
        XB.ui.confirm = {
          title: '恢复备份',
          text: '备份时间：' + (stamp || '未知') + '\\n\\n恢复会覆盖当前所有档案与数据，并重新加载。确定继续吗？',
          okText: '恢复',
          danger: true,
          onOk: () => location.reload(),
        };
        e.target.value = '';
      },
      resetAll() {
        XB.ui.confirm = {
          title: '重置全部数据',
          text: '任务、成长、装扮、家园、成就与记录都会清空，且无法恢复。确定吗？',
          okText: '确定重置',
          danger: true,
          onOk: () => XB.actions.resetAll(),
        };
      },
      prevMonth() {
        this.monthOffset--;
      },
      nextMonth() {
        this.monthOffset++;
      },
      isDoneToday(q) {
        return XB.helpers.isQuestDone(q);
      },
      condName(c) {
        return c === 'review' ? '需审核' : c === 'focus' ? '专注达标' : '直接完成';
      },
      /* ---------------- 重置中心 ---------------- */
      askReset(kind) {
        const map = {
          tasks: {
            title: '重置任务',
            text: '恢复 6 个默认任务，并清除这些任务今天的完成状态与审核记录。\n\n保留：宠物成长、金币、装扮、家园、历史学习记录、家长密码。',
            ok: '恢复默认任务',
            run: () => XB.actions.resetTasks(),
          },
          today: {
            title: '清除今日完成状态',
            text: '只清除今天所有任务的完成勾选与待审核记录，任务本身保留。\n\n保留：宠物、金币、历史记录。',
            ok: '清除',
            run: () => XB.actions.clearTodayQuestState(),
          },
          petAll: {
            title: '重置全部宠物',
            text: '两只宠物回到 1 级、0 经验、60 亲密度，进化与装扮穿戴清空。\n\n保留：任务、金币、学习记录。',
            ok: '重置全部',
            run: () => XB.actions.resetPet('all'),
          },
          petCapy: {
            title: '重置卡卡',
            text: '卡卡回到 1 级、0 经验、60 亲密度，进化与穿搭清空。\n\n不影响米粒、任务与记录。',
            ok: '重置卡卡',
            run: () => XB.actions.resetPet('capybara'),
          },
          petHam: {
            title: '重置米粒',
            text: '米粒回到 1 级、0 经验、60 亲密度，进化与穿搭清空。\n\n不影响卡卡、任务与记录。',
            ok: '重置米粒',
            run: () => XB.actions.resetPet('hamster'),
          },
          coins: {
            title: '金币清零',
            text: '金币归零。\n\n保留：经验、等级、任务、学习记录、奖励记录。',
            ok: '清零金币',
            run: () => XB.actions.resetCoins(),
          },
          inventory: {
            title: '重置道具与家园',
            text: '清空装扮、家具、星屑，并收回已摆放的家具。\n\n保留：金币、任务、宠物成长。',
            ok: '重置道具',
            run: () => XB.actions.resetInventory(),
          },
          redemptions: {
            title: '清除兑换记录',
            text: '清空兑换申请与兑换历史（已扣的金币不退回）。\n\n保留：奖励商店配置、金币余额。',
            ok: '清除记录',
            run: () => XB.actions.resetRedemptions(),
          },
          shop: {
            title: '恢复默认奖励配置',
            text: '兑换商店恢复为 4 个默认奖励，自定义奖励与库存会丢失。',
            ok: '恢复默认',
            run: () => XB.actions.resetRewardConfig(),
          },
          study: {
            title: '清除全部学习记录',
            text: '清空完成记录、专注会话、奖励历史与今日计数，任务设置和宠物保留。',
            ok: '清除记录',
            run: () => XB.actions.resetStudy(),
          },
          approvals: {
            title: '清除审核历史',
            text: '清空已通过 / 已退回的审核记录与待审核提交，任务与奖励不受影响。',
            ok: '清除',
            run: () => XB.actions.clearApprovals(),
          },
          full: {
            title: '完整重置游戏',
            text: '当前档案的宠物、金币、任务完成状态、学习记录、成就、家园装扮、奖励数据全部清空。\n\n保留：家长密码、音乐音效设置、备份功能。\n\n建议先导出备份。',
            ok: '完整重置',
            run: () => XB.actions.resetProfileKeepSettings(),
          },
          factory: {
            title: '恢复出厂设置',
            text: '删除全部学生档案、家长密码、设置与备份记录，应用回到第一次打开的状态。\n\n此操作不可恢复！',
            ok: '恢复出厂',
            run: () => XB.actions.factoryReset(),
          },
        };
        const cfg = map[kind];
        if (!cfg) return;
        XB.ui.confirm = {
          title: cfg.title,
          text: cfg.text,
          okText: cfg.ok,
          danger: true,
          onOk: () => {
            const res = XB.actions.flush && XB.actions.flush();
            const out = cfg.run();
            if (out && out.reload) {
              setTimeout(() => location.reload(), 260);
              return;
            }
            XB.actions.toast(cfg.title + ' 已完成', 'check');
            if (cfg.reload !== false) setTimeout(() => location.reload(), 700);
          },
        };
      },
      /* ---------------- 测试环境 ---------------- */
      testComplete() {
        const res = XB.actions.simulateTask();
        if (!res.ok) {
          XB.actions.toast(res.reason || '没有可完成的任务', 'info');
          return;
        }
        XB.actions.presentResult(res);
      },
      testCoins() {
        XB.actions.simulateCoins(500);
        if (window.XBFX) XBFX.coinFly(8);
        XB.actions.toast('已增加 500 金币（测试）', 'coin');
      },
      testLevel() {
        XB.actions.simulateLevelUp();
        XB.actions.toast('已触发一次互动与成长（测试）', 'sparkle');
      },
      testReset() {
        XB.ui.confirm = {
          title: '重置测试档案',
          text: '当前测试档案的全部数据将清空，正式档案不受影响。',
          okText: '重置',
          danger: true,
          onOk: () => {
            XB.actions.resetProfileKeepSettings();
            setTimeout(() => location.reload(), 300);
          },
        };
      },
    },
    template: `
      <div class="parent-shell">
        <header class="parent-head">
          <div>
            <h1>家长管理中心</h1>
            <p>任务 · 审核 · 奖励 · 记录 · 设置</p>
          </div>
          <div class="parent-head__actions">
            <span v-if="todayPending" class="parent-badge">{{ todayPending }} 项待处理</span>
            <button class="btn btn--sm" @click="exit">退出家长模式</button>
          </div>
        </header>

        <nav class="parent-tabs">
          <button v-for="t in tabs" :key="t.id" :class="{ 'is-on': tab === t.id }" @click="tab = t.id">
            {{ t.name }}<span v-if="t.id === 'review' && pendingApprovals.length" class="parent-tab-dot">{{ pendingApprovals.length }}</span>
          </button>
        </nav>

        <main class="parent-body">
          <!-- 概览 -->
          <template v-if="tab === 'overview'">
            <div class="p-grid">
              <div class="p-stat"><b>{{ stats.tasksToday }}</b><span>今日完成任务</span></div>
              <div class="p-stat"><b>{{ stats.minutesToday }}</b><span>今日专注（分钟）</span></div>
              <div class="p-stat"><b>{{ stats.tasksWeek }}</b><span>本周完成任务</span></div>
              <div class="p-stat"><b>{{ stats.minutesWeek }}</b><span>本周专注（分钟）</span></div>
            </div>
            <section class="p-card" v-if="todayPending">
              <h2>待处理</h2>
              <p class="p-hint">有 {{ pendingApprovals.length }} 个任务等待审核，{{ pendingRedemptions.length }} 个兑换等待确认。</p>
              <button class="btn btn--sm btn--primary" @click="tab = 'review'">去审核</button>
            </section>
            <section class="p-card">
              <h2>宠物状态</h2>
              <div class="p-pets">
                <div v-for="p in pets" :key="p.id" class="p-pet">
                  <b>{{ p.name }}</b>
                  <span>Lv.{{ p.level }} · {{ p.stageName }}</span>
                  <span>亲密度 {{ p.intimacy }}%</span>
                </div>
              </div>
            </section>
            <section class="p-card">
              <h2>今日任务</h2>
              <ul class="p-list">
                <li v-for="q in quests.slice(0, 6)" :key="q.id">
                  <span class="p-dot" :class="{ 'is-done': isDoneToday(q) }"></span>
                  <span class="p-list__title">{{ q.title }}</span>
                  <span class="p-list__meta">{{ catName(q.category) }} · {{ condName(q.condition) }} · {{ isDoneToday(q) ? '已完成' : '待完成' }}</span>
                </li>
              </ul>
              <button class="btn btn--sm btn--primary" @click="newTask">新建任务</button>
            </section>
          </template>

          <!-- 任务 -->
          <template v-else-if="tab === 'tasks'">
            <div class="p-actions"><button class="btn btn--sm btn--primary" @click="newTask">+ 新建任务</button></div>
            <section v-for="q in quests" :key="q.id" class="p-row">
              <div class="p-row__main">
                <b>{{ q.title }}</b>
                <span>{{ catName(q.category) }} · {{ q.minutes }} 分钟 · {{ q.repeat === 'daily' ? '每日' : q.repeat === 'weekly' ? '每周' : '一次' }} · {{ condName(q.condition) }}</span>
                <span class="p-row__reward">经验 +{{ q.exp }} · 金币 +{{ q.coins }}</span>
              </div>
              <button class="btn btn--sm" @click="editTask(q)">调整</button>
              <button class="btn btn--sm" @click="saveTemplateFromTask(q)">存模板</button>
            </section>
            <p v-if="!quests.length" class="p-empty">还没有任务</p>
          </template>

          <!-- 模板 -->
          <template v-else-if="tab === 'templates'">
            <p class="p-hint">模板可以一键加入今日计划，适合每天固定的学习安排。</p>
            <section v-for="t in templates" :key="t.id" class="p-row">
              <div class="p-row__main">
                <b>{{ t.title }}</b>
                <span>{{ catName(t.category) }} · {{ t.minutes }} 分钟</span>
              </div>
              <button class="btn btn--sm btn--primary" @click="applyTemplate(t)">加入今日</button>
              <button class="btn btn--sm" @click="removeTemplate(t)">删除</button>
            </section>
            <p v-if="!templates.length" class="p-empty">还没有模板，可在任务里保存</p>
          </template>

          <!-- 审核 -->
          <template v-else-if="tab === 'review'">
            <section class="p-card">
              <h2>待审核任务（{{ pendingApprovals.length }}）</h2>
              <div v-for="a in pendingApprovals" :key="a.id" class="p-approve">
                <div class="p-approve__main">
                  <b>{{ a.title }}</b>
                  <span>{{ a.date }} · 预计 {{ a.minutes }} 分钟</span>
                </div>
                <button class="btn btn--sm btn--gold" @click="approve(a)">通过并发奖</button>
                <button class="btn btn--sm" @click="reject(a)">退回</button>
              </div>
              <p v-if="!pendingApprovals.length" class="p-empty">没有待审核任务</p>
            </section>
            <section class="p-card">
              <h2>审核记录</h2>
              <ul class="p-list">
                <li v-for="a in decidedApprovals" :key="a.id">
                  <span class="p-dot" :class="{ 'is-done': a.status === 'approved' }"></span>
                  <span class="p-list__title">{{ a.title }}</span>
                  <span class="p-list__meta">{{ a.status === 'approved' ? '已通过' : '已退回' }}</span>
                </li>
                <li v-if="!decidedApprovals.length" class="p-empty">还没有审核记录</li>
              </ul>
            </section>
          </template>

          <!-- 奖励 -->
          <template v-else-if="tab === 'rewards'">
            <section class="p-card">
              <h2>待确认兑换（{{ pendingRedemptions.length }}）</h2>
              <div v-for="r in pendingRedemptions" :key="r.id" class="p-approve">
                <div class="p-approve__main">
                  <b>{{ r.name }}</b>
                  <span>{{ r.date }} · {{ r.cost }} 金币</span>
                </div>
                <button class="btn btn--sm btn--gold" @click="decideRedeem(r, true)">确认兑换</button>
                <button class="btn btn--sm" @click="decideRedeem(r, false)">拒绝</button>
              </div>
              <p v-if="!pendingRedemptions.length" class="p-empty">没有待确认的兑换</p>
            </section>

            <section class="p-card">
              <h2>奖励商店</h2>
              <div v-for="it in shop" :key="it.id" class="p-row">
                <div class="p-row__main">
                  <b>{{ it.name }}</b>
                  <span>{{ it.cost }} 金币 · {{ it.stock > 0 ? '剩余 ' + it.stock : '不限量' }}</span>
                </div>
                <button class="btn btn--sm" @click="removeReward(it)">下架</button>
              </div>
              <div class="p-form">
                <label>名称<input class="input" v-model="newReward.name" maxlength="20" placeholder="例如：周末多玩 30 分钟" /></label>
                <label>金币<input class="input" type="number" min="1" v-model.number="newReward.cost" /></label>
                <label>库存<input class="input" type="number" min="0" v-model.number="newReward.stock" /></label>
              </div>
              <button class="btn btn--sm btn--primary" @click="addReward">上架奖励</button>
            </section>

            <section class="p-card">
              <h2>兑换记录</h2>
              <ul class="p-list">
                <li v-for="r in redeemHistory" :key="r.id">
                  <span class="p-dot" :class="{ 'is-done': r.status === 'approved' }"></span>
                  <span class="p-list__title">{{ r.name }}</span>
                  <span class="p-list__meta">{{ r.status === 'approved' ? '已兑换' : '已拒绝' }}</span>
                </li>
                <li v-if="!redeemHistory.length" class="p-empty">还没有兑换记录</li>
              </ul>
            </section>
          </template>

          <!-- 记录 -->
          <template v-else-if="tab === 'records'">
            <section class="p-card">
              <div class="p-cal-head">
                <button class="btn btn--sm" @click="prevMonth">上一月</button>
                <b>{{ calendar.year }} 年 {{ calendar.month }} 月</b>
                <button class="btn btn--sm" @click="nextMonth">下一月</button>
              </div>
              <div class="p-cal">
                <span v-for="w in weekdays" :key="w" class="p-cal__wd">{{ w }}</span>
                <span v-for="(c, i) in calendar.cells" :key="i" class="p-cal__cell" :class="{ 'is-today': c && c.today, 'has-data': c && c.tasks }">
                  <template v-if="c"><em>{{ c.day }}</em><i v-if="c.tasks" class="p-cal__dot"></i></template>
                </span>
              </div>
            </section>
            <section class="p-card">
              <h2>最近完成</h2>
              <ul class="p-list">
                <li v-for="r in records" :key="r.id">
                  <span class="p-list__title">{{ r.title }}</span>
                  <span class="p-list__meta">{{ r.date }} · {{ r.petName }}</span>
                </li>
                <li v-if="!records.length" class="p-empty">还没有完成记录</li>
              </ul>
            </section>
          </template>

          <!-- 统计 -->
          <template v-else-if="tab === 'stats'">
            <div class="p-grid">
              <div class="p-stat"><b>{{ stats.minutesToday }}</b><span>今日专注</span></div>
              <div class="p-stat"><b>{{ stats.minutesWeek }}</b><span>本周专注</span></div>
              <div class="p-stat"><b>{{ stats.minutesMonth }}</b><span>本月专注</span></div>
              <div class="p-stat"><b>{{ stats.days }}</b><span>学习天数</span></div>
            </div>
            <section class="p-card">
              <h2>学科分布</h2>
              <div v-for="s in stats.subjects" :key="s.id" class="p-bar">
                <span>{{ s.name }}</span>
                <span class="p-bar__track"><i :style="{ width: s.percent + '%' }"></i></span>
                <b>{{ s.count }}</b>
              </div>
            </section>
            <section class="p-card">
              <h2>近 7 天学习时长</h2>
              <div class="p-chart">
                <div v-for="t in stats.trend" :key="t.key" class="p-chart__col">
                  <span class="p-chart__bar" :style="{ height: Math.max(4, Math.round(t.minutes / stats.maxMinutes * 100)) + '%' }"></span>
                  <em>{{ t.label }}</em>
                </div>
              </div>
            </section>
          </template>

          <!-- 目标 -->
          <template v-else-if="tab === 'goals'">
            <section class="p-card">
              <h2>每日学习目标</h2>
              <p class="p-hint">目标会同步到孩子的「今日学习目标」。</p>
              <div class="p-form">
                <label>每日任务数<input class="input" type="number" min="1" max="10" v-model.number="goalTasks" /></label>
                <label>每日专注分钟<input class="input" type="number" min="5" max="180" v-model.number="goalMinutes" /></label>
              </div>
              <button class="btn btn--sm btn--primary" @click="saveGoal">保存目标</button>
            </section>
            <section class="p-card">
              <h2>学习时长限制</h2>
              <p class="p-hint">设为 0 表示不限制；达到上限后孩子端无法再开始新的专注。</p>
              <div class="p-form">
                <label>每日上限（分钟）<input class="input" type="number" min="0" max="600" v-model.number="limit" /></label>
              </div>
              <button class="btn btn--sm btn--primary" @click="saveLimit">保存上限</button>
            </section>
          </template>

          <!-- 档案 -->
          <template v-else-if="tab === 'profiles'">
            <p class="p-hint">每个档案拥有独立的宠物、金币、任务、记录、装扮与家园。切换档案会重新加载应用。</p>
            <section class="p-card">
              <h2>学生档案（{{ profiles.length }}）</h2>
              <div v-for="p in profiles" :key="p.id" class="p-row">
                <div class="p-row__main">
                  <b>{{ p.name }}<span v-if="p.type === 'test'" class="p-badge">测试档案</span><span v-if="p.id === currentProfile.id" class="p-badge p-badge--on">当前</span></b>
                  <span>{{ p.type === 'test' ? '测试环境 · 可随意重置' : '正式学习档案' }}</span>
                </div>
                <template v-if="renaming === p.id">
                  <input class="input p-inline" v-model="renameText" maxlength="12" @keyup.enter="doRename(p)" />
                  <button class="btn btn--sm btn--primary" @click="doRename(p)">保存</button>
                </template>
                <template v-else>
                  <button class="btn btn--sm" @click="startRename(p)">改名</button>
                  <button v-if="p.id !== currentProfile.id" class="btn btn--sm btn--primary" @click="switchProfile(p)">切换</button>
                  <button v-if="p.type === 'test'" class="btn btn--sm" @click="askRemoveProfile(p)">删除</button>
                </template>
              </div>
            </section>
            <section class="p-card">
              <h2>新建档案</h2>
              <div class="p-form">
                <label>名字<input class="input" v-model="newName" maxlength="12" placeholder="例如：小星" /></label>
              </div>
              <div class="p-actions">
                <button class="btn btn--sm btn--primary" @click="createProfile('student')">新建学生档案</button>
                <button class="btn btn--sm" @click="createProfile('test')">新建测试档案</button>
              </div>
              <p class="p-hint">测试档案带明显标记，只用于验证任务、奖励与动画，不会影响正式档案。</p>
            </section>
          </template>

          <!-- 数据 -->
          <template v-else-if="tab === 'data'">
            <p class="p-hint">每一项都是独立操作，只清除列出的范围；执行前建议先导出备份。</p>
            <section class="p-card">
              <h2>任务</h2>
              <div class="p-actions">
                <button class="btn btn--sm" @click="askReset('tasks')">恢复默认任务</button>
                <button class="btn btn--sm" @click="askReset('today')">清除今日完成</button>
                <button class="btn btn--sm" @click="askReset('approvals')">清除审核历史</button>
              </div>
            </section>
            <section class="p-card">
              <h2>宠物</h2>
              <div class="p-actions">
                <button class="btn btn--sm" @click="askReset('petCapy')">重置卡卡</button>
                <button class="btn btn--sm" @click="askReset('petHam')">重置米粒</button>
                <button class="btn btn--sm" @click="askReset('petAll')">重置全部宠物</button>
              </div>
            </section>
            <section class="p-card">
              <h2>金币与奖励</h2>
              <div class="p-actions">
                <button class="btn btn--sm" @click="askReset('coins')">金币清零</button>
                <button class="btn btn--sm" @click="askReset('inventory')">重置道具/家园</button>
                <button class="btn btn--sm" @click="askReset('redemptions')">清除兑换记录</button>
                <button class="btn btn--sm" @click="askReset('shop')">恢复默认奖励</button>
              </div>
            </section>
            <section class="p-card">
              <h2>学习记录</h2>
              <div class="p-actions">
                <button class="btn btn--sm" @click="askReset('study')">清除全部学习记录</button>
              </div>
            </section>
            <section class="p-card p-card--danger">
              <h2>完整重置</h2>
              <p class="p-hint">完整重置保留家长密码、声音设置与备份功能；恢复出厂会清空一切。</p>
              <div class="p-actions">
                <button class="btn btn--sm btn--danger" @click="askReset('full')">完整重置游戏</button>
                <button class="btn btn--sm btn--danger" @click="askReset('factory')">恢复出厂设置</button>
              </div>
            </section>
          </template>

          <!-- 测试 -->
          <template v-else-if="tab === 'tests'">
            <section class="p-card" v-if="isTestProfile">
              <h2>测试工具 · {{ currentProfile.name }}</h2>
              <p class="p-hint">只在测试档案可用，用于快速验证任务、奖励与宠物反馈；不会绕过正式档案的审核规则。</p>
              <div class="p-actions">
                <button class="btn btn--sm btn--primary" @click="testComplete">完成一个任务</button>
                <button class="btn btn--sm" @click="testCoins">+500 金币</button>
                <button class="btn btn--sm" @click="testLevel">触发互动成长</button>
                <button class="btn btn--sm" @click="testReset">重置测试档案</button>
              </div>
            </section>
            <section class="p-card" v-else>
              <h2>测试环境未启用</h2>
              <p class="p-hint">请到「档案」新建一个测试档案，切换过去后再使用测试工具。</p>
              <button class="btn btn--sm btn--primary" @click="tab = 'profiles'">去创建</button>
            </section>
          </template>

          <!-- 设置 -->
          <template v-else>
            <section class="p-card">
              <h2>任务审核方式</h2>
              <div class="p-toggle">
                <button :class="{ 'is-on': approvalMode === 'review' }" @click="setMode('review')">需要家长审核</button>
                <button :class="{ 'is-on': approvalMode === 'auto' }" @click="setMode('auto')">直接完成发奖</button>
              </div>
              <p class="p-hint">「需要审核」时，孩子完成任务会先提交，家长通过后才发奖励。</p>
            </section>

            <section class="p-card">
              <h2>修改家长密码</h2>
              <div class="p-form">
                <label>当前密码<input class="input" type="password" v-model="pwOld" maxlength="20" /></label>
                <label>新密码<input class="input" type="password" v-model="pwNew" maxlength="20" /></label>
                <label>确认新密码<input class="input" type="password" v-model="pwNew2" maxlength="20" /></label>
              </div>
              <button class="btn btn--sm btn--primary" @click="changePw">保存新密码</button>
              <p class="p-hint">密码只保存加盐摘要，不以明文写入配置。</p>
            </section>

            <section class="p-card">
              <h2>数据备份</h2>
              <p class="p-hint">建议每周备份一次。备份包含全部任务、成长、装扮、家园与记录。</p>
              <div class="p-actions">
                <button class="btn btn--sm btn--primary" @click="exportFile">导出备份文件</button>
                <button class="btn btn--sm" @click="copyBackup">复制备份码</button>
                <button class="btn btn--sm" @click="exportProfileFile">只导出当前档案</button>
              </div>
            </section>

            <section class="p-card">
              <h2>数据恢复</h2>
              <p class="p-hint">选择之前导出的 .json 备份文件，恢复后会自动重新加载。</p>
              <label class="p-file">
                <input type="file" accept="application/json,.json" @change="importFile" />
                <span>选择备份文件</span>
              </label>
              <button class="btn btn--sm" @click="resetAll">重置全部数据</button>
            </section>
          </template>
        </main>
      </div>
    `,
  };

  window.XBParentView = XBParentView;
})();
