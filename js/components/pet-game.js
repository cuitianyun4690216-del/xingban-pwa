/* ==========================================================================
   星伴学园 · 洗澡 / 梳毛小游戏
   ========================================================================== */

(function () {
  const Game = {
    name: 'XBPetGame',
    data() {
      return {
        kind: 'bath',
        bubbles: [],
        strokes: 0,
        done: false,
        startTs: 0,
      };
    },
    computed: {
      data() {
        return XB.ui.petGame || { kind: 'bath' };
      },
      petName() {
        return XB.helpers.petMeta(XB.state.activePetId).name;
      },
      title() {
        return this.data.kind === 'bath' ? '给它洗个香香的澡' : '把毛毛梳顺';
      },
      hint() {
        return this.data.kind === 'bath'
          ? '点掉所有泡泡（' + (this.bubbles.length) + ' 个）'
          : '轻轻梳 ' + (10 - this.strokes) + ' 下';
      },
      progress() {
        if (this.data.kind === 'bath') return this.bubbles.length ? Math.round(((12 - this.bubbles.length) / 12) * 100) : 100;
        return Math.round((this.strokes / 10) * 100);
      },
    },
    mounted() {
      this.startTs = Date.now();
      if (this.data.kind === 'bath') this.spawn();
    },
    methods: {
      spawn() {
        const list = [];
        for (let i = 0; i < 12; i++) {
          list.push({
            id: i,
            x: 8 + Math.random() * 80,
            y: 10 + Math.random() * 72,
            s: 26 + Math.random() * 22,
            d: Math.round(Math.random() * 400),
          });
        }
        this.bubbles = list;
      },
      pop(b) {
        if (this.done) return;
        if (window.XBAudio) XBAudio.sfx('click');
        this.bubbles = this.bubbles.filter((x) => x.id !== b.id);
        if (!this.bubbles.length) this.finish();
      },
      brush() {
        if (this.done) return;
        this.strokes++;
        if (window.XBAudio) XBAudio.sfx('pat');
        if (this.strokes >= 10) this.finish();
      },
      finish() {
        if (this.done) return;
        this.done = true;
        const res = XB.actions.finishCareGame(this.data.kind);
        if (!res.ok) {
          XB.actions.toast(res.reason, 'info');
          return;
        }
        if (window.XBAudio) {
          XBAudio.sfx('quest');
          if (XBAudio.sayRandom) XBAudio.sayRandom(XB.state.activePetId, 'play');
        }
        if (window.XBFX) XBFX.coinFly(3);
      },
      close() {
        XB.ui.petGame = null;
      },
    },
    template: `
      <div class="pg-mask" @click.self="close">
        <div class="pg-card">
          <header class="pg-card__head">
            <b>{{ title }}</b>
            <button class="pg-card__close" @click="close" aria-label="关闭">
              <XingIcon name="close" :size="14" />
            </button>
          </header>
          <p class="pg-card__hint">{{ done ? '好舒服呀～' : hint }}</p>

          <div class="pg-stage" v-if="data.kind === 'bath'">
            <span v-for="b in bubbles" :key="b.id" class="pg-bubble"
                  :style="{ left: b.x + '%', top: b.y + '%', width: b.s + 'px', height: b.s + 'px', animationDelay: b.d + 'ms' }"
                  @click="pop(b)"></span>
            <span class="pg-pet">{{ petName }}</span>
          </div>

          <div class="pg-stage pg-stage--brush" v-else @click="brush">
            <span class="pg-pet pg-pet--brush">{{ petName }}</span>
            <span class="pg-hint">{{ done ? '毛毛顺顺的' : '点这里梳一下' }}</span>
          </div>

          <div class="pg-progress"><i :style="{ width: progress + '%' }"></i></div>

          <footer class="pg-card__foot">
            <button v-if="!done" class="btn btn--sm" @click="close">先不洗了</button>
            <button v-else class="btn btn--sm btn--primary" @click="close">收下这份开心</button>
          </footer>
        </div>
      </div>
    `,
  };
  window.XBPetGame = Game;
})();
