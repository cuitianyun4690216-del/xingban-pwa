/* ==========================================================================
   星伴学园 · 家长入口（密码闸门） + 学生奖励兑换
   ========================================================================== */

(function () {
  const XBParentGate = {
    name: 'XBParentGate',
    data() {
      return { pw: '', busy: false, error: '', show: false };
    },
    methods: {
      close() {
        XB.ui.parentGate = false;
        this.pw = '';
        this.error = '';
      },
      async ok() {
        if (!this.pw) {
          this.error = '请输入家长密码';
          return;
        }
        this.busy = true;
        const res = await XB.actions.unlockParent(this.pw);
        this.busy = false;
        if (!res.ok) {
          this.error = res.reason || '密码不正确';
          this.pw = '';
          return;
        }
        this.close();
        XB.actions.toast('已进入家长管理中心', 'user');
      },
      hint() {
        XB.actions.toast('初始密码 1234，进入后请立即修改', 'info');
      },
    },
    template: `
      <div class="modal-mask" @click.self="close">
        <div class="modal modal--gate" role="dialog" aria-label="家长验证">
          <i class="modal__corner modal__corner--tl"><Orn type="corner" :size="26" /></i>
          <i class="modal__corner modal__corner--tr"><Orn type="corner" :size="26" /></i>
          <i class="modal__corner modal__corner--br"><Orn type="corner" :size="26" /></i>
          <i class="modal__corner modal__corner--bl"><Orn type="corner" :size="26" /></i>
          <button class="modal__close" aria-label="关闭" @click="close"><XingIcon name="close" :size="13" :stroke-width="2" /></button>
          <header class="modal__head">
            <span class="modal__crest"><Orn type="crest" :size="32" /></span>
            <h2 class="modal__title">家长验证</h2>
            <p class="modal__sub">输入家长密码进入管理中心</p>
          </header>
          <div class="modal__body">
            <div class="field">
              <label class="field__label">家长密码</label>
              <div class="gate-input">
                <input class="input" :type="show ? 'text' : 'password'" v-model="pw" maxlength="20"
                       placeholder="请输入密码" @keyup.enter="ok" />
                <button class="gate-eye" @click="show = !show" :aria-label="show ? '隐藏密码' : '显示密码'">
                  <XingIcon :name="show ? 'lock' : 'user'" :size="14" />
                </button>
              </div>
            </div>
            <p v-if="error" class="form-error">{{ error }}</p>
            <p class="form-hint">
              家长密码只保存加密摘要，不会以明文写在配置里。
              <button class="link-btn" @click="hint">忘记密码？</button>
            </p>
          </div>
          <footer class="modal__foot">
            <button class="btn btn--sm" @click="close">取消</button>
            <button class="btn btn--primary btn--sm" :disabled="busy" @click="ok">{{ busy ? '验证中…' : '进入' }}</button>
          </footer>
        </div>
      </div>
    `,
  };

  const XBRedeem = {
    name: 'XBRedeem',
    computed: {
      items() {
        return XB.state.parent.rewardShop;
      },
      coins() {
        return XB.state.player.coins;
      },
      pending() {
        return XB.helpers.pendingRedemptions();
      },
      history() {
        return XB.state.parent.redemptions.filter((r) => r.status !== 'pending').slice(0, 5);
      },
    },
    methods: {
      close() {
        XB.ui.redeem = false;
      },
      pendingOf(id) {
        return this.pending.some((r) => r.itemId === id);
      },
      redeem(item) {
        const res = XB.actions.redeem(item.id);
        if (!res.ok) {
          XB.actions.toast(res.reason, 'info');
          return;
        }
        XB.actions.toast('已提交兑换申请，等家长确认', 'gift');
      },
      statusText(st) {
        return { pending: '等待家长确认', approved: '已兑换', rejected: '未通过' }[st] || st;
      },
    },
    template: `
      <div class="modal-mask" @click.self="close">
        <div class="modal modal--tall" role="dialog" aria-label="奖励兑换">
          <i class="modal__corner modal__corner--tl"><Orn type="corner" :size="30" /></i>
          <i class="modal__corner modal__corner--tr"><Orn type="corner" :size="30" /></i>
          <i class="modal__corner modal__corner--br"><Orn type="corner" :size="30" /></i>
          <i class="modal__corner modal__corner--bl"><Orn type="corner" :size="30" /></i>
          <button class="modal__close" aria-label="关闭" @click="close"><XingIcon name="close" :size="13" :stroke-width="2" /></button>
          <header class="modal__head">
            <span class="modal__crest"><Orn type="crest" :size="30" /></span>
            <h2 class="modal__title">奖励兑换</h2>
            <p class="modal__sub">用攒下的金币兑换家长准备的奖励</p>
          </header>
          <div class="modal__body">
            <div class="redeem-wallet"><XingIcon name="coin" :size="15" /><b class="t-num">{{ coins }}</b><span>金币</span></div>
            <ul class="redeem-list">
              <li v-for="it in items" :key="it.id" class="redeem-item">
                <span class="redeem-item__icon"><XingIcon :name="it.icon" :size="18" /></span>
                <div class="redeem-item__body">
                  <b>{{ it.name }}</b>
                  <em>{{ it.desc }}</em>
                  <span class="redeem-item__meta">{{ it.cost }} 金币<template v-if="it.stock > 0"> · 剩余 {{ it.stock }}</template></span>
                </div>
                <button v-if="pendingOf(it.id)" class="btn btn--sm" disabled>待确认</button>
                <button v-else-if="it.stock === 0" class="btn btn--sm" disabled>无库存</button>
                <button v-else-if="coins < it.cost" class="btn btn--sm" disabled>金币不足</button>
                <button v-else class="btn btn--sm btn--gold" @click="redeem(it)">兑换</button>
              </li>
              <li v-if="!items.length" class="empty">家长还没有准备奖励</li>
            </ul>
            <div v-if="history.length" class="redeem-history">
              <p class="t-label">最近兑换</p>
              <ul>
                <li v-for="r in history" :key="r.id">
                  <span>{{ r.name }}</span>
                  <em>{{ statusText(r.status) }}</em>
                </li>
              </ul>
            </div>
          </div>
          <footer class="modal__foot">
            <button class="btn btn--block" @click="close">关闭</button>
          </footer>
        </div>
      </div>
    `,
  };

  window.XBParentGate = XBParentGate;
  window.XBRedeem = XBRedeem;
})();
