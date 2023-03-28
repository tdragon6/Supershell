'''
    会话文件管理页界面蓝图
'''


from flask import Blueprint, request, redirect, render_template, jsonify, Response, current_app
from werkzeug.utils import secure_filename
from urllib.parse import unquote, quote
from config import user
from const import key_file, rssh_ip, rssh_port, server_files_path
from module.session_info import check_key
from module.session_files import get_default_path, get_root_folder, get_sub_folder, get_files_list, mkdir, renamePath, \
    deletePath, readFile, writeFile, downloadFile, uploadServerCheck, uploadFile, uploadLocalCheck, uploadFileObj


session_files_view = Blueprint('session_files', __name__)


@session_files_view.route('/supershell/session/files', methods=['GET'])
def session_files():
    '''
        访问客户端会话文件管理
    '''
    sessid = request.args.get('arg')
    if check_key(sessid) == 0:
        return redirect('/supershell/session/void?arg=' + sessid)
    default_path = get_default_path(key_file, sessid, rssh_ip, rssh_port)
    root_folder = get_root_folder(key_file, sessid, rssh_ip, rssh_port)
    return render_template('session_files.html', username=user, sessid=sessid, default_path=default_path, root_folder=root_folder)


@session_files_view.route('/supershell/session/files/tree/folder', methods=['POST'])
def sub_folder():
    '''
        获取指定路径的所有子目录
    '''
    data = request.json
    sessid = data.get('sessid')
    if check_key(sessid) == 0:
        return jsonify({"stat": "failed", "result": "no_sessid"})
    path = data.get('path')
    folder_list = get_sub_folder(key_file, sessid, rssh_ip, rssh_port, path)
    return jsonify(folder_list)


@session_files_view.route('/supershell/session/files/list', methods=['POST'])
def files_list():
    '''
        获取sftp文件列表接口
    '''
    data = request.json
    sessid = data.get('sessid')
    if check_key(sessid) == 0:
        return jsonify({"stat": "failed", "result": "no_sessid"})
    path = data.get('path')
    files_list = get_files_list(key_file, sessid, rssh_ip, rssh_port, path)
    return jsonify(files_list)


@session_files_view.route('/supershell/session/files/mkdir', methods=['POST'])
def make_dir():
    '''
        新建目录接口
    '''
    data = request.json
    sessid = data.get('sessid')
    if check_key(sessid) == 0:
        return jsonify({"stat": "failed", "result": "no_sessid"})
    path = data.get('path')
    mkdir_result = mkdir(key_file, sessid, rssh_ip, rssh_port, path)
    return jsonify(mkdir_result)


@session_files_view.route('/supershell/session/files/rename', methods=['POST'])
def rename_path():
    '''
        重命名接口
    '''
    data = request.json
    sessid = data.get('sessid')
    if check_key(sessid) == 0:
        return jsonify({"stat": "failed", "result": "no_sessid"})
    ori_path = data.get('ori_path')
    new_path = data.get('new_path')
    rename_result = renamePath(key_file, sessid, rssh_ip, rssh_port, ori_path, new_path)
    return jsonify(rename_result)


@session_files_view.route('/supershell/session/files/delete', methods=['POST'])
def delete_path():
    '''
        删除接口
    '''
    data = request.json
    sessid = data.get('sessid')
    if check_key(sessid) == 0:
        return jsonify({"stat": "failed", "result": "no_sessid"})
    file_type = data.get('file_type')
    path = data.get('path')
    delete_result = deletePath(key_file, sessid, rssh_ip, rssh_port, file_type, path)
    return jsonify(delete_result)


@session_files_view.route('/supershell/session/files/read', methods=['POST'])
def read_file():
    '''
        读取文件接口
    '''
    data = request.json
    sessid = data.get('sessid')
    if check_key(sessid) == 0:
        return jsonify({"stat": "failed", "result": "no_sessid"})
    path = data.get('path')
    read_result = readFile(key_file, sessid, rssh_ip, rssh_port, path)
    return jsonify(read_result)


@session_files_view.route('/supershell/session/files/write', methods=['POST'])
def write_file():
    '''
        写入文件接口
    '''
    data = request.json
    sessid = data.get('sessid')
    if check_key(sessid) == 0:
        return jsonify({"stat": "failed", "result": "no_sessid"})
    path = data.get('path')
    content = data.get('content')
    overwrite = data.get('overwrite')
    write_result = writeFile(key_file, sessid, rssh_ip, rssh_port, path, content, overwrite)
    return jsonify(write_result)


@session_files_view.route('/supershell/session/files/download', methods=['GET'])
def download_file():
    '''
        下载文件接口
    '''
    sessid = unquote(request.args.get('sessid'))
    path = unquote(request.args.get('path'))
    filename = quote(path.split('/')[-1])
    stream_size = current_app.config['DOWNLOAD_CHUNK_SIZE']
    response = Response(downloadFile(key_file, sessid, rssh_ip, rssh_port, path, stream_size), content_type='application/octet-stream')
    response.headers["Content-disposition"] = "attachment; filename*=utf-8''" + filename
    return response


@session_files_view.route('/supershell/session/files/upload/server/check', methods=['POST'])
def upload_server_check():
    '''
        从常用文件上传文件检查接口
    '''
    data = request.json
    sessid = data.get('sessid')
    if check_key(sessid) == 0:
        return jsonify({"stat": "failed", "result": "no_sessid"})
    filename = secure_filename(request.headers.get('filename'))
    local_path = server_files_path + '/' + filename
    target_path = data.get('path') + '/' + filename
    upload_check_result = uploadServerCheck(key_file, sessid, rssh_ip, rssh_port, local_path, target_path)
    return jsonify(upload_check_result)


@session_files_view.route('/supershell/session/files/upload/server', methods=['POST'])
def upload_file_from_server():
    '''
        从常用文件上传目标目录接口
    '''
    data = request.json
    sessid = data.get('sessid')
    if check_key(sessid) == 0:
        return jsonify({"stat": "failed", "result": "no_sessid"})
    filename = secure_filename(request.headers.get('filename'))
    local_path = server_files_path + '/' + filename
    target_path = data.get('path') + '/' + filename
    upload_file_result = uploadFile(key_file, sessid, rssh_ip, rssh_port, local_path, target_path)
    return jsonify(upload_file_result)


@session_files_view.route('/supershell/session/files/upload/local/check', methods=['POST'])
def upload_local_check():
    '''
        从本地文件上传文件检查接口
    '''
    sessid = request.headers.get('sessid')
    if check_key(sessid) == 0:
        return jsonify({"stat": "failed", "result": "no_sessid"})
    file_size = request.headers.get('size')
    filename = secure_filename(request.headers.get('filename'))
    target_path = request.headers.get('path') + '/' + filename
    upload_check_result = uploadLocalCheck(key_file, sessid, rssh_ip, rssh_port, file_size, target_path)
    return jsonify(upload_check_result)


@session_files_view.route('/supershell/session/files/upload/local', methods=['POST'])
def upload_file_from_local():
    '''
        从本地文件上传目标目录接口
    '''
    sessid = request.headers.get('sessid')
    if check_key(sessid) == 0:
        return jsonify({"stat": "failed", "result": "no_sessid"})
    filename = secure_filename(request.headers.get('filename'))
    target_path = request.headers.get('path') + '/' + filename
    upload_file_obj_result = uploadFileObj(key_file, sessid, rssh_ip, rssh_port, request.stream, target_path)
    return jsonify(upload_file_obj_result)