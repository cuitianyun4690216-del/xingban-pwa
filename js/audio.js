/* ==========================================================================
   星伴学园 · 声音系统
   程序化合成 BGM 与音效：无外部音频文件、无版权风险、离线可用
   ========================================================================== */

(function () {
  const A = {
    ctx: null,
    master: null,
    musicBus: null,
    sfxBus: null,
    reverb: null,
    reverbSend: null,
    scene: null,
    track: null,
    trackGain: null,
    timer: null,
    nextTime: 0,
    step: 0,
    ducked: false,
    paused: false,
    lastAt: {},
    live: 0,
    ready: false,
  };

  const S = {
    bgm: true,
    bgmVol: 0.5,
    sfx: true,
    sfxVol: 0.75,
    duckTimer: true,
  };

  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

  /* ---------------- 场景编排 ---------------- */
  const SCENES = {
    home: {
      bpm: 70,
      root: 53, // F3
      chords: [[0, 4, 7, 11], [-3, 0, 4, 9], [-5, -1, 2, 7], [-1, 2, 5, 9]],
      arp: [0, 1, 2, 3, 2, 1, 0, 2],
      octave: 12,
      padGain: 0.05,
      arpGain: 0.085,
      sparkle: 0.12,
    },
    study: {
      bpm: 58,
      root: 55, // G3
      chords: [[0, 3, 7, 10], [-2, 2, 5, 9], [-4, 0, 3, 7], [-2, 1, 5, 8]],
      arp: [0, 2, 1, 3, 1, 2, 0, 1],
      octave: 12,
      padGain: 0.055,
      arpGain: 0.055,
      sparkle: 0.05,
    },
    garden: {
      bpm: 66,
      root: 57, // A3
      chords: [[0, 4, 7, 12], [-3, 0, 4, 9], [-5, -1, 2, 7], [0, 4, 7, 11]],
      arp: [0, 1, 3, 2, 1, 3, 2, 1],
      octave: 12,
      padGain: 0.05,
      arpGain: 0.075,
      sparkle: 0.1,
    },
  };

  function now() {
    return A.ctx ? A.ctx.currentTime : 0;
  }

  function makeReverb() {
    const ctx = A.ctx;
    const len = Math.floor(ctx.sampleRate * 2.6);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
      }
    }
    const conv = ctx.createConvolver();
    conv.buffer = buf;
    const wet = ctx.createGain();
    wet.gain.value = 0.5;
    conv.connect(wet);
    wet.connect(A.master);
    A.reverb = conv;
  }

  function ensure() {
    if (A.ctx) return true;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;
    try {
      A.ctx = new Ctx();
      A.master = A.ctx.createGain();
      A.master.gain.value = 0.9;
      A.master.connect(A.ctx.destination);

      A.musicBus = A.ctx.createGain();
      A.musicBus.gain.value = S.bgmVol;
      A.musicBus.connect(A.master);

      A.sfxBus = A.ctx.createGain();
      A.sfxBus.gain.value = S.sfxVol;
      A.sfxBus.connect(A.master);

      makeReverb();
      A.reverbSend = A.ctx.createGain();
      A.reverbSend.gain.value = 0.22;
      A.reverbSend.connect(A.reverb);

      A.ready = true;
      return true;
    } catch (e) {
      A.ctx = null;
      return false;
    }
  }

  function resume() {
    if (!A.ctx) return;
    if (A.ctx.state === 'suspended') A.ctx.resume();
  }

  /* ---------------- 音色 ---------------- */
  function padNote(freq, at, dur, gain) {
    const ctx = A.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(gain, at + 1.2);
    g.gain.linearRampToValueAtTime(0, at + dur);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 900;
    lp.Q.value = 0.4;

    for (let i = 0; i < 2; i++) {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = freq * (i ? 1.006 : 1);
      o.connect(lp);
      o.start(at);
      o.stop(at + dur + 0.05);
    }
    lp.connect(g);
    g.connect(A.trackGain);
    g.connect(A.reverbSend);
  }

  function bellNote(freq, at, gain, dur) {
    const ctx = A.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(gain, at + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, at + (dur || 1.4));
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;
    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = freq * 2.01;
    const g2 = ctx.createGain();
    g2.gain.value = 0.18;
    o.connect(g);
    o2.connect(g2);
    g2.connect(g);
    g.connect(A.trackGain);
    g.connect(A.reverbSend);
    o.start(at);
    o2.start(at);
    o.stop(at + (dur || 1.4) + 0.05);
    o2.stop(at + (dur || 1.4) + 0.05);
  }

  function sparkle(at, gain) {
    const ctx = A.ctx;
    for (let i = 0; i < 3; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 2200 + i * 700;
      g.gain.setValueAtTime(0, at + i * 0.05);
      g.gain.linearRampToValueAtTime(gain, at + i * 0.05 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, at + i * 0.05 + 0.5);
      o.connect(g);
      g.connect(A.trackGain);
      g.connect(A.reverbSend);
      o.start(at + i * 0.05);
      o.stop(at + i * 0.05 + 0.55);
    }
  }

  /* ---------------- 播放一段 ---------------- */
  function playStep(step, at) {
    const sc = A.track;
    if (!sc) return;
    const chord = sc.chords[Math.floor(step / 8) % sc.chords.length];
    const s = step % 8;
    const base = sc.root + sc.octave;

    if (s === 0) {
      for (let i = 0; i < chord.length; i++) {
        padNote(midi(sc.root + chord[i]), at, (60 / sc.bpm) * 4.4, sc.padGain);
      }
    }
    const idx = sc.arp[s] % chord.length;
    const freq = midi(base + chord[idx]);
    bellNote(freq, at, sc.arpGain * (s % 4 === 0 ? 1.15 : 0.85), 1.3);
    if (s === 6 && Math.random() < sc.sparkle) sparkle(at + 0.05, 0.05);
  }

  function scheduler() {
    if (!A.ctx || !A.track || A.paused) return;
    const stepDur = 60 / A.track.bpm / 2;
    while (A.nextTime < A.ctx.currentTime + 0.25) {
      playStep(A.step, A.nextTime);
      A.step++;
      A.nextTime += stepDur;
    }
  }

  function startTrack(name) {
    if (!A.track) return;
    A.step = 0;
    A.nextTime = A.ctx.currentTime + 0.08;
    if (A.timer) clearInterval(A.timer);
    A.timer = setInterval(scheduler, 60);
    scheduler();
  }

  function setScene(name) {
    if (name === A.scene) return;
    A.scene = name;
    if (!A.ctx || !S.bgm) return;
    const def = SCENES[name];
    const prevGain = A.trackGain;
    const prevTrack = A.track;

    if (A.timer) {
      clearInterval(A.timer);
      A.timer = null;
    }
    if (prevGain) {
      try {
        prevGain.gain.cancelScheduledValues(A.ctx.currentTime);
        prevGain.gain.setValueAtTime(prevGain.gain.value, A.ctx.currentTime);
        prevGain.gain.linearRampToValueAtTime(0, A.ctx.currentTime + 1.1);
      } catch (e) {}
      setTimeout(() => {
        try {
          prevGain.disconnect();
        } catch (e) {}
      }, 1400);
    }
    if (prevTrack && prevTrack === A.track) A.track = null;

    if (!def) {
      A.track = null;
      A.trackGain = null;
      return;
    }
    A.track = def;
    A.trackGain = A.ctx.createGain();
    A.trackGain.gain.value = 0;
    A.trackGain.connect(A.musicBus);
    A.trackGain.gain.linearRampToValueAtTime(1, A.ctx.currentTime + 1.4);
    startTrack(name);
  }

  /* ---------------- 音效 ---------------- */
  function tone(type, freq, dur, gain, at, slideTo) {
    const ctx = A.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, at);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, at + dur);
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(gain, at + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g);
    g.connect(A.sfxBus);
    g.connect(A.reverbSend);
    o.start(at);
    o.stop(at + dur + 0.05);
  }

  function noise(at, dur, gain, freq) {
    const ctx = A.ctx;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = freq || 1800;
    bp.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(bp);
    bp.connect(g);
    g.connect(A.sfxBus);
    src.start(at);
  }

  const SFX = {
    click: (t) => tone('sine', 880, 0.07, 0.10, t),
    tab: (t) => {
      tone('triangle', 660, 0.09, 0.08, t);
      tone('sine', 990, 0.12, 0.05, t + 0.03);
    },
    pet: (t) => {
      tone('sine', 620, 0.1, 0.1, t);
      tone('sine', 930, 0.16, 0.07, t + 0.07);
    },
    petCapy: (t) => {
      tone('sine', 320, 0.16, 0.14, t, 260);
      tone('triangle', 480, 0.14, 0.06, t + 0.08);
    },
    petHam: (t) => {
      tone('triangle', 1320, 0.08, 0.07, t);
      tone('sine', 1760, 0.12, 0.05, t + 0.05);
    },
    pat: (t) => {
      noise(t, 0.16, 0.05, 1200);
      tone('sine', 520, 0.18, 0.06, t, 660);
    },
    feed: (t) => {
      noise(t, 0.12, 0.09, 900);
      noise(t + 0.12, 0.1, 0.06, 1400);
      tone('triangle', 400, 0.16, 0.06, t + 0.02);
    },
    coin: (t) => {
      tone('sine', 1568, 0.12, 0.1, t);
      tone('sine', 2093, 0.22, 0.07, t + 0.07);
    },
    exp: (t) => {
      tone('sine', 1046, 0.1, 0.07, t);
      tone('sine', 1318, 0.1, 0.06, t + 0.07);
      tone('sine', 1568, 0.18, 0.06, t + 0.14);
    },
    quest: (t) => {
      [1046, 1318, 1568, 2093].forEach((f, i) => tone('sine', f, 0.26, 0.075, t + i * 0.075));
    },
    redeem: (t) => {
      [1318, 1568, 1760, 2093].forEach((f, i) => tone('triangle', f, 0.22, 0.06, t + i * 0.06));
    },
    levelup: (t) => {
      [523, 659, 784, 1046, 1318].forEach((f, i) => tone('sine', f, 0.5, 0.09, t + i * 0.09));
      sparkle(t + 0.35, 0.07);
    },
    unlock: (t) => {
      tone('sine', 784, 0.4, 0.08, t);
      tone('sine', 1046, 0.5, 0.07, t + 0.1);
      tone('sine', 1318, 0.6, 0.05, t + 0.2);
    },
    error: (t) => {
      tone('triangle', 400, 0.16, 0.08, t, 300);
      tone('triangle', 300, 0.2, 0.06, t + 0.12, 240);
    },
    whoosh: (t) => noise(t, 0.3, 0.04, 900),
  };

  let curVoice = null;
  function say(petId, key) {
    const map = window.XB_VOICE && window.XB_VOICE[petId];
    if (!map || !map[key]) return false;
    const st = window.XB && XB.state && XB.state.settings;
    if (st && st.voice === false) return false;
    try {
      if (curVoice) {
        curVoice.pause();
        curVoice.currentTime = 0;
      }
      const a = new Audio(map[key]);
      a.volume = Math.min(1, (S.sfxVol || 0.75) * 0.9);
      a.play().catch(function () {});
      curVoice = a;
      return true;
    } catch (e) {
      return false;
    }
  }

  function sayRandom(petId, kind) {
    const n = Math.floor(Math.random() * 10);
    return say(petId, kind + '-' + n);
  }

  function petVoice(petId, mood) {
    if (!S.sfx || !A.ready) return;
    const t = now();
    const base = petId === 'hamster' ? 560 : 300;
    const up = mood === 'hungry' ? 0.82 : mood === 'sleep' ? 0.72 : mood === 'happy' ? 1.22 : 1;
    try {
      tone('sine', base * up, 0.16, 0.05, t, base * up * 1.22);
      setTimeout(function () {
        if (A.ready) tone('sine', base * up * 1.28, 0.14, 0.04, now(), base * up * 1.05);
      }, 150);
    } catch (e) {}
  }

  function sfx(name) {
    if (!S.sfx || !A.ready) return;
    const fn = SFX[name] || SFX.click;
    const t = now();
    if (A.lastAt[name] && t - A.lastAt[name] < 0.05) return;
    if (A.live > 12) return;
    A.lastAt[name] = t;
    A.live++;
    try {
      fn(t + 0.005);
    } catch (e) {}
    setTimeout(() => {
      A.live = Math.max(0, A.live - 1);
    }, 700);
  }

  /* ---------------- 设置 ---------------- */
  function applySettings(patch) {
    Object.assign(S, patch || {});
    if (A.musicBus) A.musicBus.gain.value = S.bgm ? S.bgmVol : 0;
    if (A.sfxBus) A.sfxBus.gain.value = S.sfx ? S.sfxVol : 0;
    if (!S.bgm) {
      if (A.timer) {
        clearInterval(A.timer);
        A.timer = null;
      }
      if (A.trackGain) {
        A.trackGain.gain.cancelScheduledValues(now());
        A.trackGain.gain.setValueAtTime(A.trackGain.gain.value, now());
        A.trackGain.gain.linearRampToValueAtTime(0, now() + 0.6);
      }
      A.timer = null;
    } else if (A.ready && A.scene && !A.timer) {
      if (A.trackGain) A.trackGain.gain.linearRampToValueAtTime(1, now() + 0.8);
      startTrack(A.scene);
    }
    if (A.ready) A.musicBus.gain.value = S.bgm ? (A.ducked ? S.bgmVol * 0.35 : S.bgmVol) : 0;
  }

  function duck(on) {
    if (!A.ctx) return;
    A.ducked = !!on;
    const target = S.bgm ? (A.ducked && S.duckTimer ? S.bgmVol * 0.35 : S.bgmVol) : 0;
    A.musicBus.gain.cancelScheduledValues(now());
    A.musicBus.gain.setValueAtTime(A.musicBus.gain.value, now());
    A.musicBus.gain.linearRampToValueAtTime(target, now() + 0.9);
  }

  function pause() {
    A.paused = true;
    if (A.timer) {
      clearInterval(A.timer);
      A.timer = null;
    }
    if (A.ctx && A.ctx.state === 'running') A.ctx.suspend();
  }

  function resumeAll() {
    A.paused = false;
    if (!A.ctx) return;
    if (A.ctx.state === 'suspended') A.ctx.resume();
    if (S.bgm && A.scene && !A.timer) startTrack(A.scene);
  }

  /* ---------------- 初始化 ---------------- */
  function init() {
    const st = window.XB && XB.state && XB.state.settings;
    if (st) {
      if (st.bgm == null) st.bgm = true;
      if (st.bgmVol == null) st.bgmVol = 0.5;
      if (st.sfx == null) st.sfx = true;
      if (st.sfxVol == null) st.sfxVol = 0.75;
      if (st.duckTimer == null) st.duckTimer = true;
      if (st.voice == null) st.voice = true;
      S.bgm = st.bgm;
      S.bgmVol = st.bgmVol;
      S.sfx = st.sfx;
      S.sfxVol = st.sfxVol;
      S.duckTimer = st.duckTimer;
    }
    const unlock = function () {
      if (ensure()) {
        resume();
        applySettings();
        if (A.scene && S.bgm) startTrack(A.scene);
      }
      document.removeEventListener('pointerdown', unlock, true);
      document.removeEventListener('touchstart', unlock, true);
    };
    document.addEventListener('pointerdown', unlock, true);
    document.addEventListener('touchstart', unlock, true);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pause();
      else resumeAll();
    });
    if (window.Capacitor && window.Capacitor.App) {
      try {
        window.Capacitor.App.addListener('appStateChange', (s) => (s.isActive ? resumeAll() : pause()));
      } catch (e) {}
    }
  }

  window.XBAudio = {
    init: init,
    ensure: ensure,
    resume: resume,
    scene: setScene,
    sfx: sfx,
    voice: petVoice,
    say: say,
    sayRandom: sayRandom,
    duck: duck,
    pause: pause,
    resumeAll: resumeAll,
    apply: applySettings,
    state: () => S,
    isReady: () => A.ready,
  };
})();
