/* ==========================================================================
   星伴学园 · 首页
   ========================================================================== */

(function () {
  const HomeView = {
    name: 'HomeView',
    props: {
      pet: { type: Object, required: true },
      pets: { type: Array, required: true },
      daily: { type: Object, required: true },
      state: { type: String, default: 'idle' },
      direction: { type: String, default: 'left' },
    },
    emits: ['select-pet', 'pet-tap', 'action', 'start-study'],
    data() {
      return {
        burst: 0,
        actions: [
          { id: 'pet', icon: 'hand', label: '抚摸' },
          { id: 'eat', icon: 'leaf', label: '喂食' },
          { id: 'play', icon: 'ball', label: '玩耍' },
          { id: 'sleep', icon: 'moon', label: '睡觉' },
        ],
      };
    },
    computed: {
      expPercent() {
        return Math.max(0, Math.min(100, Math.round((this.pet.exp / this.pet.expMax) * 100)));
      },
      moodText() {
        const map = {
          idle: this.pet.mood,
          happy: '开心到冒泡',
          sleep: '睡得正香',
          eat: '吃得津津有味',
          pet: '被摸得很舒服',
        };
        return map[this.state] || this.pet.mood;
      },
      activeAction() {
        if (this.state === 'sleep') return 'sleep';
        if (this.state === 'eat') return 'eat';
        if (this.state === 'pet') return 'pet';
        if (this.state === 'happy') return 'play';
        return '';
      },
    },
    watch: {
      'pet.id'() {
        this.burst++;
      },
    },
    methods: {
      onPetTap() {
        this.burst++;
        this.$emit('pet-tap');
      },
      onAction(id) {
        if (id !== 'sleep') this.burst++;
        this.$emit('action', id);
      },
    },
    template: `
      <main class="main">
        <section class="stage" :aria-label="pet.name + ' 的展示舞台'">
          <div class="stage__halo" aria-hidden="true"></div>
          <div class="stage__ring" aria-hidden="true"></div>

          <div class="stage__actor">
            <transition :name="'pet-swap-' + direction" mode="out-in">
              <XingPetActor
                :key="pet.id"
                :pet="pet"
                :state="state"
                :burst="burst"
                @tap="onPetTap"
              />
            </transition>
            <XingSparkles :count="8" />
          </div>

          <div class="stage__podium" aria-hidden="true">
            <span class="stage__podium-rim"></span>
          </div>
          <div class="stage__ground" aria-hidden="true"></div>

          <div class="plate">
            <div class="plate__row">
              <h1 class="plate__name">{{ pet.name }}</h1>
              <span class="plate__lv">Lv.{{ pet.level }}</span>
            </div>
            <p class="plate__sub">
              <span>{{ pet.title }}</span>
              <span class="plate__dot" aria-hidden="true"></span>
              <span>成长状态 · <b class="plate__mood">{{ moodText }}</b></span>
            </p>
            <div class="exp" :aria-label="'经验 ' + pet.exp + ' / ' + pet.expMax">
              <div class="exp__bar">
                <div class="exp__fill" :style="{ '--p': expPercent + '%' }"></div>
              </div>
              <span class="exp__num">{{ pet.exp }} / {{ pet.expMax }}</span>
            </div>
          </div>
        </section>

        <div class="care" role="group" aria-label="照顾宠物">
          <button
            v-for="a in actions"
            :key="a.id"
            class="care__btn glass"
            :class="{ 'is-active': activeAction === a.id }"
            @click="onAction(a.id)"
          >
            <span class="care__icon"><XingIcon :name="a.icon" :size="16" /></span>
            <span class="care__label">{{ a.label }}</span>
          </button>
        </div>

        <div class="panel">
          <XingPetSwitcher :pets="pets" :active-id="pet.id" @select="$emit('select-pet', $event)" />
          <XingTodayCard :daily="daily" @start="$emit('start-study')" />

          <section class="profile glass" aria-label="宠物档案">
            <p class="profile__eyebrow">{{ pet.latin }} · {{ pet.role }}</p>
            <p class="profile__intro">{{ pet.intro }}</p>
            <ul class="profile__traits">
              <li v-for="t in pet.traits" :key="t">{{ t }}</li>
            </ul>
          </section>
        </div>
      </main>
    `,
  };

  window.XingHomeView = HomeView;
})();
