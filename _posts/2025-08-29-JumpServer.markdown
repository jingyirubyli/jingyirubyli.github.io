---
layout: post
title:  跳板机、堡垒机和 JumpServer
date:   2025-08-29
description: You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. # Add post description (optional)
img: jumpserver.png # Add image post (optional)
tags: [Blog, Web]
author: # Add name author (optional)
---
# 本讲内容

终端直接运行: ./[脚本]运行, 需要在脚本头部声明解释器类型. 如果在命令行直接指定, 如 python3 [脚本], 就不用在脚本头部声明解释器.

## Jumpserver 架构

JumpServer 采用分层架构，分别是负载层、接入层、核心层、数据层、存储层。应用架构图如下：

<figure style="text-align: center;">
<img src="/assets/img/js1.png" alt="" width="500">
<figcaption>Jumpserver组成部分</figcaption>
</figure>

<figure style="text-align: center;">
<img src="/assets/img/js2.png" alt="" width="500">
<figcaption>Jumpserver架构图</figcaption>
</figure>