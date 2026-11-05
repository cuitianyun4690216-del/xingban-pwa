/* ==========================================================================
   星伴学园 · 装饰纹样（细金线雕花 / 卷轴 / 徽记）
   用法：<Orn type="corner" />、<Orn type="divider" class="divider__svg" />
   ========================================================================== */

(function () {
  const ORN = {
    corner: {
      vb: '0 0 40 40',
      body:
        '<path d="M39 1.5H15C7.2 1.5 1.5 7.2 1.5 15v23.5"/>' +
        '<path d="M35.5 6H16C10.3 6 6 10.3 6 16v19.5"/>' +
        '<path d="M15 1.8c0 4.6-2.6 7.2-7.2 7.2"/>' +
        '<path d="M1.8 15c4.6 0 7.2-2.6 7.2-7.2"/>' +
        '<path d="M23 1.6c0 2.2-1.4 3.8-3.6 4"/>' +
        '<path d="M1.6 23c2.2 0 3.8-1.4 4-3.6"/>' +
        '<circle cx="7.4" cy="7.4" r="1.25" fill="currentColor" stroke="none"/>' +
        '<path d="M10.8 10.8l1.8 1.8" opacity=".6"/>',
    },
    cornerSm: {
      vb: '0 0 40 40',
      body:
        '<path d="M38 2H18C9 2 2 9 2 18v20"/>' +
        '<path d="M30 2c0 5.6-3.4 9-9 9"/>' +
        '<circle cx="8" cy="8" r="1.6" fill="currentColor" stroke="none"/>',
    },
    divider: {
      vb: '0 0 240 14',
      body:
        '<path d="M2 7h80M158 7h80"/>' +
        '<path d="M120 1.6l5.4 5.4-5.4 5.4-5.4-5.4z" fill="currentColor" stroke="none"/>' +
        '<path d="M92 7h20M128 7h20" opacity=".55"/>' +
        '<circle cx="86" cy="7" r="1.4" fill="currentColor" stroke="none"/>' +
        '<circle cx="154" cy="7" r="1.4" fill="currentColor" stroke="none"/>',
    },
    crest: {
      vb: '0 0 48 48',
      body:
        '<circle cx="24" cy="24" r="15.2" opacity=".38"/>' +
        '<path d="M24 2.4l4 17.6L45.6 24 28 28 24 45.6 20 28 2.4 24 20 20z" fill="currentColor" stroke="none"/>' +
        '<circle cx="24" cy="24" r="3.4" opacity=".85"/>',
    },
    star4: {
      vb: '0 0 24 24',
      body: '<path d="M12 1.4l2.6 8L22.6 12l-8 2.6L12 22.6 9.4 14.6 1.4 12l8-2.6z" fill="currentColor" stroke="none"/>',
    },
    diamond: {
      vb: '0 0 16 16',
      body: '<path d="M8 1.6l5.4 6.4L8 14.4 2.6 8z" fill="currentColor" stroke="none" opacity=".9"/>',
    },
    flourish: {
      vb: '0 0 60 16',
      body:
        '<path d="M2 12.4c10.8 0 18.6-3.2 24.6-8.6 2.4 3.8 6 6.6 10.8 7.6"/>' +
        '<path d="M38.6 10.4c4.4 1 8.2.4 10.8-1.8" opacity=".65"/>',
    },
    ring: {
      vb: '0 0 60 60',
      body:
        '<circle cx="30" cy="30" r="26" opacity=".5"/>' +
        '<circle cx="30" cy="30" r="21" stroke-dasharray="2 5" opacity=".55"/>' +
        '<path d="M30 1.5v5M30 53.5v5M1.5 30h5M53.5 30h5" opacity=".7"/>',
    },
  };

  window.XingOrn = {
    name: 'Orn',
    props: {
      type: { type: String, default: 'corner' },
      size: { type: [Number, String], default: 24 },
      fluid: { type: Boolean, default: false },
    },
    computed: {
      def() {
        return ORN[this.type] || ORN.corner;
      },
    },
    template:
      '<svg class="orn" :class="{ \'orn--fluid\': fluid }" :viewBox="def.vb" ' +
      ':width="fluid ? null : size" :height="fluid ? null : size" ' +
      'fill="none" stroke="currentColor" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true" v-html="def.body"></svg>',
  };
})();
