// 按当前小程序代码（wxml 结构 + wxss 样式 + SVG 图标 + 树图）生成五页前端预览
const fs = require('fs');
const path = require('path');
const mini = path.join(__dirname, '..', 'wechat', 'miniprogram');
const read = p => fs.readFileSync(path.join(mini, p), 'utf8');

// rpx -> px（设计稿 375px 基准）
const rpx = css => css.replace(/(\d+(?:\.\d+)?)rpx/g, (m, n) => (parseFloat(n) / 2) + 'px');

// 给规则加作用域前缀，避免页面间同名类互相覆盖
function scope(css, prefix) {
  // 先去掉注释，避免注释文本被当成选择器的一部分
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const fonts = [];
  let out = css.replace(/@font-face\s*\{[^}]*\}/g, m => { fonts.push(m); return ''; });
  out = out.replace(/([^{}]+)\{([^{}]*)\}/g, (m, sel, body) => {
    const sels = sel.split(',').map(s => {
      s = s.trim();
      if (!s) return s;
      if (s.startsWith('@')) return s;
      return prefix + ' ' + s;
    }).join(',');
    return sels + '{' + body + '}';
  });
  return fonts.join('\n') + '\n' + out;
}

const svg = name => read(path.join('assets', 'icons', name)).replace(/stroke="#[0-9a-fA-F]{6}"/, 'stroke="currentColor"');
const ICON = {
  home: svg('tab-home.svg'), tree: svg('tab-tree.svg'), plus: svg('tab-plus.svg'),
  review: svg('tab-review.svg'), me: svg('tab-me.svg'), pen: svg('pen.svg'), lock: svg('lock.svg'),
  leaf: svg('kind-leaf.svg'), flower: svg('kind-flower.svg'), fruit: svg('kind-fruit.svg'),
  bud: svg('kind-bud.svg'), scar: svg('kind-scar.svg'), glow: svg('kind-glow.svg')
};

