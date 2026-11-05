/* ==========================================================================
   星伴学园 · 喂食面板（应用层弹层）
   ========================================================================== */

(function () {
  const XBCareSheet = {
    name: 'XBCareSheet',
    computed: {
      foods() {
        return XB.helpers.foods();
      },
      care() {
        return XB.helpers.careInfo();
      },
      wish() {
        return XB.helpers.wishInfo();
      },
      coins() {
        return XB.state.player.coins;
      },
    },
    methods: {
      close() {
        XB.ui.careSheet = false;
      },
      feed(food) {
        const res = XB.actions.feedPet(food.id);
        if (!res.ok) {
          XB.actions.toast(res.reason, 'info');
          return;
        }
        if (window.XBAudio && XBAudio.say) XBAudio.say(XB.state.activePetId, 'eat');
        this.close();
        XB.actions.toast(res.wishDone ? '心愿达成！它开心地转了个圈' : res.liked ? '吃得特别香～' : '吃得很满足', 'gift');
        if (window.XBFX) XBFX.coinFly(res.wishDone ? 4 : 2);
      },
    },
    template: `
      <div class="care-sheet" @click.self="close">
        <div class="care-sheet__panel">
          <header class="care-sheet__head">
            <b>给它吃点什么呢</b>
            <button class="care-sheet__close" @click="close" aria-label="关闭">
              <XingIcon name="close" :size="14" />
            </button>
          </header>
          <p class="care-sheet__hint">{{ care.hungry ? '它饿坏了，今天会吃得多一些。' : '选一样它喜欢的吧。' }}</p>
          <ul class="care-list">
            <li v-for="f in foods" :key="f.id" class="care-item">
              <span class="care-item__icon"><XingIcon :name="f.icon" :size="18" /></span>
              <div class="care-item__body">
                <b>{{ f.name }}<em v-if="wish.food.id === f.id" class="care-item__wish">心愿</em></b>
                <span>{{ f.desc }}</span>
              </div>
              <button class="btn btn--sm btn--gold" :disabled="coins < f.cost" @click="feed(f)">{{ f.cost }} 金币</button>
            </li>
          </ul>
          <p class="care-sheet__note">甜品一天最多两份，正餐更顶饱。</p>
        </div>
      </div>
    `,
  };
  window.XBCareSheet = XBCareSheet;
})();
