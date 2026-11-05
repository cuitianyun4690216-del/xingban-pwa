/* ==========================================================================
   星伴学园 · 世界数据（家园场景 / 家具 / 探索地图 / 成就）
   ========================================================================== */

(function () {
  const SCENES = [
    {
      id: 'bedroom',
      name: '温馨卧室',
      desc: '木屋里最暖的一间，窗外的星星会替你关灯。',
      image: 'assets/scenes/bedroom.webp',
      level: 1,
      tint: '#8E7FAF',
    },
    {
      id: 'garden',
      name: '宠物花园',
      desc: '云上的花园，风一吹，花瓣就落在小路上。',
      image: 'assets/backgrounds/home-bg.webp',
      level: 1,
      tint: '#A8BFA5',
    },
    {
      id: 'study',
      name: '学习角',
      desc: '旧书架和一张木桌，下午的光会停在书页上。',
      image: 'assets/scenes/study.webp',
      level: 2,
      tint: '#B08644',
    },
    {
      id: 'courtyard',
      name: '梦幻庭院',
      desc: '黄昏的魔法学院庭院，钟声一天只响两次。',
      image: 'assets/backgrounds/academy-dusk.webp',
      level: 3,
      tint: '#C88A93',
    },
    {
      id: 'observatory',
      name: '星空观测台',
      desc: '黄铜望远镜对着银河，能看到很远的自己。',
      image: 'assets/scenes/observatory.webp',
      level: 4,
      tint: '#6E8FB3',
    },
    {
      id: 'forest',
      name: '魔法森林',
      desc: '发光的蘑菇和萤火虫，是学园藏起来的秘密。',
      image: 'assets/scenes/forest.webp',
      level: 5,
      tint: '#779171',
    },
  ];

  const FURNITURE = [
    {
      id: 'bed',
      name: '云朵小床',
      price: 180,
      rarity: 'uncommon',
      desc: '躺上去像陷进一朵云。',
      w: 34,
      art:
        '<path d="M10 60 h80 v14 h-80z" fill="#8E7FAF"/>' +
        '<path d="M14 60 V38 q17 -15 33 0 V60" fill="#F7F2E6" stroke="#C9A96A" stroke-width="1.2"/>' +
        '<rect x="17" y="52" width="66" height="15" rx="6" fill="#B9A9D5" stroke="#8E7FAF" stroke-width="1"/>' +
        '<rect x="22" y="43" width="19" height="10" rx="4" fill="#FFF8E8" stroke="#C9A96A" stroke-width="1"/>' +
        '<path d="M40 58 h40 v9 h-40z" fill="#CBBDE6"/>' +
        '<path d="M12 74 h76" stroke="#5E4E7A" stroke-width="2.2"/>' +
        '<circle cx="58" cy="42" r="3" fill="#E3CA96"/>',
    },
    {
      id: 'lamp',
      name: '月光落地灯',
      price: 120,
      rarity: 'common',
      desc: '灯光是月牙的形状。',
      w: 16,
      art:
        '<path d="M50 30 V78" stroke="#A9854A" stroke-width="2.4"/><path d="M34 78 h32" stroke="#A9854A" stroke-width="2.4"/>' +
        '<path d="M30 30 h40 l-8 -18 h-24z" fill="#F2DFB2" stroke="#A9854A" stroke-width="1.4"/>' +
        '<circle cx="50" cy="40" r="4" fill="#FFF6DE" opacity=".9"/>' +
        '<path d="M50 46 l3 6 -3 6 -3 -6z" fill="#E3CA96"/>',
    },
    {
      id: 'rug',
      name: '星纹圆毯',
      price: 90,
      rarity: 'common',
      desc: '踩上去软软的，边缘绣着星星。',
      w: 40,
      art:
        '<ellipse cx="50" cy="56" rx="42" ry="20" fill="#DED4EF" stroke="#B9A9D5" stroke-width="1.2"/>' +
        '<ellipse cx="50" cy="56" rx="31" ry="14" fill="none" stroke="#C9A96A" stroke-width="1" stroke-dasharray="3 4"/>' +
        '<path d="M50 46 l2.4 5.4 5.6.6-4.2 4 1.2 5.6-5-2.8-5 2.8 1.2-5.6-4.2-4 5.6-.6z" fill="#E3CA96"/>',
    },
    {
      id: 'bookshelf',
      name: '古卷书架',
      price: 220,
      rarity: 'uncommon',
      desc: '每一层都塞着读到一半的故事。',
      w: 22,
      art:
        '<rect x="16" y="12" width="68" height="76" rx="3" fill="#8A6A45" stroke="#5E4527" stroke-width="1.4"/>' +
        '<path d="M22 34 h56M22 56 h56" stroke="#5E4527" stroke-width="2"/>' +
        '<g fill="#B9A9D5"><rect x="24" y="18" width="7" height="14"/><rect x="33" y="16" width="6" height="16"/></g>' +
        '<g fill="#A8BFA5"><rect x="42" y="19" width="7" height="13"/></g>' +
        '<g fill="#DBABB4"><rect x="54" y="17" width="8" height="15"/></g>' +
        '<g fill="#E3CA96"><rect x="24" y="40" width="8" height="14"/></g>' +
        '<g fill="#8FAECB"><rect x="36" y="38" width="7" height="16"/><rect x="46" y="41" width="8" height="13"/></g>',
    },
    {
      id: 'plant',
      name: '月光盆栽',
      price: 80,
      rarity: 'common',
      desc: '叶子会在夜里发出淡淡的光。',
      w: 14,
      art:
        '<path d="M34 60 h32 l-4 24 h-24z" fill="#B08644" stroke="#7C5E34" stroke-width="1.2"/>' +
        '<path d="M50 60 C50 42 38 34 28 34 C30 48 40 58 50 60z" fill="#A8BFA5"/>' +
        '<path d="M50 60 C50 40 62 30 72 30 C70 46 60 58 50 60z" fill="#8FA67F"/>' +
        '<path d="M50 60 V30" stroke="#779171" stroke-width="1.6"/>' +
        '<circle cx="66" cy="26" r="4" fill="#FFF6DE" opacity=".9"/>',
    },
    {
      id: 'telescope',
      name: '黄铜望远镜',
      price: 260,
      rarity: 'rare',
      desc: '能看到星星岛那边的灯。',
      w: 24,
      art:
        '<path d="M36 78 L50 40 L64 78" fill="none" stroke="#A9854A" stroke-width="2.4"/>' +
        '<path d="M28 44 L70 24 L76 34 L34 54z" fill="#C9A96A" stroke="#7C5E34" stroke-width="1.4"/>' +
        '<circle cx="74" cy="29" r="5" fill="#8FAECB" stroke="#7C5E34"/>' +
        '<path d="M34 54 L28 44" stroke="#7C5E34" stroke-width="1.2"/>' +
        '<circle cx="50" cy="44" r="3" fill="#E3CA96"/>',
    },
    {
      id: 'cushion',
      name: '软绵坐垫',
      price: 70,
      rarity: 'common',
      desc: '宠物最喜欢趴在上面打盹。',
      w: 20,
      art:
        '<ellipse cx="50" cy="58" rx="34" ry="16" fill="#DBABB4" stroke="#B87B86" stroke-width="1.2"/>' +
        '<ellipse cx="50" cy="55" rx="26" ry="11" fill="#F2DADE"/>' +
        '<circle cx="50" cy="55" r="4" fill="#B87B86" opacity=".55"/>',
    },
    {
      id: 'table',
      name: '小圆木桌',
      price: 140,
      rarity: 'common',
      desc: '刚好放下一杯热牛奶和一本书。',
      w: 26,
      art:
        '<ellipse cx="50" cy="42" rx="38" ry="12" fill="#B08A5F" stroke="#7C5E34" stroke-width="1.4"/>' +
        '<path d="M50 54 V86" stroke="#7C5E34" stroke-width="3"/>' +
        '<path d="M36 86 h28" stroke="#7C5E34" stroke-width="2.4"/>' +
        '<path d="M38 38 h24 v-8 h-24z" fill="#F7F2E6" stroke="#C9A96A" stroke-width="1"/>' +
        '<circle cx="66" cy="34" r="5" fill="#E8E0F6" stroke="#B9A9D5"/>',
    },
    {
      id: 'starjar',
      name: '星星罐',
      price: 160,
      rarity: 'uncommon',
      desc: '每完成一个任务，就有一颗星星掉进去。',
      w: 13,
      art:
        '<path d="M34 36 h32 v10 l-4 4 v30 a4 4 0 0 1-4 4 h-16 a4 4 0 0 1-4-4 v-30 l-4-4z" fill="#E8F2FA" fill-opacity=".55" stroke="#93B2CD" stroke-width="1.4"/>' +
        '<rect x="32" y="28" width="36" height="8" rx="3" fill="#C9A96A" stroke="#7C5E34" stroke-width="1.2"/>' +
        '<path d="M50 56 l2.6 5.6 6 .8-4.4 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.4-4.2 6-.8z" fill="#F2DFB2"/>' +
        '<circle cx="44" cy="70" r="2" fill="#FFF6DE"/>',
    },
  ];

  const REGIONS = [
    {
      id: 'magic-forest',
      name: '魔法森林',
      desc: '会发光的蘑菇林，学园最早的秘密从这里开始。',
      image: 'assets/scenes/forest.webp',
      cond: { type: 'tasks', value: 5, text: '完成 5 个学习任务' },
      reward: { coins: 200, stars: 10, stardust: 1 },
    },
    {
      id: 'star-island',
      name: '星星岛',
      desc: '浮在云上的小岛，夜里能听见星星落地的声音。',
      image: 'assets/backgrounds/home-bg.webp',
      cond: { type: 'tasks', value: 10, text: '完成 10 个学习任务' },
      reward: { coins: 300, stars: 15, stardust: 1 },
    },
    {
      id: 'math-valley',
      name: '数学山谷',
      desc: '山谷里的石头都排成算式，走一步要算一步。',
      image: null,
      motif: 'rune',
      tint: '#6E8FB3',
      cond: { type: 'category', value: 'math', count: 6, text: '完成 6 个数学任务' },
      reward: { coins: 240, stars: 12, stardust: 1 },
    },
    {
      id: 'library',
      name: '阅读图书馆',
      desc: '书页会自己翻动，读到精彩处灯会更亮一点。',
      image: 'assets/scenes/study.webp',
      cond: { type: 'category', value: 'reading', count: 8, text: '完成 8 个阅读任务' },
      reward: { coins: 260, stars: 12, stardust: 1 },
    },
    {
      id: 'dream-garden',
      name: '梦幻花园',
      desc: '黄昏的庭院，每一片花瓣都记得你来过。',
      image: 'assets/backgrounds/academy-dusk.webp',
      cond: { type: 'minutes', value: 60, text: '累计专注 60 分钟' },
      reward: { coins: 320, stars: 18, stardust: 1 },
    },
    {
      id: 'observatory',
      name: '星空观测台',
      desc: '望远镜对着银河，能看见未来的自己。',
      image: 'assets/scenes/observatory.webp',
      cond: { type: 'petLevel', value: 10, text: '任意宠物达到 Lv.10' },
      reward: { coins: 400, stars: 20, stardust: 2 },
    },
  ];

  const ACHIEVEMENTS = [
    { id: 'learning_master', name: '学习达人', icon: 'book', desc: '完成 10 个学习任务', target: 10, reward: { coins: 300, stars: 10 } },
    { id: 'reading_explorer', name: '阅读探索者', icon: 'scroll', desc: '完成 8 个阅读类任务', target: 8, reward: { coins: 280, stars: 10 } },
    { id: 'math_adventurer', name: '数学冒险家', icon: 'rune', desc: '完成 8 个数学类任务', target: 8, reward: { coins: 280, stars: 10 } },
    { id: 'sport_brave', name: '运动小勇士', icon: 'leaf', desc: '完成 6 个运动类任务', target: 6, reward: { coins: 240, stars: 8 } },
    { id: 'persistent', name: '坚持成长者', icon: 'hourglass', desc: '累计专注 120 分钟', target: 120, reward: { coins: 360, stars: 12 } },
    { id: 'pet_collector', name: '宠物收藏家', icon: 'heart', desc: '拥有 5 件宠物装扮', target: 5, reward: { coins: 320, stars: 12 } },
    { id: 'home_designer', name: '家园设计师', icon: 'house', desc: '在家园摆放 4 件家具', target: 4, reward: { coins: 320, stars: 12 } },
    { id: 'dual_trainer', name: '双宠物培养者', icon: 'paw', desc: '两只宠物都达到 Lv.10', target: 2, reward: { coins: 420, stars: 18 } },
  ];

  const EVOLUTION = {
    1: { stage: 1, name: '成长形态', level: 5, dust: 0, desc: '毛色更亮，眼神也更笃定了。', unlock: 'hat-flower' },
    2: { stage: 2, name: '陪伴形态', level: 8, dust: 2, desc: '身边浮起一层浅浅的星光。', unlock: 'scarf-star' },
    3: { stage: 3, name: '星辉形态', level: 12, dust: 4, desc: '星辉落在身上，学园里会有人悄悄看它。', unlock: 'wings-glow' },
  };

  window.XB_WORLD = {
    scenes: SCENES,
    furniture: FURNITURE,
    regions: REGIONS,
    achievements: ACHIEVEMENTS,
    evolution: EVOLUTION,
    sceneById(id) {
      return SCENES.find((s) => s.id === id) || SCENES[0];
    },
    furnitureById(id) {
      return FURNITURE.find((f) => f.id === id);
    },
    regionById(id) {
      return REGIONS.find((r) => r.id === id);
    },
    achievementById(id) {
      return ACHIEVEMENTS.find((a) => a.id === id);
    },
  };
})();
