'''
    会话文件管理页方法
'''

from flask import current_app
from const import win_disk
from category.sftp import sftp_client
from category.redisclient import RedisClient
import os
import traceback


def get_default_path(key_file, sessid, rssh_ip, rssh_port):
    '''
        获取文件管理页面默认路径
    '''
    try:
        with sftp_client(key_file, sessid, rssh_ip, rssh_port) as sftp_target:
            try:
                sftp_target.connect_sftp()
            except Exception as e:
                current_app.logger.exception(e)
                return {'stat': 'failed', 'result': 'Sftp Connect Error'}
            default_path = sftp_target.get_default_path()
            return default_path
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': 'Key File Error'}


def get_root_folder(key_file, sessid, rssh_ip, rssh_port):
    '''
        获取文件管理页面根目录
    '''
    client = RedisClient(0)
    os_str = client.conn.hget(sessid, 'os').decode()
    if os_str == 'windows':
        try:
            with sftp_client(key_file, sessid, rssh_ip, rssh_port) as sftp_target:
                try:
                    sftp_target.connect_sftp()
                except Exception as e:
                    current_app.logger.exception(e)
                    return {'stat': 'failed', 'result': 'Sftp Connect Error'}
                root_folder = []
                for d in win_disk:
                    if sftp_target.judge_path_exist(d):
                        root_folder.append(d)
                return {'stat': 'success', 'result': root_folder}
        except Exception as e:
            current_app.logger.exception(e)
            return {'stat': 'failed', 'result': 'Key File Error'}
    else:
        return {'stat': 'success', 'result': ['/']}


def get_sub_folder(key_file, sessid, rssh_ip, rssh_port, path):
    '''
        获取指定目录下的全部子目录
    '''
    try:
        with sftp_client(key_file, sessid, rssh_ip, rssh_port) as sftp_target:
            try:
                sftp_target.connect_sftp()
            except Exception as e:
                current_app.logger.exception(e)
                return {'stat': 'failed', 'result': 'Sftp Connect Error'}
            folder_list = sftp_target.get_sub_folder(path)
            return folder_list
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': 'Key File Error'}


def get_files_list(key_file, sessid, rssh_ip, rssh_port, path):
    '''
        获取指定路径的文件和目录列表
    '''
    try:
        with sftp_client(key_file, sessid, rssh_ip, rssh_port) as sftp_target:
            try:
                sftp_target.connect_sftp()
            except Exception as e:
                current_app.logger.exception(e)
                return {'stat': 'failed', 'result': 'Sftp Connect Error'}
            files_list = sftp_target.get_files_list(path)
            return files_list
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': 'Key File Error'}


def mkdir(key_file, sessid, rssh_ip, rssh_port, path):
    '''
        新建目录
    '''
    try:
        with sftp_client(key_file, sessid, rssh_ip, rssh_port) as sftp_target:
            try:
                sftp_target.connect_sftp()
            except Exception as e:
                current_app.logger.exception(e)
                return {'stat': 'failed', 'result': 'Sftp Connect Error'}
            if sftp_target.judge_path_exist(path):
                return {'stat': 'failed', 'result': 'Target Path Exist'}
            mkdir_result = sftp_target.mkdir(path)
            return mkdir_result
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': 'Key File Error'}


def renamePath(key_file, sessid, rssh_ip, rssh_port, ori_path, new_path):
    '''
        重命名目录
    '''
    try:
        with sftp_client(key_file, sessid, rssh_ip, rssh_port) as sftp_target:
            try:
                sftp_target.connect_sftp()
            except Exception as e:
                current_app.logger.exception(e)
                return {'stat': 'failed', 'result': 'Sftp Connect Error'}
            if sftp_target.judge_path_exist(new_path):
                return {'stat': 'failed', 'result': 'Target Path Exist'}
            rename_result = sftp_target.renamePath(ori_path, new_path)
            return rename_result
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': 'Key File Error'}


def deletePath(key_file, sessid, rssh_ip, rssh_port, file_type, path):
    '''
        删除目录或文件
    '''
    try:
        with sftp_client(key_file, sessid, rssh_ip, rssh_port) as sftp_target:
            try:
                sftp_target.connect_sftp()
            except Exception as e:
                current_app.logger.exception(e)
                return {'stat': 'failed', 'result': 'Sftp Connect Error'}
            if file_type == 'folder':
                delete_result = sftp_target.deleteFolder(path)
            else:
                delete_result = sftp_target.deleteFile(path)
            return delete_result
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': 'Key File Error'}


