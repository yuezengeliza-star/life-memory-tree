"""Build self-hosted web-font subsets for the /designs comparison.

Usage: python scripts/subset-home-fonts.py --source-dir /absolute/font-cache
Requires fonttools and brotli. Full upstream fonts stay in the supplied cache.
Run again whenever the design gallery's Chinese copy changes.
"""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import urllib.request

from fontTools import subset
from fontTools.ttLib import TTFont

parser = argparse.ArgumentParser()
parser.add_argument('--source-dir', required=True, type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
out = root / 'public' / 'fonts'
out.mkdir(parents=True, exist_ok=True)
args.source_dir.mkdir(parents=True, exist_ok=True)
fonts = {
    'serif': ('Noto Serif SC', 'https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf', 'https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/OFL.txt'),
    'sans': ('Noto Sans SC', 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf', 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/OFL.txt'),
    'wenkai': ('LXGW WenKai', 'https://raw.githubusercontent.com/lxgw/LxgwWenKai/main/fonts/TTF/LXGWWenKai-Regular.ttf', 'https://raw.githubusercontent.com/lxgw/LxgwWenKai/main/OFL.txt'),
    'xiaowei': ('ZCOOL XiaoWei', 'https://raw.githubusercontent.com/google/fonts/main/ofl/zcoolxiaowei/ZCOOLXiaoWei-Regular.ttf', 'https://raw.githubusercontent.com/google/fonts/main/ofl/zcoolxiaowei/OFL.txt'),
}
text = ''.join(p.read_text() for p in (root / 'app' / 'designs').glob('*.tsx'))
text += ''.join(chr(i) for i in range(32, 127)) + '“”‘’、。！？：；（）《》〈〉【】…—·•••'
chinese = {ord(ch) for ch in text if '\u4e00' <= ch <= '\u9fff'}
manifest = []
for name, (family, source_url, license_url) in fonts.items():
    for filename, url in [(name + '.ttf', source_url), (name + '-OFL.txt', license_url)]:
        local = args.source_dir / filename
        if not local.exists():
            local.write_bytes(urllib.request.urlopen(url, timeout=60).read())
    path = args.source_dir / (name + '.ttf')
    font = TTFont(path)
    missing = chinese - set(font.getBestCmap())
    if missing:
        raise ValueError(f'{family} missing: {"".join(chr(c) for c in sorted(missing))}')
    options = subset.Options()
    options.flavor = 'woff2'
    options.name_IDs = ['*']
    options.name_legacy = True
    options.name_languages = ['*']
    sub = subset.Subsetter(options=options)
    sub.populate(text=text)
    sub.subset(font)
    # Give the subsets distinct family names while preserving copyright/license records.
    family_name = 'MemoryTree' + name.title() + 'Web'
    replacements = {1: family_name, 2: 'Regular', 3: family_name + '-1.0', 4: family_name, 6: family_name, 16: family_name, 17: 'Regular', 18: family_name}
    for record in font['name'].names:
        if record.nameID in replacements:
            record.string = replacements[record.nameID].encode(record.getEncoding())
    font.flavor = 'woff2'
    target = out / ('home-' + name + '.woff2')
    font.save(target)
    shutil.copyfile(args.source_dir / (name + '-OFL.txt'), out / (name + '-OFL.txt'))
    saved = TTFont(target)
    assert not (chinese - set(saved.getBestCmap()))
    manifest.append({'font': family, 'file': target.name, 'source': source_url, 'source_sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'license': name + '-OFL.txt', 'bytes': target.stat().st_size})
    print(f'{family}: {target.stat().st_size:,} bytes; {len(chinese)} Chinese characters verified', flush=True)
(out / 'sources.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
