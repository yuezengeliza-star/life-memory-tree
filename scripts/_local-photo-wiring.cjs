const fs = require('fs');
const path = require('path');
const mini = path.join(__dirname, '..', 'wechat', 'miniprogram');

function edit(rel, pairs) {
  const p = path.join(mini, rel);
  let s = fs.readFileSync(p, 'utf8');
  for (const [from, to] of pairs) {
    if (!s.includes(from)) {
      if (to && s.includes(to)) { console.log('已应用，跳过:', rel); continue; }
      throw new Error(`${rel} 未找到: ${from.slice(0, 70)}`);
    }
    s = s.split(from).join(to);
  }
  fs.writeFileSync(p, s);
  console.log('已改:', rel);
}

// ---- 详情页模板：本机照片标记 + 存到相册 ----
edit('pages/detail/index.wxml', [
  [
    '<image wx:if="{{memory.photoFileId}}" class="photo detail-photo" src="{{memory.photoFileId}}" mode="widthFix" bindtap="photo"/>',
    '<image wx:if="{{photoSrc}}" class="photo detail-photo" src="{{photoSrc}}" mode="widthFix" bindtap="photo"/>'
  ],
  [
    '<view class="reading content">{{memory.content}}</view>',
    '<view wx:if="{{photoLocal}}" class="note">照片只存在这台手机，没有上传云端<text class="album-link" bindtap="saveAlbum">存到相册</text></view>\n<view class="reading content">{{memory.content}}</view>'
  ]
]);

// ---- 详情页逻辑 ----
edit('pages/detail/index.js', [
  [
    "const p=require('../../utils/page');",
    "const p=require('../../utils/page');\nconst localPhotos=require('../../utils/local-photos');"
  ],
  [
    "data:{memory:null,loading:true,error:'',busy:false}",
    "data:{memory:null,loading:true,error:'',busy:false,photoSrc:'',photoLocal:false}"
  ],
  [
    "try{this.setData({memory:await p.service.get(this.id)});}",
    "try{const memory=await p.service.get(this.id);const local=localPhotos.pathOf(memory.id);this.setData({memory,photoSrc:local || memory.photoFileId || '',photoLocal:!!local});}"
  ],
  [
    "async photo(){try{const r=await wx.cloud.getTempFileURL({fileList:[this.data.memory.photoFileId]});",
    "async photo(){try{if(this.data.photoLocal){await wx.previewImage({current:this.data.photoSrc,urls:[this.data.photoSrc]});return;}const r=await wx.cloud.getTempFileURL({fileList:[this.data.memory.photoFileId]});"
  ],
  [
    "edit(){getApp().globalData.editId=this.id;wx.switchTab({url:'/pages/capture/index'});}",
    "edit(){getApp().globalData.editId=this.id;wx.switchTab({url:'/pages/capture/index'});},\nasync saveAlbum(){if(this.data.busy||!this.data.photoSrc)return;this.setData({busy:true});try{if(this.data.photoLocal){await wx.saveImageToPhotosAlbum({filePath:this.data.photoSrc});}else{const r=await wx.cloud.getTempFileURL({fileList:[this.data.memory.photoFileId]});const url=r.fileList[0]&&r.fileList[0].tempFileURL;if(!url)throw new Error('照片暂时无法打开，请稍后重试');const f=await wx.downloadFile({url});await wx.saveImageToPhotosAlbum({filePath:f.tempFilePath});}wx.showToast({title:'已存到相册'});}catch(e){p.error(e);}finally{this.setData({busy:false});}}"
  ],
  [
    "const result=await p.service.remove(this.data.memory);",
    "const result=await p.service.remove(this.data.memory);localPhotos.drop(this.data.memory.id);"
  ]
]);

// ---- 详情页样式：存到相册链接 ----
edit('pages/detail/index.wxss', [
  ['.page{padding-bottom:60rpx}', '.page{padding-bottom:60rpx}\n.album-link{color:#61704f;text-decoration:underline;margin-left:16rpx}']
]);
