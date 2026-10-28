const config = require('../config');
const model = require('./model');
let sessionPromise;
const uploadCache = new Map();
function agreed() { return wx.getStorageSync('life-tree-consent') === config.privacyVersion; }
async function consent() {
  if (agreed()) return;
  await new Promise((resolve,reject) => wx.showModal({title:'开始保存你的记忆',content:'我们使用微信用户标识，将你主动填写的文字与选择的照片保存到私人的云端记忆库。可在「我的」查看隐私说明、导出或删除记录。',confirmText:'同意继续',cancelText:'暂不使用',success:r=>r.confirm?resolve():reject(new Error('你可以先阅读隐私说明，再开始记录')),fail:reject}));
  wx.setStorageSync('life-tree-consent',config.privacyVersion);
}
async function request(action, data = {}) {
  if (!getApp().globalData.ready) throw new Error('记忆库暂未开通，请联系开发者');
  if (!agreed()) throw new Error('请先阅读并同意隐私说明');
  let response;
  try { response = await wx.cloud.callFunction({ name:'memories', data:{action,...data} }); }
  catch (e) { throw new Error((e && (e.errMsg || e.message)) || '连接记忆库失败，请检查网络后重试'); }
  const result = response.result;
  if (!result || !result.ok) throw new Error((result && (result.message || result.errMsg)) || '暂时无法完成，请稍后重试');
  return result;
}
async function session() {
  if (!sessionPromise) sessionPromise = request('session').catch(e=>{sessionPromise=null;throw e;});
  return sessionPromise;
}
async function list() {
  if (!agreed()) return [];
  let records = [], cursor = '';
  do { const r = await request('list',{cursor}); records = records.concat(r.memories); cursor = r.cursor; } while(cursor);
  return records.map(model.decorate).sort(model.byDate);
}
async function uploadPhoto(filePath) {
  if (uploadCache.has(filePath)) return uploadCache.get(filePath);
  const { namespace } = await session();
  const {fileID} = await wx.cloud.uploadFile({ cloudPath:`users/${namespace}/${model.clientId()}.jpg`, filePath });
  uploadCache.set(filePath,fileID);
  return fileID;
}
async function save(input, filePath) {
  const value = model.normalize(input);
  let photoFileId = input.photoFileId || '';
  if (filePath) photoFileId = await uploadPhoto(filePath);
  // Do not delete an upload on a network timeout: the server may have committed.
  // The same clientId is reused on retries to prevent duplicate memories.
  const r = await request('save',{memory:{...value,photoFileId},id:input.id || '',clientId:input.clientId,revision:input.revision || 0});
  getApp().globalData.dirty++;
  return r;
}
async function get(id) { const r = await request('get',{id}); return model.decorate(r.memory); }
async function remove(memory) { const r = await request('remove',{id:memory.id,revision:memory.revision}); getApp().globalData.dirty++; return r; }
async function prepareExport() {
  const records = await list();
  const payload = {format:'life-memory-tree',version:1,exportedAt:new Date().toISOString(),photosIncluded:false,memories:records.map(m=>({...model.normalize(m),id:m.id,createdAt:m.createdAt}))};
  const data = JSON.stringify(payload,null,2);
  const filePath = `${wx.env.USER_DATA_PATH}/life-memory-tree-${model.today()}.json`;
  await new Promise((resolve,reject)=>wx.getFileSystemManager().writeFile({filePath,data,encoding:'utf8',success:resolve,fail:reject}));
  // 剪贴板保底：即使不分享文件，内容也已经能直接粘贴
  await new Promise((resolve)=>wx.setClipboardData({data,success:resolve,fail:resolve}));
  return filePath;
}
async function shareExport(filePath) {
  if (!wx.shareFileMessage) throw new Error('当前微信不支持文件导出，请升级微信');
  try {
    await wx.shareFileMessage({filePath,fileName:`人生记忆树-${model.today()}.json`});
  } finally {
    try { wx.getFileSystemManager().unlinkSync(filePath); } catch (_) {}
  }
}
async function clearAll() {
  let remaining = true;
  while(remaining) {
    const r = await request('clear');
    if (r.pendingCleanup) throw new Error('部分照片尚未删除，请重新点击清空记录继续处理');
    remaining = r.remaining;
  }
  sessionPromise = null;
  uploadCache.clear();
  getApp().globalData.dirty++;
  wx.removeStorageSync('life-tree-draft');
  wx.removeStorageSync('life-tree-consent');
}
async function importText() {
  await consent();
  if(wx.requirePrivacyAuthorize)await wx.requirePrivacyAuthorize();
  const chosen = await wx.chooseMessageFile({count:1,type:'file',extension:['json']});
  const file=chosen.tempFiles[0];
  if(!file || file.size>5*1024*1024)throw new Error('文字备份请小于5MB');
  const raw=await new Promise((resolve,reject)=>wx.getFileSystemManager().readFile({filePath:file.path,encoding:'utf8',success:r=>resolve(r.data),fail:reject}));
  let payload;try{payload=JSON.parse(raw);}catch(_){throw new Error('无法读取这份备份文件');}
  if(payload.format!=='life-memory-tree' || payload.version!==1 || !Array.isArray(payload.memories) || payload.memories.length>300)throw new Error('请选择记忆树备份，每次最多导入300条');
  const existingIds=new Set((await list()).map(m=>m.id));
  const records=payload.memories.filter(m=>!existingIds.has(m.id)).map(m=>({...model.normalize(m),clientId:typeof m.id==='string'&&/^[a-zA-Z0-9_-]{6,90}$/.test(m.id)?`import_${m.id}`:model.clientId()}));
  const answer=await wx.showModal({title:'合并导入文字记录',content:`将导入 ${records.length} 条文字记录。照片不会导入；重复导入同一备份会跳过已存在的记录。`,confirmText:'导入'});
  if(!answer.confirm)return false;
  let completed=0;
  try{for(const record of records){await save(record);completed++;}}
  catch(e){throw new Error(`已处理${completed}条，剩余未完成。可再次导入同一备份继续。${e.message}`);}
  return true;
}
module.exports = { agreed, consent, request, session, list, save, get, remove, prepareExport, shareExport, clearAll, importText };
