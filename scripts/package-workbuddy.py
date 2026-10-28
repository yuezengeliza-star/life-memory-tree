"""Export tracked source, a self-contained selected homepage, and handoff notes.

Usage: python scripts/package-workbuddy.py --rendered-html /absolute/designs.html
The supplied HTML must be rendered from the current /designs build.
"""
import argparse
import base64
from hashlib import sha256
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
from zipfile import ZipFile, ZIP_DEFLATED

parser = argparse.ArgumentParser()
parser.add_argument('--rendered-html', type=Path, required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]

class SelectedHome(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.depth = 0
        self.parts = []
        self.complete = False

    def handle_starttag(self, tag, attrs):
        classes = dict(attrs).get('class', '').split()
        if not self.depth and not self.complete and tag == 'div' and {'dg-phone', 'dg-forest'} <= set(classes):
            self.depth = 1
            self.parts.append(self.get_starttag_text())
        elif self.depth:
            self.parts.append(self.get_starttag_text())
            if tag == 'div':
                self.depth += 1

    def handle_endtag(self, tag):
        if self.depth:
            self.parts.append('</' + tag + '>')
            if tag == 'div':
                self.depth -= 1
                self.complete = self.depth == 0

    def handle_startendtag(self, tag, attrs):
        if self.depth:
            self.parts.append(self.get_starttag_text())

    def handle_data(self, data):
        if self.depth:
            self.parts.append(data)

    def handle_entityref(self, name):
        if self.depth:
            self.parts.append('&' + name + ';')

    def handle_charref(self, name):
        if self.depth:
            self.parts.append('&#' + name + ';')

home = SelectedHome()
home.feed(args.rendered_html.read_text())
assert home.complete, 'Selected fourth homepage missing from rendered output'
markup = ''.join(home.parts)
assert '让记忆' in markup and 'dg-forest-base' in markup
image_uri = 'data:image/png;base64,' + base64.b64encode((root / 'public/tree-visual-base.png').read_bytes()).decode()
markup = markup.replace('src="/tree-visual-base.png"', 'src="' + image_uri + '"')
css = (root / 'app/designs/designs.css').read_text()
assert '#3f4936' in css and '#59634d' in css
for name in ['sans', 'serif', 'wenkai', 'xiaowei']:
    data = base64.b64encode((root / f'public/fonts/home-{name}.woff2').read_bytes()).decode()
    css = css.replace(f"url('/fonts/home-{name}.woff2')", f"url('data:font/woff2;base64,{data}')")
assert not re.search(r'(?:src|href)=[\"\']/', markup)
assert not re.search(r'url\([\"\']/(?:fonts|tree)', css)
document = '''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>人生记忆树 · 山林来信</title><style>html,body{margin:0;padding:0}body{min-width:320px}button{border:0;font:inherit}img{display:block;max-width:100%}h1,h2,h3,h4,p,dl,dd{margin:0}''' + css + '''</style></head><body><main class="design-gallery"><header class="dg-gallery-header"><span class="dg-brand">人生记忆树</span><span>第四版 · 山林来信</span></header><section class="dg-detail" style="grid-template-columns:minmax(0,400px);padding:30px 0;gap:20px"><div class="dg-detail-device">''' + markup + '''</div><p style="font-family:system-ui,sans-serif;color:#5f7161;font-size:14px;line-height:1.9">已选首页视觉稿。文字与记忆为样例，按钮与导航仅展示布局。接入原生小程序的说明见 WORKBUDDY_HANDOFF.md。</p></section></main></body></html>'''
design = root / 'design/selected-home.html'
design.parent.mkdir(exist_ok=True)
design.write_text(document)

tracked = subprocess.check_output(['git', 'ls-files', '-z'], cwd=root).decode().split('\0')
extra = ['WORKBUDDY_HANDOFF.md', 'scripts/package-workbuddy.py', 'design/selected-home.html']
paths = sorted(set(p for p in tracked + extra if p and not p.startswith('public/downloads/') and not p.startswith('examples/') and not p.endswith('.zip')))
for name in paths:
    p = Path(name)
    assert p.parts[0] not in ['.git', 'node_modules', '.sites-runtime', '.wrangler', 'dist']
    assert not p.name.startswith('.env') and p.suffix not in ['.pem', '.key']
    assert name != 'wechat/project.private.config.json'
    assert (root / name).is_file(), name
    if p.suffix in ['.ts', '.tsx', '.js', '.mjs', '.json'] or p.name == '.npmrc':
        content = (root / name).read_text()
        assert not re.search(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|_authToken\s*=\s*[^$\s]+|github_pat_[A-Za-z0-9_]+|ghp_[A-Za-z0-9]{20,}', content), 'Possible credential in ' + name
manifest = {'description': '人生记忆树 WorkBuddy 交接包；D 灰橄榄绿设计已选，原生首页接入待完成。', 'files': {name: sha256((root / name).read_bytes()).hexdigest() for name in paths}}
target = root / 'public/downloads/life-memory-tree-workbuddy.zip'
target.parent.mkdir(parents=True, exist_ok=True)
prefix = 'life-memory-tree-workbuddy/'
with ZipFile(target, 'w', compression=ZIP_DEFLATED, compresslevel=6) as z:
    for name in paths:
        z.write(root / name, prefix + name)
    z.writestr(prefix + 'FILES_SHA256.json', json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
with ZipFile(target) as z:
    assert z.testzip() is None
    for name, digest in manifest['files'].items():
        assert sha256(z.read(prefix + name)).hexdigest() == digest, name
    assert prefix + 'wechat/project.config.json' in z.namelist()
    assert prefix + 'wechat/cloudfunctions/memories/handler.js' in z.namelist()
print(json.dumps({'file': str(target), 'files': len(paths) + 1, 'bytes': target.stat().st_size, 'offline_design': str(design)}, ensure_ascii=False))
