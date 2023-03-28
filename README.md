<h1 align="center">
  <br>
  <img src="https://jsd.onmicrosoft.cn/gh/tdragon6/Supershell-oss@main/logo.svg" width="200px" alt="Supershell">
</h1>

<h4 align="center">Supershell是一个通过WEB服务访问的C2远控平台，通过建立反向SSH隧道，获取完全交互式Shell，支持多平台架构Payload</h4>


<p align="center">
	<img alt="GitHub" src="https://img.shields.io/github/license/tdragon6/Supershell">
	<img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/tdragon6/Supershell">
	<img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/tdragon6/Supershell">
	<img alt="GitHub all releases" src="https://img.shields.io/github/downloads/tdragon6/Supershell/total">
	<img alt="Bitbucket open issues" src="https://img.shields.io/github/issues/tdragon6/Supershell">
</p>
      
<p align="center">
  <a href="#功能特点">功能特点</a> •
  <a href="#支持平台">支持平台</a> •
  <a href="#架构图">架构图</a> •
  <a href="#快速构建">快速构建</a> •
  <a href="#使用文档">使用文档</a> •
  <a href="#部分功能演示">部分功能演示</a> •
  <a href="#免责声明">免责声明</a> •
  <a href="#致谢">致谢</a>
</p>

<p align="center">
  <a href="https://github.com/tdragon6/Supershell/blob/main/README.md">简体中文</a> •
  <a href="https://github.com/tdragon6/Supershell/blob/main/README_EN.md">English</a> 
</p>

---

在常规渗透测试和比赛中，反弹shell时是否在为 `Ctrl + C` 意外关闭Shell而发愁？是否在为执行一些交互式脚本而苦恼？常规的反弹Shell往往只是命令的执行和结果的响应，这样的Shell通常缺少便利的功能，例如完全交互式访问、TAB补全、交互程序的执行和历史记录等功能。

