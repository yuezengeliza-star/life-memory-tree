const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const mini = path.join(root, 'wechat', 'miniprogram');

// 1. 放大镜图标（描边 #676f5d，与设计稿一致）
const icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#676f5d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>';
fs.writeFileSync(path.join(mini, 'assets', 'icons', 'search.svg'), icon);
console.log('已生成 search.svg');

function edit(rel, pairs) {
  const p = path.join(mini, rel);
  let s = fs.readFileSync(p, 'utf8');
  for (const [from, to] of pairs) {
    if (!s.includes(from)) {
      if (to && s.includes(to)) { console.log('已应用，跳过:', rel); continue; }
      throw new Error(`${rel} 未找到: ${from.slice(0, 70)}`);
    }
    s = s.split(from).join(to);
  }
  fs.writeFileSync(p, s);
  console.log('已改:', rel);
}

// 2. 搜索框：图标 + 输入框一体
edit('pages/tree/index.wxml', [
  [
    '<view class="field"><input type="text" placeholder="搜索标题、感受、人物或地点" value="{{query}}" bindinput="onQuery" maxlength="100"/></view>',
    '<view class="search"><image class="search-icon" src="/assets/icons/search.svg" mode="aspectFit" aria-hidden="true"/><input class="search-input" type="text" placeholder="搜索标题、感受、人物或地点" value="{{query}}" bindinput="onQuery" maxlength="100"/></view>'
  ]
]);

// 3. 样式：搜索框 + 「枝头的记忆」标题放大
const wxss = `
/* 搜索框：图标 + 输入一体（设计稿版式） */
.search{display:flex;align-items:center;gap:18rpx;background:#fbf9f0;border:1rpx solid #daddcb;border-radius:20rpx;padding:26rpx 28rpx;margin-top:32rpx}
.search-icon{width:32rpx;height:32rpx;flex:none}
.search-input{flex:1;min-width:0;font-size:28rpx;color:#3f4936;line-height:1.5}
/* 分区标题：设计稿为左对齐大号楷体 */
.tree-page .section-title{font-size:40rpx;margin:40rpx 0 20rpx;text-align:left}
.tree-page .quiet{flex:none}
`;
fs.writeFileSync(path.join(mini, 'pages', 'tree', 'index.wxss'), fs.readFileSync(path.join(mini, 'pages', 'tree', 'index.wxss'), 'utf8').trimEnd() + wxss);
console.log('已改: pages/tree/index.wxss');