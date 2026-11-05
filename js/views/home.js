/* ==========================================================================
   星伴学园 · 学园首页
   ========================================================================== */

(function () {
  const SPEECH = {
    capybara: ['今天的云很好看。', '慢慢来，也会到的。', '要不要一起读一会儿书？', '我在这儿，不着急。'],
    hamster: ['刚刚发现一颗瓜子！', '今天学什么呀？', '我陪你一起！', '冲呀，先把小任务做完～'],
  };

  const XBHomeView = {
    name: 'XBHomeView',
    data() {
      return {
        petState: 'idle',
        burst: 0,
        speechIndex: 0,
        stateTimer: null,
        speechTimer: null,
      };
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
      goal() {
        return XB.helpers.goal();
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
      previewQuests() {
        const qs = XB.helpers.todayQuests();
        const done = qs.filter((q) => XB.helpers.isQuestDone(q));
        const todo = qs.filter((q) => !XB.helpers.isQuestDone(q));
        return todo.concat(done).slice(0, 3);
      },
      chestClaimed() {
        return XB.helpers.isChestClaimed();
      },
      equipped() {
        return XB.helpers.equippedItems(this.petId);
      },
      isEvolved() {
        return XB.helpers.petForm(this.petId) === 'evolved';
      },
      speech() {
        const lines = SPEECH[this.petId] || SPEECH.capybara;
        return lines[this.speechIndex % lines.length];
      },
    },
    mounted() {
      this.speechTimer = setInterval(() => {
        this.speechIndex++;
      }, 14000);
    },
    beforeUnmount() {
      clearInterval(this.speechTimer);
      clearTimeout(this.stateTimer);
    },
    methods: {
      go(tab) {
        XB.ui.tab = tab;
      },
      selectPet(id) {
        if (id === this.petId) return;
        XB.actions.setActivePet(id);
        clearTimeout(this.stateTimer);
        this.petState = 'idle';
        this.speechIndex++;
        this.burst++;
        XB.actions.toast(this.pet.name + ' 换到了舞台上', 'sparkle');
      },
      setState(state, duration) {
        clearTimeout(this.stateTimer);
        this.petState = state;
        if (duration) {
          this.stateTimer = setTimeout(() => {
            this.petState = 'idle';
          }, duration);
        }
      },
      onPetTap() {
        this.burst++;
        this.speechIndex++;
        this.setState('happy', 2000);
      },
      complete(quest) {
        const res = XB.actions.submitQuest(quest.id);
        if (!res.ok) {
          XB.actions.toast(res.reason || '暂时无法完成', 'info');
          return;
        }
        if (res.pending) {
          XB.actions.toast('已提交，等家长确认后发放奖励', 'clock');
          return;
        }
        this.burst++;
        XB.actions.presentResult(res);
      },
      openQuest(quest) {
        XB.actions.toast('任务由家长设置，需要修改请进入家长模式', 'lock');
      },
      undoQuest(quest) {
        XB.ui.confirm = {
          title: '取消完成',
          text: '「' + quest.title + '」将恢复为未完成，本次获得的奖励会一并撤回。',
          okText: '取消完成',
          onOk: () => {
            const res = XB.actions.undoQuest(quest.id);
            if (res.ok) XB.actions.toast('已取消完成', 'check');
            else XB.actions.toast(res.reason || '无法取消', 'info');
          },
        };
      },
      claimChest() {
        const res = XB.actions.claimDailyChest();
        if (!res.ok) {
          XB.actions.toast(res.reason, 'info');
          return;
        }
        this.burst++;
        XB.actions.presentResult(res);
      },
      openHistory() {
        XB.ui.history = true;
      },
      openSettings() {
        XB.ui.settings = true;
      },
      openRedeem() {
        XB.ui.redeem = true;
      },
    },
    template: `
      <section class="page page--home">
        <button class="goal" @click="go('study')" aria-label="查看今日学习目标">
          <span class="goal__crown"><XingIcon name="crown" :size="15" /></span>
          <span class="goal__body">
            <span class="goal__label">今日学习目标</span>
            <span class="goal__main">完成 <b>{{ goal.done }}</b> / {{ goal.total }} 项</span>
            <XBBar :value="goal.percent" thin />
          </span>
          <span class="goal__pct t-num">{{ goal.percent }}%</span>
          <XingIcon name="chevronRight" :size="14" class="goal__arrow" />
        </button>

        <section class="stage">
          <div class="stage__aura"></div>
          <div class="stage__ring"><Orn type="ring" :size="300" /></div>

          <div class="stage__actor">
            <transition :name="'pet-swap-' + 'left'" mode="out-in">
              <XingPetActor :key="petId" :pet="petConf" :state="petState" :burst="burst"
                            :evolved="isEvolved" :costumes="equipped" @tap="onPetTap" />
            </transition>
            <XingSparkles :count="7" />
          </div>

          <div class="stage__podium" aria-hidden="true"><span class="stage__podium-rim"></span></div>

          <transition name="speech">
            <div class="speech" role="status">
              <span class="speech__text">{{ speech }}</span>
              <span class="speech__tail"></span>
            </div>
          </transition>

          <div class="rail">
            <button class="rail__btn" @click="claimChest" aria-label="领取成长奖励">
              <XingIcon name="gift" :size="17" />
              <span>{{ chestClaimed ? '已领' : '奖励' }}</span>
            </button>
            <button class="rail__btn" @click="openHistory" aria-label="查看奖励记录">
              <XingIcon name="chest" :size="17" />
              <span>记录</span>
            </button>
            <button class="rail__btn" @click="openSettings" aria-label="设置">
              <XingIcon name="bell" :size="17" />
              <span>设置</span>
            </button>
          </div>
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

        <div class="switch-row">
          <button v-for="p in pets" :key="p.id" class="pet-card" :class="{ 'is-on': p.id === petId }"
                  @click="selectPet(p.id)">
            <span class="pet-card__thumb"><img :src="p.thumb" :alt="p.name" /></span>
            <span class="pet-card__body">
              <span class="pet-card__name">{{ p.name }}</span>
              <span class="pet-card__sub">{{ p.species }} · Lv.{{ p.level }}</span>
              <XBBar :value="p.expPercent" thin />
            </span>
            <span v-if="p.id === petId" class="pet-card__on"><XingIcon name="check" :size="10" :stroke-width="2.6" /></span>
          </button>
        </div>

        <section class="tasks-block">
          <XBSecHead title="今日学习任务" more="查看全部" @more="go('study')" />
          <div class="task-list">
            <XingQuestCard v-for="q in previewQuests" :key="q.id" :quest="q"
                           :done="XB.helpers.isQuestDone(q)" :pending="XB.helpers.isPending(q)" compact
                           @complete="complete" @open="openQuest" @undo="undoQuest" />
          </div>
          <button class="btn btn--primary btn--block tasks-cta" @click="go('study')">
            <XingIcon name="book" :size="15" />开始学习
          </button>
        </section>

        <div class="action-grid">
          <button class="action-card" @click="go('pet')">
            <span class="action-card__icon"><XingIcon name="paw" :size="18" /></span>
            <span class="action-card__body"><b>宠物互动</b><em>和它们一起玩</em></span>
          </button>
          <button class="action-card" @click="claimChest">
            <span class="action-card__icon action-card__icon--gold"><XingIcon name="chest" :size="18" /></span>
            <span class="action-card__body"><b>成长奖励</b><em>{{ chestClaimed ? '今日已领取' : '领取今日奖励' }}</em></span>
          </button>
          <button class="action-card" @click="go('explore')">
            <span class="action-card__icon action-card__icon--blue"><XingIcon name="flag" :size="18" /></span>
            <span class="action-card__body"><b>探索地图</b><em>去学园外面看看</em></span>
          </button>
          <button class="action-card" @click="openRedeem">
            <span class="action-card__icon action-card__icon--rose"><XingIcon name="gift" :size="18" /></span>
            <span class="action-card__body"><b>奖励兑换</b><em>用金币换小奖励</em></span>
          </button>
        </div>
      </section>
    `,
  };

  window.XBHomeView = XBHomeView;
})();
