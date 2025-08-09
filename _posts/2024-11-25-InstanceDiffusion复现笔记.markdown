---
layout: post
title:  InstanceDiffuison 复现笔记
date:   2024-11-25
description: You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. # Add post description (optional)
img: instdiff.png # Add image post (optional)
tags: [Blog]
author: # Add name author (optional)
---
# 本讲内容

其实这篇是在某个不知名的睡不着的下午(2025-8-9)写的, 想回忆一下去年尝试这篇的过程记录一下, 否则花了很多时间什么也没学到感觉很可惜. 记录的时间选择的是文件夹最后更新的时间.

先放一个文章链接: [Instance Diffusion][instdiff]

[instdiff]: https://arxiv.org/pdf/2402.03290.pdf

当时刚来这边上学, 到一个新环境加上觉得学校水平很高, 所以干什么都摩拳擦掌跃跃欲试. 选了一门期末要求复现顶刊项目的课, 课倒是好说, 但是项目不自量力地选了一篇看上去很高大上很强的(没有说人家实际上不好的意思), 觉得只要自己愿意花时间啃下来就肯定能复现出来, 加上对这个题目挺感兴趣的, 就定了这篇论文. 当然可能因为自己还是实力不够吧, 最终没能成功复现, 当然设备限制也是一个很大的原因, 在运行关键步骤报了一个致命性错误, 抱着两台没有gpu无用武之地的mac手足无措, 最终也没找到解决方法. 当时很长一段时间跑不出来特别焦虑, 甚至想退课重选一门, 当然最后答辩是基于我已有的结果做了报告, 助教蛮好的, 老师也没多挑毛病, 还是以自我感觉比较好的成绩过了. 难道真诚真的是必杀技吗(哈哈). 
