const p = require('../../utils/page');
const WEEK = ['日','一','二','三','四','五','六'];
function longDate() {
  const d = new Date();
  return `${d.getMonth()+1} 月 ${d.getDate()} 日，星期${WEEK[d.getDay()]}`;
}
Page({
  data:{memories:[],recent:[],yearCount:0,year:new Date().getFullYear(),loading:false,error:'',needsConsent:false,letterOpen:false},
  onLoad:p.hideShare,
  onShow(){
    if (typeof this.getTabBar === 'function' && this.getTabBar()) this.getTabBar().setData({selected: 0});
    this.setData({dateLabel:longDate(),letterOpen:!wx.getStorageSync('letterReadV1')});
    p.refresh(this,memories=>({recent:memories.slice(0,3),yearCount:memories.filter(m=>m.date.startsWith(String(this.data.year))).length}));
  },
  retry(){this.onShow();}, begin(){p.begin(this);}, capture:p.capture, open:p.open,
  letter(){this.setData({letterOpen:true});}, onLetterClose(){this.setData({letterOpen:false});},
  tree(){wx.switchTab({url:'/pages/tree/index'});}, review(){wx.switchTab({url:'/pages/review/index'});},
  privacy(){wx.navigateTo({url:'/pages/privacy/index'});}
});
