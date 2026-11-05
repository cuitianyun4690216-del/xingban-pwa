/* ==========================================================================
   星伴学园 · 图片资源统一管理
   ========================================================================== */

(function () {
  const V = '3';

  const XingAssets = {
    version: V,

    background: 'assets/backgrounds/academy-dusk.webp?v=' + V,
    legacyBackground: 'assets/backgrounds/home-bg.webp?v=' + V,
    avatar: 'assets/avatars/player.webp?v=' + V,

    /** 宠物状态图：idle / happy / sleep / eat / blink */
    pet(id, state) {
      return 'assets/pets/' + id + '/' + state + '.webp?v=' + V;
    },

    preload(urls) {
      return Promise.all(
        urls.map(function (url) {
          return new Promise(function (resolve) {
            const img = new Image();
            img.onload = function () {
              resolve({ url: url, ok: true });
            };
            img.onerror = function () {
              console.warn('[XingAssets] 图片加载失败：' + url);
              resolve({ url: url, ok: false });
            };
            img.src = url;
          });
        })
      );
    },
  };

  window.XingAssets = XingAssets;
})();
