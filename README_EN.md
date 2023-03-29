<h1 align="center">
  <br>
  <img src="https://jsd.onmicrosoft.cn/gh/tdragon6/Supershell-oss@main/logo.svg" width="200px" alt="Supershell">
</h1>

<h4 align="center">Supershell is a C2 remote control platform accessed through WEB services. By establishing a reverse SSH tunnel, a fully interactive shell can be obtained, and it supports multi-platform architecture Payload</h4>


<p align="center">
	<img alt="GitHub" src="https://img.shields.io/github/license/tdragon6/Supershell">
	<img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/tdragon6/Supershell">
	<img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/tdragon6/Supershell">
	<img alt="GitHub all releases" src="https://img.shields.io/github/downloads/tdragon6/Supershell/total">
	<img alt="Bitbucket open issues" src="https://img.shields.io/github/issues/tdragon6/Supershell">
</p>
      
<p align="center">
  <a href="#features">Features</a> •
  <a href="#platform">Platform</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#build">Build</a> •
  <a href="#document">Document</a> •
  <a href="#demo">Demo</a> •
  <a href="#disclaimer">Disclaimer</a> •
  <a href="#thanks">Thanks</a>
</p>

<p align="center">
  <a href="https://github.com/tdragon6/Supershell/blob/main/README.md">简体中文</a> •
  <a href="https://github.com/tdragon6/Supershell/blob/main/README_EN.md">English</a> 
</p>

---
<h6 align="center">I'm sorry, because my native language is not English, currently the documents and platform programs are not available in English, temporarily please use Google Translate to translate the webpage</h6>

In regular penetration tests and competitions, are you worried about `Ctrl + C` accidentally closing the shell when you bounce back? Are you struggling to execute some interactive scripts? Conventional rebound shells are often just the execution of commands and the response of results. Such shells usually lack convenient functions, such as full interactive access, TAB completion, interactive program execution and history records.

