// 「山林来信」自定义底部导航：还原设计稿 .dg-tab-bar（五栏 + 中间胶囊）
Component({
  data: {
    selected: 0,
    tabs: [
      { path: '/pages/home/index', text: '首页', icon: '/assets/icons/tab-home.svg', activeIcon: '/assets/icons/tab-home-active.svg' },
      { path: '/pages/tree/index', text: '人生树', icon: '/assets/icons/tab-tree.svg', activeIcon: '/assets/icons/tab-tree-active.svg' },
      { path: '/pages/capture/index', text: '留下', icon: '/assets/icons/tab-plus.svg', activeIcon: '/assets/icons/tab-plus.svg', capture: true },
      { path: '/pages/review/index', text: '回望', icon: '/assets/icons/tab-review.svg', activeIcon: '/assets/icons/tab-review-active.svg' },
      { path: '/pages/me/index', text: '我的', icon: '/assets/icons/tab-me.svg', activeIcon: '/assets/icons/tab-me-active.svg' }
    ]
  },
  methods: {
    switch(e) {
      const path = e.currentTarget.dataset.path;
      if (!path) return;
      wx.switchTab({ url: path });
    }
  }
});
