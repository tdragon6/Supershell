'''
    连接目标ssh类
'''

from flask import current_app
import paramiko


class ssh_client:
    def __init__(self, key_file, sessid, rssh_ip, rssh_port):
        '''
            初始化目标ssh客户端
        '''
        self.private = paramiko.RSAKey.from_private_key_file(key_file)
        self.sessid = sessid
        self.rssh_ip = rssh_ip
        self.rssh_port = rssh_port


    def connect_ssh(self):
        '''
            获取ssh连接
        '''
        self.client = paramiko.SSHClient()
        self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self.client.connect(hostname=self.rssh_ip, port=self.rssh_port, pkey=self.private)
        self.transport = self.client.get_transport()
        self.tunnel = self.transport.open_channel('direct-tcpip', (self.sessid, 0), ('', 0))
        self.target = paramiko.SSHClient()
        self.target.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self.target.connect(hostname=self.rssh_ip, port=self.rssh_port, pkey=self.private, sock=self.tunnel)
        self.target_session = self.target.get_transport().open_session()


    def close_all(self):
        '''
            关闭所有打开的paramiko连接
        '''
        connect_list = [
            'self.target_session'
            'self.target',
            'self.tunnel',
            'self.transport',
            'self.client'
        ]
        for connect in connect_list:
            try:
                eval(connect).close()
            except:
                pass


    def __enter__(self):
        '''
            进入上下文管理器
        '''
        return self


    def __exit__(self, exc_type, exc_val, exc_tb):
        '''
            退出上下文管理器，回收已经打开的连接
        '''
        self.close_all()


    def exec_command(self, cmd):
        '''
            执行命令方法
        '''
        try:
            stdin, stdout, stderr = self.target.exec_command(cmd)
            cmd_result = stdout.read().decode('utf-8').strip()
            current_app.logger.info(cmd + ': ' + cmd_result)
            return {'stat': 'success', 'result': cmd_result}
        except Exception as e:
            current_app.logger.exception(e)
            return {'stat': 'failed', 'result': str(e)}


    def exec_subsystem(self, sub_str):
        '''
            执行子系统方法
        '''
        try:
            self.target_session.invoke_subsystem(sub_str)
            return {'stat': 'success', 'result': '自行判断是否成功'}
        except Exception as e:
            current_app.logger.exception(e)
            return {'stat': 'failed', 'result': '当前会话不支持此功能'}