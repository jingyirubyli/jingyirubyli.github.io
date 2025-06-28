---
layout: post
title:  数据操作与时间复杂度
date:   2025-06-28
description: You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. # Add post description (optional)
img: post-cp.png # Add image post (optional)
tags: [Blog, Data Structure]
author: # Add name author (optional)
---
# 本讲内容


---

## 时间复杂度

常数时间的操作: 一个操作如果和样本的数据量没有关系，每次都是固定时间内完成的操作，叫做常数操作。比如读数组中的数 int a = arr[i]; 但是从链表中取数int b = list.get(i) 就不是常数操作,因为链表逻辑上只能从左往右遍历,但是实际内存情况比较复杂.

时间复杂度为一个算法流程中，常数操作数量的一个指标。常用O（读作big O）来表示。具体来说，先要对一个算法流程非常熟悉，然后去写出这个算法流程中，发生了多少常数操作，进而总结出常数操作数量的表达式。比如选择排序: 遍历找出最小值与0位置交换, 在1~N-1遍历找到最小值替换1位置,以此类推...依次是进行了N次寻址+N(相当于N-1)次比较+1次交换、N-1次寻址+N-1次比较+1次交换、N-2次寻址+N-2次比较+1次交换...一共是寻址:N+N-1+N-2……,比较:N+N-1+N-2……,交换:N, 相加=aN^2+bN+C. 时间复杂度只要去掉系数的最高项O(N^2).
在表达式中，只要高阶项，不要低阶项，也不要高阶项的系数，剩下的部分如果为f（N），那么时间复杂度为O（f（N））。
评价一个算法流程的好坏，先看时间复杂度的指标，如果时间复杂度相同,再分析不同数据样本下的实际运行时间(因为理论常数项不能很容易确定)，也就是“常数项时间”。

## 