const KINDS = [
  { id: 'leaf', name: '日常', symbol: '叶', color: '#728463' },
  { id: 'flower', name: '喜悦', symbol: '花', color: '#a7656a' },
  { id: 'fruit', name: '收获', symbol: '果', color: '#b17837' },
  { id: 'bud', name: '开始', symbol: '芽', color: '#5b886d' },
  { id: 'scar', name: '成长', symbol: '纹', color: '#887467' },
  { id: 'glow', name: '珍惜', symbol: '光', color: '#ab852e' }
];
function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value + 'T00:00:00Z');
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0,10) === value && value >= '1900-01-01' && value <= '2100-12-31';
}
function text(value, limit, label, required) {
  if (value == null && !required) return '';
  if (typeof value !== 'string') throw new Error(`${label}格式不正确`);
  const clean = value.trim();
  if (required && !clean) throw new Error(`请填写${label}`);
  if (clean.length > limit) throw new Error(`${label}不能超过${limit}字`);
  return clean;
}
function normalize(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('记忆格式不正确');
  if (!validDate(input.date)) throw new Error('请选择有效的日期');
  if (!KINDS.some(k => k.id === input.kind)) throw new Error('请选择记忆类型');
  const content = text(input.content, 2000, '这一刻的感受', true);
  return {
    date: input.date, title: text(input.title, 40, '标题', false) || content.slice(0,24), content,
    kind: input.kind, scene: text(input.scene, 80, '地点', false), people: text(input.people, 80, '人物', false),
    echo: text(input.echo, 500, '写给未来的我', false), precious: input.precious === true
  };
}
function decorate(memory) {
  const kind = KINDS.find(k => k.id === memory.kind) || KINDS[0];
  let hash = 0;
  for (const char of memory.id) hash = ((hash * 31) + char.charCodeAt(0)) >>> 0;
  return { ...memory, kindName: kind.name, symbol: kind.symbol, color: kind.color,
    dateText: memory.date.replace(/-/g, '.'), month: memory.date.slice(0,7),
    x: 17 + hash % 66, y: 20 + Math.floor(hash / 67) % 47 };
}
function byDate(a,b) { return b.date.localeCompare(a.date) || String(b.createdAt).localeCompare(String(a.createdAt)); }
function clientId() { return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,12)}`; }
module.exports = { KINDS, today, validDate, normalize, decorate, byDate, clientId };
