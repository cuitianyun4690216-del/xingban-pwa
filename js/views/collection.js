/* ==========================================================================
   星伴学园 · 星宠图鉴（宠物 / 进化 / 装扮 / 家园 / 成就）
   ========================================================================== */

(function () {
  const W = window.XB_WORLD;
  const WR = window.XB_WARDROBE;
  const CAT = window.XB_CATALOG;

  const XBCollectionView = {
    name: 'XBCollectionView',
    data() {
      return { tab: 'pets' };
    },
    computed: {
      state() {
        return XB.state;
      },
      tabs() {
        return [
          { id: 'pets', name: '宠物' },
          { id: 'evolve', name: '进化' },
          { id: 'costumes', name: '装扮' },
          { id: 'home', name: '家园' },
          { id: 'achv', name: '成就' },
        ];
      },
      pets() {
        return ['capybara', 'hamster'].map((id) => {
          const meta = XB.helpers.petMeta(id);
          const stage = CAT.stageOf(meta.level);
          return Object.assign({}, meta, {
            thumb: this.$assets.pet(id, 'idle'),
            evolvedThumb: this.$assets.pet(id, 'evolved'),
            active: this.state.activePetId === id,
            expPercent: Math.round((meta.exp / meta.expMax) * 100),
            form: XB.helpers.petForm(id),
          });
        });
      },
      evolutions() {
        return ['capybara', 'hamster'].map((id) => {
          const conf = window.XingPets.byId(id);
          const stage = this.state.evolution[id] || 0;
          const info = XB.helpers.evolutionInfo(id);
          return {
            id: id,
            name: conf.name,
            species: conf.species,
            stage: stage,
            thumb: stage >= 3 ? this.$assets.pet(id, 'evolved') : this.$assets.pet(id, 'idle'),
            steps: [1, 2, 3].map((n) => {
              const e = W.evolution[n];
              return {
                n: n,
                name: e.name,
                level: e.level,
                dust: e.dust,
                done: stage >= n,
                current: stage + 1 === n,
                desc: e.desc,
              };
            }),
            next: info.next,
            can: info.can,
          };
        });
      },
      costumes() {
        return WR.items.map((it) => ({
          id: it.id,
          name: it.name,
          slot: it.slot,
          rarity: it.rarity,
          art: it.art,
          tile: it.tile,
          desc: it.desc,
          owned: XB.helpers.ownsCostume(it.id),
          unlocked: XB.helpers.costumeUnlocked(it),
          unlockText: (it.unlock && it.unlock.text) || '装扮商店',
        }));
      },
      costumeProgress() {
        return {
          owned: this.costumes.filter((c) => c.owned).length,
          total: this.costumes.length,
        };
      },
      scenes() {
        return W.scenes.map((sc) => ({
          id: sc.id,
          name: sc.name,
          desc: sc.desc,
          image: sc.image,
          level: sc.level,
          unlocked: XB.helpers.sceneUnlocked(sc),
        }));
      },
      furnitureList() {
        return W.furniture.map((f) => ({
          id: f.id,
          name: f.name,
          art: f.art,
          rarity: f.rarity,
          price: f.price,
          owned: this.state.inventory.furniture.indexOf(f.id) >= 0,
        }));
      },
      achievements() {
        return XB.helpers.achievementList();
      },
      achvProgress() {
        const list = this.achievements;
        return { done: list.filter((a) => a.unlocked).length, total: list.length };
      },
    },
    methods: {
      selectPet(id) {
        XB.actions.setActivePet(id);
        XB.actions.toast('已切换到 ' + XB.helpers.petMeta(id).name, 'sparkle');
      },
      rarityName(r) {
        return (WR.rarity[r] || WR.rarity.common).name;
      },
      rarityColor(r) {
        return (WR.rarity[r] || WR.rarity.common).color;
      },
      openWardrobe() {
        XB.ui.wardrobe = true;
      },
      goGarden() {
        XB.ui.tab = 'garden';
      },
    },
    template: `
      <section class="page page--collection">
        <header class="page-head">
          <div class="page-head__text">
            <h1 class="page-head__title">星宠图鉴</h1>
            <p class="page-head__sub">宠物 · 进化 · 装扮 · 家园 · 成就</p>
          </div>
          <span class="page-head__badge"><XingIcon name="tome" :size="12" />{{ achievements.filter(a => a.unlocked).length }} 成就</span>
        </header>

        <div class="chips coll-tabs">
          <button v-for="t in tabs" :key="t.id" class="chip" :class="{ 'is-on': tab === t.id }" @click="tab = t.id">{{ t.name }}</button>
        </div>

        <!-- 宠物 -->
        <template v-if="tab === 'pets'">
          <article v-for="p in pets" :key="p.id" class="coll panel" :class="{ 'is-active': p.active }">
            <i class="panel__corner panel__corner--tl"><Orn type="corner" :size="18" /></i>
            <i class="panel__corner panel__corner--tr"><Orn type="corner" :size="18" /></i>
            <i class="panel__corner panel__corner--br"><Orn type="corner" :size="18" /></i>
            <i class="panel__corner panel__corner--bl"><Orn type="corner" :size="18" /></i>
            <div class="coll__art">
              <span class="coll__ring"></span>
              <img :src="p.form === 'evolved' ? p.evolvedThumb : p.thumb" :alt="p.name" />
            </div>
            <div class="coll__body">
              <header class="coll__head">
                <h2 class="coll__name">{{ p.name }}</h2>
                <span class="coll__species">{{ p.species }} · Lv.{{ p.level }}</span>
                <span v-if="p.active" class="tag tag--sage"><XingIcon name="heart" :size="9" />陪伴中</span>
                <span v-else class="tag tag--muted">休息中</span>
              </header>
              <p class="coll__title">{{ p.title }} · {{ p.stageName }}<span v-if="p.form === 'evolved'"> · 星辉形态</span></p>
              <p class="coll__intro">{{ p.intro }}</p>
              <div class="coll__bars">
                <div class="coll__bar-row"><span>成长</span><XBBar :value="p.expPercent" thin /><b class="t-num">{{ p.expPercent }}%</b></div>
                <div class="coll__bar-row"><span>亲密</span><XBBar :value="p.intimacy" variant="lav" thin /><b class="t-num">{{ p.intimacy }}%</b></div>
              </div>
              <ul class="coll__traits"><li v-for="t in p.traits" :key="t">{{ t }}</li></ul>
              <button v-if="!p.active" class="btn btn--sm btn--block coll__btn" @click="selectPet(p.id)">邀请 {{ p.name }} 上台</button>
              <div v-else class="coll__hint">正在学园舞台上陪伴你</div>
            </div>
          </article>
        </template>

        <!-- 进化 -->
        <template v-else-if="tab === 'evolve'">
          <article v-for="e in evolutions" :key="e.id" class="panel evo-card">
            <i class="panel__corner panel__corner--tl"><Orn type="corner" :size="18" /></i>
            <i class="panel__corner panel__corner--tr"><Orn type="corner" :size="18" /></i>
            <i class="panel__corner panel__corner--br"><Orn type="corner" :size="18" /></i>
            <i class="panel__corner panel__corner--bl"><Orn type="corner" :size="18" /></i>
            <div class="evo-card__head">
              <img :src="e.thumb" :alt="e.name" class="evo-card__pet" />
              <div>
                <h3 class="evo-card__name">{{ e.name }} · {{ e.species }}</h3>
                <p class="evo-card__stage">当前形态：{{ e.stage === 0 ? '初始幼崽' : e.steps[e.stage - 1].name }}</p>
              </div>
            </div>
            <ol class="evo-steps">
              <li v-for="st in e.steps" :key="st.n" class="evo-step" :class="{ 'is-done': st.done, 'is-current': st.current }">
                <span class="evo-step__dot">{{ st.done ? '✓' : st.n }}</span>
                <div class="evo-step__body">
                  <b>{{ st.name }}</b>
                  <em>Lv.{{ st.level }} · 星屑 ×{{ st.dust }}</em>
                  <p>{{ st.desc }}</p>
                </div>
              </li>
            </ol>
            <p v-if="e.can" class="evo-can">满足条件，可在宠物页完成进化</p>
            <p v-else-if="e.next" class="evo-lock">下一阶段：{{ e.next.name }} · 需要 Lv.{{ e.next.level }} / 星屑 ×{{ e.next.dust }}</p>
            <p v-else class="evo-can">已抵达最终形态</p>
          </article>
        </template>

        <!-- 装扮 -->
        <template v-else-if="tab === 'costumes'">
          <div class="coll-progress panel">
            <span>装扮收藏 {{ costumeProgress.owned }} / {{ costumeProgress.total }}</span>
            <XBBar :value="Math.round(costumeProgress.owned / costumeProgress.total * 100)" thin />
            <button class="btn btn--sm btn--primary" @click="openWardrobe">打开衣橱</button>
          </div>
          <div class="cst-grid">
            <article v-for="c in costumes" :key="c.id" class="cst-card" :class="{ 'is-locked': !c.owned }">
              <XBCostumeThumb :item="c" :size="46" />
              <div class="cst-card__body">
                <div class="cst-card__row">
                  <b>{{ c.name }}</b>
                  <span :style="{ color: rarityColor(c.rarity) }">{{ rarityName(c.rarity) }}</span>
                </div>
                <em v-if="c.owned">已收藏</em>
                <em v-else>{{ c.unlocked ? '可在衣橱购买' : c.unlockText }}</em>
              </div>
              <XingIcon v-if="!c.owned" name="lock" :size="12" class="cst-card__lock" />
            </article>
          </div>
        </template>

        <!-- 家园 -->
        <template v-else-if="tab === 'home'">
          <div class="coll-progress panel">
            <span>家园 Lv.{{ XB.helpers.homeLevel() }} · 场景 {{ scenes.filter(s => s.unlocked).length }}/{{ scenes.length }}</span>
            <XBBar :value="Math.round(scenes.filter(s => s.unlocked).length / scenes.length * 100)" thin />
            <button class="btn btn--sm btn--primary" @click="goGarden">去家园</button>
          </div>
          <div class="scene-grid">
            <article v-for="s in scenes" :key="s.id" class="scene-card" :class="{ 'is-locked': !s.unlocked }">
              <span class="scene-card__img" :style="{ backgroundImage: 'url(' + s.image + ')' }"></span>
              <div class="scene-card__body">
                <b>{{ s.name }}</b>
                <em>{{ s.unlocked ? '已解锁' : '家园 Lv.' + s.level + ' 解锁' }}</em>
              </div>
            </article>
          </div>
          <section class="panel">
            <XBSecHead title="家具收藏" />
            <ul class="log">
              <li v-for="f in furnitureList" :key="f.id" class="log__item">
                <span class="log__badge">{{ f.owned ? '已拥有' : '未拥有' }}</span>
                <span class="log__main"><b>{{ f.name }}</b><em>{{ rarityName(f.rarity) }} · {{ f.price }} 金币</em></span>
              </li>
            </ul>
          </section>
        </template>

        <!-- 成就 -->
        <template v-else>
          <div class="coll-progress panel">
            <span>成就 {{ achvProgress.done }} / {{ achvProgress.total }}</span>
            <XBBar :value="Math.round(achvProgress.done / achvProgress.total * 100)" thin />
          </div>
          <article v-for="a in achievements" :key="a.id" class="achv" :class="{ 'is-done': a.unlocked }">
            <span class="achv__icon"><XingIcon :name="a.icon" :size="18" /></span>
            <div class="achv__body">
              <div class="achv__row"><b>{{ a.name }}</b><em v-if="a.unlocked">已解锁</em></div>
              <p>{{ a.desc }}</p>
              <XBBar :value="a.percent" thin />
              <div class="achv__foot">
                <span>{{ a.progress }} / {{ a.target }}</span>
                <span class="achv__reward">奖励 {{ a.reward.coins }} 金币 · {{ a.reward.stars }} 星星</span>
              </div>
            </div>
          </article>
        </template>
      </section>
    `,
  };

  window.XBCollectionView = XBCollectionView;
})();
