// 生成白色描边版记忆类型图标（树图节点用），并把树图节点从文字换成图标
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const icons = path.join(root, 'wechat', 'miniprogram', 'assets', 'icons');

// 1. kind-*.svg -> kind-*-white.svg（描边换成米白）
const kinds = ['leaf', 'flower', 'fruit', 'bud', 'scar', 'glow'];
for (const k of kinds) {
  const src = path.join(icons, `kind-${k}.svg`);
  const dst = path.join(icons, `kind-${k}-white.svg`);
  let s = fs.readFileSync(src, 'utf8');
  s = s.replace(/stroke="#[0-9a-fA-F]{6}"/, 'stroke="#fbf7ea"');
  fs.writeFileSync(dst, s);
}
console.log('白色图标 x', kinds.length);

// 2. 树图节点：文字 -> 图标
const wxml = path.join(root, 'wechat', 'miniprogram', 'components', 'tree-scene', 'index.wxml');
let w = fs.readFileSync(wxml, 'utf8');
const from = '<view wx:else class="leaf" style="background:{{item.color}}">{{item.symbol}}</view>';
const to = '<view wx:else class="leaf" style="background:{{item.color}}"><image class="leaf-icon" src="/assets/icons/kind-{{item.kind || \'leaf\'}}-white.svg" mode="aspectFit" aria-hidden="true"/></view>';
if (w.includes(from)) {
  w = w.split(from).join(to);
  fs.writeFileSync(wxml, w);
  console.log('tree-scene.wxml: 节点已换成图标');
} else if (w.includes('leaf-icon')) {
  console.log('已应用，跳过');
} else {
  throw new Error('未找到目标节点');
}

// 3. 样式：图标尺寸
const wxss = path.join(root, 'wechat', 'miniprogram', 'components', 'tree-scene', 'index.wxss');
let c = fs.readFileSync(wxss, 'utf8');
if (!c.includes('.leaf-icon')) {
  c = c.trimEnd() + '\n.leaf-icon{width:30rpx;height:30rpx}\n';
  fs.writeFileSync(wxss, c);
  console.log('tree-scene.wxss: 图标尺寸已加');
} else {
  console.log('样式已存在，跳过');
}
