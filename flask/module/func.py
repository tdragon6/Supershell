'''
    通用方法
'''

import jwt
import time


def get_jwt_token(username, salt, exp_time):
    '''
        获取jwt token
    '''
    exp = int(time.time() + exp_time)
    data = {
      "username": username,
      "exp": exp
    }
    token = jwt.encode(payload=data, key=salt, algorithm='HS256')
    return token


def no_proxy(path):
    '''
        设置拦截器白名单
    '''
    white_list = ['js', 'css', 'png', 'svg', 'jpg', 'jpeg']
    white_path_list = ['/supershell/login',
                       '/supershell/login/auth',
                       '/supershell/webhook',
                       '/supershell/share/shell/auth',
                       '/supershell/share/shell/login',
                       '/supershell/share/shell/login/auth',
                       '/supershell/session/nginx/void',
                       '/supershell/memfd/inject/auth'
                       ]
    back = path.split('.')[-1]
    if back.lower() in white_list or path in white_path_list \
            or path.startswith('/supershell/server/files/download/')\
            or path.startswith('/supershell/compile/download/'):
        return True
    else:
        return False