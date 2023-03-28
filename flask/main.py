'''
    flask入口
'''

from flask import Flask, request, redirect
from views import login, client, webhook, session_info, session_shell, session_files, \
    no_session, server_files, setting, compiled, session_memfd, session_advanced, notes, \
    monitor, log
from const import log_path
from config import global_salt
from module.func import no_proxy
import jwt
import logging
import time


# 初始化flask对象
app = Flask(__name__)


# 业务日志
log_handler = logging.FileHandler(log_path + '/flask.log', encoding='UTF-8')
app.logger.setLevel(logging.INFO)
log_format = logging.Formatter('%(asctime)s - %(levelname)s - %(filename)s - %(funcName)s - %(lineno)s - %(message)s')
log_handler.setFormatter(log_format)
app.logger.addHandler(log_handler)


# 定义全局参数
app.config['DOWNLOAD_CHUNK_SIZE'] = 1 * 1024 * 1024    # 远程主机文件下载的Chunk_Size
app.config['MAX_UPLOAD_SIZE'] = 30 * 1024 * 1024    # 远程主机文件上传的最大Size
app.config['START_TIME'] = int(time.time())    # 获取supershell开始运行时的时间戳


# 注册蓝图
app.register_blueprint(login.login_view)
app.register_blueprint(client.client_view)
app.register_blueprint(webhook.webhook_view)
app.register_blueprint(session_info.session_info_view)
app.register_blueprint(session_shell.session_shell_view)
app.register_blueprint(session_files.session_files_view)
app.register_blueprint(no_session.no_session_view)
app.register_blueprint(server_files.server_files_view)
app.register_blueprint(setting.setting_view)
app.register_blueprint(compiled.compile_view)
app.register_blueprint(session_memfd.session_memfd_view)
app.register_blueprint(session_advanced.session_advanced_view)
app.register_blueprint(notes.notes_view)
app.register_blueprint(monitor.monitor_view)
app.register_blueprint(log.log_view)


# 所有请求前的权限认证（除去no_proxy中定义的接口）
@app.before_request
def check_login():
    '''判断token是否合法'''
    if no_proxy(request.path):
        return None
    else:
        try:
            token = request.cookies.get('token')
            jwt.decode(token, global_salt, algorithms=['HS256'])
            return None
        except:
            return redirect('/supershell/login')