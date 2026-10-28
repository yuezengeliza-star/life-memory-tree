const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'wechat', 'miniprogram', 'components', 'memory-list');

// 1. 模板：日期移进 .body，排在摘要下面（不再绝对定位到右上角）
let w = fs.readFileSync(path.join(dir, 'index.wxml'), 'utf8');
const from = '<view class="body"><view class="name">{{item.title}}</view><view class="excerpt">{{item.content}}</view></view><view class="date-time">{{item.precious ? \'★ \' : \'\'}}{{fmt.short(item.dateText)}}</view>';
const to = '<view class="body"><view class="name">{{item.title}}</view><view class="excerpt">{{item.content}}</view><view class="date-time">{{item.precious ? \'★ \' : \'\'}}{{fmt.short(item.dateText)}}</view></view>';
if (w.includes(from)) {
  fs.writeFileSync(path.join(dir, 'index.wxml'), w.split(from).join(to));
  console.log('memory-list.wxml: 日期改为第三行');
} else if (w.includes('class="date-time"') && w.indexOf('class="date-time"') < w.indexOf('</view></view>')) {
  console.log('已应用，跳过');
} else {
  throw new Error('未找到目标结构');
}

// 2. 样式：去掉绝对定位、放大缩略图、按设计稿比例调整
const css = `/* 记忆行（设计稿版式）：左缩略图 + 右三行文字，日期独立成行避免与标题重叠 */
.memory{position:relative;width:100%;display:flex;align-items:flex-start;gap:24rpx;padding:28rpx 0;margin:0;border-top:1rpx solid #daddcb;background:none;text-align:left;border-radius:0;color:#3f4936;line-height:1.5}
.memory::after{border:0}
/* 缩略图 96rpx 见方；无照片时显示类型色块 + 线性图标 */
.thumb,.symbol{width:96rpx;height:96rpx;flex-shrink:0;border-radius:16rpx;background:#e8ebda;display:flex;align-items:center;justify-content:center}
.thumb{background:none}
.kind-icon{width:56rpx;height:56rpx}
.body{flex:1;min-width:0}
/* 标题：过长省略，不再与日期抢空间 */
.name{font-size:30rpx;font-weight:500;font-family:'Tree WenKai','Kaiti SC','STKaiti','KaiTi',serif;line-height:1.5;color:#3f4936;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
/* 摘要：两行截断 */
.excerpt{font-size:26rpx;color:#676f5d;margin-top:6rpx;line-height:1.6;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
/* 日期：独占一行 */
.date-time{font-size:24rpx;color:#676f5d;margin-top:10rpx;line-height:1.5}
`;
fs.writeFileSync(path.join(dir, 'index.wxss'), css);
console.log('memory-list.wxss: 行样式已按设计稿重写');