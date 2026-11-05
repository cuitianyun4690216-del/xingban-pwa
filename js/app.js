/* ==========================================================================
   星伴学园 · 应用外壳
   ========================================================================== */

(function () {
  const { createApp } = Vue;

  /* 极轻的提示音（WebAudio，无素材依赖） */
  let audioCtx = null;
  function tone(freq, at, dur, vol) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime + at);
    gain.gain.exponentialRampToValueAtTime(vol, audioCtx.currentTime + at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + at + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(audioCtx.currentTime + at);
    osc.stop(audioCtx.currentTime + at + dur + 0.05);
  }
  function chime(kind) {
    if (!XB.state.settings.sound) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      if (kind === 'level') {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.5, 0.05));
      } else {
        [659.25, 987.77].forEach((f, i) => tone(f, i * 0.08, 0.36, 0.035));
      }
    } catch (e) {
      /* 静默失败 */
    }
  }

  const XBApp = {
    name: 'XBApp',
    data() {
      return {
        dust: [],
        bgError: false,
        navItems: [
          { id: 'home', label: '学园', icon: 'castle' },
          { id: 'study', label: '学习', icon: 'book' },
          { id: 'pet', label: '宠物', icon: 'paw' },
          { id: 'garden', label: '家园', icon: 'house' },
          { id: 'collection', label: '图鉴', icon: 'tome' },
        ],
      };
    },
    computed: {
      tab() {
        return XB.ui.tab;
      },
      viewComp() {
        return {
          home: window.XBHomeView,
          study: window.XBStudyView,
          pet: window.XBPetView,
          garden: window.XBGardenView,
          collection: window.XBCollectionView,
          explore: window.XBExploreView,
          diary: window.XBDiaryView,
        }[this.tab] || window.XBHomeView;
      },
      navActive() {
        return this.tab === 'explore' || this.tab === 'diary' ? 'home' : this.tab;
      },
      mode() {
        return XB.ui.mode || 'child';
      },
      wardrobeOpen() {
        return XB.ui.wardrobe;
      },
      parentGate() {
        return XB.ui.parentGate;
      },
      redeemOpen() {
        return XB.ui.redeem;
      },
      player() {
        return XB.state.player;
      },
      playerExpPct() {
        return Math.round((this.player.exp / this.player.expMax) * 100);
      },
      avatar() {
        return this.$assets.avatar;
      },
      bg() {
        return this.$assets.background;
      },
      starText() {
        return Number(this.player.stars).toLocaleString('en-US');
      },
      coinText() {
        return Number(this.player.coins).toLocaleString('en-US');
      },
      toast() {
        return XB.ui.toast;
      },
      rewards() {
        return XB.ui.rewards;
      },
      levels() {
        return XB.ui.levels;
      },
      questEditor() {
        return XB.ui.questEditor;
      },
      settingsOpen() {
        return XB.ui.settings;
      },
      confirm() {
        return XB.ui.confirm;
      },
      historyOpen() {
        return XB.ui.history;
      },
      timerRunning() {
        return !!(XB.state.timer && XB.state.timer.running);
      },
      onboarding() {
        return XB.ui.onboarding;
      },
    },
    watch: {
      mode(v) {
        document.body.classList.toggle('parent-mode', v === 'parent');
        this.applyScene();
      },
      tab() {
        this.applyScene();
        this.$nextTick(() => {
          const sc = this.$refs.scroll;
          if (sc) sc.scrollTop = 0;
        });
      },
      'rewards.length'(n, old) {
        if (n > (old || 0)) {
          if (window.XBFX) XBFX.coinFly(6);
          if (window.XBAudio) XBAudio.sfx('quest');
        }
      },
      'levels.length'(n, old) {
        if (n > (old || 0) && window.XBAudio) XBAudio.sfx('levelup');
      },
      timerRunning(v) {
        if (window.XBAudio) XBAudio.duck(!!v);
      },
    },
    mounted() {
      XB.init();
      if (window.XBAudio) {
        XBAudio.init();
        this.applyScene();
      }
      if (window.XBFX) XBFX.init();
      if (!XB.state.flags || !XB.state.flags.onboarded) {
        setTimeout(function () {
          XB.ui.onboarding = true;
        }, 900);
      }
      document.body.classList.toggle('parent-mode', this.mode === 'parent');
      this.buildDust();
      const boot = XB.bootResult();
      if (boot && boot.ok) {
        setTimeout(() => XB.actions.presentResult(boot), 500);
      }
      const urls = [this.$assets.background, this.$assets.avatar];
      ['capybara', 'hamster'].forEach((id) => {
        urls.push(this.$assets.pet(id, 'idle'));
        urls.push(this.$assets.pet(id, 'happy'));
      });
      this.$assets.preload(urls);
    },
    methods: {
      applyScene() {
        if (!window.XBAudio) return;
        const m = XB.ui.mode || 'child';
        const t = this.tab;
        XBAudio.scene(m === 'parent' ? null : t === 'study' ? 'study' : t === 'garden' ? 'garden' : 'home');
      },
      buildDust() {
        const list = [];
        for (let i = 0; i < 16; i++) {
          list.push({
            left: Math.round(Math.random() * 96) + '%',
            top: Math.round(18 + Math.random() * 62) + '%',
            '--s': Math.round(2 + Math.random() * 3) + 'px',
            '--dur': (12 + Math.random() * 10).toFixed(1) + 's',
            '--delay': (Math.random() * 14).toFixed(1) + 's',
            '--drift': Math.round((Math.random() - 0.5) * 46) + 'px',
          });
        }
        this.dust = list;
      },
      go(tab) {
        if (tab === this.tab) return;
        XB.ui.tab = tab;
      },
      openSettings() {
        XB.ui.settings = true;
      },
      closeSettings() {
        XB.ui.settings = false;
      },
      closeEditor() {
        XB.ui.questEditor = null;
      },
      closeConfirm() {
        XB.ui.confirm = null;
      },
      closeHistory() {
        XB.ui.history = false;
      },
    },
    template: `
      <XBParentView v-if="mode === 'parent'" />
      <template v-if="mode === 'parent'">
        <XBQuestEditor v-if="questEditor" />
        <XBConfirm v-if="confirm" />
        <div class="toast-wrap parent-toast">
          <transition name="toast"><XBToast v-if="toast" :data="toast" /></transition>
        </div>
      </template>
      <div v-else class="app-frame">
        <div class="scene" aria-hidden="true">
          <img v-if="!bgError" class="scene__bg" :src="bg" alt="" @error="bgError = true" />
          <div class="scene__glow"></div>
          <div class="scene__veil"></div>
          <div class="scene__dust">
            <span v-for="(d, i) in dust" :key="i" class="dust" :style="d"></span>
          </div>
        </div>
        <div class="grain" aria-hidden="true"></div>

        <header class="hud">
          <XBAvatar :src="avatar" :size="48" />
          <div class="hud__id">
            <div class="hud__top">
              <b class="hud__name">{{ player.name }}</b>
              <span class="hud__title">{{ player.title }}</span>
            </div>
            <div class="hud__lv-row">
              <span class="hud__lv">Lv.{{ player.level }}</span>
              <XBBar :value="playerExpPct" thin class="hud__bar" />
              <span class="hud__exp t-num">{{ player.exp }}/{{ player.expMax }}</span>
            </div>
          </div>
          <div class="hud__pills">
            <span class="pill pill--sun"><XingIcon name="star" :size="14" />{{ starText }}</span>
            <span class="pill"><XingIcon name="coin" :size="14" />{{ coinText }}</span>
            <button class="icon-btn" @click="openSettings" aria-label="设置">
              <XingIcon name="gear" :size="16" />
            </button>
          </div>
        </header>

        <main class="app-scroll" ref="scroll">
          <transition name="view" mode="out-in">
            <component :is="viewComp" :key="tab" />
          </transition>
        </main>

        <nav class="nav" aria-label="主导航">
          <span class="nav__crest"><Orn type="crest" :size="20" /></span>
          <button v-for="item in navItems" :key="item.id" class="nav__item"
                  :class="{ 'is-active': item.id === navActive }"
                  :aria-current="item.id === navActive ? 'page' : undefined"
                  @click="go(item.id)">
            <span class="nav__icon"><XingIcon :name="item.icon" :size="21" /></span>
            <span class="nav__label">{{ item.label }}</span>
          </button>
        </nav>

        <div class="toast-wrap">
          <transition name="toast">
            <XBToast v-if="toast" :data="toast" />
          </transition>
        </div>

        <XBWardrobe v-if="wardrobeOpen" />
        <XBParentGate v-if="parentGate" />
        <XBRedeem v-if="redeemOpen" />
        <XBReward v-if="rewards.length" />
        <XBLevelUp v-if="levels.length" />
        <XBQuestEditor v-if="questEditor" />
        <XBSettings v-if="settingsOpen" />
        <XBConfirm v-if="confirm" />
        <XBHistory v-if="historyOpen" />
        <XBOnboarding v-if="onboarding" @done="onboarding = false" />
      </div>
    `,
  };

  const app = createApp(XBApp);
  app.config.globalProperties.$assets = window.XingAssets;
  app.config.globalProperties.XB = window.XB;

  [
    ['XingIcon', window.XingIcon],
    ['Orn', window.XingOrn],
    ['XingSparkles', window.XingSparkles],
    ['XingPetActor', window.XingPetActor],
    ['XBPanel', window.XBPanel],
    ['XBButton', window.XBButton],
    ['XBBar', window.XBBar],
    ['XBSecHead', window.XBSecHead],
    ['XBAvatar', window.XBAvatar],
    ['XBTag', window.XBTag],
    ['XBToast', window.XBToast],
    ['XBModal', window.XBModal],
    ['XBReward', window.XBReward],
    ['XBLevelUp', window.XBLevelUp],
    ['XBQuestEditor', window.XBQuestEditor],
    ['XBSettings', window.XBSettings],
    ['XBConfirm', window.XBConfirm],
    ['XBHistory', window.XBHistory],
    ['XBWardrobe', window.XBWardrobe],
    ['XBParentGate', window.XBParentGate],
    ['XBOnboarding', window.XBOnboarding],
    ['XBRedeem', window.XBRedeem],
    ['XBCostumeThumb', window.XBCostumeThumb],
    ['XBCostumeLayer', window.XBCostumeLayer],
    ['XBExploreView', window.XBExploreView],
    ['XBDiaryView', window.XBDiaryView],
    ['XBParentView', window.XBParentView],
    ['XingQuestCard', window.XBQuestCard],
    ['XingTimer', window.XBTimer],
    ['XBHomeView', window.XBHomeView],
    ['XBStudyView', window.XBStudyView],
    ['XBPetView', window.XBPetView],
    ['XBGardenView', window.XBGardenView],
    ['XBCollectionView', window.XBCollectionView],
  ].forEach(function (pair) {
    app.component(pair[0], pair[1]);
  });

  app.mount('#app');
})();
