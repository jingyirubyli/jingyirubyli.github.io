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

JumpServer 是一款开源堡垒机（运维安全审计系统），遵循 4A（认证 Authentication、授权 Authorization、账号 Account、审计 Audit）规范，帮助企业统一管控各类 IT 资产，并对运维全过程留痕审计，满足合规与安全要求。它支持 SSH、Windows、数据库、K8s、Web 后台等多种资产类型与访问方式。

- [本讲内容](#本讲内容)
  - [跳板机和堡垒机](#跳板机和堡垒机)
  - [Jumpserver 架构](#jumpserver-架构)
    - [CORE](#core)
    - [Guacamole](#guacamole)
    - [CoCo(KoKo)](#cocokoko)
    - [Lina](#lina)
    - [Luna](#luna)
  - [Jumpserver 部署](#jumpserver-部署)


---


## 跳板机和堡垒机

早在2000年左右，一些中大型企业为了能对运维人员的远程登录进行集中管理，会在机房部署一台跳板机。跳板机其实就是一台unix/windows操作系统的服务器，所有运维人员都需要先远程登录跳板机，然后再从跳板机登录其他服务器中进行运维操作。

跳板机并没有实现对运维人员操作行为的控制和审计，使用跳板机过程中还是会有误操作、违规操作导致的操作事故，一旦出现操作事故很难快速定位原因和责任人。

此外，跳板机存在严重的安全风险，一旦跳板机系统被攻入，则将后端资源风险完全暴露无遗。同时，对于个别资源（如telnet）可以通过跳板机来完成一定的内控，但是对于更多更特殊的资源（ftp、rdp等）来讲就显得力不从心了。人们逐渐认识到跳转服务器的不足，进而需要更新更好的安全技术理念来实现运维运营管理。需要一款满足角色管理与授权审批、信息资源访问控制、操作日志与审计、系统变更与维护控制等需求的产品，并生成一些具有管理规范的统计报表，以不断提高IT内控的合规性。在这些理念的指引下，2005年前后，Bastion主机开始以单机产品的形式广泛部署，有效降低运维运维风险，让运维运维管理更简单、更安全。

堡垒机是从跳板机（也叫前置机）的概念演变过来的。堡垒机是指在 Internet 网络上完全暴露于攻击的主机，通常，它不受任何防火墙或数据包过滤路由器设备的保护，由于堡垒机完全暴露在外网安全威胁之下，因此需要做大量工作来设计和配置堡垒机，以最大限度地降低外网攻击成功的风险。堡垒机是一种用于管理和控制远程服务器、网络设备等系统的安全设备。它能够将用户的访问流量进行精细化的管理和控制，实现用户权限的集中管控、会话管理、审计跟踪等功能，从而提升系统安全性和管理效率。

堡垒机既可以是硬件设备，也可以是软件。

硬件设备通常是指预装了堡垒机软件的专用服务器，具有更高的稳定性和性能，而软件形式的堡垒机则可以在虚拟化环境中部署。

但是，堡垒机的配置、部署和维护都需要专业技术，不正确的配置可能会影响系统的安全性和稳定性。

堡垒机与跳板机的区别主要在于功能不同：跳板机只是一种通用的远程登录工具，用于远程登录到目标机器，可以将本地的 SSH 连接转发到被控机器上；而堡垒机则具备更为丰富的管理和控制功能，如用户认证、权限授权、会话审计、运维流程控制、统一管理等，帮助企业实现安全管控和降低风险。

之前笔记还有 NAT网关: 堡垒机仅用作审计和代理平台，不会有内网到外网的数据交换，NAT网关通常会将内部私有地址转换为公有地址，以便内网设备访问外网，显然，NAT网关存在内网到外网的数据交互。

---

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

### CORE

Jumpserver 管理后台, 是核心组件, 使用 Django Class Based View 风格开发, 支持 Restful API, 内置了 Gunicorn Celery Beat Flower Daphne 服务.



### Guacamole



### CoCo(KoKo)





### Lina


### Luna





---

## Jumpserver 部署

读了一下官方文档: <https://docs.jumpserver.org/zh/v3/installation/setup_linux_standalone/online_install/>

ps: 幸好我进去github看了一下, 发现文档里提供的release链接已经没了, 之前踩坑太多已经学精了哈哈哈哈.

