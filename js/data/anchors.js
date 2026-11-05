/* 装扮锚点覆盖（可视化微调后保存） */
(function () {
  const KEY = 'xingban.anchors.v1';
  let map = {};
  try { map = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { map = {}; }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(map)); } catch (e) {} }
  window.XBAnchors = {
    get(itemId, petId) { return map[itemId] && map[itemId][petId]; },
    set(itemId, petId, a) {
      map[itemId] = map[itemId] || {};
      map[itemId][petId] = a;
      persist();
      if (window.XB && XB.ui) XB.ui.anchorRev = (XB.ui.anchorRev || 0) + 1;
    },
    clear(itemId, petId) {
      if (map[itemId]) { delete map[itemId][petId]; persist(); if (window.XB && XB.ui) XB.ui.anchorRev = (XB.ui.anchorRev || 0) + 1; }
    },
    all() { return map; },
  };
})();
