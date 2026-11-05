/* ==========================================================================
   星伴学园 · 奇幻 UI 组件库
   XBPanel / XBButton / XBBar / XBSecHead / XBAvatar / XBTag / XBToast / XBModal
   ========================================================================== */

(function () {
  const XBPanel = {
    name: 'XBPanel',
    props: {
      variant: { type: String, default: 'parch' },
      corners: { type: Boolean, default: true },
      pad: { type: Boolean, default: false },
    },
    template: `
      <section class="panel" :class="['panel--' + variant, { 'panel--pad': pad }]">
        <template v-if="corners">
          <i class="panel__corner panel__corner--tl"><Orn type="corner" :size="20" /></i>
          <i class="panel__corner panel__corner--tr"><Orn type="corner" :size="20" /></i>
          <i class="panel__corner panel__corner--br"><Orn type="corner" :size="20" /></i>
          <i class="panel__corner panel__corner--bl"><Orn type="corner" :size="20" /></i>
        </template>
        <slot></slot>
      </section>
    `,
  };

  const XBButton = {
    name: 'XBButton',
    props: {
      variant: { type: String, default: 'default' },
      size: { type: String, default: 'md' },
      icon: { type: String, default: '' },
      block: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
    },
    emits: ['click'],
    template: `
      <button class="btn" :class="['btn--' + variant, { 'btn--sm': size === 'sm', 'btn--block': block }]"
              :disabled="disabled" @click="$emit('click', $event)">
        <span v-if="icon" class="btn__icon"><XingIcon :name="icon" :size="15" /></span>
        <slot></slot>
      </button>
    `,
  };

  const XBBar = {
    name: 'XBBar',
    props: {
      value: { type: [Number, String], default: 0 },
      variant: { type: String, default: 'gold' },
      thin: { type: Boolean, default: false },
    },
    computed: {
      pct() {
        return Math.max(0, Math.min(100, Number(this.value) || 0)) + '%';
      },
    },
    template:
      '<div class="bar" :class="[{ \'bar--lav\': variant === \'lav\', \'bar--thin\': thin }]">' +
      '<div class="bar__fill" :style="{ \'--p\': pct }"></div></div>',
  };

  const XBSecHead = {
    name: 'XBSecHead',
    props: {
      title: { type: String, default: '' },
      more: { type: String, default: '' },
      icon: { type: String, default: '' },
    },
    emits: ['more'],
    template: `
      <div class="sec-head">
        <span class="sec-head__line"></span>
        <span class="sec-head__title">
          <XingIcon v-if="icon" :name="icon" :size="14" />
          {{ title }}
        </span>
        <span class="sec-head__line"></span>
        <button v-if="more" class="sec-head__more" @click="$emit('more')">
          {{ more }} <XingIcon name="chevronRight" :size="12" />
        </button>
      </div>
    `,
  };

  const XBAvatar = {
    name: 'XBAvatar',
    props: { src: String, size: { type: Number, default: 50 } },
    template:
      '<span class="avatar-frame" :style="{ width: size + \'px\', height: size + \'px\' }">' +
      '<img :src="src" alt="玩家头像" /></span>',
  };

  const XBTag = {
    name: 'XBTag',
    props: { tone: { type: String, default: 'gold' } },
    template: '<span class="tag" :class="\'tag--\' + tone"><slot></slot></span>',
  };

  const XBToast = {
    name: 'XBToast',
    props: { data: Object },
    template: `
      <div v-if="data" class="toast" role="status" aria-live="polite">
        <XingIcon :name="data.icon || 'sparkle'" :size="14" />
        <span>{{ data.text }}</span>
      </div>
    `,
  };

  const XBModal = {
    name: 'XBModal',
    props: {
      title: { type: String, default: '' },
      sub: { type: String, default: '' },
      crest: { type: String, default: 'crest' },
      closable: { type: Boolean, default: true },
    },
    emits: ['close'],
    template: `
      <div class="modal-mask" @click.self="closable && $emit('close')">
        <div class="modal" role="dialog" :aria-label="title">
          <i class="modal__corner modal__corner--tl"><Orn type="corner" :size="26" /></i>
          <i class="modal__corner modal__corner--tr"><Orn type="corner" :size="26" /></i>
          <i class="modal__corner modal__corner--br"><Orn type="corner" :size="26" /></i>
          <i class="modal__corner modal__corner--bl"><Orn type="corner" :size="26" /></i>
          <button v-if="closable" class="modal__close" aria-label="关闭" @click="$emit('close')">
            <XingIcon name="close" :size="13" :stroke-width="2" />
          </button>

          <header class="modal__head">
            <span class="modal__crest"><Orn :type="crest === 'crest' ? 'crest' : crest" :size="34" /></span>
            <h2 class="modal__title">{{ title }}</h2>
            <p v-if="sub" class="modal__sub">{{ sub }}</p>
          </header>

          <div class="modal__body"><slot></slot></div>
          <footer v-if="$slots.foot" class="modal__foot"><slot name="foot"></slot></footer>
        </div>
      </div>
    `,
  };

  const XingSparkles = {
    name: 'XingSparkles',
    props: { count: { type: Number, default: 8 } },
    data() {
      const spots = [
        { x: 14, y: 34, s: 12, d: 3.6, delay: 0.2 },
        { x: 86, y: 28, s: 9, d: 4.4, delay: 1.1 },
        { x: 76, y: 60, s: 13, d: 4.1, delay: 0.6 },
        { x: 20, y: 62, s: 8, d: 3.2, delay: 1.6 },
        { x: 50, y: 14, s: 10, d: 5.2, delay: 2.1 },
        { x: 92, y: 48, s: 7, d: 3.9, delay: 0.9 },
        { x: 7, y: 48, s: 6, d: 4.7, delay: 2.6 },
        { x: 62, y: 10, s: 8, d: 3.4, delay: 1.4 },
      ];
      return { spots: spots.slice(0, this.count) };
    },
    template:
      '<div class="sparkle-layer" aria-hidden="true">' +
      '<span v-for="(s, i) in spots" :key="i" class="sparkle" :style="{ left: s.x + \'%\', top: s.y + \'%\', \'--dur\': s.d + \'s\', \'--delay\': s.delay + \'s\' }">' +
      '<XingIcon name="sparkle" :size="s.s" />' +
      '</span>' +
      '</div>',
  };

  window.XBPanel = XBPanel;
  window.XBButton = XBButton;
  window.XBBar = XBBar;
  window.XBSecHead = XBSecHead;
  window.XBAvatar = XBAvatar;
  window.XBTag = XBTag;
  window.XBToast = XBToast;
  window.XBModal = XBModal;
  window.XingSparkles = XingSparkles;
})();
