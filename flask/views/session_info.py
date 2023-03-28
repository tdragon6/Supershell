'''
    会话页信息界面蓝图
'''

from flask import Blueprint, request, redirect, render_template
from config import user
from module.session_info import check_key, get_client_dict


session_info_view = Blueprint('session_info', __name__)


@session_info_view.route('/supershell/session/info', methods=['GET'])
def session_info():
    '''
        访问客户端会话信息
    '''
    sessid = request.args.get('arg')
    if check_key(sessid) == 0:
        return redirect('/supershell/session/void?arg=' + sessid)
    client_dict = get_client_dict(sessid)
    return render_template('session_info.html', username=user, client_dict=client_dict, sessid=sessid)