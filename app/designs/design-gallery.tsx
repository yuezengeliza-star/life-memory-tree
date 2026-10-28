'use client';

import {useEffect, useState, type CSSProperties} from 'react';

type Direction = 'book' | 'journal' | 'fresh' | 'forest';
type IconName = 'home' | 'tree' | 'pen' | 'book' | 'user' | 'lock' | 'leaf' | 'plus' | 'check' | 'expand' | 'close';
const directions = [
  {id: 'book' as const, letter: 'A', name: '岁月成书', tone: '安静 · 书卷气', font: 'Noto Serif SC', chinese: '思源宋体风格', body: 'Noto Sans SC', description: '像翻开一本珍藏的书。宋体做主角，留出充足的呼吸感；树与文字各有位置。', feature: '适合想保留温柔气质，又希望页面更精致的方向。', colors: ['#F8F7F0', '#E4E9D8', '#536346', '#293B2F'], headline: '把日子，\n慢慢种成一棵树。'},
  {id: 'journal' as const, letter: 'B', name: '晴日手札', tone: '亲近 · 手写感', font: 'LXGW WenKai', chinese: '霞鹜文楷', body: 'Noto Sans SC', description: '像给自己写一页手札。文楷的笔触带一点随性，蓝色页签、柔黄便笺让记录更轻松。', feature: '适合希望它像一本私人日记，而不是一个工具的方向。', colors: ['#EBF1F7', '#FFFEF8', '#E7CC76', '#3C5670'], headline: '今天，也有\n值得记住的小事。'},
  {id: 'fresh' as const, letter: 'C', name: '日常生长', tone: '清爽 · 清晰易用', font: 'Noto Sans SC', chinese: '思源黑体风格', body: 'Noto Sans SC', description: '把记录放在第一位。黑体标题干净直接，留下一刻、查看人生树、翻阅最近记忆一眼可见。', feature: '适合经常打开、快速记录，也更偏成熟小程序的方向。', colors: ['#FFFFFF', '#EFF5E8', '#356746', '#1D3728'], headline: '你好，今天。'},
  {id: 'forest' as const, letter: 'D', name: '山林来信', tone: '沉静 · 自然感', font: 'ZCOOL XiaoWei', chinese: '站酷小薇体', body: 'Noto Sans SC', description: '像收到一封来自山林的信。小薇体有细腻的字形转折，灰橄榄绿与米白承接树叶的暖色，让画面更自然。', feature: '适合更有个人辨识度、希望打开时就进入另一种心境的方向。', colors: ['#3F4936', '#59634D', '#E2D5AE', '#F5F3E8'], headline: '让记忆，\n在这里生长。'},
];
const records = [
  {date: '10.05', title: '晚风刚刚好', copy: '沿着熟悉的路走走，心也慢了下来。'},
  {date: '10.02', title: '好好吃了一顿饭', copy: '没有特别的理由，平常的一天也很好。'},
];

function Icon({name, size = 22}: {name: IconName; size?: number}) {
  const paths: Record<IconName, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/></>,
    tree: <><path d="m12 3 5 6h-3l5 6h-5v6h-4v-6H5l5-6H7Z"/></>,
    pen: <><path d="m16 3 5 5-12 12-6 1 1-6Z"/><path d="m13 6 5 5"/></>,
    book: <><path d="M12 5v16M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2Z"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
    leaf: <><path d="M20 3C9 2 3 7 4 14c1 7 9 8 13 3 3-4 3-9 3-14Z"/><path d="M3 21 15 9"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    expand: <><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M3 3l6 6m12-6-6 6M3 21l6-6m12 6-6-6"/></>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function WechatBar() {
  return <div className="dg-wechat-bar"><span>人生记忆树</span><span className="dg-capsule" aria-hidden="true"><b>•••</b><i/><svg viewBox="0 0 18 18" width="17" height="17"><circle cx="9" cy="9" r="6.3" fill="none" stroke="currentColor" strokeWidth="1.5"/><circle cx="9" cy="9" r="2" fill="currentColor"/></svg></span></div>;
}

function Tree({className = ''}: {className?: string}) {
  return <img className={`dg-tree ${className}`} src="/tree-visual-base.png" width="1024" height="1536" alt="枝叶舒展的人生记忆树" draggable={false}/>;
}

function RecordAction({empty, compact = false}: {empty: boolean; compact?: boolean}) {
  return <div className={`dg-record-action${compact ? ' compact' : ''}`}><Icon name="pen" size={19}/><span>{empty ? '留下第一个瞬间' : '留下这一刻'}</span></div>;
}

