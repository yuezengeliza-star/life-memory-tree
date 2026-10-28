"use client";
import {useEffect,useRef,useState} from 'react';
import {kinds,emptyDraft,readPhoto,type Memory,type Draft} from './memory-store';

export default function MemoryEditor({initial,onSave,onCancel}:{initial:Memory|null;onSave:(d:Draft)=>Promise<void>;onCancel:()=>void}){
  const [form,setForm]=useState<Draft>(initial||emptyDraft());
  const [busy,setBusy]=useState(false),[photoBusy,setPhotoBusy]=useState(false),[error,setError]=useState(''),[restored,setRestored]=useState(false),[ready,setReady]=useState(false);
  const file=useRef<HTMLInputElement>(null);
  useEffect(()=>{if(!initial){try{const saved=localStorage.getItem('life-tree-draft-v1');if(saved){setForm({...emptyDraft(),...JSON.parse(saved),photoData:''});setRestored(true);}}catch{}}setReady(true);},[initial]);
  useEffect(()=>{if(ready&&!initial)try{localStorage.setItem('life-tree-draft-v1',JSON.stringify({...form,photoData:''}));}catch{}},[form,ready,initial]);
  const patch=<K extends keyof Draft>(key:K,value:Draft[K])=>setForm(f=>({...f,[key]:value}));
  async function submit(e:React.FormEvent){e.preventDefault();if(busy||photoBusy)return;setBusy(true);setError('');try{await onSave(form);try{localStorage.removeItem('life-tree-draft-v1');}catch{}}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  return <main className="capture-page view-page scroll-page">
    <header className="simple-header"><button type="button" onClick={onCancel} disabled={busy||photoBusy} aria-label="返回">‹</button><span>{initial?'编辑这一刻':'留下这一刻'}</span><i/></header>
    <section className="capture-intro"><small>不必完整，也不必漂亮</small><h1>此刻，<br/>你最想记住什么？</h1></section>
    {restored?<p className="helper-copy">已恢复文字草稿，照片请重新选择。</p>:null}
    <form onSubmit={submit}><fieldset disabled={busy||photoBusy} className="capture-fields">
      <input type="file" accept="image/jpeg,image/png,image/webp" hidden ref={file} onChange={async e=>{const selected=e.target.files?.[0];if(!selected)return;setPhotoBusy(true);setError('');try{patch('photoData',await readPhoto(selected));}catch(err){setError((err as Error).message);}finally{setPhotoBusy(false);e.target.value='';}}}/>
      <button type="button" className="photo-picker" onClick={()=>file.current?.click()}>{form.photoData?<img className="picked-photo real-picked" src={form.photoData} alt="选中的记忆照片"/>:<><span className="glyph">＋</span><strong>选择一张照片</strong><small>也可以只写一句话</small></>}</button>
      {photoBusy?<p role="status" className="helper-copy">正在处理照片…</p>:null}
      {form.photoData?<button type="button" className="text-action" onClick={()=>patch('photoData','')}>移除照片</button>:null}
      <label className="form-field">给这一刻起个名字（选填）<input value={form.title} onChange={e=>patch('title',e.target.value)} maxLength={40} placeholder="如：回家吃的一顿晚饭"/></label>
      <label className="memory-input"><span className="sr-only">那一刻的感受</span><textarea value={form.content} onChange={e=>patch('content',e.target.value)} placeholder="写下一句真实的感受…" maxLength={2000} required/><span>{form.content.length}/2000</span></label>
      <label className="form-field">发生的日期<input type="date" value={form.date} onChange={e=>patch('date',e.target.value)} min="1900-01-01" max="2100-12-31" required/></label>
      <fieldset className="kind-picker"><legend>它长成什么样子</legend>{kinds.map(k=><label key={k.id} className={form.kind===k.id?'selected':''}><input type="radio" name="kind" value={k.id} checked={form.kind===k.id} onChange={()=>patch('kind',k.id)}/><b>{k.symbol}</b><span>{k.label}</span></label>)}</fieldset>
      <div className="form-pair"><label className="form-field">人物（选填）<input value={form.people} maxLength={80} onChange={e=>patch('people',e.target.value)} placeholder="和谁在一起"/></label><label className="form-field">地点（选填）<input value={form.scene} maxLength={80} onChange={e=>patch('scene',e.target.value)} placeholder="当时在哪里"/></label></div>
      <label className="form-field">写给未来的我（选填）<textarea value={form.echo} onChange={e=>patch('echo',e.target.value)} maxLength={500} placeholder="下一次读到这里，想提醒自己什么？"/></label>
      <label className="precious-check"><input type="checkbox" checked={form.precious} onChange={e=>patch('precious',e.target.checked)}/>标记为珍贵记忆</label>
      <p className="helper-copy">网页记录保存在当前浏览器。重要记忆请定期导出备份。</p>
      {error?<p className="error-banner" role="alert">{error}</p>:null}
      <button className="plant-button" type="submit" disabled={busy||photoBusy||!form.content.trim()}>{busy?'正在保存…':initial?'保存修改':'种下这一刻'}</button>
    </fieldset></form>
  </main>;
}
