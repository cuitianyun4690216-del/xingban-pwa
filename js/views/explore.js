/* ==========================================================================
   星伴学园 · 探索地图
   ========================================================================== */

(function () {
  const XBExploreView = {
    name: 'XBExploreView',
    data() {
      return { selected: null };
    },
    computed: {
      regions() {
        return XB.helpers.regionList();
      },
      cleared() {
        return this.regions.filter((r) => r.cleared).length;
      },
      selectedRegion() {
        return this.selected ? this.regions.find((r) => r.id === this.selected) : null;
      },
    },
    methods: {
      back() {
        XB.ui.tab = 'home';
      },
      open(r) {
        this.selected = r.id;
      },
      claim(r) {
        const res = XB.actions.claimRegion(r.id);
        if (!res.ok) {
          XB.actions.toast(res.reason || '还没解锁', 'lock');
          return;
        }
        XB.actions.pushReward({
          kind: 'region',
          title: '探索完成',
          subtitle: r.name,
          icon: 'flag',
          coins: res.reward.coins,
          stars: res.reward.stars,
          petExp: 0,
          capped: false,
        });
      },
      close() {
        this.selected = null;
      },
    },
    template: `
      <section class="page page--explore">
        <header class="page-head">
          <button class="icon-btn" @click="back" aria-label="返回"><XingIcon name="chevronLeft" :size="16" /></button>
          <div class="page-head__text">
            <h1 class="page-head__title">探索地图</h1>
            <p class="page-head__sub">已探索 {{ cleared }} / {{ regions.length }} 个区域</p>
          </div>
        </header>

        <section class="map panel">
          <i class="panel__corner panel__corner--tl"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--tr"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--br"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--bl"><Orn type="corner" :size="18" /></i>
          <span class="map__path"></span>
          <div class="map__nodes">
            <button v-for="(r, i) in regions" :key="r.id" class="map-node"
                    :class="{ 'is-locked': !r.unlocked, 'is-cleared': r.cleared }"
                    @click="open(r)">
              <span class="map-node__art" :style="r.image ? { backgroundImage: 'url(' + r.image + ')' } : { background: r.tint }">
                <XingIcon v-if="!r.image" :name="r.motif" :size="22" />
                <XingIcon v-if="!r.unlocked" name="lock" :size="14" class="map-node__lock" />
                <XingIcon v-if="r.cleared" name="check" :size="14" class="map-node__check" />
              </span>
              <span class="map-node__text">
                <span class="map-node__name">{{ r.name }}</span>
                <span class="map-node__desc">{{ r.cond.text }}</span>
                <span class="map-node__state">{{ r.cleared ? '已探索' : (r.unlocked ? '可探索' : r.percent + '%') }}</span>
              </span>
            </button>
          </div>
        </section>

        <section class="panel map-list">
          <i class="panel__corner panel__corner--tl"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--tr"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--br"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--bl"><Orn type="corner" :size="18" /></i>
          <XBSecHead title="区域档案" />
          <ul class="region-list">
            <li v-for="r in regions" :key="r.id" class="region-row" :class="{ 'is-locked': !r.unlocked }">
              <span class="region-row__dot"><XingIcon :name="r.cleared ? 'check' : (r.unlocked ? 'flag' : 'lock')" :size="12" /></span>
              <div class="region-row__body">
                <b>{{ r.name }}</b>
                <em>{{ r.cond.text }}</em>
                <XBBar v-if="!r.cleared" :value="r.percent" thin />
              </div>
              <span class="region-row__state">{{ r.cleared ? '完成' : r.progress + '/' + r.target }}</span>
            </li>
          </ul>
        </section>

        <div v-if="selectedRegion" class="modal-mask" @click.self="close">
          <article class="modal region-sheet">
            <i class="modal__corner modal__corner--tl"><Orn type="corner" :size="30" /></i>
            <i class="modal__corner modal__corner--tr"><Orn type="corner" :size="30" /></i>
            <i class="modal__corner modal__corner--br"><Orn type="corner" :size="30" /></i>
            <i class="modal__corner modal__corner--bl"><Orn type="corner" :size="30" /></i>
            <button class="modal__close" aria-label="关闭" @click="close"><XingIcon name="close" :size="13" :stroke-width="2" /></button>
            <div class="region-sheet__art" :style="selectedRegion.image ? { backgroundImage: 'url(' + selectedRegion.image + ')' } : { background: selectedRegion.tint }">
              <XingIcon v-if="!selectedRegion.image" :name="selectedRegion.motif" :size="46" />
            </div>
            <div class="region-sheet__body">
              <h2>{{ selectedRegion.name }}</h2>
              <p>{{ selectedRegion.desc }}</p>
              <p class="region-sheet__cond">{{ selectedRegion.cond.text }} · {{ selectedRegion.progress }}/{{ selectedRegion.target }}</p>
              <button v-if="selectedRegion.unlocked && !selectedRegion.cleared" class="btn btn--gold btn--block" @click="claim(selectedRegion)">
                探索并领取奖励
              </button>
              <button v-else-if="selectedRegion.cleared" class="btn btn--block" disabled>已经探索过这里</button>
              <button v-else class="btn btn--block" disabled>还需完成条件</button>
            </div>
          </article>
        </div>
      </section>
    `,
  };

  window.XBExploreView = XBExploreView;
})();
