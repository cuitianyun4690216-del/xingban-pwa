/* ==========================================================================
   星伴学园 · 宠物数据配置
   --------------------------------------------------------------------------
   - id      : 资源目录名（assets/pets/<id>/...）
   - frames  : 每张状态图导出后的 [宽, 高]，用于计算舞台占位比例
   - stateMap: 动画状态 -> 使用哪张图片
   ========================================================================== */

(function () {
  const pets = [
    {
      id: 'capybara',
      name: '卡卡',
      species: '卡皮巴拉',
      latin: 'Capybara',
      title: '温柔守护者',
      role: '陪伴型',
      level: 12,
      exp: 320,
      expMax: 500,
      mood: '心情很好',
      traits: ['治愈系', '沉稳', '慢半拍'],
      intro: '喜欢在阳光下慢慢咀嚼青草，是学园里最稳的陪伴。',
      lidColor: '#c18455',
      frames: {
        idle: [820, 955],
        happy: [820, 1073],
        sleep: [820, 507],
        eat: [820, 1061],
        blink: [820, 955],
        evolved: [820, 1045],
      },
      stateMap: {
        idle: 'idle',
        happy: 'happy',
        sleep: 'sleep',
        eat: 'eat',
        pet: 'idle',
        evolved: 'evolved',
      },
      states: {
        idle: 'idle',
        happy: 'happy',
        sleep: 'sleep',
        eat: 'eat',
        blink: 'blink',
        evolved: 'evolved',
      },
    },
    {
      id: 'hamster',
      name: '米粒',
      species: '小仓鼠',
      latin: 'Hamster',
      title: '探险小队长',
      role: '探索型',
      level: 9,
      exp: 180,
      expMax: 300,
      mood: '好奇满满',
      traits: ['活泼', '好奇心', '囤粮达人'],
      intro: '总在学园角落发现新东西，口袋里永远藏着半颗瓜子。',
      lidColor: '#b07a4d',
      frames: {
        idle: [820, 1160],
        happy: [820, 1067],
        sleep: [820, 923],
        eat: [820, 1134],
        blink: [820, 1160],
        evolved: [820, 1149],
      },
      stateMap: {
        idle: 'idle',
        happy: 'happy',
        sleep: 'sleep',
        eat: 'eat',
        pet: 'idle',
        evolved: 'evolved',
      },
      states: {
        idle: 'idle',
        happy: 'happy',
        sleep: 'sleep',
        eat: 'eat',
        blink: 'blink',
        evolved: 'evolved',
      },
    },
  ];

  window.XingPets = {
    list: pets,
    byId(id) {
      return pets.find(function (p) {
        return p.id === id;
      }) || pets[0];
    },
    indexOf(id) {
      return pets.findIndex(function (p) {
        return p.id === id;
      });
    },
  };
})();
