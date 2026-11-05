/* ==========================================================================
   星伴学园 · 奇遇弹层
   ========================================================================== */

(function () {
  const XBEncounter = {
    name: 'XBEncounter',
    computed: {
      data() {
        return XB.ui.encounter;
      },
    },
    methods: {
      pick(opt, i) {
        if (this.data.result) return;
        const res = XB.actions.chooseEncounter(i);
        if (!res.ok) return;
        if (window.XBAudio) XBAudio.sfx('quest');
        if (res.reward && res.reward.coins && window.XBFX) XBFX.coinFly(3);
      },
      close() {
        XB.actions.closeEncounter();
      },
    },
    template: `
      <div class="enc-mask" @click.self="close">
        <div class="enc-card" role="dialog" aria-label="小奇遇">
          <div class="enc-card__art">
            <span class="enc-card__star"><Orn type="star4" :size="26" /></span>
            <span class="enc-card__glow"></span>
          </div>
          <div class="enc-card__body">
            <p class="enc-card__kicker">今日小奇遇</p>
            <h2 class="enc-card__title">{{ data.title }}</h2>
            <p class="enc-card__text">{{ data.text }}</p>

            <div v-if="!data.result" class="enc-card__options">
              <button v-for="(o, i) in data.options" :key="i" class="enc-opt" @click="pick(o, i)">
                <span class="enc-opt__dot"></span>{{ o.label }}
              </button>
            </div>

            <div v-else class="enc-card__result">
              <p>{{ data.result }}</p>
              <button class="btn btn--primary btn--sm" @click="close">记住这一刻</button>
            </div>
          </div>
        </div>
      </div>
    `,
  };
  window.XBEncounter = XBEncounter;
})();
