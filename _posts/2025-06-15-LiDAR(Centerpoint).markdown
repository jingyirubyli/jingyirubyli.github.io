---
layout: post
title:  LiDAR in Centerpoint
date:   2025-06-15
description: You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. # Add post description (optional)
img: livoxhap.png # Add image post (optional)
tags: [Blog, LiDAR]
author: # Add name author (optional)
---
# 本讲内容

Apollo_Centerpoint_LiDAR

## 项目简介

.zip为25Spring I2I完整课程项目设计.
该部分只介绍我的safezone definition部分.

## 项目描述
### 硬件设备
Livox-Hap: https://www.livoxtech.com/hap  
Livox 航插一分三线: https://store.dji.com/cn/product/livox-three-wire-aviation-connector?vid=117441&set_region=CN&from=site-nav  
PC: Alienware (Linux)按照livox官方要求,安装Ubuntu22.04(适配官方的livox viewer 2工具)

### 实验setup
<div align = "center"> 
<img src="/assets/img/readimg/setup1.png"  width="300" />
<img src="/assets/img/readimg/setup2.png"  width="300" />
</div>
<div align = "center"> 
<img src="/assets/img/readimg/setup3.png"  width="600" />
</div>

### 结构设计
(使用omni graffle)
<div align = "center"> 
<img src="/assets/img/readimg/diagram.png"  width="600" />
</div>


## 算法结构
### Flowchart 
<div align = "center"> 
<img src="/assets/img/readimg/flow.png"  width="600" />
</div>

### 具体流程

我们从目标检测部分拿到检测结果(输出数据), 下一步需要利用这些数据定义一个我们需要的安全区,然后在工人的位置变动时实时判断工人是否迈出安全区,并将结果打印出来以实现安全监测.
<div align = "center"> 
<img src="/assets/img/readimg/safezone1.png"  width="300" />
</div>

检测的结果是包含8个点位置坐标的3D结构:
```
box = {
    "class": "traffic_cone",
    "points": [(x1, y1), (x2, y2), ..., (x8, y8)]
}

box = {
    "class": ”workers",
    "points": [(x1, y1), (x2, y2), ..., (x8, y8)]
}
```
<div align = "center"> 
<img src="/assets/img/readimg/safezone2.png"  width="300" />
<img src="/assets/img/readimg/safezone3.png"  width="300" />
</div>

**输入处理**
这部分的输入是上一步(检测)的输出, 是3D点云坐标(组成一个bounding box). 我们定义安全区的思路是选择标签为traffic cone的对象,使用cones将安全区在地面上圈出来. 此时需要处理的问题是, 每个object都包含8个点坐标, 如何使用这些坐标来确定各个cone的位置? 选取每个bounding box的底面中心来代表cone的位置,这个操作很简单,只需要中心点位置公式一步计算.然后就是将这些计算所得的点连成一个封闭的多边形,代表安全区.我们首先想到简单按照位置关系,比如比较其中两点横坐标,哪个横坐标大,哪个就在左边,以此类推比较出横坐标最大的点在左边,用这个方法选出最左、最上、最右和最下四个点,再连接.这里出现两个问题:一是这样判断得出的最上最左最下最右四个点不一定能覆盖整个安全区,很容易想象;二是连接的顺序可能导致所得的图形交叉.

<div align = "center"> 
<img src="/assets/img/readimg/safezone4.png"  width="400" />
</div>

首先解决连接顺序的问题: 由上图可以看出要想连接出一个不交叉的封闭图形需要采用正确的顺序,这里通过比较极角来确定顺序.任意选一个参考点(这里选右下点举例),依次计算其他点相对于它的极角,再将这些点按照极角大小排序,从参考点开始依次连接,这样就可以保证连接出一个不交叉的封闭多边形.
<div align = "center"> 
<img src="/assets/img/readimg/polar.png"  width="300" />
</div>
<div align = "center"> 
<img src="/assets/img/readimg/safezone5.png"  width="300" />
</div>

那么问题又来了,上面的例子中只有4个点,4个点无论如何都是好处理的,甚至可以直接做更多次判断. 那么路上设置的cones更多怎么办? 我们想到convex hull(凸包),它可以万无一失地圈出不交叉的封闭图形,而且可以保证区域全覆盖(上面提到的第一个问题也迎刃而解了).而且使用代码的操作也不复杂.

<div align = "center"> 
<img src="/assets/img/readimg/safezone6.png"  width="300" />
</div>

**安全性判断**

我们需要判断工人是否在安全区中, 这个问题抽象为判断一个或多个点是否在一个封闭多边形中. 这一部分使用计算机图形学中的Ray-Casting Algorithm: 原理好理解,代码操作简单.

