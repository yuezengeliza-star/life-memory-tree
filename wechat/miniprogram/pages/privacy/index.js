const config=require('../../config');
Page({data:{operator:config.operator,contact:config.contactEmail,version:config.privacyVersion},onLoad(){wx.hideShareMenu();},contract(){if(wx.openPrivacyContract)wx.openPrivacyContract({fail:()=>wx.showToast({title:'请在微信右上角菜单查看隐私指引',icon:'none'})});}});
