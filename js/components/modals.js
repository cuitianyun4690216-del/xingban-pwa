/* ==========================================================================
   星伴学园 · 弹窗组（奖励 / 升级 / 任务编辑 / 设置 / 确认 / 记录）
   ========================================================================== */

(function () {
  const CAT = window.XB_CATALOG;

  /* ---------------------------- 奖励弹窗 ---------------------------- */
  const XBReward = {
    name: 'XBReward',
    computed: {
      data() {
        return XB.ui.levels.length ? null : XB.ui.rewards[0];
      },
    },
    methods: {
      close() {
        XB.actions.closeReward();
      },
      fmt(n) {
        return Number(n || 0).toLocaleString('en-US');
      },
    },
    template: `
      <div v-if="data" class="modal-mask" @click.self="close">
        <div class="modal modal--reward" role="dialog" :aria-label="data.title">
          <i class="modal__corner modal__corner--tl"><Orn type="corner" :size="26" /></i>
          <i class="modal__corner modal__corner--tr"><Orn type="corner" :size="26" /></i>
          <i class="modal__corner modal__corner--br"><Orn type="corner" :size="26" /></i>
          <i class="modal__corner modal__corner--bl"><Orn type="corner" :size="26" /></i>

          <header class="modal__head reward__head">
            <div class="reward__halo">
              <span class="reward__rays"></span>
              <span class="reward__ring"></span>
              <span class="reward__icon"><XingIcon :name="data.icon" :size="30" /></span>
            </div>
            <h2 class="modal__title">{{ data.title }}</h2>
            <p class="modal__sub">{{ data.subtitle }}</p>
          </header>

          <div class="modal__body">
            <ul class="reward__list">
              <li v-if="data.coins" class="reward__item">
                <span class="reward__item-icon reward__item-icon--coin"><XingIcon name="coin" :size="17" /></span>
                <b>+{{ fmt(data.coins) }}</b>
                <em>金币</em>
              </li>
              <li v-if="data.stars" class="reward__item">
                <span class="reward__item-icon reward__item-icon--star"><XingIcon name="star" :size="17" /></span>
                <b>+{{ fmt(data.stars) }}</b>
                <em>星星</em>
              </li>
              <li v-if="data.petExp" class="reward__item">
                <span class="reward__item-icon reward__item-icon--heart"><XingIcon name="heart" :size="17" /></span>
                <b>+{{ fmt(data.petExp) }}</b>
                <em>{{ data.petName }}经验</em>
              </li>
            </ul>
            <p v-if="data.capped" class="reward__note">今日奖励已达上限，超出部分未计入</p>
          </div>

          <footer class="modal__foot">
            <button class="btn btn--gold btn--block" @click="close">收下</button>
          </footer>
        </div>
      </div>
    `,
  };

  /* ---------------------------- 升级动画 ---------------------------- */
  const XBLevelUp = {
    name: 'XBLevelUp',
    computed: {
      data() {
        return XB.ui.levels[0];
      },
      petImg() {
        return this.data ? this.$assets.pet(this.data.petId, this.data.evolve ? 'evolved' : 'happy') : '';
      },
      sparks() {
        const arr = [];
        for (let i = 0; i < 14; i++) {
          arr.push({
            left: 8 + Math.random() * 84 + '%',
            top: 18 + Math.random() * 52 + '%',
            delay: (Math.random() * 1.2).toFixed(2) + 's',
            size: 5 + Math.round(Math.random() * 7) + 'px',
          });
        }
        return arr;
      },
    },
    methods: {
      close() {
        XB.actions.closeLevelUp();
      },
    },
    template: `
      <div v-if="data" class="lu" role="dialog" aria-label="宠物升级">
        <div class="lu__rays"></div>
        <div class="lu__glow"></div>
        <span v-for="(s, i) in sparks" :key="i" class="lu__spark" :style="{ left: s.left, top: s.top, animationDelay: s.delay, '--s': s.size }"></span>

        <div class="lu__content">
          <div class="lu__pet">
            <img :src="petImg" :alt="data.name" />
          </div>
          <p class="lu__eyebrow">{{ data.evolve ? '形 态 进 化' : '成 长 礼 赞' }}</p>
          <h2 class="lu__title">{{ data.evolve ? data.stageName : 'Lv.' + data.level }}</h2>
          <p class="lu__stage">{{ data.name }} · {{ data.evolve ? 'Lv.' + data.level : data.stageName }}</p>
          <p class="lu__desc">{{ data.evolve ? data.desc : '新的成长阶段已经开启，它想和你继续走下去。' }}</p>
          <button class="btn btn--gold lu__btn" @click="close">继续陪伴</button>
        </div>
      </div>
    `,
  };

  /* ---------------------------- 任务编辑 ---------------------------- */
  const XBQuestEditor = {
    name: 'XBQuestEditor',
    data() {
      const ctx = XB.ui.questEditor;
      const q = ctx && ctx.quest;
      return {
        mode: ctx && ctx.mode ? ctx.mode : 'create',
        form: {
          title: q ? q.title : '',
          category: q ? q.category : 'custom',
          desc: q ? q.desc : '',
          minutes: q ? q.minutes : 20,
          difficulty: q ? q.difficulty : 'easy',
          repeat: q ? q.repeat : 'daily',
          condition: q && q.condition ? q.condition : 'manual',
          minMinutes: q && q.minMinutes ? q.minMinutes : 15,
          exp: q ? q.exp : 40,
          coins: q ? q.coins : 80,
          stars: q ? q.stars : 0,
        },
        autoReward: !q,
        error: '',
      };
    },
    computed: {
      title() {
        return this.mode === 'edit' ? '编辑任务' : '新建任务';
      },
      categories() {
        return CAT.categories;
      },
      difficulties() {
        return CAT.difficulties;
      },
    },
    watch: {
      'form.minutes'() {
        if (this.autoReward) this.recalc();
      },
      'form.difficulty'() {
        if (this.autoReward) this.recalc();
      },
    },
    methods: {
      recalc() {
        const r = XB.actions.questReward(this.form.minutes, this.form.difficulty);
        this.form.exp = r.exp;
        this.form.coins = r.coins;
        this.form.stars = r.stars;
      },
      close() {
        XB.ui.questEditor = null;
      },
      save() {
        if (!this.form.title.trim()) {
          this.error = '给任务起个名字吧';
          return;
        }
        if (this.mode === 'edit') {
          XB.actions.updateQuest(XB.ui.questEditor.quest.id, this.form);
          XB.actions.toast('任务已更新', 'edit');
        } else {
          XB.actions.createQuest(this.form);
          XB.actions.toast('新任务已加入今日计划', 'plus');
        }
        this.close();
      },
      remove() {
        const q = XB.ui.questEditor.quest;
        XB.ui.confirm = {
          title: '删除任务',
          text: '「' + q.title + '」将从计划中移除，已完成的历史记录会保留。',
          okText: '删除',
          danger: true,
          onOk: () => {
            XB.actions.deleteQuest(q.id);
            XB.ui.questEditor = null;
            XB.actions.toast('任务已删除', 'trash');
          },
        };
      },
    },
    template: `
      <div class="modal-mask" @click.self="close">
        <div class="modal" role="dialog" :aria-label="title">
          <i class="modal__corner modal__corner--tl"><Orn type="corner" :size="26" /></i>
          <i class="modal__corner modal__corner--tr"><Orn type="corner" :size="26" /></i>
          <i class="modal__corner modal__corner--br"><Orn type="corner" :size="26" /></i>
          <i class="modal__corner modal__corner--bl"><Orn type="corner" :size="26" /></i>
          <button class="modal__close" aria-label="关闭" @click="close"><XingIcon name="close" :size="13" :stroke-width="2" /></button>

          <header class="modal__head">
            <span class="modal__crest"><Orn type="crest" :size="32" /></span>
            <h2 class="modal__title">{{ title }}</h2>
            <p class="modal__sub">安排一段专注的时间，宠物会一起成长</p>
          </header>

          <div class="modal__body">
            <div class="field">
              <label class="field__label">任务名称 <i>*</i></label>
              <input class="input" v-model="form.title" maxlength="30" placeholder="例如：阅读 30 分钟" />
            </div>

            <div class="field">
              <span class="field__label">任务分类</span>
              <div class="chips">
                <button v-for="c in categories" :key="c.id" class="chip" :class="{ 'is-on': form.category === c.id }"
                        @click="form.category = c.id">{{ c.name }}</button>
              </div>
            </div>

            <div class="field">
              <label class="field__label">任务描述</label>
              <textarea class="textarea" v-model="form.desc" maxlength="80" placeholder="简单描述一下要做的事"></textarea>
            </div>

            <div class="field-row">
              <div class="field">
                <label class="field__label">预计时长（分钟）</label>
                <input class="input" type="number" min="5" max="180" v-model.number="form.minutes" />
              </div>
              <div class="field">
                <label class="field__label">重复规则</label>
                <select class="select" v-model="form.repeat">
                  <option value="daily">每日</option>
                  <option value="weekly">每周</option>
                  <option value="once">仅一次</option>
                </select>
              </div>
            </div>

            <div class="field">
              <span class="field__label">难度</span>
              <div class="chips">
                <button v-for="d in difficulties" :key="d.id" class="chip" :class="{ 'is-on': form.difficulty === d.id }"
                        @click="form.difficulty = d.id">{{ d.name }}</button>
              </div>
            </div>

            <div class="field">
              <span class="field__label">完成方式</span>
              <div class="chips">
                <button class="chip" :class="{ 'is-on': form.condition === 'manual' }" @click="form.condition = 'manual'">直接完成</button>
                <button class="chip" :class="{ 'is-on': form.condition === 'review' }" @click="form.condition = 'review'">需要审核</button>
                <button class="chip" :class="{ 'is-on': form.condition === 'focus' }" @click="form.condition = 'focus'">专注达标</button>
              </div>
            </div>

            <div v-if="form.condition === 'focus'" class="field">
              <label class="field__label">需要专注分钟数</label>
              <input class="input" type="number" min="5" max="180" v-model.number="form.minMinutes" />
            </div>

            <div class="field-row">
              <div class="field">
                <label class="field__label">经验奖励</label>
                <input class="input" type="number" min="0" max="999" v-model.number="form.exp" @input="autoReward = false" />
              </div>
              <div class="field">
                <label class="field__label">金币奖励</label>
                <input class="input" type="number" min="0" max="9999" v-model.number="form.coins" @input="autoReward = false" />
              </div>
            </div>
            <p class="form-hint">奖励会按「时长 × 难度」自动估算，也可以直接修改。</p>
            <p v-if="error" class="form-error">{{ error }}</p>
          </div>

          <footer class="modal__foot">
            <button v-if="mode === 'edit'" class="btn btn--sm" @click="remove">
              <XingIcon name="trash" :size="14" />删除
            </button>
            <button class="btn btn--sm" @click="close">取消</button>
            <button class="btn btn--primary btn--sm" @click="save">保存</button>
          </footer>
        </div>
      </div>
    `,
  };

  /* ---------------------------- 设置 ---------------------------- */
  const XBSettings = {
    name: 'XBSettings',
    computed: {
      settings() {
        return XB.state.settings;
      },
      stats() {
        return {
          days: new Set(XB.state.records.map((r) => r.date)).size,
          minutes: XB.helpers.totalMinutes(),
          tasks: XB.state.records.length,
        };
      },
    },
    methods: {
      close() {
        XB.ui.settings = false;
      },
      toggleSound() {
        XB.state.settings.sound = !XB.state.settings.sound;
        XB.actions.toast(XB.state.settings.sound ? '提示音已开启' : '提示音已关闭', 'bell');
      },
      audioState() {
        return XB.state.settings;
      },
      toggleAudio(key) {
        const s = XB.state.settings;
        s[key] = !s[key];
        if (window.XBAudio) XBAudio.apply(s);
        if (key === 'sfx' && s.sfx && window.XBAudio) XBAudio.sfx('click');
        XB.actions.toast(key === 'bgm' ? (s.bgm ? '背景音乐已开启' : '背景音乐已关闭') : s.sfx ? '音效已开启' : '音效已关闭', 'bell');
      },
      setVolume(key, event) {
        const v = Math.max(0, Math.min(1, Number(event.target.value) / 100));
        XB.state.settings[key] = v;
        if (window.XBAudio) XBAudio.apply(XB.state.settings);
      },
      reset() {
        XB.ui.confirm = {
          title: '重置学园数据',
          text: '所有任务、成长、金币与记录都会被清空，且无法恢复。确定要重新开始吗？',
          okText: '确定重置',
          danger: true,
          onOk: () => XB.actions.resetAll(),
        };
      },
      exportData() {
        const text = JSON.stringify(XB.state);
        navigator.clipboard && navigator.clipboard.writeText(text);
        XB.actions.toast('存档已复制到剪贴板', 'bookmark');
      },
      replayOnboarding() {
        XB.ui.settings = false;
        XB.state.flags.onboarded = false;
        XB.ui.onboarding = true;
      },
      enterParent() {
        XB.ui.settings = false;
        XB.ui.parentGate = true;
      },
    },
    template: `
      <div class="modal-mask" @click.self="close">
        <div class="modal" role="dialog" aria-label="设置">
          <i class="modal__corner modal__corner--tl"><Orn type="corner" :size="26" /></i>
          <i class="modal__corner modal__corner--tr"><Orn type="corner" :size="26" /></i>
          <i class="modal__corner modal__corner--br"><Orn type="corner" :size="26" /></i>
          <i class="modal__corner modal__corner--bl"><Orn type="corner" :size="26" /></i>
          <button class="modal__close" aria-label="关闭" @click="close"><XingIcon name="close" :size="13" :stroke-width="2" /></button>

          <header class="modal__head">
            <span class="modal__crest"><Orn type="crest" :size="32" /></span>
            <h2 class="modal__title">学园设置</h2>
            <p class="modal__sub">声音 · 存档 · 家长模式</p>
          </header>

          <div class="modal__body">
            <div class="set-group">
              <p class="set-group__title">背景音乐</p>
              <div class="set-row">
                <span class="set-row__label"><XingIcon name="sparkle" :size="15" />学园音乐</span>
                <button class="switch" :class="{ 'is-on': settings.bgm }" @click="toggleAudio('bgm')" :aria-pressed="settings.bgm">
                  <span class="switch__dot"></span>
                </button>
              </div>
              <div v-if="settings.bgm" class="set-slider">
                <span>音量</span>
                <input class="range" type="range" min="0" max="100" :value="Math.round((settings.bgmVol || 0.5) * 100)"
                       @input="setVolume('bgmVol', $event)" aria-label="音乐音量" />
                <b>{{ Math.round((settings.bgmVol || 0.5) * 100) }}%</b>
              </div>
              <div class="set-row">
                <span class="set-row__label"><XingIcon name="hourglass" :size="15" />专注时自动降低音乐</span>
                <button class="switch" :class="{ 'is-on': settings.duckTimer !== false }" @click="toggleAudio('duckTimer')" :aria-pressed="settings.duckTimer !== false">
                  <span class="switch__dot"></span>
                </button>
              </div>
            </div>

            <div class="set-group">
              <p class="set-group__title">音效</p>
              <div class="set-row">
                <span class="set-row__label"><XingIcon name="bell" :size="15" />操作音效</span>
                <button class="switch" :class="{ 'is-on': settings.sfx }" @click="toggleAudio('sfx')" :aria-pressed="settings.sfx">
                  <span class="switch__dot"></span>
                </button>
              </div>
              <div v-if="settings.sfx" class="set-slider">
                <span>音量</span>
                <input class="range" type="range" min="0" max="100" :value="Math.round((settings.sfxVol || 0.75) * 100)"
                       @input="setVolume('sfxVol', $event)" aria-label="音效音量" />
                <b>{{ Math.round((settings.sfxVol || 0.75) * 100) }}%</b>
              </div>
            </div>

            <div class="set-stats">
              <div class="set-stat"><b>{{ stats.days }}</b><span>陪伴天数</span></div>
              <div class="set-stat"><b>{{ stats.tasks }}</b><span>完成任务</span></div>
              <div class="set-stat"><b>{{ stats.minutes }}</b><span>专注分钟</span></div>
            </div>

            <div class="set-row">
              <span class="set-row__label"><XingIcon name="bookmark" :size="15" />本地存档</span>
              <button class="btn btn--sm" @click="exportData">复制存档</button>
            </div>

            <div class="set-row">
              <span class="set-row__label"><XingIcon name="sparkle" :size="15" />新手引导</span>
              <button class="btn btn--sm" @click="replayOnboarding">重新观看</button>
            </div>

            <div class="set-row">
              <span class="set-row__label"><XingIcon name="user" :size="15" />家长模式</span>
              <button class="btn btn--sm btn--primary" @click="enterParent">进入</button>
            </div>

            <p class="set-note">数据保存在本机浏览器（localStorage），刷新与重新打开都会保留。</p>

            <button class="btn btn--sm btn--block set-danger" @click="reset">重置学园数据</button>
          </div>

          <footer class="modal__foot">
            <button class="btn btn--primary btn--block" @click="close">完成</button>
          </footer>
        </div>
      </div>
    `,
  };

  /* ---------------------------- 通用确认 ---------------------------- */
  const XBConfirm = {
    name: 'XBConfirm',
    computed: {
      data() {
        return XB.ui.confirm;
      },
    },
    methods: {
      close() {
        XB.ui.confirm = null;
      },
      ok() {
        const fn = XB.ui.confirm && XB.ui.confirm.onOk;
        XB.ui.confirm = null;
        if (fn) fn();
      },
    },
    template: `
      <div v-if="data" class="modal-mask" @click.self="close">
        <div class="modal modal--confirm" role="dialog" :aria-label="data.title">
          <i class="modal__corner modal__corner--tl"><Orn type="corner" :size="22" /></i>
          <i class="modal__corner modal__corner--tr"><Orn type="corner" :size="22" /></i>
          <i class="modal__corner modal__corner--br"><Orn type="corner" :size="22" /></i>
          <i class="modal__corner modal__corner--bl"><Orn type="corner" :size="22" /></i>
          <header class="modal__head">
            <span class="modal__crest"><Orn type="crest" :size="28" /></span>
            <h2 class="modal__title">{{ data.title }}</h2>
          </header>
          <div class="modal__body"><p>{{ data.text }}</p></div>
          <footer class="modal__foot">
            <button class="btn btn--sm" @click="close">取消</button>
            <button class="btn btn--sm" :class="data.danger ? 'btn--danger' : 'btn--primary'" @click="ok">
              {{ data.okText || '确定' }}
            </button>
          </footer>
        </div>
      </div>
    `,
  };

  /* ---------------------------- 记录 ---------------------------- */
  const XBHistory = {
    name: 'XBHistory',
    data() {
      return { tab: 'reward' };
    },
    computed: {
      rewards() {
        return XB.state.rewards.history;
      },
      sessions() {
        return XB.state.sessions;
      },
      records() {
        return XB.state.records;
      },
    },
    methods: {
      close() {
        XB.ui.history = false;
      },
      fmtDate(ts) {
        const d = new Date(ts);
        return d.getMonth() + 1 + '月' + d.getDate() + '日 ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      },
      typeName(t) {
        return { quest: '任务', focus: '专注', daily: '成长奖励' }[t] || '奖励';
      },
    },
    template: `
      <div class="modal-mask" @click.self="close">
        <div class="modal modal--tall" role="dialog" aria-label="记录">
          <i class="modal__corner modal__corner--tl"><Orn type="corner" :size="26" /></i>
          <i class="modal__corner modal__corner--tr"><Orn type="corner" :size="26" /></i>
          <i class="modal__corner modal__corner--br"><Orn type="corner" :size="26" /></i>
          <i class="modal__corner modal__corner--bl"><Orn type="corner" :size="26" /></i>
          <button class="modal__close" aria-label="关闭" @click="close"><XingIcon name="close" :size="13" :stroke-width="2" /></button>

          <header class="modal__head">
            <span class="modal__crest"><Orn type="crest" :size="32" /></span>
            <h2 class="modal__title">星语记录</h2>
            <p class="modal__sub">每一次专注都会被记住</p>
          </header>

          <div class="modal__body">
            <div class="chips history-tabs">
              <button class="chip" :class="{ 'is-on': tab === 'reward' }" @click="tab = 'reward'">奖励记录</button>
              <button class="chip" :class="{ 'is-on': tab === 'focus' }" @click="tab = 'focus'">专注记录</button>
              <button class="chip" :class="{ 'is-on': tab === 'quest' }" @click="tab = 'quest'">任务记录</button>
            </div>

            <ul v-if="tab === 'reward'" class="log">
              <li v-for="r in rewards" :key="r.id" class="log__item">
                <span class="log__badge">{{ typeName(r.type) }}</span>
                <span class="log__main">
                  <b>{{ r.title }}</b>
                  <em>{{ fmtDate(r.ts) }}</em>
                </span>
                <span class="log__gain">
                  <span v-if="r.coins" class="log__num">+{{ r.coins }}<i>金</i></span>
                  <span v-if="r.petExp" class="log__num log__num--exp">+{{ r.petExp }}<i>经</i></span>
                </span>
              </li>
              <li v-if="!rewards.length" class="empty">还没有奖励记录，去完成第一个任务吧</li>
            </ul>

            <ul v-else-if="tab === 'focus'" class="log">
              <li v-for="s in sessions" :key="s.id" class="log__item">
                <span class="log__badge">专注</span>
                <span class="log__main">
                  <b>{{ s.minutes }} 分钟 · {{ s.mode === 'complete' ? '完整完成' : '提前结束' }}</b>
                  <em>{{ fmtDate(s.ts) }}</em>
                </span>
                <span class="log__gain"><span class="log__num log__num--exp">+{{ s.exp }}<i>经</i></span></span>
              </li>
              <li v-if="!sessions.length" class="empty">还没有专注记录</li>
            </ul>

            <ul v-else class="log">
              <li v-for="r in records" :key="r.id" class="log__item">
                <span class="log__badge">{{ r.petName }}</span>
                <span class="log__main">
                  <b>{{ r.title }}</b>
                  <em>{{ r.date }} · {{ r.duration || r.minutes }} 分钟</em>
                </span>
                <span class="log__gain"><span class="log__num">+{{ r.coins }}<i>金</i></span></span>
              </li>
              <li v-if="!records.length" class="empty">还没有完成记录</li>
            </ul>
          </div>

          <footer class="modal__foot">
            <button class="btn btn--block" @click="close">关闭</button>
          </footer>
        </div>
      </div>
    `,
  };

  window.XBReward = XBReward;
  window.XBLevelUp = XBLevelUp;
  window.XBQuestEditor = XBQuestEditor;
  window.XBSettings = XBSettings;
  window.XBConfirm = XBConfirm;
  window.XBHistory = XBHistory;
})();
