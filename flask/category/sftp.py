'''
    连接目标sftp类
'''

from flask import current_app
import paramiko
import stat
import time


class sftp_client:
    def __init__(self, key_file, sessid, rssh_ip, rssh_port):
        '''
            初始化目标sftp客户端
        '''
        self.private = paramiko.RSAKey.from_private_key_file(key_file)
        self.sessid = sessid
        self.rssh_ip = rssh_ip
        self.rssh_port = rssh_port


    def connect_sftp(self):
        '''
            获取sftp连接
        '''
        self.client = paramiko.SSHClient()
        self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self.client.connect(hostname=self.rssh_ip, port=self.rssh_port, pkey=self.private)
        self.transport = self.client.get_transport()
        self.tunnel = self.transport.open_channel('direct-tcpip', (self.sessid, 0), ('', 0))
        self.target = paramiko.SSHClient()
        self.target.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self.target.connect(hostname=self.rssh_ip, port=self.rssh_port, pkey=self.private, sock=self.tunnel)
        self.sftp_tunnel = self.target.get_transport()
        self.sftp_target = paramiko.SFTPClient.from_transport(self.sftp_tunnel)


    def close_all(self):
        '''
            关闭所有打开的paramiko连接
        '''
        connect_list = [
            'self.sftp_target',
            'self.sftp_tunnel',
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


    def get_file_type(self, st_mode):
        '''
            判断path是目录还是文件
        '''
        if stat.S_ISDIR(st_mode):
            return 'folder'
        else:
            return 'file'


    def judge_path_exist(self, path):
        '''
            判断指定path是否存在
        '''
        try:
            self.sftp_target.stat(path)
            return True
        except:
            return False


    def get_default_path(self):
        '''
            获取默认路径
        '''
        try:
            pwd = self.sftp_target.normalize('.')
            return {'stat': 'success', 'result': pwd}
        except Exception as e:
            current_app.logger.exception(e)
            return {'stat': 'failed', 'result': str(e)}


    def get_sub_folder(self, path):
        '''
            获取指定目录下的全部子目录
        '''
        try:
            folder_list = []
            files_obj = self.sftp_target.listdir_attr(path)
            for file_obj in files_obj:
                if self.get_file_type(file_obj.st_mode) == 'folder':
                    folder_list.append(file_obj.filename)
            return {'stat': 'success', 'result': folder_list}
        except Exception as e:
            current_app.logger.exception(e)
            return {'stat': 'failed', 'result': str(e)}


    def get_files_list(self, path):
        '''
            获取指定路径的所有文件和目录
        '''
        try:
            files_list = []
            files_obj = self.sftp_target.listdir_attr(path)
            for file_obj in files_obj:
                tmp_path = path + '/' + file_obj.filename
                file_path = ''
                # 去除多余的斜杠，注意这里不能用normalize，因为一旦文件量大的时候会爆炸
                for fp in tmp_path.split('/'):
                    if fp != '':
                        file_path = file_path + '/' + fp
                file_type = self.get_file_type(file_obj.st_mode)
                file_mode = oct(file_obj.st_mode)[-4:]
                file_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(file_obj.st_mtime))
                files_list.append({"file_path": file_path,
                                   "file_type": file_type,
                                   "file_name": file_obj.filename,
                                   "file_size": file_obj.st_size,
                                   "file_mode": file_mode,
                                   "file_time": file_time})
            return {'stat': 'success', 'result': files_list}
        except Exception as e:
            current_app.logger.exception(e)
            return {'stat': 'failed', 'result': str(e)}


    def mkdir(self, path):
        '''
            新建目录
        '''
        try:
            self.sftp_target.mkdir(path)
            return {'stat': 'success', 'result': path}
        except Exception as e:
            current_app.logger.exception(e)
            return {'stat': 'failed', 'result': str(e)}


    def renamePath(self, ori_path, new_path):
        '''
            重命名
        '''
        try:
            self.sftp_target.rename(ori_path, new_path)
            return {'stat': 'success', 'result': new_path}
        except Exception as e:
            current_app.logger.exception(e)
            return {'stat': 'failed', 'result': str(e)}


    def deleteFolder(self, path):
        '''
            删除目录
        '''
        try:
            self.sftp_target.rmdir(path)
            return {'stat': 'success', 'result': path}
        except Exception as e:
            current_app.logger.exception(e)
            return {'stat': 'failed', 'result': str(e)}


    def deleteFile(self, path):
        '''
            删除文件
        '''
        try:
            self.sftp_target.remove(path)
            return {'stat': 'success', 'result': path}
        except Exception as e:
            current_app.logger.exception(e)
            return {'stat': 'failed', 'result': str(e)}


    def readFile(self, path):
        '''
            读取文件
        '''
        try:
            file_content = ''
            with self.sftp_target.open(path, 'r') as f:
                for line in f.readlines():
                    file_content = file_content + line
            return {'stat': 'success', 'result': file_content}
        except Exception as e:
            current_app.logger.exception(e)
            return {'stat': 'failed', 'result': str(e)}


    def writeFile(self, path, content):
        '''
            写入文件
        '''
        try:
            with self.sftp_target.open(path, 'w') as f:
                f.write(content)
            return {'stat': 'success', 'result': path}
        except Exception as e:
            current_app.logger.exception(e)
            return {'stat': 'failed', 'result': str(e)}


    def uploadFile(self, local_path, target_path):
        '''
            上传文件
        '''
        try:
            self.sftp_target.put(local_path, target_path)
            return {'stat': 'success', 'result': target_path}
        except Exception as e:
            current_app.logger.exception(e)
            return {'stat': 'failed', 'result': str(e)}


    def uploadFileObj(self, file_obj, target_path):
        '''
            上传文件对象
        '''
        try:
            self.sftp_target.putfo(file_obj, target_path)
            return {'stat': 'success', 'result': target_path}
        except Exception as e:
            current_app.logger.exception(e)
            return {'stat': 'failed', 'result': str(e)}