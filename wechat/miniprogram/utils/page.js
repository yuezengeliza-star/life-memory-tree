const service = require('./service');
const model = require('./model');
function hideShare() { wx.hideShareMenu({menus:['shareAppMessage','shareTimeline']}); }
function error(e) { wx.showModal({title:'暂未完成',content:e.message || e.errMsg || '请检查网络后重试',showCancel:false}); }
async function refresh(page, extra) {
  page.setData({loading:true,error:'',needsConsent:!service.agreed()});
  try { const memories = await service.list(); page.setData({memories,loading:false,...(extra?extra(memories):{})}); }
  catch(e) { page.setData({error:e.message,loading:false}); }
}
function open(e) { wx.navigateTo({url:`/pages/detail/index?id=${e.detail.id || e.currentTarget.dataset.id}`}); }
async function begin(page) { try { await service.consent(); if(page) page.onShow(); } catch(e) { error(e); } }
function capture() { wx.switchTab({url:'/pages/capture/index'}); }
module.exports = { service, model, hideShare, error, refresh, open, begin, capture };