function Recent({empty, style}: {empty: boolean; style: Direction}) {
  return <section className="dg-recent"><header><h3>{style === 'journal' ? '最近写下的' : '最近的记忆'}</h3><span>查看全部</span></header>
    {empty ? <div className="dg-empty"><Icon name="leaf" size={25}/><p>一张照片，一句话，<br/>都可以是第一片新叶。</p></div> : <div className="dg-records">{records.map((r, i) => <article key={r.date} className="dg-memory-row"><span className="dg-memory-symbol"><Icon name={i ? 'book' : 'leaf'} size={21}/></span><div><h4>{r.title}</h4><p>{r.copy}</p></div><time>{r.date}</time></article>)}</div>}
  </section>;
}

function TabBar() {
  return <div className="dg-tab-bar" aria-label="首页底部导航样式">{(['home','tree','plus','book','user'] as IconName[]).map((name, i) => <span key={name} className={`${i === 0 ? 'active' : ''}${i === 2 ? ' capture' : ''}`}><i><Icon name={name} size={21}/></i><span>{['首页','人生树','留下','回望','我的'][i]}</span></span>)}</div>;
}

function Phone({direction, empty}: {direction: Direction; empty: boolean}) {
  const d = directions.find(d => d.id === direction)!;
  return <div className={`dg-phone dg-${direction}`} aria-label={`${d.letter} ${d.name}，首页视觉方案`}>
    <WechatBar/>
    <div className="dg-screen-scroll" tabIndex={0} aria-label={`${d.name}首页，可上下滚动查看`}>
      {direction === 'book' && <>
        <header className="dg-book-opening"><p className="dg-date">10 月 6 日，星期二</p><h2>{d.headline}</h2><p className="dg-subtitle">不必向谁展示，也值得认真收藏。</p></header>
        <div className="dg-book-landscape"><div className="dg-book-year"><span>我的人生树</span><b>2026</b></div><Tree/><span className="dg-book-count">{empty ? '从一片新叶开始' : '3 个瞬间，正在生长'}</span></div>
        <div className="dg-book-actions"><RecordAction empty={empty}/><p className="dg-private"><Icon name="lock" size={12}/>这片小天地，只属于你</p></div>
        <Recent empty={empty} style={direction}/>
      </>}
      {direction === 'journal' && <>
        <header className="dg-journal-opening"><p className="dg-date">10 月 6 日 / 星期二</p><h2>{d.headline}</h2></header>
        <div className="dg-journal-paper"><div className="dg-journal-note"><span>给未来的自己</span><p>收好今天，<br/>以后慢慢看。</p><b>我的人生树 · 2026</b></div><Tree/><span className="dg-journal-count">{empty ? '等一片新叶' : '已收藏 3 个瞬间'}</span></div>
        <div className="dg-journal-write"><RecordAction empty={empty}/><p>此刻，你最想记住什么？</p></div>
        <Recent empty={empty} style={direction}/>
      </>}
      {direction === 'fresh' && <>
        <header className="dg-fresh-opening"><div><p className="dg-date">10 月 6 日 星期二</p><h2>{d.headline}</h2><p className="dg-subtitle">把值得记住的，留在这里。</p></div><span className="dg-fresh-avatar"><Icon name="user" size={21}/></span></header>
        <div className="dg-fresh-write"><RecordAction empty={empty}/></div>
        <div className="dg-fresh-landscape"><div><span className="dg-tree-label">我的人生树</span><p>{empty ? '故事，从今天开始。' : '每一刻，都算数。'}</p><span className="dg-tree-link">查看人生树</span></div><Tree/><span className="dg-fresh-year">2026</span></div>
        <div className="dg-fresh-stats"><span><b>{empty ? '0' : '3'}</b> 个瞬间</span><i/><span><b>{empty ? '0' : '2'}</b> 个本月记忆</span></div>
        <Recent empty={empty} style={direction}/>
      </>}
      {direction === 'forest' && <>
        <section className="dg-forest-opening"><p className="dg-date">10 月 6 日，星期二</p><h2>{d.headline}</h2><p className="dg-forest-verse">一片叶子，<br/>一段属于你的时光。</p><Tree/><div className="dg-forest-caption"><span>我的人生树</span><b>2026</b><small>{empty ? '从第一段记忆开始' : '收藏了 3 个瞬间'}</small></div></section>
        <div className="dg-forest-base"><RecordAction empty={empty}/><Recent empty={empty} style={direction}/><p className="dg-private"><Icon name="lock" size={12}/>不必向谁展示，也值得认真收藏。</p></div>
      </>}
    </div>
    <TabBar/>
  </div>;
}

