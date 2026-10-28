"""从国内 npm 镜像获取霞鹜文楷分片字体，合并为完整 TTF 后重新生成小程序子集。

用法: python subset-wechat-wenkai.py
输出: public/fonts/home-wenkai.woff2（覆盖网页版设计文案 + 小程序全部固定文案）
"""
import json
import re
import tarfile
import tempfile
import urllib.parse
import urllib.request
from pathlib import Path

from fontTools import subset
from fontTools.merge import Merger
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
cache = root / '.font-cache'
cache.mkdir(exist_ok=True)
ttf = cache / 'LXGWWenKai-Regular.ttf'
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))  # 绕开失效代理


def collect_text():
    text = ''.join(p.read_text(encoding='utf-8') for p in (root / 'app' / 'designs').glob('*.tsx'))
    for pattern in ('*.wxml', '*.js'):
        for p in (root / 'wechat' / 'miniprogram').rglob(pattern):
            text += p.read_text(encoding='utf-8')
    text += ''.join(chr(i) for i in range(32, 127))
    text += '“”‘’、。！？：；（）《》〈〉【】…—·•　☆★✓✎＋▾'
    return text


def build_source_from_npmpkg():
    pkg = 'lxgw-wenkai-webfont'
    meta = json.load(opener.open('https://registry.npmmirror.com/' + urllib.parse.quote(pkg), timeout=60))
    latest = meta['dist-tags']['latest']
    tarball = meta['versions'][latest]['dist']['tarball']
    tgz = cache / 'wenkai.tgz'
    if not tgz.exists():
        print(f'下载 {pkg}@{latest} ...', flush=True)
        tgz.write_bytes(opener.open(tarball, timeout=300).read())
        print(f'  {tgz.stat().st_size:,} bytes', flush=True)
    with tempfile.TemporaryDirectory() as td:
        with tarfile.open(tgz) as tf:
            tf.extractall(td, filter='data')
        files = sorted(Path(td).rglob('*.woff2'))
        print('分片数:', len(files), flush=True)
        # 只保留含目标字符的分片（按 unicode 区间切分，中文集中在少数分片）
        want = {ord(ch) for ch in collect_text() if '\u4e00' <= ch <= '\u9fff'} | {ord(ch) for ch in collect_text() if ch.isascii()}
        picked, missing = [], set(want)
        for f in files:
            try:
                t = TTFont(f)
            except Exception:
                continue
            hit = missing & set(t.getBestCmap())
            if hit:
                missing -= hit
                picked.append(f)
        print('命中分片:', len(picked), '| 仍缺:', len(missing), flush=True)
        merged = Merger().merge([str(p) for p in picked])
        # 中文不需要 GSUB/GPOS 等布局表，且合并后的表会触发 fontTools 子集化的已知缺陷
        for tag in ('GSUB', 'GPOS', 'GDEF'):
            if tag in merged:
                del merged[tag]
        merged.flavor = None
        merged.save(ttf)
        print('合并为完整字体:', f'{ttf.stat().st_size:,} bytes', flush=True)


text = collect_text()
if not ttf.exists():
    build_source_from_npmpkg()

font = TTFont(ttf)
cmap = set(font.getBestCmap())
missing_han = {ch for ch in text if '\u4e00' <= ch <= '\u9fff' and ord(ch) not in cmap}
if missing_han:
    raise SystemExit('源字体缺字: ' + ''.join(sorted(missing_han)))

options = subset.Options()
options.flavor = 'woff2'
options.name_IDs = ['*']
options.name_legacy = True
options.name_languages = ['*']
sub = subset.Subsetter(options=options)
sub.populate(text=text)
sub.subset(font)
family_name = 'MemoryTreeWenkaiWeb'
repl = {1: family_name, 2: 'Regular', 3: family_name + '-1.0', 4: family_name, 6: family_name, 16: family_name, 17: 'Regular', 18: family_name}
for record in font['name'].names:
    if record.nameID in repl:
        record.string = repl[record.nameID].encode(record.getEncoding())
font.flavor = 'woff2'
target = root / 'public' / 'fonts' / 'home-wenkai.woff2'
font.save(target)

saved_cmap = set(TTFont(target).getBestCmap())
probe = '把重要的瞬间留在自己的树上记录保存私人云端库让记忆在这里生长一片叶子段属于你时光最近查看全部留下这一刻不必向谁展示也值得认真收藏正在翻开我的人生树个瞬间重新连接星期'
miss = [ch for ch in probe if ord(ch) not in saved_cmap]
print(f'生成子集: {target.stat().st_size:,} bytes; 汉字 {sum(1 for c in saved_cmap if 0x4E00 <= c <= 0x9FFF)} 个')
print('关键文案缺字:', ''.join(miss) if miss else '无')
