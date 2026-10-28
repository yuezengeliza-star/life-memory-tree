const config = require('./config');
App({
  globalData: { ready: false, month: '', editId: '', dirty: 0, privacyResolver: null },
  onLaunch() {
    if (wx.onNeedPrivacyAuthorization) wx.onNeedPrivacyAuthorization(resolve => {
      this.globalData.privacyResolver = resolve;
      const pages = getCurrentPages();
      const component = pages.length && pages[pages.length - 1].selectComponent('#privacy');
      if (component) component.open();
      else { resolve({ event: 'disagree' }); this.globalData.privacyResolver = null; }
    });
    if (wx.cloud) {
      // 不传 env：让 SDK 自动选择当前小程序关联的默认环境
      // （web- 前缀的 CloudBase 环境在小程序端按 ID 精确匹配会报 Env Not Exists）
      // 若日后换成标准小程序云开发环境，可在 config.envId 填入并改回 { env: config.envId }
      wx.cloud.init({ traceUser: false });
      this.globalData.ready = true;
    }
  }
});