Supershell is a WEB management platform that integrates the reverse_ssh service. It uses docker one-click deployment ([Build](#Build)) to support team collaboration for C2 remote control. By establishing a reverse SSH tunnel on the target host, get real The fully interactive Shell supports multi-platform client Payload at the same time. The size of the client Payload is a few MB, which can be understood as deploying a few MB ssh server on the target host, and then obtaining an ssh shell; Supershell integration Provides functions such as client management, client Payload generation, interactive shell, file management, file server, memory injection, installation service, migration guid, local native sftp command file transfer, local ssh tunnel port forwarding and memo.

At the same time, Supershell allows you to share the obtained Shell with your partners. The Shells are all embedded in the browser page. The shared Shell adopts a separate authentication method, and there is no need to provide your partners with the identity authentication credentials of the management platform.

## Features

* Support concurrent team collaboration, use all functions in one browser
* Rebound Shell client Payload that supports multiple system architectures, integrated compression and anti-virus
* Support client disconnection automatic reconnection
* Support fully interactive shells on all platforms, support using shells in browsers, and support sharing shells
* Support back connection client list management
* Built-in file server
* Support file management
* Support memory injection, that is, the file does not land and execute Trojan horse (memory horse)
* Support Windows to install reverse Shell service and Linux to try to migrate uid and gid

## Platform

Support generated client Payload system architecture:

| **android** | **darwin** | **dragonfly** | **freebsd** | **illumos** | **linux** | **netbsd** | **openbsd** | **solaris** | **windows** |
|:-----------:|:----------:|:-------------:|:-----------:|:-----------:|:---------:|:----------:|:-----------:|:-----------:|:-----------:|
| amd64       | amd64      | amd64         | 386         | amd64       | 386       | 386        | 386         | amd64       | 386         |
| arm64       | arm64      |               | amd64       |             | amd64     | amd64      | amd64       |             | amd64       |
|             |            |               | arm         |             | arm       | arm        | arm         |             | dll         |
|             |            |               | arm64       |             | arm64     | arm64      | arm64       |             |             |
|             |            |               |             |             | ppc64le   |            | mips64      |             |             |
|             |            |               |             |             | s390x     |            |             |             |             |
|             |            |               |             |             | so        |            |             |             |             |

The following system architectures do not support packer compression:

```
freebsd/*
android/arm64
linux/s390x
linux/so
netbsd/*
openbsd/*
```

## Architecture

<h1 align="center">
  <img src="https://jsd.onmicrosoft.cn/gh/tdragon6/Supershell-oss@main/frame/frame-en.png" alt="Frame Image">
</h1>

## Build

1、Download the latest release source code, unzip it and enter the project directory

```
wget https://github.com/tdragon6/Supershell/releases/download/latest/Supershell.tar.gz
```

```
tar -zxvf Supershell.tar.gz
```

```
cd Supershell
```

2、Modify the configuration file config.py, where the login password `pwd`, the jwt key `global_salt`, and the shared password `share_pwd` must be modified. Pay attention to the Python syntax: `String` type and `Int` type, and the password is a 32-bit plaintext password md5 value

```
# web login and session configuration information
user = 'tdragon6'  
pwd = 'b7671f125bb2ed21d0476a00cfaa9ed6' # md5 of plaintext password tdragon6  
  
# jwt encryption salt
global_salt = 'Be sure to modify this key' # It must be modified, otherwise you can forge the jwt token to log in directly  
  
# Session hold time, unit: hour  
expire = 48  
  
  
# Share the shared password of the remote control shell  
share_pwd = 'b7671f125bb2ed21d0476a00cfaa9ed6' # 明文密码 tdragon6 的md5  
  
# Shared shell session hold time, unit: hour
share_expire = 24
```

3、Make sure that ports 8888 and 3232 are not occupied (if they are occupied, please modify the docker-compose.yml file nginx and rssh services to expose ports), and execute the docker-compose command

```
docker-compose up -d
```

4、Access the management platform and log in with `user` / `pwd` configured in config.py

```
http://公网IP:8888
```

## Document

### Chinese document

[Chinese document](https://github.com/tdragon6/Supershell/wiki)

### recommended reading

Read the following content before use to avoid some errors during use, or quickly locate solutions when you encounter common errors.

[Qucikly Use](https://github.com/tdragon6/Supershell/wiki/快速使用) • [Attention](https://github.com/tdragon6/Supershell/wiki/注意事项) • [FAQs](https://github.com/tdragon6/Supershell/wiki/FAQs)

## Demo

**Statement**: The victim host in the function demonstration uses [MiTuan Shooting Range](https://mituan.zone/), the VPS host where the Supershell service is deployed is for temporary application, please do not try to attack any IP exposed in the demonstration The author has nothing to do with any behavior of the VPS host before and after the attack.

### Generate Client

<h1 align="center">
  <img src="https://jsd.onmicrosoft.cn/gh/tdragon6/Supershell-oss@main/demo/compile.gif" alt="compile">
</h1>

### Linux Reverse Shell

<h1 align="center">
  <img src="https://jsd.onmicrosoft.cn/gh/tdragon6/Supershell-oss@main/demo/linux_shell.gif" alt="linux_shell">
</h1>

### Windows Reverse Shell

<h1 align="center">
  <img src="https://jsd.onmicrosoft.cn/gh/tdragon6/Supershell-oss@main/demo/win_shell.gif" alt="windows_shell">
</h1>

### File Management

<h1 align="center">
  <img src="https://jsd.onmicrosoft.cn/gh/tdragon6/Supershell-oss@main/demo/file_manager.gif" alt="file_manager">
</h1>

### Memory Injection

The shooting range does not support TCP bounce, here we use the local demonstration, inject msf memory horse
<h1 align="center">
  <img src="https://jsd.onmicrosoft.cn/gh/tdragon6/Supershell-oss@main/demo/memfd.gif" alt="memfd">
</h1>

## Disclaimer

This tool is only for legally authorized security testing. Before using this tool, you should ensure that the behavior complies with local laws and regulations, and you have obtained sufficient authorization.

If you have any illegal acts in the process of using this tool, you shall bear the corresponding consequences yourself, and the author will not bear any legal and joint and several liabilities.

Since this tool is currently being developed by the author alone, it is inevitable that there will be loopholes in function, performance and security, and the author will not bear any responsibility for any problems arising therefrom.

Before using this tool, please be sure to carefully read and fully understand the content of each clause, disclaimer, usage documentation and LICENSE. Unless you have fully read, fully understood and accepted all the terms of this agreement, please do not use this tool. Your use behavior or your acceptance of this agreement in any other express or implied way shall be deemed to have read and agreed to be bound by this agreement.

## Thanks

:heart:  Thanks to [NHAS](https://github.com/NHAS) for guidance and help on reverse ssh tunneling

## LICENSE

Supershell is distributed under [MIT License](https://github.com/tdragon6/Supershell/blob/main/LICENSE)

View Supershell integrations and referenced 3rd party open source software licenses [thirdparty_license](https://github.com/tdragon6/Supershell/tree/main/thirdparty_license)