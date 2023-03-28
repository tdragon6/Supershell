'''
    找不到会话界面蓝图
'''

from flask import Blueprint, request, render_template


no_session_view = Blueprint('no_session', __name__)


@no_session_view.route('/supershell/session/nginx/void', methods=['GET'])
def no_session_nginx():
    '''
        从nginx代理中跳转的会话为空方法
    '''
    sessid = request.args.get('arg')
    if sessid == '':
        sessid = 'None'
    return render_template('no_session.html', sessid=sessid)


@no_session_view.route('/supershell/session/void', methods=['GET'])
def no_session():
    '''
        会话为空方法
    '''
    sessid = request.args.get('arg')
    if sessid == '':
        sessid = 'None'
    return render_template('no_session.html', sessid=sessid)