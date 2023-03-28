'''
    webhook api蓝图
'''

from flask import Blueprint, request
from const import key_file, rssh_ip, rssh_port
from module.webhook import handle_client_data


webhook_view = Blueprint('webhook', __name__)


@webhook_view.route('/supershell/webhook', methods=['POST'])
def webhook():
    '''
        接收webhook请求，处理数据
    '''
    data = request.json
    handle_client_data(data, key_file, rssh_ip, rssh_port)
    return '200', 200