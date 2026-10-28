const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const mini = path.join(root, 'wechat', 'miniprogram');
const read = rel => fs.readFileSync(path.join(mini, rel), 'utf8');
const write = (rel, s) => fs.writeFileSync(path.join(mini, rel), s);

function edit(rel, pairs) {
  let s = read(rel);
  for (const [from, to] of pairs) {
    if (!s.includes(from)) {
      if (s.includes(to)) { console.log('已应用，跳过:', rel); continue; }
      throw new Error(`${rel} 未找到: ${from.slice(0, 80)}`);
    }
    s = s.split(from).join(to);
  }
  write(rel, s);
  console.log('已改:', rel);
}

// 1. 组件声明 + 全局注册
write('components/first-letter/index.json', '{"component":true}\n');
edit('app.json', [[
  '"usingComponents": { "privacy-consent": "/components/privacy-consent/index" }',
  '"usingComponents": { "privacy-consent": "/components/privacy-consent/index", "first-letter": "/components/first-letter/index" }',
]]);

// 2. 首页：首次进入（未读过）自动弹出
edit('pages/home/index.js', [
  ["data:{memories:[],recent:[],yearCount:0,year:new Date().getFullYear(),loading:false,error:'',needsConsent:false}",
   "data:{memories:[],recent:[],yearCount:0,year:new Date().getFullYear(),loading:false,error:'',needsConsent:false,letterOpen:false}"],
  ["    this.setData({dateLabel:longDate()});",
   "    this.setData({dateLabel:longDate(),letterOpen:!wx.getStorageSync('letterReadV1')});"],
  ["  retry(){this.onShow();}, begin(){p.begin(this);}, capture:p.capture, open:p.open,",
   "  retry(){this.onShow();}, begin(){p.begin(this);}, capture:p.capture, open:p.open,\n  letter(){this.setData({letterOpen:true});}, onLetterClose(){this.setData({letterOpen:false});},"],
]);
edit('pages/home/index.wxml', [[
  '  <privacy-consent id="privacy"/>',
  '  <first-letter open="{{letterOpen}}" bind:close="onLetterClose"/>\n  <privacy-consent id="privacy"/>',
]]);

// 3.「我的」：随时重读
edit('pages/me/index.wxml', [[
  '<button class="menu-row" bindtap="privacy"><text>隐私与数据说明</text><text>›</text></button>',
  '<button class="menu-row" bindtap="letter"><text>重读那封信</text><text>›</text></button><button class="menu-row" bindtap="privacy"><text>隐私与数据说明</text><text>›</text></button>',
], [
  '<privacy-consent id="privacy"/>',
  '<first-letter open="{{letterOpen}}" bind:close="onLetterClose"/><privacy-consent id="privacy"/>',
]]);
edit('pages/me/index.js', [
  ['Page({data:{count:0,', 'Page({data:{letterOpen:false,count:0,'],
  ["privacy(){wx.navigateTo({url:'/pages/privacy/index'});},",
   "privacy(){wx.navigateTo({url:'/pages/privacy/index'});},letter(){this.setData({letterOpen:true});},onLetterClose(){this.setData({letterOpen:false});},"],
]);