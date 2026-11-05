/* ==========================================================================
   星伴学园 · 顶部状态栏
   ========================================================================== */

(function () {
  const TopBar = {
    name: 'TopBar',
    props: {
      player: { type: Object, required: true },
    },
    emits: ['settings', 'profile'],
    computed: {
      initial() {
        return (this.player.name || '星').slice(0, 1);
      },
      starText() {
        return this.player.stars > 9999 ? (this.player.stars / 1000).toFixed(1) + 'k' : this.player.stars;
      },
      coinText() {
        return this.player.coins > 9999 ? (this.player.coins / 1000).toFixed(1) + 'k' : this.player.coins;
      },
    },
    template: `
      <header class="topbar">
        <button class="player glass" @click="$emit('profile')" aria-label="查看我的资料">
          <span class="player__avatar" aria-hidden="true">{{ initial }}</span>
          <span class="player__meta">
            <strong class="player__name">{{ player.name }}</strong>
            <em class="player__lv">Lv.{{ player.level }}</em>
          </span>
        </button>

        <div class="topbar__right">
          <div class="wallet glass" aria-label="星星与金币">
            <span class="wallet__item">
              <XingIcon name="star" class="wallet__icon--sun" :size="15" />
              <b>{{ starText }}</b>
            </span>
            <i class="wallet__split" aria-hidden="true"></i>
            <span class="wallet__item">
              <XingIcon name="coin" class="wallet__icon--coin" :size="15" />
              <b>{{ coinText }}</b>
            </span>
          </div>
          <button class="icon-btn glass" @click="$emit('settings')" aria-label="设置">
            <XingIcon name="gear" :size="18" />
          </button>
        </div>
      </header>
    `,
  };

  window.XingTopBar = TopBar;
})();
