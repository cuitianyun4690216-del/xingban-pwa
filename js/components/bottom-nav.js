/* ==========================================================================
   星伴学园 · 底部导航
   ========================================================================== */

(function () {
  const BottomNav = {
    name: 'BottomNav',
    props: {
      items: { type: Array, required: true },
      active: { type: String, required: true },
    },
    emits: ['select'],
    template: `
      <nav class="nav" aria-label="主导航">
        <div class="nav__inner">
          <button
            v-for="item in items"
            :key="item.id"
            class="nav__item"
            :class="{ 'is-active': item.id === active }"
            :aria-current="item.id === active ? 'page' : undefined"
            @click="$emit('select', item.id)"
          >
            <span class="nav__icon"><XingIcon :name="item.icon" :size="21" /></span>
            <span class="nav__label">{{ item.label }}</span>
          </button>
        </div>
      </nav>
    `,
  };

  window.XingBottomNav = BottomNav;
})();
