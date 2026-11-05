/* ==========================================================================
   星伴学园 · 交互反馈层（统一按压、点击音、金币飞入、漂浮文字）
   ========================================================================== */

(function () {
  const FX = { layer: null, initDone: false };

  function layer() {
    if (!FX.layer) {
      FX.layer = document.createElement('div');
      FX.layer.className = 'fx-layer';
      FX.layer.setAttribute('aria-hidden', 'true');
      document.body.appendChild(FX.layer);
    }
    return FX.layer;
  }

  function hudTarget(kind) {
    const pills = document.querySelectorAll('.hud__pills .pill');
    if (kind === 'coin') return pills[1] || pills[0] || null;
    return pills[0] || null;
  }

  function coinFly(count, from) {
    if (!FX.layer && !document.body) return;
    const target = hudTarget('coin');
    if (!target) return;
    const tr = target.getBoundingClientRect();
    const start = from || { left: window.innerWidth / 2, top: window.innerHeight / 2 };
    const n = Math.min(8, Math.max(3, count || 5));
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.className = 'fx-coin';
      s.style.left = '0px';
      s.style.top = '0px';
      layer().appendChild(s);
      const sx = start.left + (Math.random() - 0.5) * 60;
      const sy = start.top + (Math.random() - 0.5) * 40;
      const tx = tr.left + tr.width / 2;
      const ty = tr.top + tr.height / 2;
      const mx = sx + (tx - sx) * 0.45 + (Math.random() - 0.5) * 90;
      const my = sy + (ty - sy) * 0.45 - 90 - Math.random() * 50;
      const anim = s.animate(
        [
          { transform: 'translate(' + sx + 'px,' + sy + 'px) scale(.5)', opacity: 0 },
          { transform: 'translate(' + mx + 'px,' + my + 'px) scale(1)', opacity: 1, offset: 0.45 },
          { transform: 'translate(' + tx + 'px,' + ty + 'px) scale(.35)', opacity: 0.2 },
        ],
        { duration: 760 + Math.random() * 260, delay: i * 55, easing: 'cubic-bezier(.22,.9,.3,1)', fill: 'forwards' }
      );
      anim.onfinish = () => s.remove();
    }
    target.classList.remove('is-bump');
    void target.offsetWidth;
    target.classList.add('is-bump');
    setTimeout(() => target.classList.remove('is-bump'), 460);
    if (window.XBAudio) XBAudio.sfx('coin');
  }

  function floatText(text, x, y, tone) {
    const el = document.createElement('span');
    el.className = 'fx-float';
    el.textContent = text;
    if (tone) el.classList.add('fx-float--' + tone);
    el.style.left = (x || window.innerWidth / 2) + 'px';
    el.style.top = (y || window.innerHeight / 2) + 'px';
    layer().appendChild(el);
    el.animate(
      [
        { transform: 'translate(-50%,-50%) scale(.9)', opacity: 0 },
        { transform: 'translate(-50%,-120%) scale(1.05)', opacity: 1, offset: 0.25 },
        { transform: 'translate(-50%,-230%) scale(1)', opacity: 0 },
      ],
      { duration: 1100, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' }
    ).onfinish = () => el.remove();
  }

  const CLICKABLE = 'button, .chip, .nav__item, .quest, .action-card, .slot, .menu-item, .set-row .switch';

  function onDown(e) {
    const el = e.target.closest ? e.target.closest(CLICKABLE) : null;
    if (!el || el.disabled) return;
    el.classList.add('is-press');
  }
  function onUp() {
    document.querySelectorAll('.is-press').forEach((el) => el.classList.remove('is-press'));
  }
  function onClick(e) {
    const el = e.target.closest ? e.target.closest(CLICKABLE) : null;
    if (!el) return;
    if (el.hasAttribute('data-silent') || el.classList.contains('is-disabled')) return;
    const type =
      el.getAttribute('data-sfx') ||
      (el.classList.contains('nav__item') ? 'tab' : el.classList.contains('action-card') ? 'tab' : 'click');
    if (window.XBAudio) XBAudio.sfx(type);
  }

  FX.init = function () {
    if (FX.initDone) return;
    FX.initDone = true;
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('pointerup', onUp, true);
    document.addEventListener('pointercancel', onUp, true);
    document.addEventListener('click', onClick, true);
  };

  FX.coinFly = coinFly;
  FX.floatText = floatText;
  FX.hudTarget = hudTarget;
  window.XBFX = FX;
})();
