'''
    内存执行界面蓝图
'''

from flask import Blueprint, request, redirect, render_template
from config import user, global_salt
from module.session_info import check_key
import jwt


session_memfd_view = Blueprint('session_memfd', __name__)


@session_memfd_view.route('/supershell/session/memfd', methods=['GET'])
def session_memfd():
    '''
        访问内存执行页
    '''
    sessid = request.args.get('arg')
    if check_key(sessid) == 0:
        return redirect('/supershell/session/void?arg=' + sessid)
    return render_template('session_memfd.html', username=user, sessid=sessid)


@session_memfd_view.route('/supershell/memfd/inject/auth', methods=['GET'])
def inject_auth():
    '''
        访问内存注入进行身份验证
    '''
    try:
        token = request.cookies.get('token')
        jwt.decode(token, global_salt, algorithms=['HS256'])
        return '200', 200
    except:
        return '401', 401