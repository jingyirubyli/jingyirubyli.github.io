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

投影定理是分离和支撑超平面中的部分内容.





---

## 投影定理

设集合 C 是 ℝ<sup>n</sup>  中的非空闭凸集。
1. 对 ∀x ∈ ℝ<sup>n</sup>, 存在唯一的点 π<sub>C</sub>(x) ∈ C, 使得

<figure style="text-align: center;">
<img src="/assets/img/cvx2-1.png" alt="" width="300">
<figcaption></figcaption>
</figure>

称 π<sub>C</sub>(x) 是 x 到 C 上的投影. 即 π<sub>C</sub>(x) 是x到C的距离最小的点.

<figure style="text-align: center;">
<img src="/assets/img/cvx2-2.png" alt="" width="300">
<figcaption></figcaption>
</figure>

2. 对 ∀x ∈ ℝ<sup>n</sup>, 则点 z = π<sub>C</sub>(x) 是 x 到 C 的投影, 当且仅当 ∀y∈C 有 ⟨x−z,y−z⟩≤0. 即点z是x到C的最小距离点的充要条件是:
<figure style="text-align: center;">
<img src="/assets/img/cvx2-3.png" alt="" width="300">
<figcaption></figcaption>
</figure>

3. 将 π<sub>C</sub> 看成映射 π<sub>C</sub>:ℝ<sup>n</sup> → C，则 π<sub>C</sub> 是连续且非扩张的，即 ‖π<sub>C</sub>(x)−π<sub>C</sub>(y)‖≤‖x−y‖, ∀x,y ∈ ℝ<sup>n</sup>.

<figure style="text-align: center;">
<img src="/assets/img/cvx2-4.png" alt="" width="400">
<figcaption></figcaption>
</figure>

<figure style="text-align: center;">
<img src="/assets/img/cvx2-5.png" alt="" width="300">
<figcaption></figcaption>
</figure>


## 梯度投影算法

梯度投影法的基本思想是：当迭代点x<sub>k</sub>是可行域 C 的内点时，取 d = -▽f（x<sub>k</sub>）作为搜索方向；否则，当x<sub>k</sub>是可行域 C 的边界点时，取
-▽f（x<sub>k</sub>）在这些边界面交集上的投影作为搜索方向. 这也是“梯度投影法”名称的由来.

在正常的梯度下降过程中，如果待优化的变量存在约束 x ∈ C ，那么在梯度算法中的更新公式需要用投影来代替，也即:

<figure style="text-align: center;">
<img src="/assets/img/cvx2-6.png" alt="" width="300">
<figcaption></figcaption>
</figure>

其中投影算子定义为:

<figure style="text-align: center;">
<img src="/assets/img/cvx2-7.png" alt="" width="300">
<figcaption></figcaption>
</figure>

通过投影定理, 在梯度下降时有:

<figure style="text-align: center;">
<img src="/assets/img/cvx2-8.png" alt="" width="400">
<figcaption></figcaption>
</figure>

- 因此，令 x = x<sub>k</sub>，可以得到

<figure style="text-align: center;">
<img src="/assets/img/cvx2-9.png" alt="" width="400">
<figcaption></figcaption>
</figure>
也即，当 d<sub>k+1</sub> - d<sub>k</sub>是下降方向时，可以有如上的式子成立。

- 特殊地，当迭代过程最终收敛之后，也即 x<sub>k+1</sub> = x<sub>k</sub> 时，可以证明，此时的 x<sub>k</sub> 恰好满足最优解的必要条件。

<figure style="text-align: center;">
<img src="/assets/img/cvx2-10.png" alt="" width="300">
<figcaption></figcaption>
</figure>

假定 ▽f（x） 是一个 L-Lipschitz 的函数，因此可以得到

<figure style="text-align: center;">
<img src="/assets/img/cvx2-11.png" alt="" width="400">
<figcaption></figcaption>
</figure>

因此，当 α ∈ (0, 2/L) 时，可以使得梯度下降，而同样地，由这一条件收敛到的最优值，也满足最优条件:

<figure style="text-align: center;">
<img src="/assets/img/cvx2-12.png" alt="" width="300">
<figcaption></figcaption>
</figure>
