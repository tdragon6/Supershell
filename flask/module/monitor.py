'''
    监控台方法
'''

from flask import current_app
from category.redisclient import RedisClient
from category.rssh import rssh_client
from const import compiled_clients_file_path, supershell_version_json_path
import json
import os


def getRsshStatus(key_file, rssh_ip, rssh_port):
    '''
        获取连接rssh服务器状态
    '''
    try:
        with rssh_client(key_file, rssh_ip, rssh_port) as rssh_target:
            try:
                rssh_target.connect_rssh()
                return {'stat': 'success', 'result': 'Rssh Connect Success'}
            except Exception as e:
                current_app.logger.exception(e)
                return {'stat': 'failed', 'result': 'Rssh Connect Error'}
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': 'Key File Error'}


def getClientsNum():
    '''
        获取客户端个数
    '''
    try:
        all_num = 0
        online_num = 0
        client = RedisClient(0)
        for sessid in client.conn.keys():
            all_num = all_num + 1
            if client.conn.hget(sessid.decode(), 'status').decode() == 'true':
                online_num = online_num + 1
        return {'stat': 'success', 'result': {'all_num': all_num, 'online_num': online_num}}
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': str(e)}


def getCompileNumSize():
    '''
        获取已生成客户端Payload个数和大小
    '''
    try:
        num = 0
        size = 0
        json_path = compiled_clients_file_path + '/description.json'
        with open(json_path, 'r') as f:
            clients_dict = json.loads(f.read())
        for filename in clients_dict.keys():
            file_path = compiled_clients_file_path + '/' + clients_dict[filename]['Path'].split('/')[-1]
            num = num + 1
            size = size + os.stat(file_path).st_size
        return {'stat': 'success', 'result': {'num': num, 'size': size}}
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': str(e)}


def getPathNumSize(path):
    '''
        获取某目录下所有文件个数和大小
    '''
    try:
        num = 0
        size = 0
        files_name_list = os.listdir(path)
        for filename in files_name_list:
            file_path = path + '/' + filename
            if os.path.isdir(file_path):
                continue
            file_size = os.stat(file_path).st_size
            num = num + 1
            size = size + file_size
        return {'stat': 'success', 'result': {'num': num, 'size': size}}
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': str(e)}


def getRsshVersionNum(key_file, rssh_ip, rssh_port):
    '''
        获取rssh服务器版本和连接数
    '''
    try:
        with rssh_client(key_file, rssh_ip, rssh_port) as rssh_target:
            try:
                rssh_target.connect_rssh()
            except Exception as e:
                current_app.logger.exception(e)
                return {'stat': 'failed', 'result': 'Rssh Connect Error'}
            version_cmd = 'version'
            version_result = rssh_target.exec_command(version_cmd)
            who_cmd = 'who'
            who_result = rssh_target.exec_command(who_cmd)
            if version_result['stat'] == 'success' and who_result['stat'] == 'success':
                num = len(who_result['result'].split('\n'))
                return {'stat': 'success', 'result': {'version': version_result['result'].strip(), 'num': num}}
            else:
                failed_str = 'version ' + version_result['result'] + '\n' + 'connect number: ' + who_result['result']
                return {'stat': 'failed', 'result': failed_str}
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': 'Key File Error'}


def getSupershellVersionInfo():
    '''
        获取Supershell版本信息
    '''
    try:
        with open(supershell_version_json_path, 'r') as f:
            version_dict = json.loads(f.read())
        version = version_dict['version']
        description_list = version_dict['info'][version]['description']
        mtime = version_dict['info'][version]['mtime']
        return {'stat': 'success', 'result': {'version': version, 'description_list': description_list, 'mtime': mtime}}
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': str(e)}


def convert_time_to_str(time):
    '''
        时间数字转化成字符串，不够10的前面补个0
    '''
    if (time < 10):
        time = '0' + str(time)
    else:
        time=str(time)
    return time


def sec_to_data(time_num):
    '''
        时间差转为格式化字符串
    '''
    try:
        day = int(time_num // 86400)
        hour = int(time_num //3600 % 24)
        min =int((time_num % 3600) // 60)
        sec = time_num % 60
        day =convert_time_to_str(day)
        hour = convert_time_to_str(hour)
        min = convert_time_to_str(min)
        sec =convert_time_to_str(sec)
        time_str = day + ' 天 ' + hour + ' 小时 ' + min + ' 分钟 ' + sec + ' 秒 '
        return {'stat': 'success', 'result': time_str}
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': str(e)}