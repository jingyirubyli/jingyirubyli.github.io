---
layout: post
title: Docker+MacOS M3
date: 2025-02-07
description: You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. # Add post description (optional)
img: post-6.jpg # Add image post (optional)
tags: [Blog, Docker]
author: # Add name author (optional)
---

# Docker: Mac 上的 Ubuntu 环境搭建
## 1. 搭建目标
### 在 MacOS 上的 Docker 环境中安装 Ubuntu 镜像并作为虚拟机使用
- 宿主机器操作系统：MacOS:15.3
- 容器环境：Docker for Mac
- 镜像版本：Ubuntu22.04(正文中出现20.04是因为我刚开始选错版本,读者根据自己情况选择即可)
## 2. 详细步骤
### 2.1 安装 Docker for Mac
#### 方法一
直接通过Docker官网下载安装: https://www.docker.com
#### 方法二
使用 Homebrew 直接下载

`$ brew cask install docker`

#### 方法三
阅读别人的教学得知可通过阿里云安装, 我对这种方法不太了解.可以自行搜索.

### 检查是否成功安装

启动 Docker , 打开终端输入代码:

`$ docker --version`

如果成功安装应输出:

Docker version xxx

尝试查看已拉取镜像:

`$ docker images`

显示没有镜像,下一步将拉取ubuntu镜像
{% highlight ruby %}
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
{% endhighlight %}

### 2.2 拉取镜像

Check out the [Jekyll docs][jekyll-docs] for more info on how to get the most out of Jekyll. File all bugs/feature requests at [Jekyll’s GitHub repo][jekyll-gh]. If you have questions, you can ask them on [Jekyll Talk][jekyll-talk].

[jekyll-docs]: https://jekyllrb.com/docs/home
[jekyll-gh]:   https://github.com/jekyll/jekyll
[jekyll-talk]: https://talk.jekyllrb.com/
