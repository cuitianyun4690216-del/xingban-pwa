/* ==========================================================================
   星伴学园 · 今日学习
   ========================================================================== */

(function () {
  const TodayCard = {
    name: 'TodayCard',
    props: {
      daily: { type: Object, required: true },
    },
    emits: ['start'],
    computed: {
      percent() {
        const t = this.daily.total || 1;
        return Math.round((this.daily.done / t) * 100);
      },
      dashOffset() {
        const c = 2 * Math.PI * 22;
        return (c * (1 - this.daily.done / (this.daily.total || 1))).toFixed(2);
      },
      circumference() {
        return (2 * Math.PI * 22).toFixed(2);
      },
    },
    template: `
      <section class="today glass" aria-label="今日学习进度">
        <div class="today__ring" :aria-label="'完成度 ' + percent + '%'">
          <svg viewBox="0 0 52 52" aria-hidden="true">
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#C6B5F6" />
                <stop offset="55%" stop-color="#A9DAF4" />
                <stop offset="100%" stop-color="#A2E5C7" />
              </linearGradient>
            </defs>
            <circle class="today__ring-track" cx="26" cy="26" r="22" />
            <circle class="today__ring-value" cx="26" cy="26" r="22"
                    :stroke-dasharray="circumference" :stroke-dashoffset="dashOffset" />
          </svg>
          <span class="today__ring-label">{{ percent }}%</span>
        </div>

        <div class="today__body">
          <p class="today__eyebrow">今日学习 <span class="tag-demo">示例数据</span></p>
          <p class="today__title">完成 {{ daily.done }} / {{ daily.total }} 个任务</p>
          <p class="today__sub">已专注 {{ daily.minutes }} 分钟 · 连续 {{ daily.streak }} 天</p>
        </div>

        <button class="today__cta" @click="$emit('start')">
          开始学习
          <XingIcon name="arrow" :size="13" :stroke-width="2.2" />
        </button>
      </section>
    `,
  };

  window.XingTodayCard = TodayCard;
})();
