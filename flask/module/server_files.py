'''
    常用文件页方法
'''

from flask import current_app
from werkzeug.utils import secure_filename
from const import server_files_path, server_files_chunk_size
import os
import time
import traceback


def get_server_files_list():
    '''
        获取常用文件列表
    '''
    try:
        files_list = []
        files_name_list = os.listdir(server_files_path)
        for filename in files_name_list:
            file_path = server_files_path + '/' + filename
            if os.path.isdir(file_path):
                continue
            file_size = os.stat(file_path).st_size
            file_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(os.stat(file_path).st_mtime))
            files_list.append({"server_file_name": filename,
                               "server_file_size": file_size,
                               "server_file_time": file_time})
        return {'stat': 'success', 'result': files_list}
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': str(e)}


def renameServerFile(ori_name, new_name):
    '''
        常用文件重命名方法
    '''
    try:
        ori_path = server_files_path + '/' + secure_filename(ori_name)
        if os.path.exists(ori_path) == False:
            return {'stat': 'failed', 'result': secure_filename(ori_name) + ': File Not Exist'}
        new_path = server_files_path + '/' + secure_filename(new_name)
        if os.path.exists(new_path):
            return {'stat': 'failed', 'result': secure_filename(new_name) + ': New Name has been used'}
        os.rename(ori_path, new_path)
        return {'stat': 'success', 'result': secure_filename(new_name)}
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': str(e)}


def deleteServerFile(filename):
    '''
        常用文件删除方法
    '''
    try:
        file_path = server_files_path + '/' + secure_filename(filename)
        if os.path.exists(file_path) == False:
            return {'stat': 'failed', 'result': secure_filename(filename) + ': File Not Exist'}
        os.remove(file_path)
        return {'stat': 'success', 'result': secure_filename(filename)}
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': str(e)}


def downloadServerFile(path):
    '''
        下载服务器文件
    '''
    try:
        with open(path, 'rb') as f:
            while 1:
                data = f.read(server_files_chunk_size)
                if not data:
                    break
                yield data
    except Exception as e:
        print(traceback.format_exc())


def uploadFileCheck(filename):
    '''
        常用文件上传检查文件名方法
    '''
    try:
        file_path = server_files_path + '/' + secure_filename(filename)
        if os.path.exists(file_path):
            return {'stat': 'failed', 'result': secure_filename(filename) + ': File Existed'}
        else:
            return {'stat': 'success', 'result': secure_filename(filename)}
    except Exception as e:
        return {'stat': 'failed', 'result': str(e)}


def uploadFile(filename, file_stream):
    '''
        常用文件上传方法
    '''
    try:
        file_path = server_files_path + '/' + secure_filename(filename)
        with open(file_path, 'wb') as f:
            for chunk in file_stream:
                f.write(chunk)
        return {'stat': 'success', 'result': secure_filename(filename)}
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': str(e)}