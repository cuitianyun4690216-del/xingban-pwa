/* ==========================================================================
   星伴学园 · 任务卡片
   ========================================================================== */

(function () {
  const CAT = window.XB_CATALOG;

  const XBQuestCard = {
    name: 'XBQuestCard',
    props: {
      quest: { type: Object, required: true },
      done: { type: Boolean, default: false },
      pending: { type: Boolean, default: false },
      compact: { type: Boolean, default: false },
    },
    emits: ['complete', 'open', 'undo'],
    computed: {
      conditionText() {
        if (this.quest.condition === 'review') return '需家长审核';
        if (this.quest.condition === 'focus') return '需专注 ' + (this.quest.minMinutes || this.quest.minutes) + ' 分钟';
        return '';
      },
      cat() {
        return CAT.categoryById(this.quest.category);
      },
      diff() {
        return CAT.difficultyById(this.quest.difficulty);
      },
      repeatName() {
        return { daily: '每日', weekly: '每周', once: '一次' }[this.quest.repeat] || '每日';
      },
    },
    template: `
      <article class="quest" :class="{ 'is-done': done, 'is-compact': compact }" @click="$emit('open', quest)">
        <span class="quest__cat" :style="{ '--tint': 'var(--tint-' + cat.tint + ')' }">
          <XingIcon :name="cat.icon" :size="17" />
        </span>

        <div class="quest__body">
          <div class="quest__row">
            <h3 class="quest__title">{{ quest.title }}</h3>
            <span class="quest__diff">{{ diff.name }}</span>
          </div>
          <p class="quest__meta">
            <span>{{ quest.minutes }} 分钟</span>
            <i class="dot"></i>
            <span>{{ repeatName }}</span>
            <i class="dot"></i>
            <span>{{ cat.name }}</span>
            <template v-if="conditionText">
              <i class="dot"></i><span class="quest__cond">{{ conditionText }}</span>
            </template>
          </p>
          <div class="quest__rewards">
            <span class="quest__gain"><XingIcon name="coin" :size="12" :stroke-width="1.5" />{{ quest.coins }}</span>
            <span class="quest__gain quest__gain--exp"><XingIcon name="sparkle" :size="12" :stroke-width="1.5" />{{ quest.exp }}</span>
          </div>
        </div>

        <button class="quest__check" :class="{ 'is-done': done, 'is-pending': pending }"
                :aria-label="pending ? '等待家长确认' : (done ? '取消完成' : '提交任务')"
                :disabled="pending"
                @click.stop="pending ? null : (done ? $emit('undo', quest) : $emit('complete', quest))">
          <XingIcon :name="pending ? 'clock' : (done ? 'check' : 'plus')" :size="15" :stroke-width="2" />
        </button>
      </article>
    `,
  };

  window.XBQuestCard = XBQuestCard;
})();
