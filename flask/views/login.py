'''
    登录界面蓝图
'''

from flask import Blueprint, request, redirect, render_template, make_response, jsonify
from config import user, pwd, global_salt, expire
from module.func import get_jwt_token
import jwt
import hashlib


login_view = Blueprint('login', __name__)


@login_view.route('/supershell/login', methods=['GET'])
def login():
    '''
        登陆页面功能
    '''
    if request.method == 'GET':
        try:
            token = request.cookies.get('token')
            jwt.decode(token, global_salt, algorithms=['HS256'])
            return redirect('/supershell/monitor')
        except:
            return render_template('login.html')


@login_view.route('/supershell/login/auth', methods=['POST'])
def login_auth():
    '''
        登录鉴权点
    '''
    if request.method == 'POST':
        data = request.json
        username = data.get('username')
        password = data.get('password')
        if username == user and hashlib.md5(password.encode('utf-8')).hexdigest() == pwd:
            response = make_response(jsonify({'result': 'success'}))
            jwt_token = get_jwt_token(username, global_salt, expire * 60 * 60)
            response.set_cookie('token', jwt_token)
            return response
        else:
            return jsonify({'result': 'failed'})