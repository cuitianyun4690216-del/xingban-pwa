/* ==========================================================================
   星伴学园 · 静态配置（分类 / 难度 / 成长阶段 / 奖励规则）
   ========================================================================== */

(function () {
  const categories = [
    { id: 'chinese', name: '语文', icon: 'scroll', tint: 'rose' },
    { id: 'math', name: '数学', icon: 'rune', tint: 'blue' },
    { id: 'english', name: '英语', icon: 'quill', tint: 'lavender' },
    { id: 'reading', name: '阅读', icon: 'book', tint: 'sage' },
    { id: 'sport', name: '运动', icon: 'leaf', tint: 'mint' },
    { id: 'habit', name: '生活习惯', icon: 'home', tint: 'gold' },
    { id: 'self', name: '自主学习', icon: 'sparkle', tint: 'violet' },
    { id: 'custom', name: '自定义', icon: 'star', tint: 'gold' },
  ];

  const difficulties = [
    { id: 'easy', name: '简单', exp: 1, coins: 1, stars: 0 },
    { id: 'normal', name: '普通', exp: 1.25, coins: 1.2, stars: 0.5 },
    { id: 'hard', name: '挑战', exp: 1.6, coins: 1.5, stars: 1 },
  ];

  const stages = [
    { key: 'nursery', min: 1, name: '幼生期', desc: '刚刚来到学园的小小身影' },
    { key: 'growth', min: 5, name: '成长期', desc: '开始熟悉这里的每一盏灯' },
    { key: 'companion', min: 10, name: '陪伴期', desc: '已经习惯在你身边打转' },
    { key: 'radiance', min: 15, name: '星辉期', desc: '身上浮起淡淡的星光' },
    { key: 'legend', min: 20, name: '传说期', desc: '学园传说里会有一页属于它' },
  ];

  const stageNames = {
    capybara: ['暖绒幼崽', '沉稳学徒', '温柔守护者', '星光贤者', '学园传说'],
    hamster: ['机灵幼仔', '好奇学徒', '探险小队长', '星辉游侠', '学园传奇'],
  };

  const moods = {
    calm: { name: '安静', icon: 'leaf' },
    happy: { name: '开心', icon: 'sparkle' },
    excited: { name: '兴奋', icon: 'star' },
    sleepy: { name: '困倦', icon: 'moon' },
    proud: { name: '自豪', icon: 'crown' },
  };

  const interactions = {
    pet: { name: '抚摸', icon: 'hand', intimacy: 2, exp: 6, mood: 'calm', line: '顺着毛摸，它慢慢眨了眨眼' },
    feed: { name: '喂食', icon: 'leaf', intimacy: 3, exp: 8, mood: 'happy', line: '吃得津津有味，尾巴都翘起来了' },
    play: { name: '玩耍', icon: 'ball', intimacy: 2, exp: 10, mood: 'excited', line: '追着光点跑了两圈' },
    rest: { name: '休息', icon: 'moon', intimacy: 1, exp: 4, mood: 'sleepy', line: '靠着你打起了小呼噜' },
  };

  const defaultQuests = [
    {
      id: 'q-reading-30',
      title: '阅读 30 分钟',
      category: 'reading',
      desc: '挑一本喜欢的书，安静读完一个章节。',
      minutes: 30,
      difficulty: 'easy',
      exp: 50,
      coins: 100,
      repeat: 'daily',
      createdAt: 0,
    },
    {
      id: 'q-math-oral',
      title: '数学口算练习',
      category: 'math',
      desc: '完成 20 道口算，错的题目订正一遍。',
      minutes: 20,
      difficulty: 'normal',
      exp: 62,
      coins: 120,
      repeat: 'daily',
      createdAt: 0,
    },
    {
      id: 'q-english-words',
      title: '英语单词 15 个',
      category: 'english',
      desc: '跟读并默写今天的新单词。',
      minutes: 15,
      difficulty: 'easy',
      exp: 45,
      coins: 90,
      repeat: 'daily',
      createdAt: 0,
    },
    {
      id: 'q-chinese-read',
      title: '语文朗读一篇',
      category: 'chinese',
      desc: '大声朗读课文，注意停顿和语气。',
      minutes: 15,
      difficulty: 'easy',
      exp: 40,
      coins: 80,
      repeat: 'daily',
      createdAt: 0,
    },
    {
      id: 'q-sport-20',
      title: '户外运动 20 分钟',
      category: 'sport',
      desc: '跳绳、慢跑或球类都可以，记得拉伸。',
      minutes: 20,
      difficulty: 'normal',
      exp: 55,
      coins: 110,
      repeat: 'daily',
      createdAt: 0,
    },
    {
      id: 'q-habit-desk',
      title: '整理书桌与书包',
      category: 'habit',
      desc: '把今天用过的书本归位，准备好明天的东西。',
      minutes: 10,
      difficulty: 'easy',
      exp: 30,
      coins: 60,
      repeat: 'daily',
      createdAt: 0,
    },
    {
      id: 'q-self-preview',
      title: '自主学习：预习明天的课文',
      category: 'self',
      desc: '先自己读一遍，把不懂的地方标记出来。',
      minutes: 25,
      difficulty: 'hard',
      exp: 80,
      coins: 160,
      repeat: 'weekly',
      createdAt: 0,
    },
    {
      id: 'q-custom-weekly',
      title: '给宠物讲一个今天的故事',
      category: 'custom',
      desc: '随口讲讲今天发生的事，它们会认真听。',
      minutes: 5,
      difficulty: 'easy',
      exp: 20,
      coins: 40,
      repeat: 'weekly',
      createdAt: 0,
    },
  ];

  const timerPresets = [15, 20, 25, 30];

  // 等级经验曲线：Lv.n 升到 n+1 所需经验
  function expForLevel(level) {
    return 100 + level * 60;
  }

  function stageOf(level) {
    let cur = stages[0];
    for (const s of stages) if (level >= s.min) cur = s;
    return cur;
  }

  function stageName(petId, level) {
    const idx = stages.findIndex((s) => s.key === stageOf(level).key);
    return stageNames[petId] ? stageNames[petId][idx] : stageOf(level).name;
  }

  window.XB_CATALOG = {
    categories,
    difficulties,
    stages,
    stageNames,
    moods,
    interactions,
    defaultQuests,
    timerPresets,
    expForLevel,
    stageOf,
    stageName,
    categoryById(id) {
      return categories.find((c) => c.id === id) || categories[categories.length - 1];
    },
    difficultyById(id) {
      return difficulties.find((d) => d.id === id) || difficulties[0];
    },
  };
})();
