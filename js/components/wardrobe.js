/* ==========================================================================
   星伴学园 · 装扮衣橱（预览 / 购买 / 装备 / 卸下）
   ========================================================================== */

(function () {
  const WR = window.XB_WARDROBE;

  const XBCostumeThumb = {
    name: 'XBCostumeThumb',
    props: { item: Object, size: { type: Number, default: 54 } },
    template: `
      <span class="cst-thumb" :style="{ width: size + 'px', height: size + 'px', '--tile': item.tile }">
        <svg :viewBox="'0 0 ' + item.art.vb[0] + ' ' + item.art.vb[1]" preserveAspectRatio="xMidYMid meet" v-html="item.art.inner"></svg>
      </span>
    `,
  };

  const XBWardrobe = {
    name: 'XBWardrobe',
    data() {
      return { slot: 'hat', petId: XB.state.activePetId };
    },
    computed: {
      slots() {
        return WR.slots;
      },
      sets() {
        const claimed = XB.state.inventory.setClaimed || [];
        const defs = [
          { id: 'set-academy', name: '星语学院', items: ['hat-wizard', 'glasses-round', 'bag-school', 'pin-star'], coins: 120, stars: 6 },
          { id: 'set-winter', name: '冬日暖意', items: ['hat-winter', 'scarf-snow', 'collar-bell'], coins: 90, stars: 5 },
          { id: 'set-spring', name: '春日花园', items: ['hat-flower', 'bow-lav', 'scarf-star'], coins: 90, stars: 5 },
        ];
        return defs.map((d) => {
          const owned = d.items.filter((id) => this.owns(id)).length;
          return Object.assign({}, d, { owned: owned, done: owned >= d.items.length, claimed: claimed.indexOf(d.id) >= 0 });
        });
      },
      petConf() {
        return window.XingPets.byId(this.petId);
      },
      petMeta() {
        return XB.helpers.petMeta(this.petId);
      },
      equipped() {
        return XB.helpers.equippedItems(this.petId);
      },
      evolved() {
        return XB.helpers.petForm(this.petId) === 'evolved';
      },
      list() {
        return WR.bySlot(this.slot);
      },
      petList() {
        return ['capybara', 'hamster'].map((id) => ({
          id: id,
          name: window.XingPets.byId(id).name,
        }));
      },
      playerCoins() {
        return XB.state.player.coins;
      },
      playerStars() {
        return XB.state.player.stars;
      },
    },
    methods: {
      claimSet(s) {
        if (!s.done) return;
        const inv = XB.state.inventory;
        inv.setClaimed = inv.setClaimed || [];
        if (inv.setClaimed.indexOf(s.id) >= 0) return;
        inv.setClaimed.push(s.id);
        XB.state.player.coins += s.coins;
        XB.state.player.stars += s.stars;
        XB.actions.toast('集齐「' + s.name + '」，奖励已发放', 'star');
        if (window.XBAudio) XBAudio.sfx('unlock');
        if (window.XBFX) XBFX.coinFly(5);
      },
      close() {
        XB.ui.wardrobe = false;
      },
      rarityOf(id) {
        return WR.rarity[id] || WR.rarity.common;
      },
      owns(id) {
        return XB.helpers.ownsCostume(id);
      },
      unlocked(item) {
        return XB.helpers.costumeUnlocked(item);
      },
      isEquipped(item) {
        const eq = XB.helpers.equippedItem(this.petId, item.slot);
        return eq && eq.id === item.id;
      },
      priceText(item) {
        return item.price.currency === 'stars' ? item.price.amount + ' 星星' : item.price.amount + ' 金币';
      },
      buy(item) {
        const res = XB.actions.buyCostume(item.id);
        if (!res.ok) {
          XB.actions.toast(res.reason || '暂时买不了', 'info');
          return;
        }
        XB.actions.toast('获得「' + item.name + '」', 'gift');
        XB.actions.equipCostume(this.petId, item.id);
        XB.actions.toast(item.name + ' 已装备', 'check');
      },
      equip(item) {
        const res = XB.actions.equipCostume(this.petId, item.id);
        if (res.ok) XB.actions.toast('已装备「' + item.name + '」', 'check');
        else XB.actions.toast(res.reason || '无法装备', 'info');
      },
      unequip(item) {
        XB.actions.unequipCostume(this.petId, item.slot);
        XB.actions.toast('已卸下「' + item.name + '」', 'close');
      },
    },
    components: { XBCostumeThumb: XBCostumeThumb },
    template: `
      <div class="modal-mask" @click.self="close">
        <div class="modal modal--wardrobe" role="dialog" aria-label="装扮衣橱">
          <i class="modal__corner modal__corner--tl"><Orn type="corner" :size="30" /></i>
          <i class="modal__corner modal__corner--tr"><Orn type="corner" :size="30" /></i>
          <i class="modal__corner modal__corner--br"><Orn type="corner" :size="30" /></i>
          <i class="modal__corner modal__corner--bl"><Orn type="corner" :size="30" /></i>
          <button class="modal__close" aria-label="关闭" @click="close"><XingIcon name="close" :size="13" :stroke-width="2" /></button>

          <header class="modal__head wd-head">
            <span class="modal__crest"><Orn type="crest" :size="30" /></span>
            <h2 class="modal__title">装扮衣橱</h2>
            <div class="wd-pets">
              <button v-for="p in petList" :key="p.id" class="chip" :class="{ 'is-on': petId === p.id }" @click="petId = p.id">
                {{ p.name }}
              </button>
            </div>
          </header>

          <div class="modal__body">
            <div class="wd-preview">
              <div class="wd-preview__stage">
                <XingPetActor :key="petId" :pet="petConf" state="idle" :burst="0" :evolved="evolved" :costumes="equipped" />
              </div>
              <div class="wd-preview__side">
                <p class="wd-preview__name">{{ petMeta.name }} · Lv.{{ petMeta.level }}</p>
                <p class="wd-preview__sub">已装备 {{ equipped.length }} 件</p>
                <ul class="wd-preview__list">
                  <li v-for="it in equipped" :key="it.id">
                    <span>{{ it.name }}</span>
                    <button class="wd-mini" @click="unequip(it)">卸下</button>
                  </li>
                  <li v-if="!equipped.length" class="wd-empty">还没有穿戴，挑一件试试</li>
                </ul>
              </div>
            </div>

                        <div class="wd-sets">
              <div v-for="s in sets" :key="s.id" class="wd-set" :class="{ 'is-done': s.done }">
                <b>{{ s.name }}</b>
                <span>{{ s.owned }}/{{ s.items.length }}</span>
                <button v-if="s.done && !s.claimed" class="btn btn--sm btn--gold" @click="claimSet(s)">领奖励</button>
                <em v-else-if="s.claimed">已领取</em>
                <i v-else class="wd-set__bar"><i :style="{ width: Math.round(s.owned / s.items.length * 100) + '%' }"></i></i>
              </div>
            </div>

            <div class="chips wd-slots">
              <button v-for="sl in slots" :key="sl.id" class="chip" :class="{ 'is-on': slot === sl.id }" @click="slot = sl.id">
                {{ sl.name }}
              </button>
            </div>

            <div class="wd-grid">
              <article v-for="it in list" :key="it.id" class="wd-item" :class="{ 'is-owned': owns(it.id), 'is-locked': !unlocked(it) }">
                <XBCostumeThumb :item="it" :size="48" />
                <div class="wd-item__body">
                  <div class="wd-item__row">
                    <b>{{ it.name }}</b>
                    <span class="wd-rarity" :style="{ color: rarityOf(it.rarity).color }">{{ rarityOf(it.rarity).name }}</span>
                  </div>
                  <p class="wd-item__desc">{{ it.desc }}</p>
                  <p v-if="!unlocked(it)" class="wd-item__lock"><XingIcon name="lock" :size="10" />{{ it.unlock.text }}</p>
                  <div class="wd-item__actions">
                    <template v-if="!owns(it.id)">
                      <button v-if="unlocked(it)" class="btn btn--sm btn--gold" @click="buy(it)">{{ priceText(it) }}</button>
                      <button v-else class="btn btn--sm" disabled>未解锁</button>
                    </template>
                    <template v-else-if="isEquipped(it)">
                      <button class="btn btn--sm" @click="unequip(it)">卸下</button>
                    </template>
                    <template v-else>
                      <button class="btn btn--sm btn--primary" @click="equip(it)">装备</button>
                    </template>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <footer class="modal__foot">
            <div class="wd-wallet">
              <span class="pill"><XingIcon name="coin" :size="13" />{{ playerCoins }}</span>
              <span class="pill pill--sun"><XingIcon name="star" :size="13" />{{ playerStars }}</span>
            </div>
          </footer>
        </div>
      </div>
    `,
  };


  window.XBCostumeThumb = XBCostumeThumb;
  window.XBWardrobe = XBWardrobe;
})();
