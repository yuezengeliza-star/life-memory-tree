"use client";
import {useEffect,useRef,useState} from 'react';
import {kinds,today,sorted,listMemories,saveMemory,deleteMemory,clearMemories,downloadBackup,parseBackup,importMemories,type Memory,type Draft} from './memory-store';
import MemoryEditor from './memory-editor';
import {TreeScene,MemoryList,MonthPicker,MemoryDialog} from './memory-visuals';
type View='home'|'tree'|'capture'|'review'|'me';
const poetry=['新岁微光','风里藏春','春风初醒','新叶写信','花影慢行','长日向暖','盛夏光年','晚风有信','桂香入梦','秋色成诗','秋声渐远','岁末灯火'];
const glyphs={home:'⌂',tree:'♧',capture:'＋',review:'◔',me:'○'};

export default function LifeTreeApp(){
  const [view,setView]=useState<View>('home'),[month,setMonth]=useState(today().slice(0,7)),[all,setAll]=useState(false),[query,setQuery]=useState(''),[precious,setPrecious]=useState(false);
  const [memories,setMemories]=useState<Memory[]>([]),[selected,setSelected]=useState<string|null>(null),[editing,setEditing]=useState<Memory|null>(null);
  const [loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState(''),[privacy,setPrivacy]=useState(false),[importing,setImporting]=useState(false);
  const importFile=useRef<HTMLInputElement>(null);
  const [mounted,setMounted]=useState(false);
  const current=memories.find(m=>m.id===selected),period=memories.filter(m=>m.date.startsWith(month)),year=today().slice(0,4),yearMemories=memories.filter(m=>m.date.startsWith(year));
  const filtered=memories.filter(m=>(all||m.date.startsWith(month))&&(!precious||m.precious)&&(!query||`${m.title} ${m.content} ${m.people} ${m.scene}`.toLowerCase().includes(query.toLowerCase())));
  async function refresh(){setError('');try{setMemories(await listMemories());}catch(e){setError((e as Error).message);}finally{setLoading(false);}}
  useEffect(()=>{setMounted(true);refresh();const handler=()=>{if(!document.hidden)refresh();};document.addEventListener('visibilitychange',handler);return()=>document.removeEventListener('visibilitychange',handler);},[]);
  useEffect(()=>{if(!notice)return;const id=setTimeout(()=>setNotice(''),4500);return()=>clearTimeout(id);},[notice]);
  function navigate(next:View){if(view==='capture'&&editing&&next!=='capture'&&!confirm('离开编辑页？尚未保存的修改会丢失。'))return;setView(next);setError('');if(next!=='capture')setEditing(null);window.scrollTo({top:0,behavior:'auto'});}
  const open=(m:Memory)=>setSelected(m.id);
  async function save(draft:Draft){const m=await saveMemory(draft,editing||undefined);setMemories(items=>sorted([...items.filter(i=>i.id!==m.id),m]));setEditing(null);setMonth(m.date.slice(0,7));setView('tree');setAll(false);setNotice('已种下这一刻');}
  const dateLabel=new Date().toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'}),greeting=new Date().getHours()<12?'早上好':new Date().getHours()<18?'下午好':'晚上好';
  if(!mounted)return <div className="life-tree-app"><div className="app-frame"><main className="home-page view-page"><h1 className="loading-brand">人生记忆树</h1><p className="loading-note">正在翻开记忆…</p></main></div></div>;
  return <div className={`life-tree-app view-${view}`}><aside className="desktop-whisper"><span>人生记忆树</span><p>记录要轻，<br/>回看要深。</p></aside><div className="app-frame">
    {error?<div className="error-banner" role="alert">{error}<button type="button" onClick={refresh}>重新读取</button></div>:null}
    {loading?<div className="loading-note" role="status">正在翻开记忆…</div>:null}
    {view==='home'?<main className="home-page view-page scroll-page">
      <header className="home-header"><span><small>{dateLabel}</small><h1>{greeting}</h1></span><button className="avatar" type="button" onClick={()=>navigate('me')} aria-label="我的记忆">记</button></header>
      <p className="private-note">不必向谁展示，也值得认真收藏。</p>
      <div className="home-tree-card"><button type="button" className="home-tree-copy home-tree-link" onClick={()=>navigate('tree')}><small>{year} · 人生树</small><strong>这一年，<br/>{yearMemories.length?`已经长出 ${yearMemories.length} 个瞬间`:'从一片新叶开始'}</strong><em>走近看看 ›</em></button><span className="home-tree-visual"><TreeScene memories={yearMemories} onOpen={open} compact/></span></div>
      <button type="button" className="home-capture" onClick={()=>navigate('capture')}><span className="home-capture-icon">＋</span><span><strong>留下这一刻</strong><small>此刻，你最想记住什么？</small></span><span>›</span></button>
      <section className="recent-section"><header><span><small>最近</small><h2>刚刚落在枝头的光</h2></span><button type="button" onClick={()=>{setAll(true);navigate('tree');}}>全部</button></header><MemoryList memories={memories.slice(0,3)} onOpen={open} empty="一张照片，一句话，都值得留下。"/></section>
      <button type="button" className="month-reflection" onClick={()=>navigate('review')}><span><small>{month} 回望</small><strong>{poetry[Number(month.slice(5))-1]}</strong><p>重新读一读，你留下的那些日子。</p></span><span>›</span></button>
    </main>:null}
    {view==='tree'?<main className="tree-page view-page"><section className="tree-stage">
      <header className="tree-header"><button type="button" className="round-ghost" onClick={()=>navigate('home')} aria-label="返回首页">‹</button><div><h1>我的人生树</h1><MonthPicker month={month} onChange={v=>{setMonth(v);setAll(false);}}/></div><button type="button" className="round-ghost book-entry" onClick={()=>navigate('review')} aria-label="年月回望">◔</button></header>
      <p className="tree-poem">每一片叶子，<br/>都是时光留下的礼物。</p><button type="button" className="all-memories" onClick={()=>setAll(v=>!v)}>{all?'回到本月':'全部年月'}</button><TreeScene memories={filtered} onOpen={open}/>
      <button type="button" className="monthly-card" onClick={()=>document.getElementById('tree-memories')?.scrollIntoView({behavior:'smooth'})}><span><strong>{all?'所有年月':month} · {filtered.length} 个瞬间</strong><small>查看枝头的记忆</small></span><span>⌄</span></button>
      <button type="button" className="add-moment" onClick={()=>navigate('capture')}><span className="add-leaf">＋</span><span>留下<br/>这一刻</span></button>
    </section><section id="tree-memories" className="tree-list-section"><div className="section-heading"><h2>枝头的记忆</h2><button type="button" onClick={()=>setPrecious(p=>!p)} className={precious?'text-action active':'text-action'} aria-pressed={precious}>{precious?'♥ 只看珍贵':'♡ 只看珍贵'}</button></div><label className="search-field"><span className="sr-only">搜索记忆</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索标题、感受、人物或地点"/></label><MemoryList memories={filtered} onOpen={open} empty={query||precious?'没有找到匹配的记忆，试试调整筛选。':'这个月还没有记忆，留下第一个瞬间吧。'}/></section></main>:null}
    {view==='capture'?<MemoryEditor key={editing?.id||'new'} initial={editing} onSave={save} onCancel={()=>navigate('tree')}/>:null}
    {view==='review'?<main className="review-page view-page scroll-page"><header className="review-header"><MonthPicker month={month} onChange={setMonth}/><h1>{poetry[Number(month.slice(5))-1]}</h1><p>生活的答案，藏在你写下的字里。</p></header>{period.length?<><section className="letter-card"><span className="letter-mark">“</span><p>这个月，你留下了 {period.length} 个瞬间。</p><p>其中有 {period.filter(m=>m.precious).length} 个，被你标记为珍贵。</p><div className="review-kind-counts">{kinds.filter(k=>period.some(m=>m.kind===k.id)).map(k=><span key={k.id}>{k.label} {period.filter(m=>m.kind===k.id).length}</span>)}</div><p className="helper-copy">以下内容来自你的记录。</p></section>{period.filter(m=>m.echo).slice(0,3).map(m=><section className="future-echo review-echo" key={m.id}><small>你写给未来的话 · {m.date}</small><p>{m.echo}</p></section>)}<section className="recent-section"><h2>重新走过这些日子</h2><MemoryList memories={period} onOpen={open}/></section></>:<div className="empty-state">这个月还没有留下记忆。<button type="button" className="plant-button" onClick={()=>navigate('capture')}>留下第一个瞬间</button></div>}</main>:null}
    {view==='me'?<main className="me-page view-page scroll-page"><header className="me-header"><span className="large-avatar">记</span><h1>这棵树，只属于你。</h1><p>不必向谁展示，也值得认真收藏。</p></header><section className="me-card"><div><span>人生树</span><strong>{memories.length} 个瞬间</strong></div><div><span>珍贵记忆</span><strong>{memories.filter(m=>m.precious).length} 个光点</strong></div><div><span>当前保存位置</span><strong>此浏览器</strong></div></section>
      <section className="settings-actions"><button type="button" onClick={()=>downloadBackup(memories)}>导出完整备份 <span>含文字与照片 ›</span></button><button type="button" disabled={importing} onClick={()=>importFile.current?.click()}>{importing?'正在导入…':'导入记忆备份'} <span>合并导入 ›</span></button>
      <input type="file" ref={importFile} accept=".json,application/json" hidden onChange={async e=>{const file=e.target.files?.[0];if(!file)return;setImporting(true);try{if(file.size>30*1024*1024)throw new Error('备份文件请小于30MB');const records=parseBackup(await file.text());if(confirm(`合并导入 ${records.length} 条记忆？已有相同编号的记录会保留，不会被覆盖。`)){const count=await importMemories(records);await refresh();setNotice(`已导入 ${count} 条记忆`);}}catch(e){setError((e as Error).message||'无法读取备份');}finally{setImporting(false);e.target.value='';}}}/>
      <button type="button" onClick={()=>setPrivacy(v=>!v)} aria-expanded={privacy}>隐私与数据说明 <span>{privacy?'收起':'查看'} ›</span></button>
      <button type="button" className="danger-text" onClick={async()=>{if(prompt('此操作永久清空当前浏览器的记忆与照片。建议先导出备份。输入「清空」继续。')!=='清空')return;try{await clearMemories();try{localStorage.removeItem('life-tree-draft-v1');}catch{}setMemories([]);setNotice('当前浏览器的记录已清空');}catch(e){setError((e as Error).message);}}}>清空此浏览器记录 <span>›</span></button></section>
      {privacy?<section className="privacy-panel"><h2>你的记忆，由你决定</h2><p>网页中的记录与照片保存在当前浏览器的 IndexedDB 中；文字草稿保存在本机，不上传到服务器或 AI 模型。清除浏览器数据、更换浏览器或无痕窗口关闭后，记录可能丢失。</p><p>请定期导出完整备份。备份中包含原文与照片，请妥善保存。在共享设备上，能够打开同一浏览器的人可能读取这些记录。</p><p>微信小程序使用独立的微信云开发记忆库，当前网页记录不会自动同步。网页版备份可供保留与迁移使用。</p></section>:null}
      <p className="privacy-copy">不是所有回忆都需要被看见，<br/>但每一段重要的人生都值得被留下。</p></main>:null}
    <nav className="bottom-nav" aria-label="主导航"><div>{(['home','tree','capture','review','me'] as View[]).map((v,i)=><button type="button" key={v} onClick={()=>navigate(v)} className={`${view===v?'is-active':''}${v==='capture'?' is-primary':''}`} aria-current={view===v?'page':undefined}><span className="glyph">{glyphs[v]}</span><small>{['首页','人生树','留下','回望','我的'][i]}</small></button>)}</div></nav>
    {current?<MemoryDialog memory={current} onClose={()=>setSelected(null)} onEdit={()=>{setEditing(current);setSelected(null);setView('capture');window.scrollTo({top:0});}} onToggle={async()=>{const m=await saveMemory({...current,precious:!current.precious},current);setMemories(items=>items.map(i=>i.id===m.id?m:i));}} onDelete={async()=>{await deleteMemory(current);setMemories(items=>items.filter(i=>i.id!==current.id));setSelected(null);setNotice('已删除这段记忆');}}/>:null}
    {notice?<div className="toast" role="status">{notice}</div>:null}
  </div></div>;
}
