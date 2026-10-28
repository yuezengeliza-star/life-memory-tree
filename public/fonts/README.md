# 首页方案字体

`/designs` 使用四种字体的网页子集，字体从本站加载，不依赖第三方字体 CDN。

- A：Noto Serif SC，正文与导航为 Noto Sans SC。
- B：LXGW WenKai，正文与导航为 Noto Sans SC。
- C：Noto Sans SC，使用字号与字重区分层次。
- D：ZCOOL XiaoWei，正文与导航为 Noto Sans SC。

原始下载地址、源文件 SHA-256、子集大小见 `sources.json`；各字体完整许可见对应的 `*-OFL.txt`。子集内部名称以 `MemoryTree` 开头，避免沿用保留字体名称。

这些字体目前仅覆盖方案页中的文字。修改中文文案后，运行 `python scripts/subset-home-fonts.py --source-dir /absolute/font-cache` 重新生成。正式应用用户输入的内容时需另行选择完整字体或可靠的系统字体回退，不能把仅供视觉稿的子集当作完整中文字库。
