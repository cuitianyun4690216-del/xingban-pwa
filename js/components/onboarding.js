/* ==========================================================================
   星伴学园 · 新手引导（聚光灯逐步介绍）
   ========================================================================== */

(function () {
  const STEPS = [
    { sel: '.hud', title: '这里是你的状态栏', text: '等级、星星和金币都显示在这里。完成任务、照顾宠物就会慢慢变多。', pos: 'bottom' },
    { sel: '.goal', title: '今日学习目标', text: '今天要完成几项任务、专注多少分钟，进度会实时更新。点它可以直接去学习页。', pos: 'bottom' },
    { sel: '.stage', title: '你的星宠伙伴', text: '点一下宠物，它会跳起来，还会冒出爱心或星尘。在这里你可以陪它玩。', pos: 'bottom' },
    { sel: '.switch-row', title: '两只宠物各自成长', text: '卡卡和米粒有独立的等级、经验和亲密度，点卡片就能切换。', pos: 'top' },
    { sel: '.rail', title: '右侧三个小按钮', text: '上面是今日成长奖励，中间看奖励记录，下面是设置——家长模式也在设置里。', pos: 'left' },
    { sel: '.tasks-block', title: '今天的任务', text: '点右边的加号提交任务。有的任务需要家长审核，通过后才会发奖励。', pos: 'top' },
    { sel: '.nav', title: '底部导航', text: '学园是首页，学习里做任务和计时，宠物里装扮进化，家园布置房间，图鉴看收藏。', pos: 'top' },
  ];

  const Onboarding = {
    name: 'XBOnboarding',
    emits: ['done'],
    data() {
      return { index: 0, spot: null, tip: null, steps: STEPS };
    },
    computed: {
      step() {
        return this.steps[this.index] || this.steps[0];
      },
      spotStyle() {
        if (!this.spot) return { display: 'none' };
        return {
          left: this.spot.left + 'px',
          top: this.spot.top + 'px',
          width: this.spot.width + 'px',
          height: this.spot.height + 'px',
        };
      },
      tipStyle() {
        if (!this.tip) return { display: 'none' };
        return { left: this.tip.left + 'px', top: this.tip.top + 'px', width: this.tip.width + 'px' };
      },
    },
    mounted() {
      this.$nextTick(this.measure);
      window.addEventListener('resize', this.measure);
      window.addEventListener('scroll', this.measure, true);
    },
    beforeUnmount() {
      window.removeEventListener('resize', this.measure);
      window.removeEventListener('scroll', this.measure, true);
    },
    methods: {
      findStep(from) {
        for (let i = from; i < this.steps.length; i++) {
          if (document.querySelector(this.steps[i].sel)) return i;
        }
        return -1;
      },
      measure() {
        let i = this.index;
        let el = document.querySelector(this.steps[i].sel);
        if (!el) {
          i = this.findStep(i + 1);
          if (i < 0) {
            this.finish();
            return;
          }
          this.index = i;
          el = document.querySelector(this.steps[i].sel);
        }
        if (!el) return;
        const r = el.getBoundingClientRect();
        const pad = 6;
        this.spot = { left: r.left - pad, top: r.top - pad, width: r.width + pad * 2, height: r.height + pad * 2 };
        this.positionTip(r);
        if (r.top < 0 || r.bottom > window.innerHeight) {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      },
      positionTip(r) {
        const W = Math.min(300, window.innerWidth - 32);
        let left = Math.min(Math.max(16, r.left + r.width / 2 - W / 2), window.innerWidth - W - 16);
        let top;
        const pos = this.step.pos || 'bottom';
        if (pos === 'left') {
          top = Math.min(Math.max(80, r.top + r.height / 2 - 80), window.innerHeight - 200);
          left = Math.max(16, r.left - W - 14);
        } else if (pos === 'top') {
          top = r.top - 176;
          if (top < 70) top = r.bottom + 14;
        } else {
          top = r.bottom + 14;
          if (top > window.innerHeight - 200) top = Math.max(70, r.top - 176);
        }
        this.tip = { left: left, top: top, width: W };
      },
      next() {
        if (this.index >= this.steps.length - 1) {
          this.finish();
          return;
        }
        this.index++;
        this.$nextTick(this.measure);
      },
      skip() {
        this.finish();
      },
      finish() {
        if (XB.state.flags) XB.state.flags.onboarded = true;
        XB.ui.onboarding = false;
        this.$emit('done');
      },
    },
    template: `
      <div class="onb" role="dialog" aria-label="新手引导">
        <div class="onb__spot" :style="spotStyle"></div>
        <div class="onb__tip" :style="tipStyle">
          <div class="onb__head">
            <span class="onb__step">{{ index + 1 }} / {{ steps.length }}</span>
            <button class="onb__skip" @click="skip">跳过</button>
          </div>
          <h3>{{ step.title }}</h3>
          <p>{{ step.text }}</p>
          <div class="onb__actions">
            <button class="btn btn--sm btn--primary" @click="next">{{ index === steps.length - 1 ? '开始吧' : '下一步' }}</button>
          </div>
        </div>
      </div>
    `,
  };

  window.XBOnboarding = Onboarding;
})();