function TypeNotes({direction}: {direction: Direction}) {
  const d = directions.find(d => d.id === direction)!;
  return <aside className="dg-type-notes"><span className="dg-detail-label">方案 {d.letter}</span><h2>{d.name}</h2><p>{d.description}</p><div className={`dg-font-specimen dg-font-${direction}`}><span>时光有迹，记忆成树。</span><small>人生记忆树 · 2026</small></div><dl><div><dt>标题字体</dt><dd>{d.font}<span>{d.chinese}</span></dd></div><div><dt>正文与导航</dt><dd>{d.body}</dd></div><div><dt>配色</dt><dd className="dg-swatches">{d.colors.map(color => <span key={color} style={{background: color}} title={color}><i className="dg-visually-hidden">{color}</i></span>)}</dd></div></dl><p className="dg-direction-fit">{d.feature}</p></aside>;
}

export default function DesignGallery() {
  const [mode, setMode] = useState<'compare'|'detail'>('compare');
  const [active, setActive] = useState<Direction>('book');
  const [empty, setEmpty] = useState(false);
  const [favorite, setFavorite] = useState<Direction|null>(null);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    try { const value = localStorage.getItem('life-tree-home-design'); if (directions.some(d => d.id === value)) setFavorite(value as Direction); } catch {}
    const params = new URLSearchParams(window.location.search); const selected = params.get('variant');
    if (directions.some(d => d.id === selected)) { setActive(selected as Direction); setMode('detail'); }
  }, []);
  function open(id: Direction) { setActive(id); setMode('detail'); window.scrollTo({top: 0, behavior: 'smooth'}); }
  function choose(id: Direction) {
    setFavorite(id);
    try {localStorage.setItem('life-tree-home-design', id);} catch {}
    const d = directions.find(d => d.id === id)!;
    setNotice(`已标记 ${d.letter}「${d.name}」。回到对话告诉我字母，就可以继续调整。`);
  }
  const chosen = directions.find(d => d.id === favorite);
  return <main className="design-gallery">
    <header className="dg-gallery-header"><a href="/" className="dg-brand"><Icon name="tree" size={25}/><span>人生记忆树</span></a><a className="dg-return" href="/">打开当前版本</a></header>
    <section className="dg-intro"><div><p>首页设计方案</p><h1>选一种，属于你的气质。</h1><span>四种中文字体，四种首页表达。使用相同的示例记忆，方便比较。</span></div><div className="dg-selection"><Icon name={chosen ? 'check' : 'leaf'} size={19}/><span>{chosen ? `已标记 ${chosen.letter} · ${chosen.name}` : '看完后，告诉我你喜欢哪一版'}</span></div></section>
    <div className="dg-toolbar"><div className="dg-view-switch" role="group" aria-label="查看方式"><button type="button" aria-pressed={mode === 'compare'} onClick={() => setMode('compare')}>四版同看</button><button type="button" aria-pressed={mode === 'detail'} onClick={() => setMode('detail')}>放大查看</button></div>{mode === 'detail' && <div className="dg-direction-switch" role="group" aria-label="选择设计方案">{directions.map(d => <button type="button" key={d.id} onClick={() => setActive(d.id)} aria-pressed={active === d.id}>{d.letter}<span> {d.name}</span></button>)}</div>}<label className="dg-state-switch"><input type="checkbox" checked={empty} onChange={e => setEmpty(e.target.checked)}/><span>看看首次使用的样子</span></label></div>
    {mode === 'compare' ? <div className="dg-comparison">{directions.map(d => <section key={d.id} className={`dg-option${favorite === d.id ? ' is-favorite' : ''}`} style={{'--option-accent': d.colors[2]} as CSSProperties}><header><span className="dg-letter">{d.letter}</span><div><h2>{d.name}</h2><p>{d.tone}</p></div><button type="button" className="dg-expand" onClick={() => open(d.id)} aria-label={`放大查看 ${d.letter} ${d.name}`}><Icon name="expand" size={18}/></button></header><Phone direction={d.id} empty={empty}/><div className="dg-option-footer"><div><span>{d.font}</span><small>{d.chinese}</small></div><button type="button" aria-pressed={favorite === d.id} onClick={() => choose(d.id)}>{favorite === d.id && <Icon name="check" size={15}/>}<span>{favorite === d.id ? '已标记' : '喜欢这版'}</span></button></div></section>)}</div> : <div className="dg-detail"><div className="dg-detail-device"><Phone key={active} direction={active} empty={empty}/></div><div className="dg-detail-copy"><TypeNotes direction={active}/><button type="button" className="dg-choose" onClick={() => choose(active)}>{favorite === active ? <><Icon name="check" size={18}/>已标记这版</> : '喜欢这版'}</button><button type="button" className="dg-back-compare" onClick={() => setMode('compare')}>回到四版对比</button></div></div>}
    <footer className="dg-gallery-footer"><p>可以选整版，也可以组合：比如「A 的字体 + C 的布局」。</p><span>这里是首页视觉方案；记忆与导航用于展示，不会写入你的记录。</span></footer>
    {notice && <div className="dg-notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="关闭提示"><Icon name="close" size={17}/></button></div>}
  </main>;
}
