/* ==========================================================================
   星伴学园 · 学生档案与测试环境
   - 多档案隔离：每个档案独立存档键
   - 家长密码独立存储（与档案分离）
   - 旧版单存档自动迁移
   ========================================================================== */

(function () {
  const REG = 'xingban.profiles.v1';
  const PARENT = 'xingban.parent.v1';
  const LEGACY = 'xingban.save.v2';
  const LEGACY_COPY = 'xingban.legacy.v2';
  const PREFIX = 'xingban.profile.';

  function read(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
  function write(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }
  function uid(prefix) {
    return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /* ---------------- 首次迁移 ---------------- */
  function migrate() {
    let reg = read(REG);
    if (reg && reg.list && reg.list.length) return reg;

    const legacy = localStorage.getItem(LEGACY);
    const id = 'p-main';
    const list = [{ id: id, name: '小星', type: 'student', createdAt: Date.now() }];
    reg = { v: 1, active: id, list: list };

    if (legacy) {
      try {
        localStorage.setItem(PREFIX + id, legacy);
        if (!localStorage.getItem(LEGACY_COPY)) localStorage.setItem(LEGACY_COPY, legacy);
        const data = JSON.parse(legacy);
        const pw = data && data.parent && data.parent.password;
        if (pw && !localStorage.getItem(PARENT)) {
          localStorage.setItem(PARENT, JSON.stringify({ v: 1, salt: pw.salt, iterations: pw.iterations, hash: pw.hash, createdAt: Date.now(), migrated: true }));
        }
      } catch (e) {
        /* 迁移失败时保持旧键可用 */
      }
    }
    write(REG, reg);
    return reg;
  }

  function registry() {
    return read(REG) || migrate();
  }
  function saveRegistry(reg) {
    write(REG, reg);
  }

  function activeId() {
    const reg = registry();
    if (!reg.active || !reg.list.some((p) => p.id === reg.active)) {
      reg.active = reg.list[0] ? reg.list[0].id : 'p-main';
      saveRegistry(reg);
    }
    return reg.active;
  }
  function active() {
    const reg = registry();
    return reg.list.find((p) => p.id === activeId()) || reg.list[0];
  }
  function list() {
    return registry().list.slice();
  }
  function key(id) {
    return PREFIX + (id || activeId());
  }
  function stateOf(id) {
    return read(PREFIX + id);
  }
  function isTest(id) {
    const p = list().find((x) => x.id === (id || activeId()));
    return !!(p && p.type === 'test');
  }

  function create(name, type) {
    const reg = registry();
    const id = uid(type === 'test' ? 'pt' : 'p');
    const item = {
      id: id,
      name: (name || (type === 'test' ? '测试档案' : '新同学')).slice(0, 12),
      type: type === 'test' ? 'test' : 'student',
      createdAt: Date.now(),
    };
    reg.list.push(item);
    saveRegistry(reg);
    try { localStorage.setItem('xingban.tmp.fresh', '1'); } catch (e) {}
    return item;
  }

  function rename(id, name) {
    const reg = registry();
    const p = reg.list.find((x) => x.id === id);
    if (!p) return false;
    p.name = String(name || '').slice(0, 12) || p.name;
    saveRegistry(reg);
    return true;
  }

  function remove(id) {
    const reg = registry();
    const p = reg.list.find((x) => x.id === id);
    if (!p) return { ok: false, reason: '档案不存在' };
    const formal = reg.list.filter((x) => x.type === 'student');
    if (p.type === 'student' && formal.length <= 1) return { ok: false, reason: '至少保留一个正式档案' };
    reg.list = reg.list.filter((x) => x.id !== id);
    if (reg.active === id) reg.active = reg.list[0].id;
    saveRegistry(reg);
    try {
      localStorage.removeItem(PREFIX + id);
    } catch (e) {}
    return { ok: true, active: reg.active };
  }

  function switchTo(id) {
    const reg = registry();
    if (!reg.list.some((p) => p.id === id)) return false;
    reg.active = id;
    saveRegistry(reg);
    return true;
  }

  function clearProfile(id) {
    try {
      localStorage.removeItem(PREFIX + (id || activeId()));
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---------------- 家长密码（独立存储） ---------------- */
  function parentRecord() {
    return read(PARENT);
  }
  function setParentRecord(rec) {
    return write(PARENT, rec);
  }

  /* ---------------- 备份（不含明文密码） ---------------- */
  function exportAll() {
    const reg = registry();
    const profiles = reg.list.map((p) => {
      const st = read(PREFIX + p.id);
      return { id: p.id, name: p.name, type: p.type, createdAt: p.createdAt, state: st || null };
    });
    return {
      app: 'xingban',
      schema: 4,
      exportedAt: Date.now(),
      active: reg.active,
      profiles: profiles,
      parent: parentRecord() || null,
      settings: (read(PREFIX + reg.active) || {}).settings || null,
    };
  }

  function importAll(text) {
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return { ok: false, reason: '不是有效的备份文件' };
    }
    if (!data || data.app !== 'xingban' || !Array.isArray(data.profiles)) {
      return { ok: false, reason: '备份格式不匹配' };
    }
    const good = data.profiles.filter((p) => p && p.id && p.state && p.state.pets && p.state.quests);
    if (!good.length) return { ok: false, reason: '备份里没有可用的档案数据' };

    good.forEach((p) => {
      write(PREFIX + p.id, p.state);
    });
    const reg = {
      v: 1,
      active: good.some((p) => p.id === data.active) ? data.active : good[0].id,
      list: good.map((p) => ({ id: p.id, name: p.name || '档案', type: p.type === 'test' ? 'test' : 'student', createdAt: p.createdAt || Date.now() })),
    };
    saveRegistry(reg);
    if (data.parent && data.parent.hash) write(PARENT, data.parent);
    return { ok: true, count: good.length, active: reg.active };
  }

  /* ---------------- 单一档案导出 ---------------- */
  function exportProfile(id) {
    const p = list().find((x) => x.id === (id || activeId()));
    const st = read(PREFIX + (id || activeId()));
    return {
      app: 'xingban',
      schema: 4,
      kind: 'single-profile',
      exportedAt: Date.now(),
      profiles: [{ id: p.id, name: p.name, type: p.type, createdAt: p.createdAt, state: st }],
      active: p.id,
      parent: null,
    };
  }

  const api = {
    migrate: migrate,
    list: list,
    active: active,
    activeId: activeId,
    key: key,
    stateOf: stateOf,
    isTest: isTest,
    create: create,
    rename: rename,
    remove: remove,
    switchTo: switchTo,
    clearProfile: clearProfile,
    parentRecord: parentRecord,
    setParentRecord: setParentRecord,
    exportAll: exportAll,
    exportProfile: exportProfile,
    importAll: importAll,
    PREFIX: PREFIX,
    PARENT_KEY: PARENT,
  };

  migrate();
  window.XBProfiles = api;
  window.XBStorage = { key: () => key() };
})();
