/* ==========================================================================
   星伴学园 · 宠物切换
   ========================================================================== */

(function () {
  const PetSwitcher = {
    name: 'PetSwitcher',
    props: {
      pets: { type: Array, required: true },
      activeId: { type: String, required: true },
    },
    emits: ['select'],
    methods: {
      thumb(pet) {
        return this.$assets.pet(pet.id, 'idle');
      },
    },
    template: `
      <div class="switcher" role="tablist" aria-label="选择陪伴宠物">
        <button
          v-for="p in pets"
          :key="p.id"
          class="pet-chip glass"
          :class="{ 'is-active': p.id === activeId }"
          role="tab"
          :aria-selected="p.id === activeId"
          :aria-label="'切换到' + p.name"
          @click="$emit('select', p.id)"
        >
          <span class="pet-chip__avatar">
            <img :src="thumb(p)" :alt="p.name" />
          </span>
          <span class="pet-chip__meta">
            <span class="pet-chip__name">{{ p.name }}</span>
            <em class="pet-chip__sub">{{ p.species }} · Lv.{{ p.level }}</em>
          </span>
          <span class="pet-chip__dot"><XingIcon name="check" :size="9" :stroke-width="3" /></span>
        </button>
      </div>
    `,
  };

  window.XingPetSwitcher = PetSwitcher;
})();