从被判断点向右(或向左,但是同一组判断方向要保持一致)绘制一条射线；计算该射线与多边形边界的交点数；如果交点数为奇数，则该点位于多边形内部，否则位于多边形外部。
<div align = "center"> 
<img src="/assets/img/readimg/safezone7.png"  width="400" />
</div>


## 结果展示

下面展示简单的脚本模拟:
<div align = "center"> 
<img src="/assets/img/readimg/safezone8.png"  width="300" />
<img src="/assets/img/readimg/safezone9.png"  width="300" />
</div>
<div align = "center"> 
<img src="/assets/img/demo/demo4.gif"  width="600" />
</div>
---

## 实装

**实验数据组**

我们采集三组数据,以第一组为例,在合适的时间段按照每10 frames选出一帧进行gt标注、检测和误差计算.

<table>
  <tr>
    <th> </th>
    <th>Frame 10</th>
    <th>⋯⋯⋯</th>
    <th>180</th>
    <th>190</th>
    <th>⋯⋯⋯</th>
  </tr>
  <tr>
    <td>Detection</td>
    <td>Null</td>
    <td></td>
    <td>[15.25, 2.33]</td>
    <td>[16.24, 2.33]</td>
    <td></td>
  </tr>
  <tr>
    <td>Ground Truth</td>
    <td>Null</td>
    <td></td>
    <td>[15.2, 2.5]</td>
    <td>[16.1, 2.5]</td>
    <td></td>
  </tr>
  <tr>
    <td>IoU</td>
    <td>Null</td>
    <td></td>
    <td>58.5%</td>
    <td>48.1%</td>
    <td></td>
  </tr>
  <tr class="summary">
    <td>IoU (average)</td>
    <td colspan="9">0.653</td>
  </tr>
</table>

下表是检测对象交通锥detection边界框与对应真实边界框gt的中心点坐标及其 IoU.最后一行计算前6个cones的原因是在点云数据中随着距离增大,误差会相应增大.

<table>
  <tr>
    <th></th>
    <th>Cone 1</th>
    <th>Cone 2</th>
    <th>Cone 3</th>
    <th>Cone 4</th>
    <th>Cone 5</th>
    <th>Cone 6</th>
    <th>Cone 7</th>
    <th>Cone 8</th>
    <th>Cone 9</th>
  </tr>
  <tr class="header">
    <td>Detection</td>
    <td>(7.3, 4.1)</td>
    <td>(15.4, 4.0)</td>
    <td>(21.7, 4.3)</td>
    <td>(30.5, 4.6)</td>
    <td>(38.3, 4.8)</td>
    <td>(45.8, 5.1)</td>
    <td>(53.3, 5.1)</td>
    <td>(61.5, 5.4)</td>
    <td>(69.7, 5.5)</td>
  </tr>
  <tr class="header">
    <td>Ground Truth</td>
    <td>(7.5, 4)</td>
    <td>(15.3, 4.0)</td>
    <td>(21.9, 4.25)</td>
    <td>(30.1, 4.5)</td>
    <td>(37.7, 4.75)</td>
    <td>(45.0, 5.0)</td>
    <td>(52.3, 5.0)</td>
    <td>(60.2, 5.25)</td>
    <td>(68.0, 5.25)</td>
  </tr>
  <tr>
    <td>IoU</td>
    <td>0.69</td>
    <td>0.66</td>
    <td>0.67</td>
    <td>0.67</td>
    <td>0.64</td>
    <td>0.59</td>
    <td>0.55</td>
    <td>0.48</td>
    <td>0.43</td>
  </tr>
  <tr class="summary">
    <td>IoU (average)</td>
    <td colspan="9">0.498</td>
  </tr>
  <tr class="summary">
    <td>IoU (First 6 cones)</td>
    <td colspan="9">0.653</td>
  </tr>
</table>

**Demo:三种常见情况模拟**

1. 工人踏入安全区时: 有人触碰边界, 指示变红色表示危险; 安全区内的工人数增加, 指示不变表示安全.
   
<div align = "center"> 
<img src="/assets/img/demo/demo1.gif"  width="300" />
</div>

2. 工人在安全局内移动,无踏入或踏出:指示颜色不变.
<div align = "center"> 
<img src="/assets/img/demo/demo2.gif"  width="600" />
</div>

3. 工人踏出安全区时: 有人触碰边界, 指示变红色表示危险; 安全区内的工人数减少, 指示变红色表示危险.

<div align = "center"> 
<img src="/assets/img/demo/demo3.gif"  width="600" />
</div>
