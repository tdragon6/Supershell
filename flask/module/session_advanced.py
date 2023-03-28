'''
    会话进阶功能页方法
'''

from flask import current_app
from category.ssh import ssh_client


def sub_system(key_file, sessid, rssh_ip, rssh_port, sub_str):
    '''
        ssh子系统功能
    '''
    try:
        with ssh_client(key_file, sessid, rssh_ip, rssh_port) as ssh_target:
            try:
                ssh_target.connect_ssh()
            except Exception as e:
                current_app.logger.exception(e)
                return {'stat': 'failed', 'result': 'Ssh Connect Error'}
            sub_result = ssh_target.exec_subsystem(sub_str)
            return sub_result
    except Exception as e:
        current_app.logger.exception(e)
        return {'stat': 'failed', 'result': 'Key File Error'}