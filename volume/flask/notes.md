## 本地功能

若需使用本地功能，本地需具备 `openssh` 环境，且sftp支持 `-J` 参数，一般此条件为 `openssh >= 8.0` ，同时本地需要Supershell生成的私钥 `id_rsa` 。

### sftp命令

`sftp -J <VPS IP>:3232 <sessid>`

### ssh隧道端口转发

* 本地端口转发
* 远程端口转发
* 动态端口转发

以上三种端口转发只需将正常ssh端口转发命令中的host变更为 `-J <VPS IP>:3232 <sessid>`即可

举例：远程端口转发

**对目标主机A端口B的访问转为对主机C端口D的访问：**

`ssh -R B:C:D username@A`

**若目标主机A是您控制的主机，则转发命令变为：**

`ssh -R B:C:D -J <VPS IP>:3232 <sessid>`