/* ==========================================================================
   星伴学园 · 成长日记
   ========================================================================== */

(function () {
  const MOODS = [
    { id: 'happy', name: '开心', icon: 'sparkle' },
    { id: 'calm', name: '平静', icon: 'leaf' },
    { id: 'proud', name: '自豪', icon: 'crown' },
    { id: 'sleepy', name: '有点累', icon: 'moon' },
  ];

  const XBDiaryView = {
    name: 'XBDiaryView',
    data() {
      return {
        form: { done: '', learned: '', happy: '', hard: '', tomorrow: '', mood: 'happy' },
        moods: MOODS,
      };
    },
    computed: {
      history() {
        return XB.state.diary;
      },
      today() {
        const d = new Date();
        return d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日';
      },
    },
    mounted() {
      const t = XB.helpers.diaryToday();
      if (t) this.form = Object.assign({}, this.form, t);
    },
    methods: {
      back() {
        XB.ui.tab = 'home';
      },
      save() {
        XB.actions.saveDiary(this.form);
        XB.actions.toast('今天的日记已经收进星语书', 'quill');
      },
      dateText(key) {
        return key;
      },
      moodOf(id) {
        return MOODS.find((m) => m.id === id) || MOODS[0];
      },
    },
    template: `
      <section class="page page--diary">
        <header class="page-head">
          <button class="icon-btn" @click="back" aria-label="返回"><XingIcon name="chevronLeft" :size="16" /></button>
          <div class="page-head__text">
            <h1 class="page-head__title">成长日记</h1>
            <p class="page-head__sub">{{ today }} · 写下来，就会被记住</p>
          </div>
        </header>

        <section class="panel diary-form">
          <i class="panel__corner panel__corner--tl"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--tr"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--br"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--bl"><Orn type="corner" :size="18" /></i>
          <XBSecHead title="今天" />
          <div class="field">
            <label class="field__label">今天完成了什么</label>
            <textarea class="textarea" v-model="form.done" maxlength="200" placeholder="比如：读完了《夏洛的网》第三章"></textarea>
          </div>
          <div class="field">
            <label class="field__label">今天学到了什么</label>
            <textarea class="textarea" v-model="form.learned" maxlength="200" placeholder="新学会的一个知识点"></textarea>
          </div>
          <div class="field">
            <label class="field__label">今天最开心的事</label>
            <textarea class="textarea" v-model="form.happy" maxlength="200" placeholder="一件小小的好事"></textarea>
          </div>
          <div class="field">
            <label class="field__label">今天遇到的困难</label>
            <textarea class="textarea" v-model="form.hard" maxlength="200" placeholder="哪里卡住了？"></textarea>
          </div>
          <div class="field">
            <label class="field__label">明天的目标</label>
            <textarea class="textarea" v-model="form.tomorrow" maxlength="200" placeholder="明天想做到的一件小事"></textarea>
          </div>
          <div class="field">
            <span class="field__label">今天的心情</span>
            <div class="chips">
              <button v-for="m in moods" :key="m.id" class="chip" :class="{ 'is-on': form.mood === m.id }" @click="form.mood = m.id">
                <XingIcon :name="m.icon" :size="12" />{{ m.name }}
              </button>
            </div>
          </div>
          <button class="btn btn--primary btn--block" @click="save"><XingIcon name="quill" :size="14" />保存今天的日记</button>
        </section>

        <section class="panel diary-history">
          <i class="panel__corner panel__corner--tl"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--tr"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--br"><Orn type="corner" :size="18" /></i>
          <i class="panel__corner panel__corner--bl"><Orn type="corner" :size="18" /></i>
          <XBSecHead title="日记收藏" :more="history.length + ' 篇'" />
          <ul class="diary-list">
            <li v-for="d in history" :key="d.id" class="diary-item">
              <span class="diary-item__date">{{ d.date }}</span>
              <span class="diary-item__mood"><XingIcon :name="moodOf(d.mood).icon" :size="12" />{{ moodOf(d.mood).name }}</span>
              <p class="diary-item__text">{{ d.happy || d.done || d.learned || '这一天没有留下文字' }}</p>
            </li>
            <li v-if="!history.length" class="empty">还没有日记，从今天开始吧。</li>
          </ul>
        </section>
      </section>
    `,
  };

  window.XBDiaryView = XBDiaryView;
})();
