const fs = require('fs');
const path = require('path');
const wechat = path.join(__dirname, '..', 'wechat');
const NAME = '人生记忆树V1.0';
const ENCODED = encodeURIComponent(NAME);

function patch(rel, value) {
  const file = path.join(wechat, rel);
  let s = fs.readFileSync(file, 'utf8');
  if (/"projectname"\s*:\s*"[^"]*"/.test(s)) {
    s = s.replace(/"projectname"\s*:\s*"[^"]*"/, `"projectname": "${value}"`);
  } else {
    s = s.replace(/^\{\r?\n/, m => m + `  "projectname": "${value}",\n`);
  }
  JSON.parse(s); // 保证仍是合法 JSON
  fs.writeFileSync(file, s);
  console.log('已改:', rel, '→', JSON.parse(s).projectname);
}

// 私有配置用 URL 编码（与开发者工具写入格式一致），公开配置用中文原文
patch('project.private.config.json', ENCODED);
patch('project.config.json', NAME);
patch('miniprogram/project.private.config.json', ENCODED);
patch('miniprogram/project.config.json', NAME);
console.log('\n编码形式:', ENCODED);