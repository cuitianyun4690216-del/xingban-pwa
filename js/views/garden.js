/* ==========================================================================
   星伴学园 · 星宠家园（场景 / 家具摆放 / 商店 / 等级）
   ========================================================================== */

(function () {
  const W = window.XB_WORLD;

  const XBGardenView = {
    name: 'XBGardenView',
    data() {
      return { editMode: false, drag: null, shopOpen: false, burst: 0, toastTimer: null };
    },
    computed: {
      state() {
        return XB.state;
      },
      scene() {
        return W.sceneById(this.state.home.scene);
      },
      scenes() {
        return W.scenes.map((sc) => ({
          id: sc.id,
          name: sc.name,
          level: sc.level,
          unlocked: XB.helpers.sceneUnlocked(sc),
          active: this.state.home.scene === sc.id,
        }));
      },
      level() {
        return XB.helpers.homeLevel();
      },
      levelProgress() {
        return Math.round(((this.state.inventory.furniture.length % 3) / 3) * 100);
      },
      nextLevelNeed() {
        return 3 - (this.state.inventory.furniture.length % 3);
      },
      placed() {
        return this.state.home.placed
          .map((p) => {
            const item = W.furnitureById(p.itemId);
            return item ? Object.assign({}, p, { item: item }) : null;
          })
          .filter(Boolean);
      },
      owned() {
        return this.state.inventory.furniture
          .map((id) => W.furnitureById(id))
          .filter(Boolean)
          .map((it) => Object.assign({}, it, { placed: this.state.home.placed.filter((p) => p.itemId === it.id).length }));
      },
      petId() {
        return this.state.activePetId;
      },
      petConf() {
        return window.XingPets.byId(this.petId);
      },
      petMeta() {
        return XB.helpers.petMeta(this.petId);
      },
      evolved() {
        return XB.helpers.petForm(this.petId) === 'evolved';
      },
      equipped() {
        return XB.helpers.equippedItems(this.petId);
      },
      shopList() {
        return W.furniture.map((it) => ({
          id: it.id,
          name: it.name,
          price: it.price,
          rarity: it.rarity,
          art: it.art,
          w: it.w,
          desc: it.desc,
          owned: this.state.inventory.furniture.indexOf(it.id) >= 0,
        }));
      },
    },
    beforeUnmount() {
      this.detach();
    },
    methods: {
      sceneStyle() {
        return { backgroundImage: 'url(' + this.scene.image + ')' };
      },
      selectScene(sc) {
        if (!sc.unlocked) {
          XB.actions.toast('家园 Lv.' + sc.level + ' 解锁「' + sc.name + '」', 'lock');
          return;
        }
        const res = XB.actions.setScene(sc.id);
        if (res.ok) XB.actions.toast('来到「' + sc.name + '」', 'house');
      },
      toggleEdit() {
        this.editMode = !this.editMode;
        XB.actions.toast(this.editMode ? '拖动家具调整位置' : '布置完成', this.editMode ? 'hand' : 'check');
      },
      buy(item) {
        const res = XB.actions.buyFurniture(item.id);
        if (!res.ok) {
          XB.actions.toast(res.reason || '暂时买不了', 'info');
          return;
        }
        XB.actions.toast('获得「' + item.name + '」', 'gift');
        this.shopOpen = false;
        XB.actions.placeFurniture(item.id, 30 + Math.random() * 40, 66 + Math.random() * 14);
      },
      place(item) {
        XB.actions.placeFurniture(item.id, 30 + Math.random() * 40, 66 + Math.random() * 14);
        XB.actions.toast('「' + item.name + '」已放入家园', 'house');
        this.editMode = true;
      },
      remove(p) {
        XB.actions.removeFurniture(p.uid);
        XB.actions.toast('已收回「' + p.item.name + '」', 'trash');
      },
      onDown(e, p) {
        if (!this.editMode) return;
        e.preventDefault();
        const sceneEl = this.$refs.scene;
        const rect = sceneEl.getBoundingClientRect();
        this.drag = { uid: p.uid, rect: rect };
        window.addEventListener('pointermove', this.onMove);
        window.addEventListener('pointerup', this.endDrag);
      },
      onMove(e) {
        if (!this.drag) return;
        const r = this.drag.rect;
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        XB.actions.moveFurniture(this.drag.uid, x, y);
      },
      endDrag() {
        this.drag = null;
        this.detach();
      },
      detach() {
        window.removeEventListener('pointermove', this.onMove);
        window.removeEventListener('pointerup', this.endDrag);
      },
      petTap() {
        this.burst++;
        const res = XB.actions.interact(this.petId, 'pet');
        if (res.ok) {
          XB.actions.toast(res.action.line, 'heart');
          XB.actions.presentResult(res);
        }
      },
      styleOf(p) {
        return {
          left: p.x + '%',
          top: p.y + '%',
          width: p.item.w + '%',
        };
      },
      itemSvg(p) {
        return this.svgOf(p.item);
      },
      svgOf(item) {
        return '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">' + item.art + '</svg>';
      },
    },
    template: `
      <section class="page page--garden">
        <header class="page-head">
          <div class="page-head__text">
            <h1 class="page-head__title">星宠家园</h1>
            <p class="page-head__sub">{{ scene.name }} · 家园 Lv.{{ level }} · {{ petMeta.name }} 在这里</p>
          </div>
          <button class="icon-btn" @click="shopOpen = true" aria-label="家具商店">
            <XingIcon name="gift" :size="16" />
          </button>
        </header>

        <div class="garden-scene" :style="sceneStyle()" ref="scene">
          <div class="garden-scene__veil"></div>

          <div class="garden-pet" @click="petTap">
            <XingPetActor :key="petId" :pet="petConf" state="idle" :burst="burst"
                          :evolved="evolved" :costumes="equipped" />
          </div>

          <div v-for="p in placed" :key="p.uid" class="garden-item"
               :class="{ 'is-editing': editMode }" :style="styleOf(p)"
               @pointerdown="onDown($event, p)">
            <span v-html="itemSvg(p)"></span>
            <button v-if="editMode" class="garden-item__del" @click.stop="remove(p)" aria-label="收回">
              <XingIcon name="close" :size="9" :stroke-width="2.4" />
            </button>
          </div>

          <div v-if="editMode" class="garden-scene__hint">拖动家具调整位置 · 点右上角 × 收回</div>
          <div class="garden-scene__edit">
            <button class="btn btn--sm" @click="toggleEdit">{{ editMode ? '完成布置' : '布置家园' }}</button>
          </div>
        </div>

        <div class="scene-tabs" role="tablist" aria-label="家园场景">
          <button v-for="sc in scenes" :key="sc.id" class="scene-chip"
                  :class="{ 'is-on': sc.active, 'is-locked': !sc.unlocked }"
                  @click="selectScene(sc)">
            <XingIcon v-if="!sc.unlocked" name="lock" :size="10" />
            <span>{{ sc.name }}</span>
            <em v-if="!sc.unlocked">Lv.{{ sc.level }}</em>
          </button>
        </div>

        <section class="panel home-level">
          <i class="panel__corner panel__corner--tl"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--tr"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--br"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--bl"><Orn type="corner" :size="18" /></i>
          <div class="home-level__head">
            <span class="home-level__lv">家园 Lv.{{ level }}</span>
            <span class="home-level__hint">再收集 {{ nextLevelNeed }} 件家具升级</span>
          </div>
          <XBBar :value="levelProgress" thin />
          <p class="home-level__desc">家具 {{ owned.length }} 件 · 已摆放 {{ placed.length }} 件 · 场景 {{ scenes.filter(s => s.unlocked).length }}/6</p>
        </section>

        <section class="panel furniture-list">
          <i class="panel__corner panel__corner--tl"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--tr"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--br"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--bl"><Orn type="corner" :size="18" /></i>
          <XBSecHead title="我的家具" more="家具商店" @more="shopOpen = true" />
          <div class="furniture-grid">
            <button v-for="it in owned" :key="it.id" class="furniture-card" @click="place(it)">
              <span class="furniture-card__art" v-html="svgOf(it)"></span>
              <span class="furniture-card__name">{{ it.name }}</span>
              <span class="furniture-card__meta">{{ it.placed ? '已摆放 ' + it.placed : '点击摆放' }}</span>
            </button>
            <div v-if="!owned.length" class="empty">还没有家具，去家具商店挑一件吧</div>
          </div>
        </section>

        <div v-if="shopOpen" class="modal-mask" @click.self="shopOpen = false">
          <div class="modal modal--tall" role="dialog" aria-label="家具商店">
            <i class="modal__corner modal__corner--tl"><Orn type="corner" :size="30" /></i>
            <i class="modal__corner modal__corner--tr"><Orn type="corner" :size="30" /></i>
            <i class="modal__corner modal__corner--br"><Orn type="corner" :size="30" /></i>
            <i class="modal__corner modal__corner--bl"><Orn type="corner" :size="30" /></i>
            <button class="modal__close" aria-label="关闭" @click="shopOpen = false"><XingIcon name="close" :size="13" :stroke-width="2" /></button>
            <header class="modal__head">
              <span class="modal__crest"><Orn type="crest" :size="30" /></span>
              <h2 class="modal__title">家具商店</h2>
              <p class="modal__sub">买下的家具会自动放进家园</p>
            </header>
            <div class="modal__body">
              <div class="shop-grid">
                <article v-for="it in shopList" :key="it.id" class="shop-item">
                  <span class="shop-item__art" v-html="svgOf(it)"></span>
                  <div class="shop-item__body">
                    <b>{{ it.name }}</b>
                    <em>{{ it.desc }}</em>
                    <button v-if="!it.owned" class="btn btn--sm btn--gold" @click="buy(it)">
                      <XingIcon name="coin" :size="12" />{{ it.price }}
                    </button>
                    <button v-else class="btn btn--sm" @click="place(it)">已拥有 · 摆放</button>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,
  };

  window.XBGardenView = XBGardenView;
})();
