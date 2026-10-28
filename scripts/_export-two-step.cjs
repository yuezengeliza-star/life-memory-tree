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

// ---- service：拆成 prepareExport（生成+复制剪贴板）与 shareExport（tap 内分享） ----
edit('utils/service.js', [
  [
    "async function exportText() {\n  const records = await list();\n  const payload = {format:'life-memory-tree',version:1,exportedAt:new Date().toISOString(),photosIncluded:false,memories:records.map(m=>({...model.normalize(m),id:m.id,createdAt:m.createdAt}))};\n  const filePath = `${wx.env.USER_DATA_PATH}/life-memory-tree-${model.today()}.json`;\n  await new Promise((resolve,reject)=>wx.getFileSystemManager().writeFile({filePath,data:JSON.stringify(payload,null,2),encoding:'utf8',success:resolve,fail:reject}));\n  try {\n    if (!wx.shareFileMessage) throw new Error('当前微信不支持文件导出，请升级微信');\n    await wx.shareFileMessage({filePath,fileName:`人生记忆树-${model.today()}.json`});\n  } finally {\n    try { wx.getFileSystemManager().unlinkSync(filePath); } catch (_) {}\n  }\n}",
    "async function prepareExport() {\n  const records = await list();\n  const payload = {format:'life-memory-tree',version:1,exportedAt:new Date().toISOString(),photosIncluded:false,memories:records.map(m=>({...model.normalize(m),id:m.id,createdAt:m.createdAt}))};\n  const data = JSON.stringify(payload,null,2);\n  const filePath = `${wx.env.USER_DATA_PATH}/life-memory-tree-${model.today()}.json`;\n  await new Promise((resolve,reject)=>wx.getFileSystemManager().writeFile({filePath,data,encoding:'utf8',success:resolve,fail:reject}));\n  // 剪贴板保底：即使不分享文件，内容也已经能直接粘贴\n  await new Promise((resolve)=>wx.setClipboardData({data,success:resolve,fail:resolve}));\n  return filePath;\n}\nasync function shareExport(filePath) {\n  if (!wx.shareFileMessage) throw new Error('当前微信不支持文件导出，请升级微信');\n  try {\n    await wx.shareFileMessage({filePath,fileName:`人生记忆树-${model.today()}.json`});\n  } finally {\n    try { wx.getFileSystemManager().unlinkSync(filePath); } catch (_) {}\n  }\n}"
  ],
  [
    "module.exports = { agreed, consent, request, session, list, save, get, remove, exportText, clearAll, importText };",
    "module.exports = { agreed, consent, request, session, list, save, get, remove, prepareExport, shareExport, clearAll, importText };"
  ]
]);

// ---- 我的页：两步导出 ----
edit('pages/me/index.js', [
  [
    "data:{count:0,preciousCount:0,busy:false,error:'',filingNumber:config.filingNumber}",
    "data:{count:0,preciousCount:0,busy:false,error:'',exportFile:'',filingNumber:config.filingNumber}"
  ],
  [
    "async export(){if(this.data.busy)return;this.setData({busy:true});try{await p.service.exportText();}catch(e){if(!/cancel/i.test(e.errMsg || ''))p.error(e);}finally{this.setData({busy:false});}}",
    "async export(){if(this.data.busy)return;this.setData({busy:true});try{if(!this.data.exportFile){const f=await p.service.prepareExport();this.setData({exportFile:f});wx.showToast({title:'内容已复制，可发送文件',icon:'none'});}else{await p.service.shareExport(this.data.exportFile);this.setData({exportFile:''});}}catch(e){if(!/cancel/i.test(e.errMsg || e.message || ''))p.error(e);}finally{this.setData({busy:false});}}"
  ]
]);

// ---- 我的页模板：按钮两态 ----
edit('pages/me/index.wxml', [
  [
    '<button class="menu-row" bindtap="export" disabled="{{busy || needsConsent}}"><text>导出文字记录</text><text>›</text></button>',
    '<button class="menu-row" bindtap="export" disabled="{{busy || needsConsent}}"><text>{{exportFile ? \'② 发送文件给好友（内容已复制）\' : \'导出文字记录\'}}</text><text>›</text></button>'
  ]
]);
