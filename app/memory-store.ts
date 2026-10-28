export const kinds = [
  {id:'leaf',label:'日常',symbol:'叶'}, {id:'flower',label:'喜悦',symbol:'花'},
  {id:'fruit',label:'收获',symbol:'果'}, {id:'bud',label:'开始',symbol:'芽'},
  {id:'scar',label:'成长',symbol:'纹'}, {id:'glow',label:'珍惜',symbol:'光'},
] as const;
export type Kind = typeof kinds[number]['id'];
export type Memory = {id:string;date:string;title:string;content:string;kind:Kind;scene:string;people:string;echo:string;precious:boolean;photoData:string;createdAt:string;updatedAt:string;revision:number};
export type Draft = Pick<Memory,'date'|'title'|'content'|'kind'|'scene'|'people'|'echo'|'precious'|'photoData'>;
export function today() {const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export const emptyDraft = ():Draft => ({date:today(),title:'',content:'',kind:'leaf',scene:'',people:'',echo:'',precious:false,photoData:''});
export function normalize(value:unknown):Draft {
  if(!value || typeof value!=='object' || Array.isArray(value))throw new Error('记忆格式不正确');
  const m=value as Record<string,unknown>;
  const text=(key:string,max:number,required=false)=>{const s=m[key]??'';if(typeof s!=='string'||s.length>max||(required&&!s.trim()))throw new Error(key==='content'?'请填写感受，最多2000字':'记录格式或长度不正确');return s.trim();};
  const date=text('date',10,true);const d=new Date(`${date}T00:00:00Z`);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==date||date<'1900-01-01'||date>'2100-12-31')throw new Error('请选择有效日期');
  if(!kinds.some(k=>k.id===m.kind))throw new Error('请选择记忆类型');
  const photoData=text('photoData',3000000);
  if(photoData&&!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(photoData))throw new Error('照片格式不正确');
  const content=text('content',2000,true);
  return {date,title:text('title',40)||content.slice(0,24),content,kind:m.kind as Kind,scene:text('scene',80),people:text('people',80),echo:text('echo',500),precious:m.precious===true,photoData};
}
export function sorted(records:Memory[]){return [...records].sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt.localeCompare(a.createdAt));}
export function position(id:string){let h=0;for(const c of id)h=(h*31+c.charCodeAt(0))>>>0;return {x:17+h%66,y:20+Math.floor(h/67)%47};}
let database:Promise<IDBDatabase>|undefined;
function db(){if(!database)database=new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('life-memory-tree',1);r.onupgradeneeded=()=>r.result.createObjectStore('memories',{keyPath:'id'});r.onsuccess=()=>{r.result.onversionchange=()=>{r.result.close();database=undefined;};resolve(r.result);};r.onerror=()=>reject(new Error('浏览器无法打开记忆库，请检查存储权限'));r.onblocked=()=>reject(new Error('请关闭其他记忆树页面后重试'));}).catch(e=>{database=undefined;throw e;});return database;}
async function write(action:(store:IDBObjectStore)=>void){const database=await db();return new Promise<void>((resolve,reject)=>{const tx=database.transaction('memories','readwrite');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(new Error('保存失败，浏览器存储空间可能不足。请先导出备份'));tx.onabort=()=>reject(new Error('操作未保存，请重试'));try{action(tx.objectStore('memories'));}catch(e){tx.abort();reject(e);}});}
export async function listMemories(){const database=await db();return new Promise<Memory[]>((resolve,reject)=>{const r=database.transaction('memories').objectStore('memories').getAll();r.onsuccess=()=>resolve(sorted(r.result));r.onerror=()=>reject(new Error('读取失败，请重试'));});}
export async function saveMemory(draft:Draft,previous?:Memory){const now=new Date().toISOString();const memory:Memory={...normalize(draft),id:previous?.id||crypto.randomUUID(),createdAt:previous?.createdAt||now,updatedAt:now,revision:(previous?.revision||0)+1};const database=await db();await new Promise<void>((resolve,reject)=>{const tx=database.transaction('memories','readwrite');const s=tx.objectStore('memories');let conflict=false;tx.oncomplete=()=>resolve();tx.onabort=()=>reject(new Error(conflict?'这条记忆已在另一个页面修改，请刷新后重试':'保存未完成，请检查浏览器存储空间'));tx.onerror=()=>{};if(previous){const r=s.get(previous.id);r.onsuccess=()=>{if(!r.result || r.result.revision!==previous.revision){conflict=true;tx.abort();}else s.put(memory);};}else s.add(memory);});return memory;}
export async function deleteMemory(memory:Memory){const database=await db();await new Promise<void>((resolve,reject)=>{const tx=database.transaction('memories','readwrite');const s=tx.objectStore('memories');const r=s.get(memory.id);tx.oncomplete=()=>resolve();tx.onabort=()=>reject(new Error('记忆已在另一个页面修改，请刷新后再删除'));tx.onerror=()=>{};r.onsuccess=()=>{if(!r.result||r.result.revision!==memory.revision)tx.abort();else s.delete(memory.id);};});}
export async function clearMemories(){await write(s=>s.clear());}
export function parseBackup(text:string){if(text.length>30*1024*1024)throw new Error('备份文件请小于30MB');const v=JSON.parse(text);if(v.format!=='life-memory-tree'||v.version!==1||!Array.isArray(v.memories)||v.memories.length>1000)throw new Error('这不是受支持的记忆树备份（每次最多1000条）');return v.memories.map((m:Record<string,unknown>)=>({...normalize(m),id:typeof m.id==='string'&&/^[A-Za-z0-9_-]{6,100}$/.test(m.id)?m.id:crypto.randomUUID(),createdAt:typeof m.createdAt==='string'?m.createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),revision:1} as Memory));}
export async function importMemories(records:Memory[]){let added=0;await write(s=>{for(const m of records){const r=s.get(m.id);r.onsuccess=()=>{if(!r.result){s.add(m);added++;}};}});return added;}
export function downloadBackup(records:Memory[]){const blob=new Blob([JSON.stringify({format:'life-memory-tree',version:1,photosIncluded:true,exportedAt:new Date().toISOString(),memories:records},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`人生记忆树-${today()}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export async function readPhoto(file:File):Promise<string>{if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>12*1024*1024)throw new Error('请选择12MB以内的 JPG、PNG 或 WebP 照片');const bitmap=await createImageBitmap(file);const scale=Math.min(1,1280/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));const ctx=canvas.getContext('2d');if(!ctx)throw new Error('当前浏览器无法处理照片');ctx.fillStyle='#fffdf8';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();return canvas.toDataURL('image/jpeg',.8);}
