# 人生记忆树

私人记忆工具，包含现有 Sites 网页和独立的原生微信小程序工程。

- `app/`：React / Vinext 网页。浏览器 IndexedDB 保存文字与照片，支持编辑删除、年月回看、搜索、珍贵标记、完整备份导入导出。
- `wechat/`：原生微信小程序与微信云开发云函数。部署方式见 [小程序说明](wechat/README.md)。
- `/wechat` 网页路由：小程序工程下载与交付状态。

两端数据不会自动同步。网页记录位于当前浏览器；小程序记录位于运营者配置的微信云开发环境。当前没有生成式 AI、公共内容社区或支付。

## 验证

```sh
node node_modules/typescript/bin/tsc --noEmit
node --experimental-strip-types --test tests/memory-store.test.mjs
node --test wechat/tests/security.test.cjs
node scripts/check-wechat.mjs
```

正式发布配置检查：`node scripts/check-wechat.mjs --release`。当前会如实报告未填写的 AppID、环境 ID、运营主体、隐私联系邮箱和备案号。

网页构建使用现有 Sites build helper；构建后 `node --test tests/rendered-html.test.mjs` 检查实际 Worker 输出。浏览器交互 QA 和微信开发者工具/真机测试尚需执行。自动化云函数测试使用替身数据库，不能代替真实云权限验证。

本公开代码仓库不包含 `.openai/hosting.json`、微信开发者本地私有配置或运营环境 ID；若要沿用已有部署身份，请在自己的私有环境中保留配置，不要提交到 GitHub。

## 开源副本说明

为避免公开开发者配置和本地缓存，本仓库用 `touristappid` / 空云环境 ID 代替上传包中的微信部署标识，排除了本地缓存和未公开的部署元数据。仓库未包含字体二进制文件或内嵌字体数据，运行时回退到系统字体；根据许可和实际需要，可在本地自行安装相关字体。大型设计页面预览属于派生文件，可由脚本生成。
