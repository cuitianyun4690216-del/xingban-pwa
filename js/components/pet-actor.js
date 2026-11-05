/* ==========================================================================
   星伴学园 · 宠物角色（含分层装扮与进化形态）
   ========================================================================== */

(function () {
  const CostumeLayer = {
    name: 'XBCostumeLayer',
    props: {
      items: { type: Array, default: () => [] },
      petId: { type: String, required: true },
      layer: { type: String, default: 'front' },
    },
    computed: {
      list() {
        return this.items.filter((it) => (this.layer === 'back' ? it.slot === 'back' : it.slot !== 'back'));
      },
    },
    methods: {
      styleOf(it) {
        const rev = (window.XB && XB.ui && XB.ui.anchorRev) || 0;
        let a = (it.anchors && it.anchors[this.petId]) || { x: 50, y: 20, w: 26, r: 0 };
        const ov = window.XBAnchors && XBAnchors.get(it.id, this.petId);
        if (ov) a = Object.assign({}, a, ov);
        return {
          left: a.x + '%',
          top: a.y + '%',
          width: a.w + '%',
          transform: 'translate(-50%, -50%) rotate(' + (a.r || 0) + 'deg)',
        };
      },
    },
    template: `
      <div class="cst-layer" :class="'cst-layer--' + layer" aria-hidden="true">
        <span v-for="it in list" :key="it.id" class="cst" :style="styleOf(it)">
          <svg :viewBox="'0 0 ' + it.art.vb[0] + ' ' + it.art.vb[1]" preserveAspectRatio="xMidYMid meet" v-html="it.art.inner"></svg>
        </span>
      </div>
    `,
  };

  const PetActor = {
    name: 'XingPetActor',
    props: {
      pet: { type: Object, required: true },
      state: { type: String, default: 'idle' },
      burst: { type: Number, default: 0 },
      evolved: { type: Boolean, default: false },
      costumes: { type: Array, default: () => [] },
    },
    emits: ['tap'],
    data() {
      return {
        blink: false,
        frameW: '',
        imgFallback: false,
        ro: null,
        shake: false,
        loaded: false,
        error: false,
        hearts: [],
        sparks: [],
        sparkSeed: 0,
        action: '',
        blinkTimer: null,
        unblinkTimer: null,
        shakeTimer: null,
        actionTimer: null,
        hopTimer: null,
        heartSeed: 0,
      };
    },
    computed: {
      usingEvolved() {
        return this.evolved && (this.state === 'idle' || this.state === 'pet');
      },
      frame() {
        if (this.usingEvolved && this.pet.frames.evolved) return this.pet.frames.evolved;
        return this.pet.frames[this.state] || this.pet.frames.idle;
      },
      ratio() {
        return (this.frame[0] / this.frame[1]).toFixed(4);
      },
      src() {
        let url;
        if (this.usingEvolved) url = this.$assets.pet(this.pet.id, 'evolved');
        else {
          const map = this.pet.stateMap || {};
          url = this.$assets.pet(this.pet.id, map[this.state] || 'idle');
        }
        if (this.imgFallback && url.indexOf('.webp') > 0) return url.replace(/\.webp$/, '.png');
        return url;
      },
      blinkSrc() {
        return this.pet.states && this.pet.states.blink ? this.$assets.pet(this.pet.id, 'blink') : '';
      },
      stateClass() {
        return 'is-' + this.state;
      },
    },
    watch: {
      burst() {
        this.burstHearts();
      },
      state() {
        if (this.state !== 'idle') this.blink = false;
        this.$nextTick(this.fitFrame);
      },
      'pet.id'() {
        this.loaded = false;
        this.error = false;
        this.imgFallback = false;
        this.$nextTick(this.fitFrame);
      },
    },
    mounted() {
      this.scheduleBlink();
      this.scheduleShake();
      this.scheduleIdle();
      this.$nextTick(this.fitFrame);
      window.addEventListener('resize', this.fitFrame);
      if (typeof ResizeObserver !== 'undefined' && this.$refs.stage) {
        this.ro = new ResizeObserver(this.fitFrame);
        this.ro.observe(this.$refs.stage);
      }
    },
    beforeUnmount() {
      clearTimeout(this.blinkTimer);
      clearTimeout(this.unblinkTimer);
      clearTimeout(this.shakeTimer);
      clearTimeout(this.actionTimer);
      clearTimeout(this.hopTimer);
      window.removeEventListener('resize', this.fitFrame);
      if (this.ro) this.ro.disconnect();
    },
    methods: {
      fitFrame() {
        const box = this.$refs.stage;
        if (!box) return;
        const h = box.clientHeight || box.offsetHeight || 0;
        const ar = this.frame[0] / this.frame[1];
        if (h > 0 && ar > 0) this.frameW = Math.round(h * ar) + 'px';
      },
      onLoad() {
        this.loaded = true;
        this.error = false;
      },
      onError() {
        if (!this.imgFallback && this.src && this.src.indexOf('.webp') > 0) {
          this.imgFallback = true;
          return;
        }
        this.error = true;
      },
      scheduleBlink() {
        clearTimeout(this.blinkTimer);
        const wait = 3000 + Math.random() * 4200;
        this.blinkTimer = setTimeout(() => {
          if (this.state === 'idle' && !this.usingEvolved) {
            this.blink = true;
            clearTimeout(this.unblinkTimer);
            this.unblinkTimer = setTimeout(() => {
              this.blink = false;
            }, 170);
          }
          this.scheduleBlink();
        }, wait);
      },
      scheduleShake() {
        clearTimeout(this.shakeTimer);
        const wait = 9000 + Math.random() * 7000;
        this.shakeTimer = setTimeout(() => {
          if (this.state === 'idle') {
            this.shake = true;
            setTimeout(() => {
              this.shake = false;
            }, 720);
          }
          this.scheduleShake();
        }, wait);
      },
      burstHearts() {
        const now = Date.now();
        for (let i = 0; i < 4; i++) {
          const id = now + '-' + this.heartSeed++;
          const size = 13 + Math.round(Math.random() * 8);
          this.hearts.push({
            id,
            size,
            style: {
              left: 34 + Math.random() * 32 + '%',
              top: 26 + Math.random() * 16 + '%',
              '--size': size + 'px',
              '--rot': Math.round((Math.random() - 0.5) * 40) + 'deg',
              animationDelay: i * 90 + 'ms',
            },
          });
        }
        setTimeout(() => {
          this.hearts = this.hearts.slice(4);
        }, 1900);
      },
      scheduleIdle() {
        clearTimeout(this.actionTimer);
        const wait = 7000 + Math.random() * 9000;
        this.actionTimer = setTimeout(() => {
          if (this.state === 'idle' || this.state === 'pet') {
            const pool = ['yawn', 'stretch', 'look'];
            this.action = pool[Math.floor(Math.random() * pool.length)];
            setTimeout(() => {
              this.action = '';
            }, 2100);
          }
          this.scheduleIdle();
        }, wait);
      },
      spawnSparks(kind, count) {
        const now = Date.now();
        const n = count || 6;
        for (let i = 0; i < n; i++) {
          const id = now + '-' + this.sparkSeed++;
          const size = kind === 'heart' ? 10 + Math.random() * 8 : 7 + Math.random() * 9;
          this.sparks.push({
            id,
            kind: kind,
            style: {
              '--s': size.toFixed(1) + 'px',
              '--x': 32 + Math.random() * 40 + '%',
              '--y': 32 + Math.random() * 20 + '%',
              '--dx': (Math.random() - 0.5) * 46 + 'px',
              '--dy': -(30 + Math.random() * 52) + 'px',
              '--d': Math.round(i * 70) + 'ms',
            },
          });
        }
        setTimeout(() => {
          this.sparks = this.sparks.slice(n);
        }, 1700);
      },
      onTap() {
        if (this.hopTimer) clearTimeout(this.hopTimer);
        this.action = 'hop';
        this.hopTimer = setTimeout(() => {
          this.action = '';
        }, 560);
        this.spawnSparks(this.pet.id === 'hamster' ? 'star' : 'heart', this.pet.id === 'hamster' ? 7 : 5);
        if (window.XBAudio) {
          XBAudio.sfx(this.pet.id === 'hamster' ? 'petHam' : 'petCapy');
          if (XBAudio.voice && Math.random() < 0.35) XBAudio.voice(this.pet.id, this.state === 'happy' ? 'happy' : 'idle');
          if (XBAudio.say) {
            const care = XB.helpers.careInfo ? XB.helpers.careInfo() : null;
            if (care && care.hunger < 30) XBAudio.say(this.pet.id, 'hungry');
            else if (care && care.energy < 25) XBAudio.say(this.pet.id, 'sleep');
            else if (this.state === 'happy') XBAudio.say(this.pet.id, 'happy');
            else if (Math.random() < 0.55 && XBAudio.sayRandom) XBAudio.sayRandom(this.pet.id, 'pat');
          }
        }
        this.$emit('tap');
      },
    },
    template: `
      <div class="pet-actor" :class="[stateClass, { 'is-shake': shake, ['is-' + action]: !!action }]" role="button" tabindex="0"
           :aria-label="'和' + pet.name + '互动'" @click="onTap" @keydown.enter.prevent="onTap">
        <div class="pet-actor__float">
          <div class="pet-actor__body" ref="stage">
            <div class="pet-actor__frame" :style="{ '--ar': ratio, width: frameW || undefined }">
              <XBCostumeLayer :items="costumes" :pet-id="pet.id" layer="back" />
              <transition name="pet-state">
                <img :key="src" :src="src" class="pet-actor__img" :alt="pet.name" draggable="false"
                     @load="onLoad" @error="onError" />
              </transition>
              <img v-if="state === 'idle' && !usingEvolved && blinkSrc && !error" :src="blinkSrc"
                   class="pet-actor__blink" :class="{ 'is-on': blink }" alt="" draggable="false" />
              <XBCostumeLayer :items="costumes" :pet-id="pet.id" layer="front" />
              <div class="pet-actor__fx">
                <span v-for="s in sparks" :key="s.id" class="pet-spark"
                      :class="s.kind === 'heart' ? 'pet-spark--heart' : 'pet-spark--star'" :style="s.style"></span>
              </div>
              <div v-if="error" class="pet-fallback">
                <strong>宠物素材加载失败</strong>
                <span>{{ src }}</span>
              </div>
              <div v-else-if="!loaded" class="pet-skeleton"></div>
            </div>
          </div>
        </div>
        <div class="heart-layer">
          <span v-for="h in hearts" :key="h.id" class="heart-pop" :style="h.style">
            <XingIcon name="heart" :size="h.size" />
          </span>
        </div>
      </div>
    `,
  };

  window.XBCostumeLayer = CostumeLayer;
  window.XingPetActor = PetActor;
})();
