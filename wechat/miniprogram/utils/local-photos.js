// 本机照片：照片不上传云存储，只存在微信给小程序的本地持久目录，路径记在本机映射表里。
// 记忆本身仍存云端（文字永远不丢），只是照片跟随这台设备——换手机或重装微信后照片会缺失。
const KEY = 'life-tree-local-photos';
const DIR = `${wx.env.USER_DATA_PATH}/photos`;

function readMap() {
  try { return wx.getStorageSync(KEY) || {}; } catch (_) { return {}; }
}
function writeMap(map) {
  try { wx.setStorageSync(KEY, map); } catch (_) {}
}
const fs = () => wx.getFileSystemManager();

function ensureDir() {
  try {
    if (!fs().accessSync(DIR)) fs().mkdirSync(DIR, true);
  } catch (_) {
    try { fs().mkdirSync(DIR, true); } catch (__) {}
  }
}

function ext(filePath) {
  const m = /\.(\w+)$/.exec(filePath || '');
  return m ? m[1].toLowerCase() : 'jpg';
}

// 把临时文件复制到本机持久目录，并记下「记忆 id -> 本机路径」
function keep(id, tempPath) {
  if (!id || !tempPath) return '';
  ensureDir();
  const target = `${DIR}/${id}.${ext(tempPath)}`;
  try {
    fs().copyFileSync(tempPath, target);
    const map = readMap();
    map[id] = target;
    writeMap(map);
    return target;
  } catch (_) {
    return '';
  }
}

function pathOf(id) { return readMap()[id] || ''; }

// 列表/树图用：把本机照片路径挂到记录上
function apply(records) {
  const map = readMap();
  return (records || []).map(r => (r.photoFileId ? r : { ...r, photoFileId: map[r.id] || '', photoLocal: !!map[r.id] }));
}

function drop(id) {
  const map = readMap();
  const target = map[id];
  if (!target) return;
  delete map[id];
  writeMap(map);
  try { fs().unlinkSync(target); } catch (_) {}
}

module.exports = { keep, pathOf, apply, drop, DIR };
