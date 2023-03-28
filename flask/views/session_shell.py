'''
    会话页shell界面蓝图
'''

from flask import Blueprint, request, redirect, render_template, make_response, jsonify
from config import user, global_salt, share_pwd, share_expire
from module.func import get_jwt_token
from module.session_info import check_key
import jwt
import hashlib


session_shell_view = Blueprint('session_shell', __name__)


@session_shell_view.route('/supershell/session/shell', methods=['GET'])
def session_shell():
    '''
        访问客户端会话交互终端
    '''
    sessid = request.args.get('arg')
    if check_key(sessid) == 0:
        return redirect('/supershell/session/void?arg=' + sessid)
    return render_template('session_shell.html', username=user, sessid=sessid)


@session_shell_view.route('/supershell/share/shell/auth', methods=['GET'])
def share_shell_auth():
    '''
        访问远控shell进行身份验证，鉴权是内部用户还是分享用户，都不是则返回401，
        鉴权成功后找不到会返回403，返回结果均给nginx处理
    '''
    sessid = request.args.get('arg')
    try:
        token = request.cookies.get('token')
        jwt.decode(token, global_salt, algorithms=['HS256'])
        if check_key(sessid) == 0:
            return '403', 403
        else:
            return '200', 200
    except:
        try:
            share_token = request.cookies.get('share_token')
            jwt.decode(share_token, global_salt, algorithms=['HS256'])
            if check_key(sessid) == 0:
                return '403', 403
            else:
                return '200', 200
        except:
            return '401', 401


@session_shell_view.route('/supershell/share/shell/login', methods=['GET'])
def share_shell_login():
    '''
        共享密码登录点
    '''
    if request.method == 'GET':
        sessid = request.args.get('arg')
        return render_template('share_auth.html', sessid=sessid)


@session_shell_view.route('/supershell/share/shell/login/auth', methods=['POST'])
def share_shell_login_auth():
    '''
        共享密码鉴权点
    '''
    if request.method == 'POST':
        data = request.json
        share_password = data.get('share_password')
        sessid = data.get('sessid')
        if hashlib.md5(share_password.encode('utf-8')).hexdigest() == share_pwd:
            response = make_response(jsonify({'result': 'success', 'sessid': sessid}))
            jwt_token = get_jwt_token('anonymous', global_salt, share_expire * 60 * 60)
            response.set_cookie('share_token', jwt_token)
            return response
        else:
            return jsonify({'result': 'failed'})