def readFile(key_file, sessid, rssh_ip, rssh_port, path):
    '''
        读取文件
    '''
    try:
        with sftp_client(key_file, sessid, rssh_ip, rssh_port) as sftp_target:
            try:
                sftp_target.connect_sftp()
            except Exception as e:
                current_app.logger.exception(e)
                return {'stat': 'failed', 'result': 'Sftp Connect Error'}
            read_result = sftp_target.readFile(path)
            return read_result
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': 'Key File Error'}


def writeFile(key_file, sessid, rssh_ip, rssh_port, path, content, overwrite):
    '''
        写入文件
    '''
    try:
        with sftp_client(key_file, sessid, rssh_ip, rssh_port) as sftp_target:
            try:
                sftp_target.connect_sftp()
            except Exception as e:
                current_app.logger.exception(e)
                return {'stat': 'failed', 'result': 'Sftp Connect Error'}
            if overwrite == 'false':
                if sftp_target.judge_path_exist(path):
                    return {'stat': 'failed', 'result': 'Target Path Exist'}
            write_result = sftp_target.writeFile(path, content)
            return write_result
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': 'Key File Error'}


def downloadFile(key_file, sessid, rssh_ip, rssh_port, path, stream_size):
    '''
        下载文件
    '''
    try:
        with sftp_client(key_file, sessid, rssh_ip, rssh_port) as sftp_target:
            sftp_target.connect_sftp()
            with sftp_target.sftp_target.open(path, 'r') as f:
                while 1:
                    data = f.read(stream_size)
                    if not data:
                        break
                    yield data
    except Exception as e:
        print(traceback.format_exc())


def uploadServerCheck(key_file, sessid, rssh_ip, rssh_port, local_path, target_path):
    '''
        从常用文件上传文件检查
    '''
    try:
        if os.stat(local_path).st_size >= current_app.config['MAX_UPLOAD_SIZE']:
            return {'stat': 'failed', 'result': 'File size exceeds limit'}
        with sftp_client(key_file, sessid, rssh_ip, rssh_port) as sftp_target:
            try:
                sftp_target.connect_sftp()
            except Exception as e:
                current_app.logger.exception(e)
                return {'stat': 'failed', 'result': 'Sftp Connect Error'}
            if sftp_target.judge_path_exist(target_path):
                return {'stat': 'failed', 'result': 'Target Path Exist'}
            else:
                return {'stat': 'success', 'result': target_path}
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': 'Key File Error'}


def uploadFile(key_file, sessid, rssh_ip, rssh_port, local_path, target_path):
    '''
        上传文件
    '''
    try:
        with sftp_client(key_file, sessid, rssh_ip, rssh_port) as sftp_target:
            try:
                sftp_target.connect_sftp()
            except Exception as e:
                current_app.logger.exception(e)
                return {'stat': 'failed', 'result': 'Sftp Connect Error'}
            upload_file_result = sftp_target.uploadFile(local_path, target_path)
            return upload_file_result
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': 'Key File Error'}


def uploadLocalCheck(key_file, sessid, rssh_ip, rssh_port, file_size, target_path):
    '''
        从本地文件上传文件检查
    '''
    try:
        if int(file_size) >= current_app.config['MAX_UPLOAD_SIZE']:
            return {'stat': 'failed', 'result': 'File size exceeds limit'}
        with sftp_client(key_file, sessid, rssh_ip, rssh_port) as sftp_target:
            try:
                sftp_target.connect_sftp()
            except Exception as e:
                current_app.logger.exception(e)
                return {'stat': 'failed', 'result': 'Sftp Connect Error'}
            if sftp_target.judge_path_exist(target_path):
                return {'stat': 'failed', 'result': 'Target Path Exist'}
            else:
                return {'stat': 'success', 'result': target_path}
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': 'Key File Error'}


def uploadFileObj(key_file, sessid, rssh_ip, rssh_port, file_obj, target_path):
    '''
        上传文件对象
    '''
    try:
        with sftp_client(key_file, sessid, rssh_ip, rssh_port) as sftp_target:
            try:
                sftp_target.connect_sftp()
            except Exception as e:
                current_app.logger.exception(e)
                return {'stat': 'failed', 'result': 'Sftp Connect Error'}
            upload_file_obj_result = sftp_target.uploadFileObj(file_obj, target_path)
            return upload_file_obj_result
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': 'Key File Error'}