// 把「一封信」两个状态在大小两种屏幕上渲染成网页预览（rpx → px，375 基准），
// 并自动检测「内容是否溢出容器」与「信纸区域内是否真的能滚动」。
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const mini = path.join(root, 'wechat', 'miniprogram');
const read = p => fs.readFileSync(path.join(mini, p), 'utf8');
const rpx = css => css.replace(/(\d+(?:\.\d+)?)rpx/g, (m, n) => (parseFloat(n) / 2) + 'px');

const fonts = read('styles/fonts.wxss');
const css = rpx(read('components/first-letter/index.wxss'));
const envelope = read('assets/icons/letter-envelope.svg').replace('<svg ', '<svg class="envelope" ');
const arrow = read('assets/icons/arrow-up.svg').replace('<svg ', '<svg class="hint-icon" ');
const close = read('assets/icons/close.svg').replace('<svg ', '<svg class="close-icon" ');
const tree = 'file:///' + path.join(mini, 'assets', 'tree.png').replace(/\\/g, '/');

const paras = [
  '亲爱的朋友，见字如面：',
  '人的一生，不过三万天。不算长，也不算短，足够我们去看一些风景，爱一些人，也在平凡的日子里，慢慢认识自己。',
  '我常常思考活着的意义。想来想去，最打动我的，还是“体验”二字。',
  '《心灵奇旅》让我想到，生命的火花，也许就藏在一顿热饭、一阵晚风，或某个忽然觉得“今天真好”的瞬间里。',
  '所以有了这棵树。',
  '它不长在山上，也不长在路边，只长在你的手机里。你每记下一个瞬间，它就多一片叶子；等你回头看它的时候，它已经替你记住了那么多你差点忘掉的日子。',
  '这里没有别人，没有比较，也没有观众。你可以写下开心的事，也可以写下很难的那一天。它们一样重要，一样值得被收好。',
  '那么，就从今天开始吧。不用写得多好，一句话、一张照片，就够了。十年之后，你会收到一份礼物：一个你自己过完的、真实的、闪着光的人生。',
].map(t => `<div class="para">${t}</div>`).join('');

const cover = `
<div class="layer">
  <img class="bg" src="${tree}"/>
  <div class="tint"></div>
  <div class="cover">
    <div class="brand">让记忆</div>
    <div class="brand">在这里生长</div>
    <div class="cover-title">有一封信，</div>
    <div class="cover-title">想交给你</div>
    <div class="envelope-wrap">
      ${envelope}
      <div class="env-to">亲爱的朋友</div>
      <div class="env-open">亲启</div>
      <div class="env-from">人生记忆树 寄</div>
    </div>
  </div>
  <div class="actions">
    <div class="cta">拆开这封信</div>
    <div class="later">稍后再读</div>
  </div>
</div>`;

const reader = `
<div class="layer">
  <img class="bg" src="${tree}"/>
  <div class="tint"></div>
  <div class="close">${close}</div>
  <div class="reader">
    <div class="paper"><div class="paper-body">${paras}<div class="sign">人生记忆树 敬上</div></div></div>
  </div>
  <div class="hint">${arrow}<span>向上滑动，继续读信</span></div>
  <div class="actions">
    <div class="cta">写下第一个瞬间</div>
    <div class="later">收好这封信</div>
  </div>
</div>`;

const sizes = [
  { label: '封面态 · 小屏 375×667', h: 667, compact: true, body: cover },
  { label: '阅读态 · 小屏 375×667', h: 667, compact: true, body: reader },
  { label: '封面态 · 大屏 375×812', h: 812, compact: false, body: cover },
  { label: '阅读态 · 大屏 375×812', h: 812, compact: false, body: reader },
];

const rack = sizes.map(s => `
<div class="cell">
  <div class="phone" style="height:${s.h}px" data-label="${s.label}">
    <div class="navbar">人生记忆树<div class="capsule"><i></i><i></i></div></div>
    <div class="stage">${s.body.replace('class="layer"', `class="layer${s.compact ? ' compact' : ''}"`)}</div>
  </div>
  <div class="probe">检测中…</div>
</div>`).join('');

const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<title>一封信 · 布局自检</title>
<style>
${fonts}
*{box-sizing:border-box}
body{margin:0;background:#eceee9;padding:26px 16px 44px;font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;color:#3f4936}
h1{font:400 20px/1.6 'Tree WenKai','Kaiti SC',serif;text-align:center;margin:0 0 4px}
.lead{text-align:center;color:#6b7566;font-size:13px;margin:0 0 20px}
.rack{display:flex;gap:20px;justify-content:center;flex-wrap:wrap}
.cell{flex:none}
.phone{position:relative;width:375px;flex:none;border-radius:26px;overflow:hidden;background:#f5f3e8;box-shadow:0 2px 4px #26372810,0 16px 34px #26372814;border:1px solid #dfe3dc}
.navbar{position:absolute;top:0;left:0;right:0;height:44px;z-index:5;background:#3f4936;color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px}
.capsule{position:absolute;right:10px;top:10px;width:52px;height:24px;border-radius:12px;border:1px solid #ffffff66;display:flex;align-items:center;justify-content:center}
.capsule i{width:4px;height:4px;border-radius:50%;background:#fff;display:block}
.stage{position:absolute;top:44px;left:0;right:0;bottom:0}
.stage > .layer{position:absolute}
.probe{margin-top:8px;font-size:12px;line-height:1.6;text-align:center;color:#5f6b58}
.probe.bad{color:#a44e45;font-weight:500}
.probe.good{color:#3b6d11}
.paper{overflow-y:auto}
.actions > div{display:flex;align-items:center;justify-content:center}
${css}
</style></head>
<body>
<h1>一封信 · 布局自检</h1>
<div class="lead">按真机 flex/高度规则渲染，自动检测溢出与信纸内滚动</div>
<div class="rack">${rack}</div>
<script>
window.addEventListener('load', function () {
  document.querySelectorAll('.phone').forEach(function (phone) {
    var layer = phone.querySelector('.layer');
    var paper = phone.querySelector('.paper');
    var over = layer.scrollHeight - layer.clientHeight;
    var scroll = paper ? paper.scrollHeight - paper.clientHeight : 0;
    var probe = phone.parentNode.querySelector('.probe');
    var parts = [];
    if (over > 1) parts.push('⚠ 内容溢出容器 ' + over + 'px');
    else parts.push('✓ 未溢出');
    if (paper) parts.push(scroll > 1 ? '信纸内可滚动 ' + scroll + 'px' : '信纸未产生滚动');
    probe.textContent = phone.dataset.label + '：' + parts.join(' · ');
    probe.className = 'probe ' + (over > 1 || (paper && scroll <= 1) ? 'bad' : 'good');
  });
});
</script>
</body></html>`;

fs.writeFileSync(path.join(root, 'design', 'preview-letter.html'), html);
console.log('已生成 design/preview-letter.html（4 种尺寸自检）');