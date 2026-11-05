/* ==========================================================================
   星伴学园 · 宠物空间（独立成长 / 互动 / 阶段 / 记录）
   ========================================================================== */

(function () {
  const CAT = window.XB_CATALOG;
  const ACTIONS = [
    { id: 'pet', label: '抚摸', icon: 'hand', state: 'pet' },
    { id: 'feed', label: '喂食', icon: 'leaf', state: 'eat' },
    { id: 'play', label: '玩耍', icon: 'ball', state: 'happy' },
    { id: 'rest', label: '休息', icon: 'moon', state: 'sleep' },
  ];

  const XBPetView = {
    name: 'XBPetView',
    data() {
      return { petState: 'idle', burst: 0, timer: null };
    },
    computed: {
      state() {
        return XB.state;
      },
      petId() {
        return this.state.activePetId;
      },
      petConf() {
        return window.XingPets.byId(this.petId);
      },
      pet() {
        return XB.helpers.petMeta(this.petId);
      },
      mood() {
        return XB.helpers.moodOf(this.pet.mood);
      },
      expPct() {
        return Math.round((this.pet.exp / this.pet.expMax) * 100);
      },
      pets() {
        return ['capybara', 'hamster'].map((id) => {
          const meta = XB.helpers.petMeta(id);
          return Object.assign({}, meta, {
            expPercent: Math.round((meta.exp / meta.expMax) * 100),
            thumb: this.$assets.pet(id, 'idle'),
          });
        });
      },
      stages() {
        const cur = CAT.stageOf(this.pet.level);
        return CAT.stages.map((s) => {
          const name = CAT.stageName(this.petId, s.min);
          return {
            key: s.key,
            name: name,
            range: s.min + (s.min === 1 ? '–4' : '–' + (CAT.stages[CAT.stages.indexOf(s) + 1] ? CAT.stages[CAT.stages.indexOf(s) + 1].min - 1 : '∞')) + ' 级',
            active: s.key === cur.key,
            passed: this.pet.level >= s.min,
          };
        });
      },
      nextStage() {
        const cur = CAT.stageOf(this.pet.level);
        const idx = CAT.stages.indexOf(cur);
        return CAT.stages[idx + 1] || null;
      },
      actions() {
        return ACTIONS;
      },
      interactions() {
        return this.state.pets[this.petId].interactions.slice(0, 6);
      },
      history() {
        return this.state.pets[this.petId].history.slice(0, 4);
      },
      wardrobe() {
        return this.state.pets[this.petId].wardrobe;
      },
      equipped() {
        return XB.helpers.equippedItems(this.petId);
      },
      care() {
        return XB.helpers.careInfo();
      },
      wish() {
        return XB.helpers.wishInfo();
      },
      isEvolved() {
        return XB.helpers.petForm(this.petId) === 'evolved';
      },
      slots() {
        return window.XB_WARDROBE.slots;
      },
      evo() {
        return XB.helpers.evolutionInfo(this.petId);
      },
      evoSteps() {
        return [1, 2, 3].map((n) => {
          const e = window.XB_WORLD.evolution[n];
          return { n: n, name: e.name, level: e.level, dust: e.dust, done: (this.state.evolution[this.petId] || 0) >= n };
        });
      },
    },
    beforeUnmount() {
      clearTimeout(this.timer);
    },
    methods: {
      selectPet(id) {
        XB.actions.setActivePet(id);
        this.petState = 'idle';
        this.burst++;
      },
      onTap() {
        this.burst++;
        const res = XB.actions.interact(this.petId, 'pet');
        if (res.ok) {
          this.setState('pet');
          XB.actions.toast(res.action.line, 'heart');
          XB.actions.presentResult(res);
        }
      },
      openCare() {
        XB.ui.careSheet = true;
      },
      openWardrobe() {
        XB.ui.wardrobe = true;
      },
      slotName(slot) {
        const it = XB.helpers.equippedItem(this.petId, slot);
        return it ? it.name : '未穿戴';
      },
      evolve() {
        const res = XB.actions.evolvePet(this.petId);
        if (!res.ok) {
          XB.actions.toast(res.reason || '还不能进化', 'info');
          return;
        }
        this.burst++;
        XB.actions.pushLevelUp({
          petId: this.petId,
          name: this.pet.name,
          level: this.pet.level,
          stageName: res.stage.name,
          evolve: true,
          desc: res.stage.desc,
        });
        XB.actions.toast('进化成功，解锁了新装扮', 'sparkle');
      },
      care(action) {
        const res = XB.actions.interact(this.petId, action.id);
        if (!res.ok) {
          XB.actions.toast(res.reason || '稍等一会儿再互动吧', 'info');
          return;
        }
        this.burst++;
        this.setState(action.state);
        XB.actions.toast(res.action.line, res.action.icon);
        XB.actions.presentResult(res);
      },
      setState(state) {
        clearTimeout(this.timer);
        this.petState = state;
        this.timer = setTimeout(() => {
          this.petState = 'idle';
        }, 1900);
      },
      timeAgo(ts) {
        const diff = Date.now() - ts;
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前';
        if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小时前';
        return Math.floor(diff / 86400000) + ' 天前';
      },
    },
    template: `
      <section class="page page--pet">
        <header class="page-head">
          <div class="page-head__text">
            <h1 class="page-head__title">宠物空间</h1>
            <p class="page-head__sub">两只小家伙，各自成长</p>
          </div>
          <span class="page-head__badge">
            <XingIcon name="heart" :size="12" />{{ pet.intimacy }}%
          </span>
        </header>

        <div class="switch-row">
          <button v-for="p in pets" :key="p.id" class="pet-card" :class="{ 'is-on': p.id === petId }" @click="selectPet(p.id)">
            <span class="pet-card__thumb"><img :src="p.thumb" :alt="p.name" /></span>
            <span class="pet-card__body">
              <span class="pet-card__name">{{ p.name }}</span>
              <span class="pet-card__sub">{{ p.species }} · Lv.{{ p.level }}</span>
              <XBBar :value="p.expPercent" thin />
            </span>
            <span v-if="p.id === petId" class="pet-card__on"><XingIcon name="check" :size="10" :stroke-width="2.6" /></span>
          </button>
        </div>

        <section class="stage stage--pet">
          <div class="stage__aura"></div>
          <div class="stage__ring"><Orn type="ring" :size="290" /></div>
          <div class="stage__actor">
            <transition name="pet-swap-left" mode="out-in">
              <XingPetActor :key="petId" :pet="petConf" :state="petState" :burst="burst"
                            :evolved="isEvolved" :costumes="equipped" @tap="onTap" />
            </transition>
            <XingSparkles :count="6" />
          </div>
          <div class="stage__podium" aria-hidden="true"><span class="stage__podium-rim"></span></div>
        </section>

        <section class="pet-status panel">
          <i class="panel__corner panel__corner--tl"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--tr"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--br"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--bl"><Orn type="corner" :size="18" /></i>
          <div class="pet-status__head">
            <span class="pet-status__name">{{ pet.name }}</span>
            <span class="pet-status__lv">Lv.{{ pet.level }}</span>
            <span class="pet-status__stage">{{ pet.stageName }}</span>
            <span class="pet-status__mood"><XingIcon :name="mood.icon" :size="12" />{{ mood.name }}</span>
          </div>
          <div class="pet-status__row">
            <span class="pet-status__tag"><XingIcon name="sparkle" :size="11" />成长</span>
            <XBBar :value="expPct" thin />
            <span class="pet-status__num t-num">{{ pet.exp }}/{{ pet.expMax }}</span>
          </div>
          <div class="pet-status__row">
            <span class="pet-status__tag pet-status__tag--heart"><XingIcon name="heart" :size="11" />亲密</span>
            <XBBar :value="pet.intimacy" variant="lav" thin />
            <span class="pet-status__num t-num">{{ pet.intimacy }}%</span>
          </div>
        </section>

        <div class="care-row">
          <button v-for="a in actions" :key="a.id" class="care" :class="{ 'is-on': petState === a.state }" @click="care(a)">
            <span class="care__icon"><XingIcon :name="a.icon" :size="17" /></span>
            <span class="care__label">{{ a.label }}</span>
          </button>
        </div>

        <section class="pet-care">
          <div class="pet-care__head">
            <b>今天的照顾</b>
            <button class="btn btn--sm btn--gold" @click="openCare">喂它</button>
          </div>
          <div class="care-bar">
            <span class="care-bar__label"><XingIcon name="leaf" :size="12" />饱食</span>
            <span class="care-bar__track"><i :style="{ width: care.hunger + '%' }" :class="{ 'is-low': care.hunger < 35 }"></i></span>
            <b>{{ care.hunger }}</b>
          </div>
          <div class="care-bar">
            <span class="care-bar__label"><XingIcon name="heart" :size="12" />心情</span>
            <span class="care-bar__track care-bar__track--mood"><i :style="{ width: care.mood + '%' }"></i></span>
            <b>{{ care.mood }}</b>
          </div>
          <div class="care-bar">
            <span class="care-bar__label"><XingIcon name="moon" :size="12" />精力</span>
            <span class="care-bar__track"><i :style="{ width: care.energy + '%' }"></i></span>
            <b>{{ care.energy }}</b>
          </div>
          <p class="pet-care__wish">{{ wish.done ? '今天的心愿已经满足啦' : '今天想吃：' + wish.food.name }}</p>
        </section>

        <section class="panel dress">
          <i class="panel__corner panel__corner--tl"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--tr"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--br"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--bl"><Orn type="corner" :size="18" /></i>
          <XBSecHead title="装扮" more="打开衣橱" @more="openWardrobe" />
          <div class="dress-slots">
            <div v-for="sl in slots" :key="sl.id" class="dress-slot">
              <span class="dress-slot__icon"><XingIcon :name="sl.icon" :size="14" /></span>
              <div class="dress-slot__body">
                <b>{{ sl.name }}</b>
                <em>{{ slotName(sl.id) }}</em>
              </div>
            </div>
          </div>
        </section>

        <section class="panel evo">
          <i class="panel__corner panel__corner--tl"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--tr"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--br"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--bl"><Orn type="corner" :size="18" /></i>
          <XBSecHead title="进化" />
          <div class="evo-line">
            <span v-for="st in evoSteps" :key="st.n" class="evo-node" :class="{ 'is-done': st.done }">
              <i>{{ st.done ? '✓' : st.n }}</i>
              <b>{{ st.name }}</b>
              <em>Lv.{{ st.level }}</em>
            </span>
          </div>
          <button v-if="evo.can" class="btn btn--gold btn--block evo-btn" @click="evolve">
            <XingIcon name="sparkle" :size="14" />进化 · {{ evo.next.name }}
          </button>
          <p v-else class="evo-tip">{{ evo.reason }}<span v-if="evo.next"> · 星屑 {{ evo.dust }}/{{ evo.next.dust }}</span></p>
        </section>

        <section class="growth panel">
          <i class="panel__corner panel__corner--tl"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--tr"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--br"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--bl"><Orn type="corner" :size="18" /></i>
          <XBSecHead title="成长阶段" />
          <ol class="track">
            <li v-for="s in stages" :key="s.key" class="track__node"
                :class="{ 'is-active': s.active, 'is-passed': s.passed && !s.active }">
              <span class="track__dot"><Orn type="star4" :size="10" /></span>
              <span class="track__name">{{ s.name }}</span>
              <span class="track__range">{{ s.range }}</span>
            </li>
          </ol>
          <p class="growth__desc">
            <span v-if="nextStage">距离下一阶段「{{ nextStage.name }}」还需 {{ nextStage.min - pet.level }} 级</span>
            <span v-else>已经抵达最高成长阶段</span>
          </p>
        </section>

        <section class="history panel">
          <i class="panel__corner panel__corner--tl"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--tr"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--br"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--bl"><Orn type="corner" :size="18" /></i>
          <XBSecHead title="互动记录" />
          <ul class="timeline">
            <li v-for="it in interactions" :key="it.id" class="timeline__item">
              <span class="timeline__dot"><XingIcon :name="it.action === 'feed' ? 'leaf' : it.action === 'play' ? 'ball' : it.action === 'rest' ? 'moon' : 'hand'" :size="12" /></span>
              <span class="timeline__body">{{ it.text }}</span>
              <span class="timeline__time">{{ timeAgo(it.ts) }}</span>
            </li>
            <li v-for="h in history" :key="h.id" class="timeline__item timeline__item--gold">
              <span class="timeline__dot"><XingIcon name="star" :size="12" /></span>
              <span class="timeline__body">{{ h.text }}</span>
              <span class="timeline__time">成长</span>
            </li>
            <li v-if="!interactions.length && !history.length" class="empty">还没有互动记录，去和它打个招呼吧。</li>
          </ul>
        </section>

        <section class="wardrobe panel">
          <i class="panel__corner panel__corner--tl"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--tr"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--br"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--bl"><Orn type="corner" :size="18" /></i>
          <XBSecHead title="装扮" more="后续开放" />
          <div class="wardrobe__slots">
            <span v-for="n in 3" :key="n" class="wardrobe__slot">
              <XingIcon name="lock" :size="15" />
              <em>待解锁</em>
            </span>
          </div>
        </section>
      </section>
    `,
  };

  window.XBPetView = XBPetView;
})();
