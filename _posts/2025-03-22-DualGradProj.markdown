---
layout: post
title: Gradient Projection Algorithm(梯度投影算法)
date: 2025-03-22
description: You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. # Add post description (optional)
img: post-cvx-2.png # Add image post (optional)
tags: [Blog, Convex Optimization]
author: # Add name author (optional)
---
# 本讲内容

投影定理时分离和支撑超平面中的部分内容.





---

## 投影定理

设集合 C 是 ℝ<sup>n</sup>  中的非空闭凸集。
1. 对 ∀x ∈ ℝ<sup>n</sup>, 存在唯一的点 π<sub>C</sub>(x) ∈ C, 使得

<figure style="text-align: center;">
<img src="/assets/img/cvx2-1.png" alt="" width="300">
<figcaption></figcaption>
</figure>

称 π<sub>C</sub>(x) 是 x 到 C 上的投影.


2. 对 ∀x ∈ ℝ<sup>n</sup>, 则点 z= π<sub>C</sub>(x) 是 x 到 C 的投影, 当且仅当 ∀y∈C 有 ⟨x−z,y−z⟩≤0.

3. 将 π<sub>C</sub> 看成映射 π<sub>C</sub>:ℝn→C，则 π<sub>C</sub> 是连续且非扩张的，即 ‖π<sub>C</sub>(x)−π<sub>C</sub>(y)‖≤‖x−y‖,   ∀x,y ∈ ℝ<sup>n</sup>.

<figure style="text-align: center;">
<img src="/assets/img/cvx2-2.png" alt="" width="300">
<figcaption></figcaption>
</figure>




## 梯度投影算法