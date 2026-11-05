/* ==========================================================================
   星伴学园 · 学习空间（任务 + 专注计时 + 记录）
   ========================================================================== */

(function () {
  const XBStudyView = {
    name: 'XBStudyView',
    data() {
      return { filter: 'today' };
    },
    computed: {
      state() {
        return XB.state;
      },
      goal() {
        return XB.helpers.goal();
      },
      today() {
        const d = new Date();
        const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
        return d.getMonth() + 1 + ' 月 ' + d.getDate() + ' 日 · 周' + week;
      },
      todayGain() {
        return XB.helpers.todayGain();
      },
      todayMinutes() {
        return XB.helpers.todayMinutes();
      },
      list() {
        const all = this.state.quests.filter((q) => !q.archived);
        if (this.filter === 'all') return all;
        if (this.filter === 'done') return all.filter((q) => XB.helpers.isQuestDone(q));
        return XB.helpers.todayQuests();
      },
      recent() {
        return XB.helpers.recentRecords(5);
      },
      stats() {
        return XB.helpers.stats();
      },
      subjects() {
        const list = this.stats.subjects.filter((s) => s.count > 0);
        return list.length ? list : this.stats.subjects.slice(0, 4);
      },
      doneCount() {
        return this.list.filter((q) => XB.helpers.isQuestDone(q)).length;
      },
    },
    methods: {
      setFilter(f) {
        this.filter = f;
      },
      isDone(q) {
        return XB.helpers.isQuestDone(q);
      },
      complete(q) {
        const res = XB.actions.submitQuest(q.id);
        if (!res.ok) {
          XB.actions.toast(res.reason || '暂时无法完成', 'info');
          return;
        }
        if (res.pending) {
          XB.actions.toast('已提交，等家长确认后发放奖励', 'clock');
          return;
        }
        XB.actions.presentResult(res);
      },
      open(q) {
        XB.actions.toast('任务由家长设置，需要修改请进入家长模式', 'lock');
      },
      undo(q) {
        XB.ui.confirm = {
          title: '取消完成',
          text: '「' + q.title + '」将恢复为未完成，本次获得的经验、金币与亲密度会一并撤回。',
          okText: '取消完成',
          onOk: () => {
            const res = XB.actions.undoQuest(q.id);
            if (res.ok) XB.actions.toast('已取消完成', 'check');
            else XB.actions.toast(res.reason || '无法取消', 'info');
          },
        };
      },
      add() {
        XB.ui.questEditor = { mode: 'create', quest: null };
      },
      goHome() {
        XB.ui.tab = 'home';
      },
      go(tab) {
        XB.ui.tab = tab;
      },
      openHistory() {
        XB.ui.history = true;
      },
    },
    template: `
      <section class="page page--study">
        <header class="page-head">
          <div class="page-head__text">
            <h1 class="page-head__title">学习空间</h1>
            <p class="page-head__sub">{{ today }} · 今日专注 {{ todayMinutes }} 分钟</p>
          </div>
          <button class="icon-btn" @click="openHistory" aria-label="查看记录">
            <XingIcon name="scroll" :size="17" />
          </button>
        </header>

        <XingTimer />

        <section class="goal-card panel">
          <i class="panel__corner panel__corner--tl"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--tr"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--br"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--bl"><Orn type="corner" :size="18" /></i>
          <div class="goal-card__head">
            <span class="goal-card__title"><XingIcon name="crown" :size="14" />今日目标</span>
            <span class="goal-card__pct t-num">{{ goal.percent }}%</span>
          </div>
          <XBBar :value="goal.percent" />
          <div class="goal-card__stats">
            <span><b>{{ goal.done }}</b> / {{ goal.total }} 项</span>
            <i class="dot"></i>
            <span>经验 +{{ todayGain.exp }}</span>
            <i class="dot"></i>
            <span>金币 +{{ todayGain.coins }}</span>
          </div>
        </section>

        <section class="panel stat-panel">
          <i class="panel__corner panel__corner--tl"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--tr"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--br"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--bl"><Orn type="corner" :size="18" /></i>
          <XBSecHead title="学习统计" more="成长日记" @more="go('diary')" />
          <div class="stat-grid">
            <div class="stat-cell"><b>{{ stats.minutesToday }}</b><span>今日分钟</span></div>
            <div class="stat-cell"><b>{{ stats.minutesWeek }}</b><span>本周分钟</span></div>
            <div class="stat-cell"><b>{{ stats.minutesMonth }}</b><span>本月分钟</span></div>
            <div class="stat-cell"><b>{{ stats.tasksAll }}</b><span>累计任务</span></div>
          </div>
          <div class="week-chart">
            <div v-for="t in stats.trend" :key="t.key" class="week-bar">
              <span class="week-bar__col">
                <i :style="{ height: Math.max(6, Math.round(t.minutes / stats.maxMinutes * 100)) + '%' }"></i>
              </span>
              <em>{{ t.label }}</em>
              <span class="week-bar__num">{{ t.minutes }}</span>
            </div>
          </div>
          <div class="subject-chart">
            <div v-for="s in subjects" :key="s.id" class="subject-row">
              <span class="subject-row__name">{{ s.name }}</span>
              <span class="subject-row__track"><i :style="{ width: Math.max(4, s.percent) + '%' }"></i></span>
              <b>{{ s.count }}</b>
            </div>
          </div>
        </section>

        <div class="toolbar">          <div class="chips">
            <button class="chip" :class="{ 'is-on': filter === 'today' }" @click="setFilter('today')">今日</button>
            <button class="chip" :class="{ 'is-on': filter === 'all' }" @click="setFilter('all')">全部</button>
            <button class="chip" :class="{ 'is-on': filter === 'done' }" @click="setFilter('done')">已完成</button>
          </div>

        </div>

        <div class="task-list">
          <XingQuestCard v-for="q in list" :key="q.id" :quest="q" :done="isDone(q)" :pending="XB.helpers.isPending(q)"
                         @complete="complete" @open="open" @undo="undo" />
          <div v-if="!list.length" class="empty panel">
            <Orn type="crest" :size="34" class="empty__icon" />
            <p v-if="filter === 'done'">还没有完成的任务，今天可以从一个小目标开始。</p>
            <p v-else>今天还没有任务，等家长安排新的学习计划吧。</p>
          </div>
        </div>

        <section class="recent-block">
          <XBSecHead title="最近记录" more="全部记录" @more="openHistory" />
          <ul class="log">
            <li v-for="r in recent" :key="r.id" class="log__item">
              <span class="log__badge">{{ r.petName }}</span>
              <span class="log__main">
                <b>{{ r.title }}</b>
                <em>{{ r.date }} · {{ r.minutes }} 分钟</em>
              </span>
              <span class="log__gain">
                <span class="log__num">+{{ r.coins }}<i>金</i></span>
                <span class="log__num log__num--exp">+{{ r.exp }}<i>经</i></span>
              </span>
            </li>
            <li v-if="!recent.length" class="empty">完成任务后，这里会留下今天的星光。</li>
          </ul>
        </section>
      </section>
    `,
  };

  window.XBStudyView = XBStudyView;
})();
