// 按设计稿生成 SVG 图标资源（颜色烘焙，image 组件不支持 currentColor）
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'wechat', 'miniprogram', 'assets', 'icons');
fs.mkdirSync(dir, { recursive: true });

const wrap = (inner, size) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g stroke="{COLOR}">${inner}</g></svg>`;

// 设计稿原始路径（stroke 全部走 currentColor，此处替换为具体色值）
const P = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  tree: '<path d="m12 3 5 6h-3l5 6h-5v6h-4v-6H5l5-6H7Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  book: '<path d="M12 5v16M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2Z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  pen: '<path d="m16 3 5 5-12 12-6 1 1-6Z"/><path d="m13 6 5 5"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  leaf: '<path d="M20 3C9 2 3 7 4 14c1 7 9 8 13 3 3-4 3-9 3-14Z"/><path d="M3 21 15 9"/>',
  // 以下四种为设计稿风格的同规格线形图标（设计稿只给了叶片和书本两种）
  flower: '<circle cx="12" cy="12" r="2.4"/><path d="M12 9.6C9.9 7.6 9.9 4.7 12 3c2.1 1.7 2.1 4.6 0 6.6Z"/><path d="M12 14.4c-2.1 2-2.1 4.9 0 6.6 2.1-1.7 2.1-4.6 0-6.6Z"/><path d="M9.6 12c-2-2.1-4.9-2.1-6.6 0 1.7 2.1 4.6 2.1 6.6 0Z"/><path d="M14.4 12c2-2.1 4.9-2.1 6.6 0-1.7 2.1-4.6 2.1-6.6 0Z"/>',
  fruit: '<path d="M12 7.5c-1-.6-2.2-.8-3.4-.4C6.4 7.8 5.5 10 6 12.8c.5 3 2.6 5.6 5 6.1 1 .2 1.4-.3 1-.3s1 .5 2 .3c2.4-.5 4.5-3.1 5-6.1.5-2.8-.4-5-2.6-5.7-1.2-.4-2.4-.2-3.4.4Z"/><path d="M12 7c0-2 1-3 3-3.5"/>',
  bud: '<path d="M12 21v-7"/><path d="M12 14c-4.5 0-6.5-2.5-6.5-6C9 8 12 10 12 14Z"/><path d="M12 12c0-3.5 2-5.5 6.5-5.5 0 3.5-2 6-6.5 5.5Z"/>',
  scar: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.8"/>',
  glow: '<path d="m12 4 1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8Z"/><path d="M18.5 3.5v3M17 5h3"/>'
};

const files = {
  // 底部导航：默认 #676f5d / 选中 #506342 / 胶囊加号 #f5f3e8
  'tab-home.svg': [P.home, 21, '#676f5d'],
  'tab-home-active.svg': [P.home, 21, '#506342'],
  'tab-tree.svg': [P.tree, 21, '#676f5d'],
  'tab-tree-active.svg': [P.tree, 21, '#506342'],
  'tab-plus.svg': [P.plus, 21, '#f5f3e8'],
  'tab-review.svg': [P.book, 21, '#676f5d'],
  'tab-review-active.svg': [P.book, 21, '#506342'],
  'tab-me.svg': [P.user, 21, '#676f5d'],
  'tab-me-active.svg': [P.user, 21, '#506342'],
  // 记录按钮画笔（按钮文字色 #3f4936）
  'pen.svg': [P.pen, 19, '#3f4936'],
  // 隐私小字挂锁（#676f5d）
  'lock.svg': [P.lock, 12, '#676f5d'],
  // 六种记忆符号（.dg-forest-base 内 accent=#61704f）
  'kind-leaf.svg': [P.leaf, 21, '#61704f'],
  'kind-flower.svg': [P.flower, 21, '#61704f'],
  'kind-fruit.svg': [P.fruit, 21, '#61704f'],
  'kind-bud.svg': [P.bud, 21, '#61704f'],
  'kind-scar.svg': [P.scar, 21, '#61704f'],
  'kind-glow.svg': [P.glow, 21, '#61704f']
};

for (const [name, [inner, size, color]] of Object.entries(files)) {
  fs.writeFileSync(path.join(dir, name), wrap(inner, size).replace('{COLOR}', color));
}
console.log('生成图标数:', Object.keys(files).length, '目录:', dir);
