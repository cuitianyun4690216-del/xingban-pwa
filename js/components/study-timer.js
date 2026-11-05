/* ==========================================================================
   星伴学园 · 月光专注计时器
   ========================================================================== */

(function () {
  const CAT = window.XB_CATALOG;

  const XBTimer = {
    name: 'XBTimer',
    data() {
      return {
        now: Date.now(),
        selected: XB.state.timer.preset || 25,
        custom: 25,
        useCustom: false,
        tick: null,
      };
    },
    computed: {
      timer() {
        return XB.state.timer;
      },
      remaining() {
        const t = this.timer;
        if (t.running && t.endsAt) {
          return Math.max(0, Math.round((t.endsAt - this.now) / 1000));
        }
        return t.remaining;
      },
      total() {
        return this.timer.totalSec;
      },
      percent() {
        return Math.max(0, Math.min(100, (this.remaining / this.total) * 100));
      },
      isIdle() {
        return !this.timer.running && this.remaining >= this.total;
      },
      isPaused() {
        return !this.timer.running && this.remaining < this.total && this.remaining > 0;
      },
      clock() {
        const s = this.remaining;
        return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
      },
      presets() {
        return CAT.timerPresets;
      },
      minutesLabel() {
        return Math.round(this.remaining / 60);
      },
      dashOffset() {
        const c = 2 * Math.PI * 46;
        return (c * (1 - this.percent / 100)).toFixed(2);
      },
      circumference() {
        return (2 * Math.PI * 46).toFixed(2);
      },
    },
    mounted() {
      this.tick = setInterval(() => {
        this.now = Date.now();
        if (this.timer.running && this.remaining <= 0) {
          this.finish('complete');
        }
      }, 1000);
      if (this.timer.running && this.remaining <= 0) {
        this.finish('complete');
      }
    },
    beforeUnmount() {
      clearInterval(this.tick);
    },
    methods: {
      start() {
        const limit = XB.helpers.limitInfo ? XB.helpers.limitInfo() : { blocked: false, limit: 0, left: -1 };
        if (limit.blocked) {
          XB.actions.toast('今天的专注时间已达到家长设置的上限', 'hourglass');
          return;
        }
        const minutes = this.useCustom ? Math.max(1, Math.min(120, Number(this.custom) || 25)) : this.selected;
        if (limit.limit && limit.left > 0 && minutes > limit.left) {
          XB.actions.toast('家长设置今天还能专注 ' + limit.left + ' 分钟，先选短一点的吧', 'hourglass');
          return;
        }
        XB.actions.startTimer(minutes);
        this.now = Date.now();
        XB.actions.toast('愿这段时光安静而专注', 'hourglass');
      },
      pause() {
        XB.actions.pauseTimer();
        this.now = Date.now();
      },
      resume() {
        XB.actions.resumeTimer();
        this.now = Date.now();
      },
      finish(mode) {
        const res = XB.actions.finishTimer(mode);
        this.now = Date.now();
        if (res.ok) {
          XB.actions.presentResult(res);
        } else if (res.reason) {
          XB.actions.toast(res.reason, 'info');
        }
      },
      cancel() {
        XB.ui.confirm = {
          title: '放弃这段专注',
          text: '本次计时不会留下记录，已过去的 ' + Math.round((this.total - this.remaining) / 60) + ' 分钟也不会获得奖励。',
          okText: '放弃',
          danger: true,
          onOk: () => {
            XB.actions.resetTimer();
            this.now = Date.now();
            XB.actions.toast('已结束本次专注', 'moon');
          },
        };
      },
      endEarly() {
        const spent = Math.round((this.total - this.remaining) / 60);
        XB.ui.confirm = {
          title: '提前结束专注',
          text: '已经专注 ' + spent + ' 分钟，结束会按实际时长记录并发放奖励。',
          okText: '结束并记录',
          onOk: () => this.finish('early'),
        };
      },
    },
    template: `
      <section class="timer panel">
        <i class="panel__corner panel__corner--tl"><Orn type="corner" :size="20" /></i>
        <i class="panel__corner panel__corner--tr"><Orn type="corner" :size="20" /></i>
        <i class="panel__corner panel__corner--br"><Orn type="corner" :size="20" /></i>
        <i class="panel__corner panel__corner--bl"><Orn type="corner" :size="20" /></i>

        <div class="timer__ring-wrap">
          <svg class="timer__ring" viewBox="0 0 104 104" aria-hidden="true">
            <defs>
              <linearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#F7EACA" />
                <stop offset="45%" stop-color="#DCC18C" />
                <stop offset="100%" stop-color="#A9854A" />
              </linearGradient>
            </defs>
            <circle class="timer__track" cx="52" cy="52" r="46" />
            <circle class="timer__value" cx="52" cy="52" r="46"
                    :stroke-dasharray="circumference" :stroke-dashoffset="dashOffset" />
          </svg>
          <div class="timer__center">
            <XingIcon name="hourglass" :size="15" class="timer__icon" />
            <strong class="timer__clock">{{ clock }}</strong>
            <span class="timer__hint">{{ isIdle ? '选择时长' : (timer.running ? '专注中' : '已暂停') }}</span>
          </div>
        </div>

        <div class="timer__side">
          <div v-if="isIdle" class="timer__presets">
            <button v-for="m in presets" :key="m" class="chip" :class="{ 'is-on': !useCustom && selected === m }"
                    @click="useCustom = false; selected = m">{{ m }} 分钟</button>
            <button class="chip" :class="{ 'is-on': useCustom }" @click="useCustom = true">自定义</button>
          </div>
          <div v-if="isIdle && useCustom" class="timer__custom">
            <input class="input" type="number" min="1" max="120" v-model.number="custom" />
            <span>分钟</span>
          </div>

          <div class="timer__actions">
            <button v-if="isIdle" class="btn btn--primary btn--sm" @click="start">
              <XingIcon name="hourglass" :size="14" />开始专注
            </button>
            <template v-else>
              <button v-if="timer.running" class="btn btn--sm" @click="pause"><XingIcon name="moon" :size="14" />暂停</button>
              <button v-else class="btn btn--primary btn--sm" @click="resume"><XingIcon name="sun" :size="14" />继续</button>
              <button class="btn btn--sm" @click="endEarly"><XingIcon name="check" :size="14" />结束</button>
              <button class="btn btn--sm btn--ghost timer__cancel" @click="cancel"><XingIcon name="close" :size="13" />放弃</button>
            </template>
          </div>
        </div>
      </section>
    `,
  };

  window.XBTimer = XBTimer;
})();
