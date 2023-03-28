'''
    进阶功能界面蓝图
'''

from flask import Blueprint, request, redirect, render_template, jsonify, current_app
from const import key_file, rssh_ip, rssh_port
from config import user
from module.session_info import check_key
from module.session_advanced import sub_system


session_advanced_view = Blueprint('session_advanced', __name__)


@session_advanced_view.route('/supershell/session/advanced', methods=['GET'])
def session_advanced():
    '''
        访问进阶功能页
    '''
    sessid = request.args.get('arg')
    if check_key(sessid) == 0:
        return redirect('/supershell/session/void?arg=' + sessid)
    return render_template('session_advanced.html', username=user, sessid=sessid)


@session_advanced_view.route('/supershell/session/advanced/service', methods=['POST'])
def service():
    '''
        安装卸载服务接口
    '''
    data = request.json
    sessid = data.get('sessid')
    if check_key(sessid) == 0:
        return jsonify({"stat": "failed", "result": "no_sessid"})
    name = data.get('name').strip()
    if name == '' or ' ' in name:
        return jsonify({'stat': 'failed', 'result': '服务名不能为空且不能包含空格'})
    type_str = data.get('type_str')
    sub_str = 'service --name ' + name + ' --' + type_str
    current_app.logger.info('Install Windows Service: ' + str(sub_str))
    service_result = sub_system(key_file, sessid, rssh_ip, rssh_port, sub_str)
    return jsonify(service_result)


@session_advanced_view.route('/supershell/session/advanced/ugid', methods=['POST'])
def set_ugid():
    '''
        尝试设置uid、gid接口
    '''
    data = request.json
    sessid = data.get('sessid')
    if check_key(sessid) == 0:
        return jsonify({"stat": "failed", "result": "no_sessid"})
    id_num = data.get('id_num').strip()
    type_str = data.get('type_str')
    try:
        int(id_num)
    except Exception as e:
        current_app.logger.exception(e)
        return jsonify({'stat': 'failed', 'result': type_str + '不合法'})
    sub_str = 'set' + type_str + ' ' + id_num
    current_app.logger.info('Set linux ugid: ' + str(sub_str))
    ugid_result = sub_system(key_file, sessid, rssh_ip, rssh_port, sub_str)
    return jsonify(ugid_result)