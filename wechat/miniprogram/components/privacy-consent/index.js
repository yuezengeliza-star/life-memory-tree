Component({
  data:{visible:false},
  methods:{
    open(){this.setData({visible:true});},
    read(){wx.openPrivacyContract({fail:()=>wx.navigateTo({url:'/pages/privacy/index'})});},
    agree(){const app=getApp();if(app.globalData.privacyResolver)app.globalData.privacyResolver({buttonId:'agree-privacy',event:'agree'});app.globalData.privacyResolver=null;this.setData({visible:false});},
    refuse(){const app=getApp();if(app.globalData.privacyResolver)app.globalData.privacyResolver({event:'disagree'});app.globalData.privacyResolver=null;this.setData({visible:false});}
  }
});
