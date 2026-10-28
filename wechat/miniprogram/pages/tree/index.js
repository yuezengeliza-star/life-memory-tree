const p = require('../../utils/page');
Page({
  data:{memories:[],filtered:[],month:p.model.today().slice(0,7),all:false,loading:false,error:'',query:'',precious:false},
  onLoad:p.hideShare,
  onShow(){if(typeof this.getTabBar==='function'&&this.getTabBar())this.getTabBar().setData({selected:1});if(getApp().globalData.month)this.setData({month:getApp().globalData.month});p.refresh(this,memories=>({filtered:this.filter(memories)}));},
  filter(memories){const d=this.data;return memories.filter(m=>(d.all || m.date.startsWith(d.month)) && (!d.precious || m.precious) && (!d.query || `${m.title} ${m.content} ${m.scene} ${m.people}`.includes(d.query)));},
  update(){this.setData({filtered:this.filter(this.data.memories)});},
  onMonth(e){this.setData({month:e.detail.value,all:false});getApp().globalData.month=e.detail.value;this.update();},
  onQuery(e){this.setData({query:e.detail.value.trim()});this.update();},
  all(){this.setData({all:!this.data.all});this.update();}, precious(){this.setData({precious:!this.data.precious});this.update();},
  retry(){this.onShow();},begin(){p.begin(this);},capture:p.capture,open:p.open
});
