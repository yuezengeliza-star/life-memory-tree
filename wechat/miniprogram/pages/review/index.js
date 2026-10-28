const p = require('../../utils/page');
const localPhotos = require('../../utils/local-photos');
const md = date => ({ month: +date.slice(5, 7), day: +date.slice(8, 10) });
const monthDay = date => `${+date.slice(5, 7)}月${+date.slice(8, 10)}日`;

Page({
  data: {
    memories: [], month: p.model.today().slice(0, 7), monthNum: +p.model.today().slice(5, 7),
    yearText: p.model.today().slice(0, 4), records: [], preciousCount: 0, echoes: [], kinds: [],
    error: '', loading: false
  },
  onLoad: p.hideShare,
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) this.getTabBar().setData({ selected: 3 });
    this.setData({ month: getApp().globalData.month || this.data.month });
    p.refresh(this, memories => this.summary(memories));
  },
  summary(memories) {
    const month = this.data.month;
    const inMonth = localPhotos.apply(memories.filter(m => m.date.startsWith(month)))
      .map(m => ({ ...m, md: md(m.date), monthDay: monthDay(m.date) }));
    const counts = p.model.KINDS.map(k => ({ ...k, count: inMonth.filter(m => m.kind === k.id).length })).filter(k => k.count);
    return {
      monthNum: +month.slice(5, 7),
      yearText: month.slice(0, 4),
      records: inMonth,
      preciousCount: inMonth.filter(m => m.precious).length,
      echoes: inMonth.filter(m => m.echo).slice(0, 3).map(m => ({ ...m, monthDay: monthDay(m.date) })),
      kinds: counts.slice(0, 3)
    };
  },
  onMonth(e) {
    const month = e.detail.value;
    getApp().globalData.month = month;
    this.setData({ month, ...this.summary(this.data.memories) });
  },
  retry() { this.onShow(); },
  begin() { p.begin(this); },
  open: p.open,
  capture: p.capture
});
