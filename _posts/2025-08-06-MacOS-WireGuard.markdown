---
layout: post
title:  MacOS(M3) 配置 WireGuard
date:   2025-08-06
description: You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. # Add post description (optional)
img: .png # Add image post (optional)
tags: [Blog]
author: # Add name author (optional)
---
# 本讲内容

配置WireGuard

## 下载安装

美区账号直接在App Store安装, 或者brew: 

```
sudo brew install wireguard-tools
```

参考官网 https://www.wireguard.com/install/

## 配置

```
# 创建文件夹 (以管理员身份)
sudo mkdir /usr/local/etc/wireguard

# 设置文件夹权限 (以管理员身份)
sudo chmod 777  /usr/local/etc/wireguard

# 切入到创建的目录下
cd /etc/wireguard

# 生成公钥与私钥
wg genkey | tee privatekey | wg pubkey > publickey

# 创建虚拟网卡配置文件
touch wg0.conf

# 编辑虚拟网卡配置文件内容
vi wg0.conf
```

在wg0.conf文件中写入如下内容，需要注意的是，需要自己修改文件内容，保持可用。

```
[Interface]
Address = 10.130.222.3/32
PrivateKey = 客户端的私钥（刚刚生成的privatekey文件的内容）
DNS = 10.130.222.1

[Peer]
PublicKey = 服务器的公钥(需要去服务器查看服务器的公钥)
Endpoint = 服务器的物理ip地址:41821
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 21

```

我卡在这一步,因为公网ip要买...

## 服务器参数配置

除了客户端需要修改之后，还要将服务器网卡禁用，再修改服务器端的配置文件，在文件 尾部加入当前客户端的信息，下面是示例文件。

```
[Peer]
PublicKey = 服务器的公钥（需要到服务里查看公钥）
AllowedIPs = 10.200.200.3/32

```

## Mac OS下启动客户端的网卡

```
# 启动网卡
wg-quick up wg0
```

如果服务器配置正确，就可以正常上网了（你也可以wg命令来查看当前网卡连接状态）。

```
# 其他命令
wg-quick down wg0 #停止服务
wg-quick strip wg0 #查看配置
wg-quick #查看所有支持的命令
```