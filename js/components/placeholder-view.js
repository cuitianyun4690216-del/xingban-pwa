/* ==========================================================================
   星伴学园 · 开发中页面（学习 / 宠物 / 家园 / 我的）
   ========================================================================== */

(function () {
  const PlaceholderView = {
    name: 'PlaceholderView',
    props: {
      meta: { type: Object, required: true },
      pet: { type: Object, required: true },
    },
    emits: ['back'],
    computed: {
      petImg() {
        return this.$assets.pet(this.pet.id, 'idle');
      },
    },
    template: `
      <main class="dev">
        <div class="dev__top">
          <button class="dev__back glass" @click="$emit('back')">
            <XingIcon name="chevron-left" :size="15" :stroke-width="2.2" />
            返回首页
          </button>
        </div>

        <div class="dev__orb">
          <img class="dev__pet" :src="petImg" :alt="pet.name" />
        </div>

        <span class="dev__brand">
          <XingIcon name="sparkle" :size="10" />
          星伴学园
        </span>

        <span class="dev__badge">
          <XingIcon name="lock" :size="11" :stroke-width="2" />
          {{ meta.badge }}
        </span>

        <h2 class="dev__title">{{ meta.title }}</h2>
        <p class="dev__desc">{{ meta.desc }}</p>

        <ul class="dev__roadmap">
          <li v-for="r in meta.roadmap" :key="r">{{ r }}</li>
        </ul>

        <button class="dev__cta" @click="$emit('back')">回到首页</button>
      </main>
    `,
  };

  window.XingPlaceholderView = PlaceholderView;
})();
