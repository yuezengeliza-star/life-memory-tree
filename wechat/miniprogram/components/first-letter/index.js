const p = require('../../utils/page');

const KEY = 'letterReadV1';
const LETTER = [
  '亲爱的朋友，见字如面：',
  '人的一生，不过三万天。不算长，也不算短，足够我们去看一些风景，爱一些人，也在平凡的日子里，慢慢认识自己。',
  '我常常思考活着的意义。想来想去，最打动我的，还是“体验”二字。',
  '《心灵奇旅》让我想到，生命的火花，也许就藏在一顿热饭、一阵晚风，或某个忽然觉得“今天真好”的瞬间里。',
  '所以有了这棵树。',
  '它不长在山上，也不长在路边，只长在你的手机里。你每记下一个瞬间，它就多一片叶子；等你回头看它的时候，它已经替你记住了那么多你差点忘掉的日子。',
  '这里没有别人，没有比较，也没有观众。你可以写下开心的事，也可以写下很难的那一天。它们一样重要，一样值得被收好。',
  '那么，就从今天开始吧。不用写得多好，一句话、一张照片，就够了。十年之后，你会收到一份礼物：一个你自己过完的、真实的、闪着光的人生。',
];

Component({
  properties: {
    open: { type: Boolean, value: false, observer(v) { this.setData({ visible: !!v, mode: 'cover', atEnd: false }); } },
  },
  data: { visible: false, mode: 'cover', atEnd: false, compact: false, letter: LETTER, sign: '人生记忆树 敬上' },
  lifetimes: {
    attached() {
      // 小屏（iPhone 8/SE 等 667pt 屏）收紧排版，避免动作按钮被挤出可视区
      let height = 0;
      try { height = (wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()).windowHeight || 0; } catch (e) {}
      const patch = { compact: height > 0 && height < 700 };
      if (this.data.open) patch.visible = true;
      this.setData(patch);
    },
  },
  methods: {
    // 标记已读：之后不再自动弹出，只能从「我的」重读
    remember() { try { wx.setStorageSync(KEY, 1); } catch (e) {} },
    openLetter() { this.setData({ mode: 'read' }); },
    toEnd() { this.setData({ atEnd: true }); },
    close() { this.remember(); this.setData({ visible: false }); this.triggerEvent('close'); },
    dismiss() { this.close(); },
    write() { this.close(); p.capture(); },
  },
});
