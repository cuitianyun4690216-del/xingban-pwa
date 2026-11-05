/* ==========================================================================
   星伴学园 · 装扮目录（分层 SVG 叠加，真实改变宠物外观）
   slot: hat / face / neck / back / accessory
   anchors: 以宠物图框为坐标系（百分比），四只锚点按宠物外形分别调校
   ========================================================================== */

(function () {
  const S = { stroke: '#C9A96A', width: 1.4 };

  function art(inner, vb) {
    return { vb: vb || [100, 100], inner: inner };
  }

  const ITEMS = [
    /* ---------------- 帽子 ---------------- */
    {
      id: 'hat-wizard',
      name: '星语尖帽',
      slot: 'hat',
      rarity: 'rare',
      desc: '学园赠予的星语尖帽，帽檐上绣着会发光的星纹。',
      price: { currency: 'coins', amount: 280 },
      unlock: { type: 'level', value: 8, text: '卡卡 / 米粒达到 Lv.8' },
      tile: '#635688',
      art: art(
        '<path d="M50 8 L70 62 L30 62 Z" fill="#5C4E85"/><path d="M50 8 L70 62 L30 62 Z" fill="none" stroke="#C9A96A" stroke-width="1.6"/>' +
          '<path d="M28 60 Q50 70 72 60 Q50 82 28 60" fill="#4B3F6B" stroke="#C9A96A" stroke-width="1.4"/>' +
          '<ellipse cx="50" cy="64" rx="24" ry="6" fill="#3F3560" opacity=".7"/>' +
          '<path d="M42 28 l2.2 5 5 2.2-5 2.2-2.2 5-2.2-5-5-2.2 5-2.2z" fill="#F6E3B0"/>' +
          '<circle cx="58" cy="44" r="2" fill="#F6E3B0"/><circle cx="38" cy="50" r="1.6" fill="#F6E3B0"/>'
      ),
      anchors: { capybara: { x: 38, y: 10, w: 35, r: -4 }, hamster: { x: 50, y: 8, w: 39, r: 0 } },
    },
    {
      id: 'hat-beret',
      name: '月见贝雷帽',
      slot: 'hat',
      rarity: 'common',
      desc: '柔软的薰衣草贝雷帽，适合安静的午后。',
      price: { currency: 'coins', amount: 120 },
      unlock: { type: 'shop', text: '装扮商店购买' },
      tile: '#B9A9D5',
      art: art(
        '<ellipse cx="50" cy="60" rx="34" ry="12" fill="#8E7FAF"/>' +
          '<path d="M20 58 Q34 26 62 30 Q84 34 80 58 Q50 70 20 58" fill="#B9A9D5" stroke="#C9A96A" stroke-width="1.2"/>' +
          '<circle cx="62" cy="34" r="4.5" fill="#E3CA96" stroke="#A9854A" stroke-width="1"/>'
      ),
      anchors: { capybara: { x: 44, y: 15, w: 34, r: -4 }, hamster: { x: 50, y: 13, w: 37, r: -2 } },
    },
    {
      id: 'hat-flower',
      name: '樱雪花环',
      slot: 'hat',
      rarity: 'uncommon',
      desc: '编进春日花枝的花环，会随呼吸轻轻晃动。',
      price: { currency: 'coins', amount: 180 },
      unlock: { type: 'level', value: 6, text: '宠物达到 Lv.6' },
      tile: '#DBABB4',
      art: art(
        '<path d="M18 58 Q50 40 82 58" fill="none" stroke="#779171" stroke-width="2.4"/>' +
          '<g fill="#F2DADE" stroke="#DBABB4" stroke-width="1"><circle cx="26" cy="55" r="6"/><circle cx="42" cy="47" r="7"/><circle cx="60" cy="47" r="7"/><circle cx="76" cy="55" r="6"/></g>' +
          '<g fill="#F7EACA"><circle cx="26" cy="55" r="2.2"/><circle cx="42" cy="47" r="2.6"/><circle cx="60" cy="47" r="2.6"/><circle cx="76" cy="55" r="2.2"/></g>' +
          '<path d="M34 44 q-6 -6 -12 -4" fill="none" stroke="#779171" stroke-width="1.6"/>'
      ),
      anchors: { capybara: { x: 44, y: 13, w: 38, r: 2 }, hamster: { x: 50, y: 11, w: 41, r: 0 } },
    },
    {
      id: 'hat-crown',
      name: '星光小皇冠',
      slot: 'hat',
      rarity: 'epic',
      desc: '连续专注的证明。戴上它，连走路都带一点光。',
      price: { currency: 'stars', amount: 30 },
      unlock: { type: 'achievement', value: 'persistent', text: '解锁成就「坚持成长者」' },
      tile: '#C9A96A',
      art: art(
        '<path d="M22 72 L27 40 L40 56 L50 32 L60 56 L73 40 L78 72 Z" fill="#F2DFB2" stroke="#A9854A" stroke-width="1.6"/>' +
          '<path d="M24 70 h52" stroke="#A9854A" stroke-width="1.6"/>' +
          '<circle cx="27" cy="38" r="3" fill="#FFF6DE" stroke="#A9854A"/><circle cx="50" cy="30" r="3.4" fill="#FFF6DE" stroke="#A9854A"/><circle cx="73" cy="38" r="3" fill="#FFF6DE" stroke="#A9854A"/>' +
          '<circle cx="50" cy="60" r="3" fill="#B4574D"/>'
      ),
      anchors: { capybara: { x: 43, y: 11, w: 29, r: 0 }, hamster: { x: 50, y: 9, w: 31, r: 0 } },
    },
    {
      id: 'hat-pumpkin',
      name: '南瓜夜帽',
      slot: 'hat',
      rarity: 'limited',
      desc: '万圣夜限定。帽尖上挂着一颗会眨眼的小星星。',
      price: { currency: 'coins', amount: 260 },
      unlock: { type: 'shop', text: '节日限定 · 装扮商店' },
      tile: '#D98E4A',
      art: art(
        '<path d="M50 6 L66 46 L34 46 Z" fill="#C97B3C" stroke="#8F5524" stroke-width="1.4"/>' +
          '<path d="M32 46 q18 16 36 0 q-18 18 -36 0" fill="#B86A30" stroke="#8F5524" stroke-width="1.2"/>' +
          '<ellipse cx="50" cy="50" rx="22" ry="6" fill="#8F5524" opacity=".55"/>' +
          '<path d="M50 6 q10 10 0 20" fill="none" stroke="#7A9A6A" stroke-width="2"/>' +
          '<circle cx="50" cy="34" r="2.4" fill="#FFE9B8"/>'
      ),
      anchors: { capybara: { x: 38, y: 11, w: 33, r: -4 }, hamster: { x: 50, y: 8, w: 35, r: 0 } },
    },
    {
      id: 'hat-winter',
      name: '冬雪绒帽',
      slot: 'hat',
      rarity: 'limited',
      desc: '冬夜限定。帽尖的绒球会轻轻晃动。',
      price: { currency: 'coins', amount: 260 },
      unlock: { type: 'shop', text: '节日限定 · 装扮商店' },
      tile: '#AFC4D9',
      art: art(
        '<path d="M28 56 Q30 24 56 20 Q80 18 82 52 Q56 66 28 56" fill="#8FAECB" stroke="#E8E4EF" stroke-width="1.4"/>' +
          '<path d="M26 54 Q56 66 84 54 Q56 74 26 54" fill="#F7F3EA" stroke="#C9C1D6" stroke-width="1.2"/>' +
          '<circle cx="80" cy="22" r="7" fill="#F7F3EA" stroke="#C9C1D6"/>'
      ),
      anchors: { capybara: { x: 44, y: 13, w: 36, r: -3 }, hamster: { x: 50, y: 11, w: 38, r: -1 } },
    },

    /* ---------------- 眼镜 ---------------- */
    {
      id: 'glasses-round',
      name: '圆框眼镜',
      slot: 'face',
      rarity: 'uncommon',
      desc: '学园图书管理员的同款圆框，看起来更专注了。',
      price: { currency: 'coins', amount: 140 },
      unlock: { type: 'shop', text: '装扮商店购买' },
      tile: '#93B2CD',
      art: art(
        '<g fill="none" stroke="#8F6A3C" stroke-width="2"><circle cx="30" cy="50" r="13"/><circle cx="70" cy="50" r="13"/><path d="M43 50 h14"/><path d="M17 48 l-8 -4"/><path d="M83 48 l8 -4"/></g>' +
          '<circle cx="30" cy="50" r="13" fill="#E8F2FA" opacity=".28"/><circle cx="70" cy="50" r="13" fill="#E8F2FA" opacity=".28"/>' +
          '<path d="M24 44 l6 -4" stroke="#FFFFFF" stroke-width="1.6" opacity=".8"/><path d="M64 44 l6 -4" stroke="#FFFFFF" stroke-width="1.6" opacity=".8"/>'
      ),
      anchors: { capybara: { x: 41, y: 18, w: 25, r: -2 }, hamster: { x: 50, y: 17, w: 30, r: 0 } },
    },
    {
      id: 'monocle',
      name: '单片眼镜',
      slot: 'face',
      rarity: 'rare',
      desc: '旧学园的学者遗物，镜片会映出细小的符文。',
      price: { currency: 'coins', amount: 220 },
      unlock: { type: 'shop', text: '装扮商店购买' },
      tile: '#C9A96A',
      art: art(
        '<circle cx="50" cy="48" r="17" fill="#E8F2FA" opacity=".22" stroke="#C9A96A" stroke-width="2.4"/>' +
          '<path d="M63 60 q10 12 22 16" fill="none" stroke="#C9A96A" stroke-width="1.4"/>' +
          '<path d="M44 40 l8 -4" stroke="#FFFFFF" stroke-width="1.6" opacity=".85"/>'
      ),
      anchors: { capybara: { x: 30, y: 18, w: 15, r: 0 }, hamster: { x: 42, y: 17, w: 16, r: 0 } },
    },

    /* ---------------- 围巾 / 项圈 ---------------- */
    {
      id: 'scarf-star',
      name: '星纹围巾',
      slot: 'neck',
      rarity: 'uncommon',
      desc: '绣着星纹的长围巾，风一吹会飘起来。',
      price: { currency: 'coins', amount: 160 },
      unlock: { type: 'shop', text: '装扮商店购买' },
      tile: '#8E7FAF',
      art: art(
        '<path d="M16 38 Q50 56 84 38 L84 56 Q50 76 16 56 Z" fill="#7A6BA8" stroke="#C9A96A" stroke-width="1.4"/>' +
          '<path d="M70 56 L80 92 L64 86 L58 58" fill="#8E7FAF" stroke="#C9A96A" stroke-width="1.2"/>' +
          '<path d="M34 46 l2 4.6 4.6 2-4.6 2-2 4.6-2-4.6-4.6-2 4.6-2z" fill="#F6E3B0"/>' +
          '<path d="M66 60 l1.6 3.6 3.6 1.6-3.6 1.6-1.6 3.6-1.6-3.6-3.6-1.6 3.6-1.6z" fill="#F6E3B0"/>'
      ),
      anchors: { capybara: { x: 45, y: 33, w: 42, r: 0 }, hamster: { x: 50, y: 32, w: 40, r: 0 } },
    },
    {
      id: 'collar-bell',
      name: '铃铛项圈',
      slot: 'neck',
      rarity: 'common',
      desc: '走一步响一声，提醒你它一直在旁边。',
      price: { currency: 'coins', amount: 90 },
      unlock: { type: 'shop', text: '装扮商店购买' },
      tile: '#D98E4A',
      art: art(
        '<path d="M20 44 Q50 62 80 44 L80 54 Q50 74 20 54 Z" fill="#B4574D" stroke="#E3CA96" stroke-width="1.2"/>' +
          '<circle cx="50" cy="66" r="9" fill="#E3CA96" stroke="#A9854A" stroke-width="1.4"/>' +
          '<path d="M44 66 h12" stroke="#A9854A" stroke-width="1.6"/>' +
          '<circle cx="50" cy="71" r="2" fill="#A9854A"/>'
      ),
      anchors: { capybara: { x: 45, y: 35, w: 36, r: 0 }, hamster: { x: 50, y: 34, w: 34, r: 0 } },
    },

    /* ---------------- 背包 / 翅膀 ---------------- */
    {
      id: 'bag-school',
      name: '学院小书包',
      slot: 'back',
      rarity: 'uncommon',
      desc: '装着课本、铅笔和半块饼干。',
      price: { currency: 'coins', amount: 180 },
      unlock: { type: 'shop', text: '装扮商店购买' },
      tile: '#779171',
      art: art(
        '<rect x="26" y="34" width="48" height="50" rx="12" fill="#8FA67F" stroke="#5F7357" stroke-width="1.6"/>' +
          '<path d="M26 52 h48" stroke="#5F7357" stroke-width="1.2"/>' +
          '<rect x="38" y="58" width="24" height="16" rx="4" fill="#E3CA96" stroke="#A9854A" stroke-width="1.2"/>' +
          '<path d="M36 34 q14 -16 28 0" fill="none" stroke="#5F7357" stroke-width="2"/>' +
          '<circle cx="50" cy="66" r="2.4" fill="#A9854A"/>'
      ),
      anchors: { capybara: { x: 62, y: 46, w: 30, r: 6 }, hamster: { x: 63, y: 44, w: 28, r: 4 } },
    },
    {
      id: 'wings-glow',
      name: '萤光小翅',
      slot: 'back',
      rarity: 'epic',
      desc: '家园设计师的奖赏。半透明的小翅膀，夜里会发光。',
      price: { currency: 'stars', amount: 45 },
      unlock: { type: 'achievement', value: 'home_designer', text: '解锁成就「家园设计师」' },
      tile: '#A9DAF4',
      art: art(
        '<g opacity=".82"><path d="M50 52 Q18 26 6 44 Q-2 60 20 70 Q38 78 50 62" fill="#BFE3F6" stroke="#A9DAF4" stroke-width="1.4"/>' +
          '<path d="M50 52 Q82 26 94 44 Q102 60 80 70 Q62 78 50 62" fill="#BFE3F6" stroke="#A9DAF4" stroke-width="1.4"/></g>' +
          '<path d="M26 46 q12 8 18 12M74 46 q-12 8 -18 12" fill="none" stroke="#FFFFFF" stroke-width="1.2" opacity=".7"/>' +
          '<circle cx="50" cy="56" r="3" fill="#FFF6DE"/>'
      ),
      anchors: { capybara: { x: 50, y: 40, w: 46, r: 0 }, hamster: { x: 50, y: 38, w: 44, r: 0 } },
    },

    /* ---------------- 饰品 ---------------- */
    {
      id: 'pin-star',
      name: '星星发夹',
      slot: 'accessory',
      rarity: 'common',
      desc: '一枚安安静静的小星星，别在耳边。',
      price: { currency: 'coins', amount: 80 },
      unlock: { type: 'shop', text: '装扮商店购买' },
      tile: '#E3CA96',
      art: art(
        '<path d="M50 22 l6 12 13 2-9.5 9 2.2 13-11.7-6.2-11.7 6.2 2.2-13-9.5-9 13-2z" fill="#F2DFB2" stroke="#A9854A" stroke-width="1.4"/>' +
          '<path d="M40 20 h20" stroke="#A9854A" stroke-width="1.2" opacity=".6"/>'
      ),
      anchors: { capybara: { x: 28, y: 13, w: 11, r: -8 }, hamster: { x: 32, y: 12, w: 12, r: -6 } },
    },
    {
      id: 'bow-lav',
      name: '薰衣草蝴蝶结',
      slot: 'accessory',
      rarity: 'uncommon',
      desc: '打得很认真的一只蝴蝶结。',
      price: { currency: 'coins', amount: 110 },
      unlock: { type: 'shop', text: '装扮商店购买' },
      tile: '#B9A9D5',
      art: art(
        '<path d="M50 50 L20 30 Q14 50 20 70 Z" fill="#B9A9D5" stroke="#8E7FAF" stroke-width="1.4"/>' +
          '<path d="M50 50 L80 30 Q86 50 80 70 Z" fill="#CBBDE6" stroke="#8E7FAF" stroke-width="1.4"/>' +
          '<circle cx="50" cy="50" r="7" fill="#E3CA96" stroke="#A9854A" stroke-width="1.2"/>'
      ),
      anchors: { capybara: { x: 66, y: 13, w: 12, r: 10 }, hamster: { x: 67, y: 12, w: 13, r: 8 } },
    },
    {
      id: 'scarf-snow',
      name: '雪花围巾',
      slot: 'neck',
      rarity: 'limited',
      desc: '冬夜限定。围巾里缝着不会融化的雪花。',
      price: { currency: 'coins', amount: 200 },
      unlock: { type: 'shop', text: '节日限定 · 装扮商店' },
      tile: '#AFC4D9',
      art: art(
        '<path d="M16 38 Q50 56 84 38 L84 58 Q50 78 16 58 Z" fill="#8FAECB" stroke="#E8E4EF" stroke-width="1.4"/>' +
          '<path d="M70 58 L80 92 L64 86 L58 60" fill="#A6C4DE" stroke="#E8E4EF" stroke-width="1.2"/>' +
          '<g stroke="#FFFFFF" stroke-width="1.4" fill="none"><path d="M36 48 v10M31 53 h10M31 48 l10 10M41 48 l-10 10"/></g>' +
          '<path d="M16 58 q34 20 68 0" fill="none" stroke="#E8E4EF" stroke-width="1.2" opacity=".8"/>'
      ),
      anchors: { capybara: { x: 45, y: 33, w: 42, r: 0 }, hamster: { x: 50, y: 32, w: 40, r: 0 } },
    },
  
    /* ---------------- 新增 ---------------- */
    {
      id: 'hat-straw',
      name: '麦田草帽',
      slot: 'hat',
      rarity: 'common',
      desc: '午后散步时戴的草帽，帽檐上还留着阳光的味道。',
      price: { currency: 'coins', amount: 140 },
      unlock: { type: 'level', value: 1, text: '可直接购买' },
      tile: '#E8C97B',
      art: art(
        '<ellipse cx="50" cy="62" rx="33" ry="10" fill="#E8C97B" stroke="#B08A46" stroke-width="1.4"/>' +
          '<path d="M28 60 Q30 30 50 30 Q70 30 72 60 Z" fill="#F2DCA6" stroke="#B08A46" stroke-width="1.4"/>' +
          '<path d="M30 56 Q50 50 70 56 L70 60 Q50 56 30 60 Z" fill="#C98C5A"/>' +
          '<path d="M44 34 q6 10 2 22" stroke="#C98C5A" stroke-width="1.2" fill="none"/>' +
          '<circle cx="58" cy="42" r="2.4" fill="#F6E3B0"/>'
      ),
      anchors: { capybara: { x: 44, y: 15, w: 36, r: -4 }, hamster: { x: 50, y: 13, w: 39, r: -2 } },
    },
    {
      id: 'hat-cat',
      name: '猫耳发箍',
      slot: 'hat',
      rarity: 'rare',
      desc: '戴上去就忍不住想喵一声，耳朵会随心情轻轻动。',
      price: { currency: 'coins', amount: 320 },
      unlock: { type: 'level', value: 6, text: '卡卡 / 米粒达到 Lv.6' },
      tile: '#F3D9C4',
      art: art(
        '<path d="M20 62 Q50 44 80 62" stroke="#B08A46" stroke-width="5" fill="none" stroke-linecap="round"/>' +
          '<path d="M30 54 L34 24 L54 44 Z" fill="#F7E4D4" stroke="#B08A46" stroke-width="1.4"/>' +
          '<path d="M70 54 L66 24 L46 44 Z" fill="#F7E4D4" stroke="#B08A46" stroke-width="1.4"/>' +
          '<path d="M37 47 L39 33 L48 44 Z" fill="#F0B7B7"/>' +
          '<path d="M63 47 L61 33 L52 44 Z" fill="#F0B7B7"/>'
      ),
      anchors: { capybara: { x: 43, y: 11, w: 40, r: -3 }, hamster: { x: 50, y: 9, w: 42, r: 0 } },
    },
    {
      id: 'glasses-heart',
      name: '爱心墨镜',
      slot: 'face',
      rarity: 'rare',
      desc: '看到喜欢的东西，镜片会悄悄冒出一颗小心心。',
      price: { currency: 'coins', amount: 360 },
      unlock: { type: 'level', value: 7, text: '卡卡 / 米粒达到 Lv.7' },
      tile: '#F6C6D0',
      art: art(
        '<path d="M34 44 C26 34 40 28 46 38 C52 28 66 34 58 44 C54 52 46 56 46 56 C46 56 38 52 34 44Z" fill="#F6C6D0" stroke="#B08A46" stroke-width="1.4" opacity=".92"/>' +
          '<path d="M66 44 C58 34 72 28 78 38 C84 28 98 34 90 44 C86 52 78 56 78 56 C78 56 70 52 66 44Z" fill="#F6C6D0" stroke="#B08A46" stroke-width="1.4" opacity=".92"/>' +
          '<path d="M58 44 h8" stroke="#B08A46" stroke-width="2"/>' +
          '<path d="M80 44 l6 -4" stroke="#B08A46" stroke-width="1.6"/>' +
          '<circle cx="42" cy="38" r="2" fill="#FFF8E4"/>'
      ),
      anchors: { capybara: { x: 41, y: 18, w: 25, r: -2 }, hamster: { x: 50, y: 17, w: 30, r: 0 } },
    },
    {
      id: 'scarf-check',
      name: '格纹围巾',
      slot: 'neck',
      rarity: 'common',
      desc: '厚实柔软的格子围巾，冬天裹上就不想起床。',
      price: { currency: 'coins', amount: 160 },
      unlock: { type: 'level', value: 1, text: '可直接购买' },
      tile: '#D9C6A6',
      art: art(
        '<path d="M22 40 Q50 56 78 40 L76 50 Q50 66 24 50 Z" fill="#D9C6A6" stroke="#B08A46" stroke-width="1.4"/>' +
          '<path d="M30 62 L26 92 L38 86 L42 64 Z" fill="#C9B08A" stroke="#B08A46" stroke-width="1.2"/>' +
          '<path d="M30 66 h10 M28 74 h10" stroke="#8B6B45" stroke-width="1"/>' +
          '<path d="M46 46 h8 M62 46 h8" stroke="#8B6B45" stroke-width="1" opacity=".7"/>'
      ),
      anchors: { capybara: { x: 45, y: 33, w: 42, r: 0 }, hamster: { x: 50, y: 32, w: 40, r: 0 } },
    },
    {
      id: 'bag-picnic',
      name: '野餐小篮',
      slot: 'back',
      rarity: 'rare',
      desc: '篮子里总藏着一点点心，是留给你的。',
      price: { currency: 'coins', amount: 340 },
      unlock: { type: 'level', value: 8, text: '卡卡 / 米粒达到 Lv.8' },
      tile: '#E2C08A',
      art: art(
        '<path d="M32 44 Q50 22 68 44" stroke="#B08A46" stroke-width="4" fill="none" stroke-linecap="round"/>' +
          '<rect x="26" y="44" width="48" height="32" rx="6" fill="#E2C08A" stroke="#B08A46" stroke-width="1.4"/>' +
          '<path d="M26 56 h48" stroke="#B08A46" stroke-width="1.2"/>' +
          '<path d="M40 44 v32 M60 44 v32" stroke="#C9A96A" stroke-width="1" opacity=".7"/>' +
          '<circle cx="50" cy="66" r="3" fill="#F3DFAF"/>'
      ),
      anchors: { capybara: { x: 62, y: 46, w: 30, r: 6 }, hamster: { x: 63, y: 44, w: 28, r: 4 } },
    },
    {
      id: 'pin-moon',
      name: '月牙胸针',
      slot: 'accessory',
      rarity: 'rare',
      desc: '一枚小小的月牙，夜里会发出很淡的光。',
      price: { currency: 'coins', amount: 300 },
      unlock: { type: 'level', value: 5, text: '卡卡 / 米粒达到 Lv.5' },
      tile: '#F3DFAF',
      art: art(
        '<path d="M58 22 a22 22 0 1 0 0 40 a18 18 0 1 1 0 -40z" fill="#F3DFAF" stroke="#C9A96A" stroke-width="1.4"/>' +
          '<circle cx="64" cy="33" r="2" fill="#FFF8E4"/>' +
          '<circle cx="70" cy="44" r="1.4" fill="#FFF8E4"/>'
      ),
      anchors: { capybara: { x: 28, y: 13, w: 12, r: -8 }, hamster: { x: 32, y: 12, w: 13, r: -6 } },
    },
  
  ];

  const SLOTS = [
    { id: 'hat', name: '帽子', icon: 'crown' },
    { id: 'face', name: '眼镜', icon: 'target' },
    { id: 'neck', name: '围巾', icon: 'heart' },
    { id: 'back', name: '背包', icon: 'bag-school' === 'x' ? 'book' : 'book' },
    { id: 'accessory', name: '饰品', icon: 'sparkle' },
  ];

  const RARITY = {
    common: { name: '普通', color: '#8E85A3', rank: 1 },
    uncommon: { name: '优秀', color: '#779171', rank: 2 },
    rare: { name: '稀有', color: '#6E8FB3', rank: 3 },
    epic: { name: '史诗', color: '#8A78B8', rank: 4 },
    limited: { name: '限定', color: '#B4574D', rank: 5 },
  };

  window.XB_WARDROBE = {
    items: ITEMS,
    slots: SLOTS,
    rarity: RARITY,
    byId(id) {
      return ITEMS.find((i) => i.id === id);
    },
    bySlot(slot) {
      return ITEMS.filter((i) => i.slot === slot);
    },
  };
})();
