const p = require('../../utils/page');
const localPhotos = require('../../utils/local-photos');
const empty = () => ({title:'',content:'',date:p.model.today(),kind:'leaf',scene:'',people:'',echo:'',precious:false,photoLocal:false,photoFileId:'',id:'',revision:0,clientId:p.model.clientId()});
Page({
  data:{form:empty(),kinds:p.model.KINDS,filePath:'',saving:false,editing:false,error:'',draftNotice:''},
  onLoad(){p.hideShare();const draft=wx.getStorageSync('life-tree-draft');if(draft && !draft.id)this.setData({form:{...empty(),...draft},draftNotice:'已恢复未完成的文字草稿'});},
  async onShow(){if(typeof this.getTabBar==='function'&&this.getTabBar())this.getTabBar().setData({selected:2});const id=getApp().globalData.editId;if(!id)return;getApp().globalData.editId='';this.setData({loading:true});try{this.setData({form:await p.service.get(id),editing:true,filePath:'',error:'',draftNotice:''});}catch(e){p.error(e);}finally{this.setData({loading:false});}},
  input(e){const key=e.currentTarget.dataset.field;this.setData({[`form.${key}`]:e.detail.value});this.draft();},
  kind(e){this.setData({'form.kind':e.currentTarget.dataset.kind});this.draft();},
  precious(e){this.setData({'form.precious':e.detail.value});this.draft();},
  toggle(e){this.setData({['form.' + e.currentTarget.dataset.field]:e.detail.value});this.draft();},
  draft(){if(!this.data.editing)try{wx.setStorageSync('life-tree-draft',this.data.form);}catch(_){}},
  async photo(){try{
    await p.service.consent();
    if(wx.requirePrivacyAuthorize)await wx.requirePrivacyAuthorize();
    const r=await wx.chooseMedia({count:1,mediaType:['image'],sourceType:['album','camera'],sizeType:['compressed']});
    if(!r.tempFiles.length)return;
    const f=r.tempFiles[0];if(f.size>8*1024*1024)throw new Error('照片请小于8MB，压缩后再试');
    const compressed=await wx.compressImage({src:f.tempFilePath,quality:75,compressedWidth:1600});
    this.setData({filePath:compressed.tempFilePath,error:''});
  }catch(e){if(!/cancel|deny|disagree/i.test(e.errMsg || ''))p.error(e);}},
  removePhoto(){this.setData({filePath:'','form.photoFileId':''});this.draft();},
  async save(){if(this.data.saving)return;this.setData({error:''});try{p.model.normalize(this.data.form);await p.service.consent();this.setData({saving:true});const keepLocal=!!this.data.form.photoLocal && !!this.data.filePath;
    const payload=keepLocal?{...this.data.form,photoFileId:''}:this.data.form;
    const r=await p.service.save(payload,keepLocal?'':this.data.filePath);
    if(r && r.memory && r.memory.id){ if(keepLocal) localPhotos.keep(r.memory.id,this.data.filePath); else localPhotos.drop(r.memory.id); }getApp().globalData.month=r.memory.date.slice(0,7);this.setData({form:empty(),filePath:'',editing:false,draftNotice:''});wx.removeStorageSync('life-tree-draft');wx.showToast({title:'已保存到记忆树'});wx.switchTab({url:'/pages/tree/index'});}catch(e){this.setData({error:e.message || e.errMsg || '保存失败，请稍后重试。文字还在这里。'});}finally{this.setData({saving:false});}},
  cancel(){wx.showModal({title:this.data.editing?'放弃本次修改？':'清除这份草稿？',content:'已经保存的记忆不会改变。',success:r=>{if(r.confirm){this.setData({form:empty(),filePath:'',editing:false,draftNotice:'',error:''});wx.removeStorageSync('life-tree-draft');wx.switchTab({url:'/pages/tree/index'});}}});},
  privacy(){wx.navigateTo({url:'/pages/privacy/index'});}
});
