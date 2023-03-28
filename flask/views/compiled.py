'''
    客户端生成蓝图
'''

from flask import Blueprint, render_template, request, jsonify, Response, current_app
from werkzeug.utils import secure_filename
from config import user
from const import key_file, rssh_ip, rssh_port, support_os_arch_list
from module.compile import get_compiled_clients_list, handle_compiled_clients, get_real_filename, \
    deleteCompileClient, check_compile_input, makeClient
from module.server_files import downloadServerFile
import os


compile_view = Blueprint('compile', __name__)


@compile_view.route('/supershell/compile', methods=['GET'])
def cleint_complie():
    '''
        访问客户端生成界面
    '''
    return render_template('compile.html', username=user)


@compile_view.route('/supershell/compile/update', methods=['POST'])
def update_compiled_client():
    '''
        读取已生成的客户端接口
    '''
    data = request.json
    search_text = data.get('search_text').strip()
    source_list = get_compiled_clients_list()
    source_list = handle_compiled_clients(source_list, search_text)
    return jsonify({'clients_list': source_list})


@compile_view.route('/supershell/compile/download/<path:filename>', methods=['GET'])
def download_file(filename):
    '''
        客户端Payload文件下载接口
    '''
    real_path = get_real_filename(secure_filename(filename))
    response = Response(downloadServerFile(real_path), content_type='application/octet-stream')
    response.headers["Content-disposition"] = "attachment; filename*=utf-8''" + secure_filename(filename)
    response.headers['content-length'] = os.stat(real_path).st_size
    return response


@compile_view.route('/supershell/compile/delete', methods=['POST'])
def delete_compile_client():
    '''
        已生成客户端删除接口
    '''
    data = request.json
    filename = secure_filename(data.get('filename'))
    delete_compile_client_result = deleteCompileClient(key_file, rssh_ip, rssh_port, filename)
    return jsonify(delete_compile_client_result)


@compile_view.route('/supershell/compile/os', methods=['POST'])
def get_support_os_arch():
    '''
        获取客户端支持生成的系统架构数据接口
    '''
    return jsonify({'support_os_arch_list': support_os_arch_list})


@compile_view.route('/supershell/compile/make', methods=['POST'])
def make_client():
    '''
        生成客户端Payload接口
    '''
    data = request.json
    current_app.logger.info('Make Client Receive Data: ' + str(data))
    filename = data.get('filename').strip()
    address = data.get('address').strip()
    port = data.get('port').strip()
    os_arch = data.get('os_arch')
    upx = data.get('upx')
    garble = data.get('garble')
    check_result = check_compile_input(filename, address, port, os_arch, upx, garble)
    if check_result['stat'] == 'success':
        make_result = makeClient(key_file, rssh_ip, rssh_port, check_result['result'])
        return make_result
    else:
        return jsonify(check_result)