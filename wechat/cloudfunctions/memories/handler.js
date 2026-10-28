const crypto = require('node:crypto');
const { normalize } = require('./model');
const COLLECTION = 'life_memories';
const fail = message => { throw new Error(message); };
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
function createHandler(cloud) {
  return async function main(event) {
    try {
      const { OPENID, ENV } = cloud.getWXContext();
      if (!OPENID) return {ok:false,message:'无法确认微信身份，请从小程序重新进入'};
      const namespace = digest(OPENID).slice(0,32);
      const db = cloud.database();
      const collection = db.collection(COLLECTION);
      const owner = { _openid:OPENID };
      const safe = d => ({id:d._id,...normalize(d),photoFileId:d.photoFileId || '',revision:d.revision,createdAt:d.createdAt,updatedAt:d.updatedAt});
      const validId = id => typeof id === 'string' && /^[a-f0-9]{32}$/.test(id);
      const photoAllowed = file => !file || typeof file === 'string' && file.length < 512 && /^cloud:\/\/[^/]+\/users\/[a-f0-9]{32}\/m_[a-z0-9_]+\.jpg$/.test(file) && file.includes(`/users/${namespace}/`) && (!ENV || file.startsWith(`cloud://${ENV}.`));
      async function own(id, includeDeleted = false) {
        if (!validId(id)) fail('记忆不存在或已删除');
        const {data} = await collection.where({...owner,_id:id,...(includeDeleted?{}:{deleted:false})}).limit(1).get();
        if (!data.length) fail('记忆不存在或已删除');
        return data[0];
      }
      async function deletePhoto(file) {
        if (!file) return true;
        if (!photoAllowed(file)) return false;
        const references = await collection.where({...owner,photoFileId:file,deleted:false}).limit(1).get();
        if(references.data.length) return true;
        try {
          const r = await cloud.deleteFile({fileList:[file]});
          return !!r.fileList && r.fileList.every(f=>f.status === 0 || /not.?exist|not.?found/i.test(f.errMsg || ''));
        } catch (_) { return false; }
      }
      async function cleanup(d) {
        if (!(await deletePhoto(d.photoFileId))) return false;
        await collection.where({...owner,_id:d._id,deleted:true}).remove();
        return true;
      }
      async function remove(d) {
        if (!d.deleted) {
          const r = await collection.where({...owner,_id:d._id,revision:d.revision,deleted:false}).update({data:{deleted:true,revision:d.revision+1,updatedAt:new Date().toISOString()}});
          if(r.stats.updated !== 1) fail('记忆已在其他设备修改，请刷新后重试');
        }
        return cleanup(d);
      }
      switch(event && event.action) {
        case 'session': return {ok:true,namespace};
        case 'list': {
          const cursor = event.cursor || '';
          if (cursor && !validId(cursor)) fail('分页标识不正确');
          const where = {...owner,deleted:false,...(cursor?{_id:db.command.gt(cursor)}:{})};
          const {data} = await collection.where(where).orderBy('_id','asc').limit(50).get();
          return {ok:true,memories:data.map(safe),cursor:data.length === 50?data[data.length-1]._id:''};
        }
        case 'get': return {ok:true,memory:safe(await own(event.id))};
        case 'save': {
          const value = normalize(event.memory);
          const photoFileId = event.memory.photoFileId || '';
          if(!photoAllowed(photoFileId)) fail('照片不属于当前用户');
          const now = new Date().toISOString();
          if (event.id) {
            const old = await own(event.id);
            if(!Number.isInteger(event.revision) || event.revision !== old.revision) fail('记忆已在其他设备修改，请返回并刷新后再编辑');
            const updated = {...value,photoFileId,updatedAt:now,revision:old.revision+1};
            const r = await collection.where({...owner,_id:old._id,deleted:false,revision:old.revision}).update({data:updated});
            if(r.stats.updated !== 1) fail('记忆已在其他设备修改，请返回并刷新后再编辑');
            // Failed cleanup is retained for the next explicit cleanup/clear action.
            if(old.photoFileId && old.photoFileId !== photoFileId && !(await deletePhoto(old.photoFileId))) {
              await collection.add({data:{_id:digest(`${OPENID}:cleanup:${old.photoFileId}`).slice(0,32),...owner,deleted:true,photoFileId:old.photoFileId,revision:1}}).catch(()=>{});
            }
            return {ok:true,memory:safe({...old,...updated})};
          }
          if(typeof event.clientId !== 'string' || !/^[a-zA-Z0-9_-]{6,100}$/.test(event.clientId)) fail('记录标识不正确，请重新打开记录页');
          const id = digest(`${OPENID}:${event.clientId}`).slice(0,32);
          const existing = await collection.where({...owner,_id:id}).limit(1).get();
          if(existing.data.length) {
            if(existing.data[0].deleted) fail('这条记忆已删除，请重新创建');
            return {ok:true,memory:safe(existing.data[0])};
          }
          const memory = {_id:id,...owner,...value,photoFileId,deleted:false,revision:1,createdAt:now,updatedAt:now};
          try { await collection.add({data:memory}); }
          catch(e) { const found = await collection.where({...owner,_id:id,deleted:false}).limit(1).get(); if(found.data.length) return {ok:true,memory:safe(found.data[0])}; throw e; }
          return {ok:true,memory:safe(memory)};
        }
        case 'remove': {
          const d = await own(event.id,true);
          if(!d.deleted && d.revision !== event.revision) fail('记忆已在其他设备修改，请刷新后重试');
          return {ok:true,pendingCleanup:!(await remove(d))};
        }
        case 'cleanup': {
          const {data} = await collection.where({...owner,deleted:true}).limit(50).get();
          let pending = false;
          for(const d of data) if(!(await cleanup(d))) pending = true;
          return {ok:true,pendingCleanup:pending,remaining:(await collection.where({...owner,deleted:true}).limit(1).get()).data.length>0};
        }
        case 'clear': {
          const {data} = await collection.where(owner).limit(30).get();
          let pending = false;
          for(const d of data) if(!(await remove(d))) pending = true;
          return {ok:true,pendingCleanup:pending,remaining:(await collection.where(owner).limit(1).get()).data.length>0};
        }
        default: return {ok:false,message:'不支持此操作'};
      }
    } catch(e) {
      // Never log journal content, identifiers, or raw requests.
      const message = e && e.message || '';
      const isUserError = /^(请|记忆|照片|标题|地点|人物|这一刻|写给未来|分页|记录|这条)/.test(message);
      return {ok:false,message:isUserError?message:'记忆库暂时不可用，请稍后重试'};
    }
  };
}
module.exports = {createHandler};
