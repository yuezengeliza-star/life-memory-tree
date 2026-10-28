import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const root=path.resolve('wechat');
const mini=path.join(root,'miniprogram');
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);
for(const file of walk(root)){
  if(file.endsWith('.js')||file.endsWith('.cjs')){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});assert.equal(r.status,0,`${file}: ${r.stderr}`);}
  if(file.endsWith('.json'))JSON.parse(fs.readFileSync(file,'utf8'));
}
const app=JSON.parse(fs.readFileSync(path.join(mini,'app.json'),'utf8'));
for(const page of app.pages)for(const ext of ['js','json','wxml','wxss'])assert.ok(fs.existsSync(path.join(mini,`${page}.${ext}`)),`${page}.${ext} missing`);
for(const tab of app.tabBar.list){assert.ok(app.pages.includes(tab.pagePath));for(const k of ['iconPath','selectedIconPath'])assert.ok(fs.existsSync(path.join(mini,tab[k])));}
for(const file of walk(mini).filter(p=>p.endsWith('.json'))){const json=JSON.parse(fs.readFileSync(file));for(const component of Object.values(json.usingComponents||{}))for(const ext of ['js','json','wxml','wxss'])assert.ok(fs.existsSync(path.join(mini,`${component}.${ext}`)),`${component}.${ext} missing`);}
assert.equal(fs.readFileSync(path.join(mini,'utils/model.js'),'utf8'),fs.readFileSync(path.join(root,'cloudfunctions/memories/model.js'),'utf8'),'client/server validation drift');
assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,'database.rules.json'))),{read:false,write:false});
const size=walk(mini).reduce((n,p)=>n+fs.statSync(p).size,0);assert.ok(size<2*1024*1024,`main package ${size} bytes exceeds 2 MiB`);
const source=walk(mini).filter(p=>/\.(js|json|wxml)$/.test(p)).map(p=>fs.readFileSync(p,'utf8')).join('\n');
assert.ok(!/wx\.request\(|appsecret\s*[:=]\s*['"][^'"]+/i.test(source),'unexpected external requests or secrets');
console.log(`Native project structure, JavaScript, JSON, rules, assets passed. Main package: ${(size/1024).toFixed(1)} KiB.`);
if(process.argv.includes('--release')){
  const config=createRequire(import.meta.url)(path.join(mini,'config.js'));
  const project=JSON.parse(fs.readFileSync(path.join(root,'project.config.json')));
  const missing=[];
  if(!/^wx[a-f0-9]{16}$/.test(project.appid))missing.push('正式小程序 AppID');
  for(const [key,label]of [['envId','云开发环境 ID'],['operator','运营主体'],['contactEmail','隐私联系邮箱'],['filingNumber','备案号']])if(!config[key])missing.push(label);
  if(missing.length){console.error(`Release blocked: 缺少${missing.join('、')}。这不影响源码检查，但不能提交上线。`);process.exit(2);}
  console.log('Release configuration fields are filled. This does not verify account, filing, deployed rules, or WeChat review.');
}