Supershell是一个集成了reverse_ssh服务的WEB管理平台，使用docker一键部署（[快速构建](#快速构建)），支持团队协作进行C2远程控制，通过在目标主机上建立反向SSH隧道，获取真正的完全交互式Shell，同时支持多平台架构的客户端Payload，客户端Payload的大小为几MB，可以理解为在目标主机上部署了一个几MB的ssh服务器，然后获取了一个ssh shell；Supershell集成了客户端管理、客户端Payload生成、交互式Shell、文件管理、文件服务器、内存注入、安装服务、迁移guid、本地原生sftp命令传输文件、本地ssh隧道端口转发和备忘录等功能。

同时Supershell允许您将获取到的Shell分享给您的伙伴使用，Shell均通过浏览器页面嵌入，共享Shell采用单独的鉴权方式，无需给您的伙伴提供管理平台的身份认证凭证。

## 功能特点

* 支持团队并发协作，一个浏览器使用所有功能
* 支持多种系统架构的反弹Shell客户端Payload，集成压缩和免杀
* 支持客户端断线自动重连
* 支持全平台完全交互式Shell，支持在浏览器中使用Shell，支持分享Shell
* 支持回连客户端列表管理
* 内置文件服务器
* 支持文件管理
* 支持内存注入，即文件不落地执行木马（内存马）
* 支持Windows安装反弹Shell服务和Linux尝试迁移uid与gid

## 支持平台

支持生成的客户端Payload系统架构：

| **android** | **darwin** | **dragonfly** | **freebsd** | **illumos** | **linux** | **netbsd** | **openbsd** | **solaris** | **windows** |
|:-----------:|:----------:|:-------------:|:-----------:|:-----------:|:---------:|:----------:|:-----------:|:-----------:|:-----------:|
| amd64       | amd64      | amd64         | 386         | amd64       | 386       | 386        | 386         | amd64       | 386         |
| arm64       | arm64      |               | amd64       |             | amd64     | amd64      | amd64       |             | amd64       |
|             |            |               | arm         |             | arm       | arm        | arm         |             | dll         |
|             |            |               | arm64       |             | arm64     | arm64      | arm64       |             |             |
|             |            |               |             |             | ppc64le   |            | mips64      |             |             |
|             |            |               |             |             | s390x     |            |             |             |             |
|             |            |               |             |             | so        |            |             |             |             |

其中以下系统架构不支持加壳压缩：

```
freebsd/*
android/arm64
linux/s390x
linux/so
netbsd/*
openbsd/*
```

## 架构图

<h1 align="center">
  <img src="https://jsd.onmicrosoft.cn/gh/tdragon6/Supershell-oss@main/frame/frame-zh-cn.png" alt="Frame Image">
</h1>

## 快速构建

1、拉取源码，进入项目目录

```
git clone https://github.com/tdragon6/Supershell.git
```

```
cd Supershell
```

2、修改配置文件config.py，其中登录密码`pwd`、jwt密钥`global_salt`、共享密码`share_pwd`必须修改，注意Python语法：`String`类型和`Int`类型，密码为明文密码的32位md5值

```
# web登录和会话配置信息  
user = 'tdragon6'  
pwd = 'b7671f125bb2ed21d0476a00cfaa9ed6' # 明文密码 tdragon6 的md5  
  
# jwt加密盐  
global_salt = 'Be sure to modify this key' # 必须修改，不然可以伪造jwt token直接登录  
  
# 会话保持时间，单位：小时  
expire = 48  
  
  
# 共享远控shell的共享密码  
share_pwd = 'b7671f125bb2ed21d0476a00cfaa9ed6' # 明文密码 tdragon6 的md5  
  
# 共享shell会话保持时间，单位：小时  
share_expire = 24
```

3、确保8888和3232端口没有占用（若占用，请修改docker-compose.yml文件nginx和rssh服务对外暴露端口），执行docker-compose命令

```
docker-compose up -d
```

4、访问管理平台，使用config.py配置的 `user` / `pwd` 登录

```
http://公网IP:8888
```

## 使用文档

### 中文文档

[中文文档](https://github.com/tdragon6/Supershell/wiki)

### 建议必读

使用前阅读以下内容可以在使用过程中避免某些错误，或在您碰到常见错误的时候快速定位解决方案。

[快速使用](https://github.com/tdragon6/Supershell/wiki/快速使用) • [注意事项](https://github.com/tdragon6/Supershell/wiki/注意事项) • [FAQs](https://github.com/tdragon6/Supershell/wiki/FAQs)

## 部分功能演示

**声明**：功能演示时的受害者主机采用[谜团靶场](https://mituan.zone/)，部署Supershell服务的VPS主机为临时申请使用，请不要尝试对演示中暴露的任何IP进行攻击，该VPS主机之前与之后的任何行为与本作者无关。

### 客户端生成

<h1 align="center">
  <img src="https://jsd.onmicrosoft.cn/gh/tdragon6/Supershell-oss@main/demo/compile.gif" alt="compile">
</h1>

### Linux 反弹Shell

<h1 align="center">
  <img src="https://jsd.onmicrosoft.cn/gh/tdragon6/Supershell-oss@main/demo/linux_shell.gif" alt="linux_shell">
</h1>

### Windows 反弹Shell

<h1 align="center">
  <img src="https://jsd.onmicrosoft.cn/gh/tdragon6/Supershell-oss@main/demo/win_shell.gif" alt="windows_shell">
</h1>

### 文件管理

<h1 align="center">
  <img src="https://jsd.onmicrosoft.cn/gh/tdragon6/Supershell-oss@main/demo/file_manager.gif" alt="file_manager">
</h1>

### 内存注入

靶机不支持TCP反弹，这里使用本机演示，注入msf内存马
<h1 align="center">
  <img src="https://jsd.onmicrosoft.cn/gh/tdragon6/Supershell-oss@main/demo/memfd.gif" alt="memfd">
</h1>

## 免责声明

本工具仅面向合法授权的安全测试，在使用本工具前，您应确保该行为符合当地的法律法规，并且已经取得了足够的授权。

若您在使用本工具的过程中存在任何非法行为，您需自行承担相应后果，作者将不承担任何法律及连带责任。

因本工具目前为作者一人开发，难免会存在功能、性能和安全方面的漏洞，由此产生的任何问题作者将不承担任何责任。

在使用本工具前，请您务必审慎阅读、充分理解各条款内容、免责声明、使用文档和LICENSE。除非您已充分阅读、完全理解并接受本协议所有条款，否则，请您不要使用本工具。您的使用行为或者您以其他任何明示或者默示方式表示接受本协议的，即视为您已阅读并同意本协议的约束。

## 致谢

:heart:  感谢 [NHAS](https://github.com/NHAS) 对反向ssh隧道提供的指导和帮助

## LICENSE

Supershell使用 [MIT License](https://github.com/tdragon6/Supershell/blob/main/LICENSE)

查看Supershell集成和引用的第三方开源软件许可证 [thirdparty_license](https://github.com/tdragon6/Supershell/tree/main/thirdparty_license)