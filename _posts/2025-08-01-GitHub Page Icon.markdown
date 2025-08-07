---
layout: post
title:  GitHub Page Icon 修改
date:   2025-08-01
description: You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. # Add post description (optional)
img: webpageicon.png # Add image post (optional)
tags: [Blog]
author: # Add name author (optional)
---
# 本讲内容

**静态工程站点**

如果 GitHub Pages 是用一个完整的静态工程来做的，那么很简单：

向站点根加入一张图片 favicon.ico（未测试 png 格式）

向静态站点的 index.html 的 <head> 节点加入子节点：

```
<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico?">
```

**纯 Markdown 站点**

如果是纯 Markdown 页面，则需要覆盖当前套用主题（theme）的默认布局：

首先需要去找到当前主题的模板文件（raw）：

raw.githubusercontent.com/pages-themes/你套用的主题名，比如：cayman、minimal等等/master/_layouts/default.html

把这个文件的内容全部复制

在自己仓库根目录下新建个目录 _layouts ，在里面新建个文件 default.html ，把复制的内容粘贴进去

向这个文件的 <head> 节点加入子节点，内容同前文那一行

最后还是要往仓库的根目录里加入 favicon.ico

## 总结: 

在head.html里修改. _config.yml里修改个人页面信息.

