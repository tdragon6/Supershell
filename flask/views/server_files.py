'''
    常用文件界面蓝图
'''

from flask import Blueprint, request, render_template, jsonify, Response
from werkzeug.utils import secure_filename
from config import user
from const import server_files_path
from module.server_files import get_server_files_list, renameServerFile, deleteServerFile, \
    downloadServerFile, uploadFileCheck, uploadFile
import os


server_files_view = Blueprint('server_files', __name__)


@server_files_view.route('/supershell/server/files', methods=['GET'])
def server_files_list():
    '''
        访问常用文件列表
    '''
    return render_template('server_files.html', username=user)


@server_files_view.route('/supershell/server/files/list', methods=['POST'])
def update_server_files():
    '''
        获取常用文件列表
    '''
    server_files_list_result = get_server_files_list()
    return jsonify(server_files_list_result)


@server_files_view.route('/supershell/server/files/rename', methods=['POST'])
def rename_server_file():
    '''
        常用文件重命名接口
    '''
    data = request.json
    ori_name = data.get('ori_name')
    new_name = data.get('new_name')
    rename_server_file_result = renameServerFile(ori_name, new_name)
    return jsonify(rename_server_file_result)


@server_files_view.route('/supershell/server/files/delete', methods=['POST'])
def delete_server_file():
    '''
        常用文件删除接口
    '''
    data = request.json
    filename = data.get('filename')
    delete_server_file_result = deleteServerFile(filename)
    return jsonify(delete_server_file_result)


@server_files_view.route('/supershell/server/files/download/<path:filename>', methods=['GET'])
def download_file(filename):
    '''
        服务器文件下载接口
    '''
    path = server_files_path + '/' + secure_filename(filename)
    response = Response(downloadServerFile(path), content_type='application/octet-stream')
    response.headers["Content-disposition"] = "attachment; filename*=utf-8''" + secure_filename(filename)
    response.headers['content-length'] = os.stat(path).st_size
    return response


@server_files_view.route('/supershell/server/files/upload/check', methods=['POST'])
def upload_file_check():
    '''
        常用文件上传检查文件名接口
    '''
    filename = request.headers.get('filename')
    upload_file_check_result = uploadFileCheck(filename)
    return upload_file_check_result


@server_files_view.route('/supershell/server/files/upload', methods=['POST'])
def upload_file():
    '''
        常用文件上传接口
    '''
    filename = request.headers.get('filename')
    upload_file_result = uploadFile(filename, request.stream)
    return upload_file_result
