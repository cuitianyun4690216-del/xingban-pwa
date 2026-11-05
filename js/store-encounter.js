/* ==========================================================================
   星伴学园 · 奇遇系统（治愈向小事件）
   ========================================================================== */

(function () {
  const s = XB.state;
  const H = XB.helpers;

  if (!s.encounter) s.encounter = { last: '', count: 0, seen: [], log: [] };

  const EVENTS = [
    {
      id: 'star-window',
      title: '窗边的星星',
      cond: () => true,
      text: '夜里，{pet}趴在窗台上，盯着天上一颗很亮的星星看了很久。',
      options: [
        { label: '陪它一起看', reply: '你们靠在一起，谁也没说话。它把脑袋轻轻搭在你肩上。', mood: 10, intimacy: 4, stars: 1 },
        { label: '给它讲一个星星的故事', reply: '你讲到一半，它已经靠着你的手睡着了。', mood: 8, intimacy: 6, exp: 8 },
      ],
    },
    {
      id: 'old-page',
      title: '一页旧纸',
      cond: () => (s.records || []).filter((r) => r.category === 'reading').length >= 3,
      text: '{pet}从书架的缝隙里叼出一张旧纸片，上面画着一株小小的花。',
      options: [
        { label: '和它一起读一读', reply: '纸片上写着「给未来的你」。你读给它听，它听得很认真。', mood: 8, intimacy: 5, stars: 2 },
        { label: '夹回书里，留个记号', reply: '你们把它放回原处，约定下次再来找。', mood: 5, exp: 10 },
      ],
    },
    {
      id: 'hungry-crumb',
      title: '饼干渣',
      cond: () => s.care && s.care.hunger < 40,
      text: '{pet}在桌子底下找到一小块饼干渣，闻了闻，又抬头看看你。',
      options: [
        { label: '给它正经做顿饭', reply: '它吃得头也不抬，尾巴晃得像小风车。', mood: 12, hunger: 30, intimacy: 4 },
        { label: '先陪它忍一忍', reply: '它蹭了蹭你的手，好像在说「没关系」。', mood: 3, intimacy: 2, stars: 1 },
      ],
    },
    {
      id: 'flower-package',
      title: '门口的包裹',
      cond: () => s.checkin && s.checkin.streak >= 3,
      text: '门口放着一个小包裹，里面是一株会发光的夜光花，还有一张字条：「谢谢你每天来。」',
      options: [
        { label: '种在窗边', reply: '夜光花慢慢亮起来，{pet}守着它不肯走。', mood: 12, coins: 30, stars: 2 },
        { label: '送给你', reply: '它把花推到你面前，眼睛亮亮的。', mood: 10, intimacy: 8 },
      ],
    },
    {
      id: 'rain-shelter',
      title: '突然的雨',
      cond: () => true,
      text: '外面忽然下起雨。{pet}躲到屋檐下，回头看你有没有跟上。',
      options: [
        { label: '一起躲雨', reply: '雨声很轻，你们并排坐着，看水洼里的倒影。', mood: 9, intimacy: 6 },
        { label: '跑回去拿伞', reply: '你回来时，它正努力用身体护住你的书包。', mood: 7, intimacy: 4, exp: 6 },
      ],
    },
    {
      id: 'paper-crane',
      title: '会飞的纸鹤',
      cond: () => (s.records || []).length >= 5,
      text: '{pet}把一张作业纸折成了歪歪扭扭的纸鹤，举起来给你看。',
      options: [
        { label: '夸夸它', reply: '它得意地转了两圈，纸鹤差点被扇飞。', mood: 10, intimacy: 5, coins: 20 },
        { label: '教它折得更好', reply: '你们折了一桌子的纸鹤，最后一只终于稳稳地立住了。', mood: 8, exp: 12, stars: 1 },
      ],
    },
    {
      id: 'sleepy-afternoon',
      title: '犯困的下午',
      cond: () => (new Date().getHours() >= 13 && new Date().getHours() <= 16),
      text: '下午的阳光晒得暖暖的，{pet}打了个大大的哈欠，眼皮开始打架。',
      options: [
        { label: '让它睡一会儿', reply: '你放轻脚步，它睡得很沉，还打起了小呼噜。', mood: 6, energy: 25, intimacy: 3 },
        { label: '轻轻叫醒它', reply: '它迷迷糊糊地睁眼，先确认你还在，又重新趴下了。', mood: 4, intimacy: 2, stars: 1 },
      ],
    },
    {
      id: 'lost-bell',
      title: '找不到的小铃铛',
      cond: () => true,
      text: '{pet}脖子上的小铃铛不见了，它急得在房间里转圈。',
      options: [
        { label: '帮它找', reply: '铃铛卡在沙发缝里。你把它挂回去，它开心地摇了一路。', mood: 8, intimacy: 6, coins: 15 },
        { label: '说「找不到也没关系」', reply: '它安静下来，把头靠在你腿上。', mood: 5, intimacy: 4, exp: 8 },
      ],
    },
  ];

  function petName() {
    return H.petMeta(s.activePetId).name;
  }

  function eligible() {
    return EVENTS.filter((e) => {
      if (s.encounter.seen.indexOf(e.id) >= 0 && Math.random() < 0.5) return false;
      try {
        return e.cond();
      } catch (err) {
        return false;
      }
    });
  }

  function pick() {
    const list = eligible();
    return list.length ? list[Math.floor(Math.random() * list.length)] : EVENTS[0];
  }

  function open(id) {
    const ev = (id && EVENTS.find((e) => e.id === id)) || pick();
    XB.ui.encounter = {
      id: ev.id,
      title: ev.title,
      text: ev.text.replace(/\{pet\}/g, petName()),
      options: ev.options,
      result: '',
    };
    return ev;
  }

  function choose(index) {
    const cur = XB.ui.encounter;
    if (!cur) return { ok: false };
    const ev = EVENTS.find((e) => e.id === cur.id);
    const opt = ev.options[index];
    if (!opt) return { ok: false };
    const pet = s.pets[s.activePetId];
    if (opt.mood) s.care.mood = Math.min(100, s.care.mood + opt.mood);
    if (opt.hunger) s.care.hunger = Math.min(100, s.care.hunger + opt.hunger);
    if (opt.energy) s.care.energy = Math.min(100, s.care.energy + opt.energy);
    if (opt.intimacy && pet) pet.intimacy = Math.min(100, pet.intimacy + opt.intimacy);
    if (opt.exp && pet) pet.exp = Math.min(pet.expMax, pet.exp + opt.exp);
    if (opt.coins) s.player.coins += opt.coins;
    if (opt.stars) s.player.stars += opt.stars;
    if (s.encounter.seen.indexOf(ev.id) < 0) s.encounter.seen.push(ev.id);
    s.encounter.last = H.dateKey();
    s.encounter.count += 1;
    s.encounter.log.unshift({ id: ev.id, title: ev.title, date: H.dateKey(), reply: opt.reply });
    if (s.encounter.log.length > 40) s.encounter.log.length = 40;
    cur.result = opt.reply.replace(/\{pet\}/g, petName());
    return { ok: true, reward: { mood: opt.mood || 0, coins: opt.coins || 0, stars: opt.stars || 0, intimacy: opt.intimacy || 0 } };
  }

  function close() {
    XB.ui.encounter = null;
  }

  function canShow() {
    return s.encounter.last !== H.dateKey();
  }

  function maybeShow() {
    if (!canShow()) return false;
    if (Math.random() > 0.65) return false;
    open();
    return true;
  }

  Object.assign(XB.actions, {
    openEncounter: open,
    chooseEncounter: choose,
    closeEncounter: close,
    maybeEncounter: maybeShow,
  });
  Object.assign(XB.helpers, {
    encounterEvents: () => EVENTS.map((e) => ({ id: e.id, title: e.title })),
    encounterLog: () => s.encounter.log.slice(0, 10),
    canEncounter: canShow,
  });
})();
