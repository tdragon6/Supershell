'''
    收到rssh服务器webhook处理数据相关方法
'''

from flask import current_app
from category.redisclient import RedisClient
from category.ssh import ssh_client
import json
import requests


def tim_format_transfer(utc_str):
    '''
        将UTC时间格式转换为自然语言时间格式
    '''
    result = utc_str.split('.')[0].replace('T', ' ')
    return result


def get_target_user(key_file, sessid, rssh_ip, rssh_port):
    '''
        获取目标主机用户名
    '''
    try:
        with ssh_client(key_file, sessid, rssh_ip, rssh_port) as ssh_target:
            try:
                ssh_target.connect_ssh()
            except Exception as e:
                current_app.logger.exception(e)
                return '-'
            user = ssh_target.exec_command('whoami')
            if user['stat'] == 'failed':
                return '-'
            elif 'executable file not found in' in user['result'] or user['result'] == '':
                current_app.logger.info('exec "whoami" to get username failed, now attempt to exec "id".')
                user_id = ssh_target.exec_command('id')
                if user_id['stat'] == 'failed':
                    return '-'
                elif 'executable file not found in' in user_id['result'] or user_id['result'] == '':
                    current_app.logger.info('exec "id" to get username failed, return "-".')
                    return '-'
                else:
                    ind_left = user_id['result'].find('(') + 1
                    ind_right = user_id['result'].find(')')
                    return user_id['result'][ind_left:ind_right]
            else:
                return user['result']
    except Exception as e:
        current_app.logger.exception(e)
        return '-'


def get_target_os_arch(version_str):
    '''
        获取客户端操作系统架构和版本信息
    '''
    os_arch = version_str.split('-')[-1].split('_')
    version = version_str.split('-')[1]
    return os_arch[0], os_arch[1], version


def ip2region(ip):
    '''
        查找ip归属地
    '''
    try:
        result = requests.get('http://ip-api.com/json/' + ip).text
        country_code = json.loads(result)['countryCode']
        return country_code
    except Exception as e:
        current_app.logger.exception(e)
        return '-'


def handle_client_data(client_data, key_file, rssh_ip, rssh_port):
    '''
        处理webhook收到的数据信息
    '''
    try:
        client = RedisClient(0)
        data = json.loads(client_data['Full'])
        status = data['Status']
        if status == "connected":
            current_app.logger.info('Client Connect: ' + str(client_data))
            sessid = data['ID']
            hostname = data['HostName']
            address = data['IP']
            username = get_target_user(key_file, sessid, rssh_ip, rssh_port)
            os, arch, version = get_target_os_arch(data['Version'])
            attribution = ip2region(address.split(':')[0])
            tim_str = data['Timestamp']
            tim = tim_format_transfer(tim_str)

            client.conn.hset(sessid, "sessid", sessid)
            client.conn.hset(sessid, "hostname", hostname)
            client.conn.hset(sessid, "address", address)
            client.conn.hset(sessid, "username", username)
            client.conn.hset(sessid, "attribution", attribution)
            client.conn.hset(sessid, "os", os)
            client.conn.hset(sessid, "arch", arch)
            client.conn.hset(sessid, "time", tim)
            client.conn.hset(sessid, "version", version)
            client.conn.hset(sessid, "group", "-")
            client.conn.hset(sessid, "status", "true")
            client.conn.hset(sessid, "mark", "")
        else:
            current_app.logger.info('Client Disconnect: ' + str(client_data))
            sessid = data['ID']
            if sessid in [s.decode() for s in client.conn.keys()]:
                tim_str = data['Timestamp']
                tim = tim_format_transfer(tim_str)

                client.conn.hset(sessid, "time", tim)
                client.conn.hset(sessid, "status", "false")
        return {'stat': 'success', 'result': 'ok'}
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': str(e)}