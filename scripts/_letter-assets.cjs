const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const icons = path.join(root, 'wechat', 'miniprogram', 'assets', 'icons');

// 米色信封 + 深绿蜡封（设计稿内衬亮、上盖略深、蜡封居中偏下）
const envelope = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="272" viewBox="0 0 400 272" fill="none">
<rect width="400" height="272" fill="#efe2c8"/>
<path d="M10 266 L200 132 L390 266 Z" fill="#f6edda"/>
<path d="M0 0 L200 154 L400 0 Z" fill="#e7d9bb"/>
<path d="M0 0 L200 154 L400 0" stroke="#d8c7a4" stroke-width="1.5"/>
<path d="M0 0 L0 6 M400 0 L400 6" stroke="#d8c7a4" stroke-width="1.5"/>
<circle cx="200" cy="172" r="43" fill="#4e5b45"/>
<circle cx="200" cy="172" r="33" fill="none" stroke="#68765a" stroke-width="1.5"/>
<path d="M200 145 C217 160 217 181 200 198 C183 181 183 160 200 145 Z" fill="#64735a"/>
<path d="M200 152 L200 192" stroke="#4e5b45" stroke-width="2" stroke-linecap="round"/>
</svg>
`;

const arrowUp = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d3d7bf" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
<path d="M12 19V6"/><path d="M6 11.5 12 5.5l6 6"/>
</svg>
`;

const close = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e8e6d8" stroke-width="1.5" stroke-linecap="round">
<path d="M6 6 18 18"/><path d="M18 6 6 18"/>
</svg>
`;

const files = { 'letter-envelope.svg': envelope, 'arrow-up.svg': arrowUp, 'close.svg': close };
for (const [name, body] of Object.entries(files)) {
  fs.writeFileSync(path.join(icons, name), body);
  console.log('已生成', name);
}