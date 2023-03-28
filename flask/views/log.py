'''
    日志界面蓝图
'''

from flask import Blueprint, render_template, request, jsonify, Response
from werkzeug.utils import secure_filename
from const import log_path, log_last_lines
from config import user
from module.server_files import downloadServerFile
from collections import deque
import os


log_view = Blueprint('log', __name__)


@log_view.route('/supershell/log/<path:name>', methods=['GET'])
def log(name):
    '''
        访问日志
    '''
    return render_template('log.html', username=user, name=name)


@log_view.route('/supershell/log/read', methods=['POST'])
def read_log():
    '''
        读取日志
    '''
    data = request.json
    name = data.get('name')
    path = log_path + '/' + name + '.log'
    log_text = ''
    with open(path, 'r', encoding='utf-8') as f:
        for line in list(deque(f, log_last_lines)):
            log_text = log_text + line
    return jsonify({'result': log_text.strip(), 'size': str(os.stat(path).st_size)})


@log_view.route('/supershell/log/download/<path:filename>', methods=['GET'])
def download_file(filename):
    '''
        下载日志文件接口
    '''
    path = log_path + '/' + secure_filename(filename)
    response = Response(downloadServerFile(path), content_type='application/octet-stream')
    response.headers["Content-disposition"] = "attachment; filename*=utf-8''" + secure_filename(filename)
    response.headers['content-length'] = os.stat(path).st_size
    return response