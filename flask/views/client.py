'''
    客户端界面蓝图
'''

from flask import Blueprint, request, render_template, jsonify
from config import user
from const import key_file, rssh_ip, rssh_port
from module.client import handle_clients, get_filter_dict, get_source_list, update_filter_choose, writeInfo, \
    disconnectClient, deleteClient, calibrationClients, deleteAllOffClients, disconnectAllClients
from module.session_info import check_key


client_view = Blueprint('client', __name__)


@client_view.route('/supershell/client', methods=['GET'])
def clients_list():
    '''
        访问客户端列表
    '''
    return render_template('client.html', username=user)


@client_view.route('/supershell/client/update/memory', methods=['POST'])
def update_client_memory():
    '''
        从redis内存数据中更新客户端列表
    '''
    data = request.json
    search_text = data.get('search_text').strip()
    filter_dict = data.get('filter_dict')
    filter_choose = data.get('filter_choose')
    new_source_list = get_source_list()
    new_filter_dict = get_filter_dict(new_source_list)
    new_filter_choose = update_filter_choose(filter_choose, filter_dict, new_filter_dict)
    new_clients_list = handle_clients(new_source_list, search_text, new_filter_choose)
    if new_filter_choose == {}:
        new_filter_choose = new_filter_dict
    return jsonify({'clients_list': new_clients_list, 'filter_dict': new_filter_dict, 'filter_choose': new_filter_choose})


@client_view.route('/supershell/client/info/write', methods=['POST'])
def write_client_info():
    '''
        详细信息写入分组和备注信息接口
    '''
    data = request.json
    sessid = data.get('sessid')
    if check_key(sessid) == 0:
        return jsonify({"stat": "failed", "result": "no_sessid"})
    group = data.get('group')
    mark = data.get('mark')
    write_result = writeInfo(group, mark, sessid)
    return jsonify(write_result)


@client_view.route('/supershell/client/disconnect', methods=['POST'])
def disconnect_client():
    '''
        断开连接接口
    '''
    data = request.json
    sessid = data.get('sessid')
    if check_key(sessid) == 0:
        return jsonify({"stat": "failed", "result": "no_sessid"})
    kill_result = disconnectClient(key_file, rssh_ip, rssh_port, sessid)
    return jsonify(kill_result)


@client_view.route('/supershell/client/delete', methods=['POST'])
def delete_client():
    '''
        删除记录接口
    '''
    data = request.json
    sessid = data.get('sessid')
    if check_key(sessid) == 0:
        return jsonify({"stat": "failed", "result": "no_sessid"})
    delete_result = deleteClient(sessid)
    return jsonify(delete_result)


@client_view.route('/supershell/client/calibration', methods=['POST'])
def calibration_clients():
    '''
        数据校准接口
    '''
    calibration_result = calibrationClients(key_file, rssh_ip, rssh_port)
    return jsonify(calibration_result)


@client_view.route('/supershell/client/delete/off', methods=['POST'])
def delete_all_off_clients():
    '''
        删除全部离线记录接口
    '''
    delete_all_off_clients_result = deleteAllOffClients()
    return jsonify(delete_all_off_clients_result)


@client_view.route('/supershell/client/disconnect/all', methods=['POST'])
def disconnect_all_clients():
    '''
        断开全部连接接口
    '''
    disconnect_all_clients_result = disconnectAllClients(key_file, rssh_ip, rssh_port)
    return jsonify(disconnect_all_clients_result)