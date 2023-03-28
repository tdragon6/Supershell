'''
    一些固定的全局变量配置
'''


# 连接rssh服务器的ip，不是rssh服务的开放ip
rssh_ip = 'rssh'

# rssh服务器的端口
rssh_port = 3232

# redis的ip
redis_ip = 'redis'

# redis的端口
redis_port = 6379

# redis的密码
redis_password = 'tdragon6'

# 连接rssh服务器的私钥
key_file = '/volume/key/id_rsa'

# rssh服务器的公钥
public_key_file = '/volume/authorized_keys'

# windows待检测是否存在的磁盘列表
win_disk = ['/C:', '/D:', '/E:', '/F:', '/G:', '/X:', '/Y:', 'Z:']

# 常用文件路径
server_files_path = '/downloads'

# 服务器文件下载Chunk Size
server_files_chunk_size = 20 * 1024 * 1024

# 已生成的客户端记录json文件路径
compiled_clients_file_path = '/cache'

# 备忘录路径
notes_path = '/volume/notes.md'

# 日志路径
log_path = '/volume/log'

# 日志最后几行
log_last_lines = 3000

# Supershell版本信息json文件路径
supershell_version_json_path = '/volume/version.json'

# 客户端支持生成的系统架构数据列表
support_os_arch_list = ['android/amd64',
                        'android/arm64',
                        'darwin/amd64',
                        'darwin/arm64',
                        'dragonfly/amd64',
                        'freebsd/386',
                        'freebsd/amd64',
                        'freebsd/arm',
                        'freebsd/arm64',
                        'illumos/amd64',
                        'linux/386',
                        'linux/amd64',
                        'linux/arm',
                        'linux/arm64',
                        'linux/ppc64le',
                        'linux/s390x',
                        'linux/so',
                        'netbsd/386',
                        'netbsd/amd64',
                        'netbsd/arm',
                        'netbsd/arm64',
                        'openbsd/386',
                        'openbsd/amd64',
                        'openbsd/arm',
                        'openbsd/arm64',
                        'openbsd/mips64',
                        'solaris/amd64',
                        'windows/386',
                        'windows/amd64',
                        'windows/dll']

# 全部go支持的客户端支持生成的系统架构数据列表
all_go_support_os_arch_list = ['aix/ppc64',
                        'android/386',
                        'android/amd64',
                        'android/arm',
                        'android/arm64',
                        'darwin/amd64',
                        'darwin/arm64',
                        'dragonfly/amd64',
                        'freebsd/386',
                        'freebsd/amd64',
                        'freebsd/arm',
                        'freebsd/arm64',
                        'freebsd/riscv64',
                        'illumos/amd64',
                        'ios/amd64',
                        'ios/arm64',
                        'js/wasm',
                        'linux/386',
                        'linux/amd64',
                        'linux/arm',
                        'linux/arm64',
                        'linux/loong64',
                        'linux/mips',
                        'linux/mips64',
                        'linux/mips64le',
                        'linux/mipsle',
                        'linux/ppc64',
                        'linux/ppc64le',
                        'linux/riscv64',
                        'linux/s390x',
                        'netbsd/386',
                        'netbsd/amd64',
                        'netbsd/arm',
                        'netbsd/arm64',
                        'openbsd/386',
                        'openbsd/amd64',
                        'openbsd/arm',
                        'openbsd/arm64',
                        'openbsd/mips64',
                        'plan9/386',
                        'plan9/amd64',
                        'plan9/arm',
                        'solaris/amd64',
                        'windows/386',
                        'windows/amd64',
                        'windows/arm',
                        'windows/arm64']
