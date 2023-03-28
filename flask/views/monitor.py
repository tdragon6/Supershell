'''
    监控台界面蓝图
'''
import time

from flask import Blueprint, render_template, jsonify, current_app
from const import key_file, rssh_ip, rssh_port, server_files_path, log_path
from config import user
from module.monitor import getRsshStatus, getClientsNum, getCompileNumSize, getPathNumSize, getRsshVersionNum, \
    getSupershellVersionInfo, sec_to_data


monitor_view = Blueprint('monitor', __name__)

@monitor_view.route('/', methods=['GET'])
@monitor_view.route('/supershell/monitor', methods=['GET'])
def monitor_page():
    '''
        访问监控台页面
    '''
    return render_template('monitor.html', username=user)


@monitor_view.route('/supershell/monitor/status', methods=['POST'])
def get_rssh_status():
    '''
        获取连接rssh服务器状态信息接口
    '''
    status_result = getRsshStatus(key_file, rssh_ip, rssh_port)
    return jsonify(status_result)


@monitor_view.route('/supershell/monitor/clients', methods=['POST'])
def get_clients_num():
    '''
        获取客户端个数接口
    '''
    num_result = getClientsNum()
    return jsonify(num_result)


@monitor_view.route('/supershell/monitor/compiled', methods=['POST'])
def get_compiled_num_size():
    '''
        获取已生成客户端Paylaod个数和大小接口
    '''
    compiled_result = getCompileNumSize()
    return jsonify(compiled_result)


@monitor_view.route('/supershell/monitor/server', methods=['POST'])
def get_server_file_num_size():
    '''
        获取常用文件个数和大小接口
    '''
    server_file_result = getPathNumSize(server_files_path)
    return jsonify(server_file_result)


@monitor_view.route('/supershell/monitor/log', methods=['POST'])
def get_log_size():
    '''
        获取日志大小接口
    '''
    log_result = getPathNumSize(log_path)
    return jsonify(log_result)


@monitor_view.route('/supershell/monitor/rssh', methods=['POST'])
def get_rssh_version_num():
    '''
        获取rssh服务器版本和连接数
    '''
    rssh_result = getRsshVersionNum(key_file, rssh_ip, rssh_port)
    return jsonify(rssh_result)


@monitor_view.route('/supershell/monitor/version', methods=['POST'])
def get_supershell_version_info():
    '''
        获取Supershell版本信息
    '''
    supershell_version_result = getSupershellVersionInfo()
    return jsonify(supershell_version_result)


@monitor_view.route('/supershell/monitor/time', methods=['POST'])
def get_run_time():
    '''
        获取Supershell运行时间
    '''
    now_time = int(time.time())
    run_time = now_time - current_app.config['START_TIME']
    run_time_result = sec_to_data(run_time)
    return jsonify(run_time_result)