// ---------- 样式 ----------
const fontsCss = read('styles/fonts.wxss');
const appCss = read('app.wxss').replace(/^page\{/m, '.phone{').replace(/page \.serif/g, '.phone .serif').replace('@import "styles/fonts.wxss";', '');
const memCss = read('components/memory-list/index.wxss');
const sceneCss = scope(read('components/tree-scene/index.wxss'), '.tree-scope');
const tabCss = scope(read('custom-tab-bar/index.wxss'), '.tab-scope').replace(/position:\s*fixed;?/g, '').replace(/env\(safe-area-inset-bottom\)/g, '0px');
const pageCss = {
  home: scope(read('pages/home/index.wxss'), '.p-home'),
  tree: scope(read('pages/tree/index.wxss'), '.p-tree'),
  capture: scope(read('pages/capture/index.wxss'), '.p-capture'),
  review: scope(read('pages/review/index.wxss'), '.p-review'),
  me: scope(read('pages/me/index.wxss'), '.p-me')
};

const shell = `
*{box-sizing:border-box}
body{margin:0;background:#eceee9;padding:32px 16px 48px;font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;color:#3f4936}
h1{font:400 20px/1.6 'Tree WenKai','Kaiti SC','STKaiti','KaiTi',serif;text-align:center;margin:0 0 6px;color:#3f4936}
.lead{text-align:center;color:#6b7566;font-size:13px;margin:0 0 26px}
.rack{display:flex;flex-wrap:wrap;gap:22px;justify-content:center}
.phone{width:375px;height:760px;flex:none;background:#f5f3e8;border-radius:26px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 2px 4px #26372810,0 16px 34px #26372814;border:1px solid #dfe3dc}
.navbar{height:44px;flex:none;background:#3f4936;color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px}
.capsule{position:absolute;right:10px;width:52px;height:24px;border-radius:12px;border:1px solid #ffffff66;display:flex;align-items:center;justify-content:center;gap:4px}
.capsule i{width:4px;height:4px;border-radius:50%;background:#fff;display:block}
.navbar{position:relative}
.screen{flex:1;overflow:hidden;position:relative}
.tab-scope{position:relative;flex:none}
.tab-scope .bar{position:static}
.p-home .home{min-height:100%;height:100%;overflow-y:auto}
.screen>div{height:100%;overflow-y:auto}
.p-home>div{display:flex;flex-direction:column}
img{max-width:100%}
input,textarea{font-family:inherit}
`;

// ---------- 结构 ----------
const row = (icon, title, excerpt, date) =>
  `<div class="memory"><div class="symbol">${icon}</div><div class="body"><div class="name">${title}</div><div class="excerpt">${excerpt}</div></div><div class="date-time">${date}</div></div>`;

const tabs = sel => `<div class="tab-scope"><div class="bar">` +
  [['首页', ICON.home], ['人生树', ICON.tree], ['留下', ICON.plus], ['回望', ICON.review], ['我的', ICON.me]]
    .map(([text, icon], i) => `<div class="item${i === sel ? ' active' : ''}${i === 2 ? ' capture' : ''}"><div class="icon">${icon}</div><div class="label">${text}</div></div>`).join('') +
  `</div></div>`;

const phone = (title, pageClass, body, sel) =>
  `<div class="phone"><div class="navbar">${title}<div class="capsule"><i></i><i></i><i></i></div></div>` +
  `<div class="screen ${pageClass}">${body}</div>${tabs(sel)}</div>`;

const home = phone('人生记忆树', 'p-home', `
<div class="home"><div class="opening">
  <div class="date">10 月 7 日，星期三</div>
  <div class="title kai">让记忆，</div><div class="title kai">在这里生长</div>
  <div class="verse"><span>一片叶子，</span><span>一段属于你的时光</span></div>
  <img class="tree" alt="人生树">
  <div class="caption"><div class="cap-label">我的人生树</div><div class="cap-year kai">2026</div><div class="cap-note">收藏了 12 个瞬间</div></div>
</div>
<div class="base">
  <button class="record">${ICON.pen}<span>留下这一刻</span></button>
  <div class="recent">
    <div class="recent-header"><div class="recent-title kai">最近的记忆</div><button class="recent-all">查看全部</button></div>
    ${row(ICON.leaf, '晚风刚刚好', '沿着熟悉的路走走，心也慢了下来。', '10.05')}
    ${row(ICON.flower, '好好吃了一顿饭', '没有特别的理由，平常的一天也很好。', '★ 10.02')}
  </div>
  <div class="private">${ICON.lock}<span>不必向谁展示，也值得认真收藏。</span></div>
</div></div>`, 0);

const tree = phone('人生记忆树', 'p-tree', `
<div class="page tree-page">
  <div class="header"><div class="title">我的人生树</div><div class="month-picker">2026-10 ▾</div></div>
  <div class="row"><div class="subtitle">每一片叶子都是时光的礼物</div><button class="quiet">全部年月</button></div>
  <div class="tree-scope"><div class="scene">
    <img class="tree" alt="人生树">
    <div class="node" style="left:38%;top:24%"><div class="leaf" style="background:#728463">叶</div></div>
    <div class="node precious" style="left:62%;top:36%"><div class="leaf" style="background:#a7656a">花</div></div>
    <div class="node" style="left:29%;top:52%"><div class="leaf" style="background:#b17837">果</div></div>
    <div class="node" style="left:58%;top:63%"><div class="leaf" style="background:#5b886d">芽</div></div>
  </div></div>
  <div class="row tree-bottom"><div><div class="serif">2026-10 · 4 个瞬间</div><div class="muted">轻触树上的枝叶，打开记忆</div></div><button class="secondary">＋ 留下</button></div>
  <div class="field"><input placeholder="搜索标题、感受、人物或地点" value=""></div>
  <div class="row"><div class="section-title">枝头的记忆</div><button class="quiet">只看珍贵</button></div>
  ${row(ICON.leaf, '晚风刚刚好', '沿着熟悉的路走走，心也慢了下来。', '10.05')}
  ${row(ICON.flower, '好好吃了一顿饭', '没有特别的理由，平常的一天也很好。', '★ 10.02')}
</div>`, 1);

const capture = phone('人生记忆树', 'p-capture', `
<div class="page">
  <div class="header"><div class="title">此刻，想记住什么？</div><button class="quiet">清空</button></div>
  <div class="subtitle">不必完整，也不必漂亮。</div>
  <button class="photo-picker"><div><div class="photo-plus">＋</div><div>选择一张照片</div><div class="muted">也可以只写一句话</div></div></button>
  <div class="field"><text class="label">给这一刻起个名字（选填）</text><input value="回家吃的一顿晚饭"></div>
  <div class="field"><text class="label">那一刻的感受</text><textarea>锅里的汤咕嘟咕嘟响，爸在旁边念叨少放点盐。</textarea><div class="count">21 / 2000</div></div>
  <div class="field"><text class="label">发生的日期</text><div class="picker">2026-10-07 ▾</div></div>
  <div class="field"><text class="label">它长成什么样子</text><div class="kinds">
    <button class="kind selected"><span style="color:#728463">叶</span>日常</button>
    <button class="kind"><span style="color:#a7656a">花</span>喜悦</button>
    <button class="kind"><span style="color:#b17837">果</span>收获</button>
    <button class="kind"><span style="color:#5b886d">芽</span>开始</button>
    <button class="kind"><span style="color:#887467">纹</span>成长</button>
    <button class="kind"><span style="color:#ab852e">光</span>珍惜</button>
  </div></div>
  <div class="field"><text class="label">人物（选填）</text><input value="爸妈"></div>
  <div class="field"><text class="label">地点（选填）</text><input value="家里"></div>
  <div class="field"><text class="label">写给未来的我（选填）</text><textarea class="echo-input">记得多回家吃饭。</textarea></div>
  <div class="row field"><text>标记为珍贵记忆</text><span class="sw on"></span></div>
  <div class="space"></div>
  <button class="primary">种下这一刻</button>
  <button class="privacy-link">私人保存 · 查看隐私说明</button>
</div>`, 2);

const review = phone('人生记忆树', 'p-review', `
<div class="page">
  <div class="header"><div class="title">年月回望</div><div class="month-picker">2026-10 ▾</div></div>
  <div class="subtitle">生活的答案，藏在你写下的字里。</div>
  <div class="review-letter">
    <div class="serif letter-title">这个月，你留下了 4 个瞬间。</div>
    <div>其中有 1 个，被你标记为珍贵。</div>
    <div class="kind-line"><span style="color:#728463">日常 2　</span><span style="color:#a7656a">喜悦 1　</span><span style="color:#b17837">收获 1　</span></div>
    <div class="note">以下内容来自你的记录。</div>
  </div>
  <div class="section-title">你写给未来的话</div>
  <div class="echo-card"><div class="reading serif">记得多回家吃饭。</div><div class="muted">2026.10.05 · 好好吃了一顿饭</div></div>
  <div class="section-title">重新走过这些日子</div>
  ${row(ICON.leaf, '晚风刚刚好', '沿着熟悉的路走走，心也慢了下来。', '10.05')}
  ${row(ICON.flower, '好好吃了一顿饭', '没有特别的理由，平常的一天也很好。', '★ 10.02')}
</div>`, 3);

const me = phone('人生记忆树', 'p-me', `
<div class="page">
  <div class="me-heading"><div class="seal serif">记</div><div class="title">这棵树，只属于你。</div><div class="subtitle">不必向谁展示，也值得认真收藏。</div></div>
  <div class="stats"><div><text>12</text><div>个瞬间</div></div><div><text>3</text><div>个珍贵记忆</div></div></div>
  <div class="card">
    <div class="menu-row"><text>导出文字记录</text><text>›</text></div>
    <div class="menu-row"><text>导入文字备份</text><text>›</text></div>
    <div class="menu-row"><text>隐私与数据说明</text><text>›</text></div>
    <div class="menu-row"><text>重试已删除照片的清理</text><text>›</text></div>
    <div class="menu-row danger"><text>清空记录并停止使用</text><text>›</text></div>
  </div>
  <div class="note center export-note"><div>导出的 JSON 包含文字与日期，不含照片。</div><div>重要照片请在记忆详情中预览并另行保存。</div></div>
  <div class="note center">人生记忆树 1.0.0</div>
</div>`, 4);

const treePng = 'data:image/png;base64,' + fs.readFileSync(path.join(mini, 'assets', 'tree.png')).toString('base64');

const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>人生记忆树 · 小程序当前前端全貌</title>
<style>
${fontsCss}
${shell}
${rpx(appCss)}
${rpx(memCss)}
${rpx(sceneCss)}
${rpx(tabCss)}
${rpx(pageCss.home)}
${rpx(pageCss.tree)}
${rpx(pageCss.capture)}
${rpx(pageCss.review)}
${rpx(pageCss.me)}
.sw{width:52px;height:30px;border-radius:15px;background:#728463;display:inline-block;position:relative}
.sw::after{content:'';position:absolute;right:3px;top:3px;width:24px;height:24px;border-radius:50%;background:#fff}
.kinds{display:flex;flex-wrap:wrap;gap:8px}
.kind{display:inline-flex;align-items:center;gap:4px;border:1px solid #e7e0d6;border-radius:999px;padding:8px 14px;background:#fffdf8;font-size:13px}
.kind.selected{border-color:#728463;background:#edf0e7}
.photo-picker{width:100%;height:150px;border:1px dashed #c7cdbd;border-radius:20px;background:#fffdf8;color:#81766b;font-size:14px}
.photo-plus{font-size:26px;color:#98a184}
text{font-size:inherit}
</style></head><body>
<h1>人生记忆树 · 当前前端全貌</h1>
<p class="lead">样式与图标直接取自 wechat/miniprogram 现有代码（rpx 按 375px 换算），示例数据仅用于排版示意。</p>
<div class="rack">${home}${tree}${capture}${review}${me}</div>
<script>
const TREE = "${treePng}";
document.querySelectorAll('img.tree').forEach(img => { img.src = TREE; });
</script>
</body></html>`;

fs.writeFileSync(path.join(__dirname, '..', 'design', 'preview-all-pages.html'), html);
console.log('生成完成，大小:', (html.length / 1024 / 1024).toFixed(2), 'MB');
