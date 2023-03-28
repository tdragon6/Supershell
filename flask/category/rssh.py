'''
    连接rssh服务器类
'''

from flask import current_app
import paramiko


class rssh_client:
    def __init__(self, key_file, rssh_ip, rssh_port):
        '''
            初始化rssh客户端
        '''
        self.private = paramiko.RSAKey.from_private_key_file(key_file)
        self.rssh_ip = rssh_ip
        self.rssh_port = rssh_port


    def connect_rssh(self):
        '''
            获取rssh连接
        '''
        self.client = paramiko.SSHClient()
        self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self.client.connect(hostname=self.rssh_ip, port=self.rssh_port, pkey=self.private)


    def __enter__(self):
        '''
            进入上下文管理器
        '''
        return self


    def __exit__(self, exc_type, exc_val, exc_tb):
        '''
            退出上下文管理器，回收已经打开的连接
        '''
        self.client.close()


    def exec_command(self, cmd):
        '''
            执行命令方法
        '''
        try:
            stdin, stdout, stderr = self.client.exec_command(cmd)
            cmd_result = stdout.read().decode('utf-8').strip()
            current_app.logger.info(cmd + ': ' + cmd_result)
            return {'stat': 'success', 'result': cmd_result}
        except Exception as e:
            current_app.logger.exception(e)
            return {'stat': 'failed', 'result': str(e)}