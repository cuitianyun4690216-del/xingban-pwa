/* ==========================================================================
   星伴学园 · 自动备份（快照 / 7 天提醒 / 安卓原生文件）
   ========================================================================== */

(function () {
  const SNAP_KEY = 'xingban.snapshots.v1';
  const LAST_EXPORT = 'xingban.lastExport.v1';
  const MAX_SNAP = 5;
  const DAY = 86400000;

  function pageKey() {
    return window.XB_PAGE_KEY || 'xingban.save.v2';
  }
  function readSnaps() {
    try {
      const arr = JSON.parse(localStorage.getItem(SNAP_KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }
  function writeSnaps(arr) {
    try {
      localStorage.setItem(SNAP_KEY, JSON.stringify(arr.slice(0, MAX_SNAP)));
    } catch (e) {}
  }

  function snapshot() {
    try {
      const raw = localStorage.getItem(pageKey());
      if (!raw || raw.length < 200) return;
      const arr = readSnaps();
      const last = arr[0];
      if (last && last.data === raw) return;
      arr.unshift({ ts: Date.now(), key: pageKey(), data: raw });
      writeSnaps(arr);
    } catch (e) {}
  }

  function latest() {
    const arr = readSnaps();
    return arr.length ? arr[0] : null;
  }

  function restore(snap) {
    try {
      localStorage.setItem(pageKey(), snap.data);
      return true;
    } catch (e) {
      return false;
    }
  }

  function exportNow() {
    try {
      const data = window.XBProfiles ? XBProfiles.exportAll() : JSON.parse(localStorage.getItem(pageKey()) || '{}');
      const text = JSON.stringify(data, null, 2);
      const blob = new Blob([text], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'xingban-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      try {
        localStorage.setItem(LAST_EXPORT, String(Date.now()));
      } catch (e) {}
      return true;
    } catch (e) {
      return false;
    }
  }

  function lastExportDays() {
    const t = Number(localStorage.getItem(LAST_EXPORT) || 0);
    if (!t) return 999;
    return Math.floor((Date.now() - t) / DAY);
  }

  /* ---------------- 安卓：写真实文件 ---------------- */
  function nativeBackup() {
    const cap = window.Capacitor;
    const fsPlugin = cap && cap.Plugins && cap.Plugins.Filesystem;
    if (!fsPlugin || !window.XBProfiles) return;
    try {
      const text = JSON.stringify(XBProfiles.exportAll());
      fsPlugin
        .writeFile({
          path: 'xingban/backup-' + new Date().toISOString().slice(0, 10) + '.json',
          data: text,
          directory: 'EXTERNAL',
          encoding: 'utf8',
          recursive: true,
        })
        .catch(function () {});
    } catch (e) {}
  }

  /* ---------------- 首次打开：快照恢复检测 ---------------- */
  function checkRestore() {
    const snap = latest();
    if (!snap) return;
    const raw = localStorage.getItem(pageKey());
    if (raw && raw.length > 200) return;
    XB.ui.confirm = {
      title: '发现上次的存档快照',
      text: '主存档不见了，但保留着 ' + new Date(snap.ts).toLocaleString() + ' 的快照。要恢复吗？',
      okText: '恢复',
      onOk: function () {
        restore(snap);
        location.reload();
      },
    };
  }

  /* ---------------- 7 天提醒 ---------------- */
  function checkReminder() {
    if (lastExportDays() < 7) return;
    setTimeout(function () {
      XB.ui.confirm = {
        title: '好久没备份啦',
        text: '已经 ' + (lastExportDays() > 300 ? '很久' : lastExportDays() + ' 天') + '没有导出备份。现在导出一份吗？（不会影响游戏）',
        okText: '导出备份',
        onOk: function () {
          exportNow();
          XB.actions.toast('备份已导出，记得存到网盘或微信', 'bookmark');
        },
      };
    }, 2600);
  }

  /* ---------------- 事件绑定 ---------------- */
  function flushNow() {
    if (XB.actions && XB.actions.flush) XB.actions.flush();
    snapshot();
    nativeBackup();
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) flushNow();
  });
  window.addEventListener('pagehide', flushNow);
  window.addEventListener('beforeunload', flushNow);

  if (window.Capacitor && window.Capacitor.App) {
    try {
      window.Capacitor.App.addListener('appStateChange', function (s) {
        if (!s.isActive) flushNow();
      });
    } catch (e) {}
  }

  setTimeout(function () {
    checkRestore();
    checkReminder();
  }, 1500);

  window.XBBackup = {
    snapshot: snapshot,
    flush: flushNow,
    exportNow: exportNow,
    last: latest,
    days: lastExportDays,
    restore: restore,
  };
})();
