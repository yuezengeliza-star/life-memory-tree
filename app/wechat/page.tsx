export default function WechatDelivery(){
  return <main className="delivery-page">
    <a className="delivery-back" href="/">‹ 返回人生记忆树</a>
    <header><p>人生记忆树</p><h1>把记忆，种进微信里。</h1><p className="delivery-lead">原生小程序工程已准备。接下来，绑定你的小程序账号，部署记忆库，再进行真机验收。</p></header>
    <section className="delivery-download"><div><h2>微信小程序工程</h2><p>含五个主页面、记忆详情、隐私说明、云函数、权限规则与部署文档。</p></div><a className="delivery-button" href="/downloads/life-memory-tree-wechat.zip" download>下载完整工程 ZIP</a><a href="/downloads/wechat-readme.md" download>下载部署说明</a></section>
    <section><h2>已完成的功能</h2><ul><li>文字与照片记录，编辑、删除和珍贵标记。</li><li>人生树、年月筛选、搜索和基于真实记录的回望。</li><li>微信身份隔离、云端保存代码、隐私授权与照片删除重试。</li><li>文字备份导出与导入、个人记录清空。</li></ul></section>
    <section><h2>上线前还要完成</h2><ol><li><strong>绑定账号。</strong>填写正式 AppID、云开发环境 ID、运营主体与隐私联系邮箱。</li><li><strong>部署云端。</strong>创建集合、索引和私有存储规则，部署 memories 云函数。</li><li><strong>真机验收。</strong>用两个微信账号验证隔离、重开后的保存、照片、弱网与删除链路。</li><li><strong>提交发布。</strong>完成小程序备案与后台资料，上传体验版，提交微信审核，通过后发布。</li></ol></section>
    <aside className="delivery-status"><strong>当前状态：未提交微信审核</strong><p>已完成源码结构、包大小及数据逻辑检查。尚未运行微信开发者工具编译、真机测试或真实云端部署。网页的更新与微信小程序的发布是两个独立步骤。</p></aside>
    <p className="delivery-footnote">网页版记录保存在当前浏览器；小程序使用你配置的微信云开发环境。两端不会自动同步。小程序导入和导出为文字备份，不含照片。</p>
  </main>;
}
