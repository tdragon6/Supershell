'''
    会话页显示信息方法
'''

from category.redisclient import RedisClient


def check_key(sessid):
    '''
        判断sessid是否存在
    '''
    client = RedisClient(0)
    result = 0
    for key in client.conn.keys():
        if key.decode() == sessid:
            result = 1
            break
    return result


def get_client_dict(sessid):
    '''
        从redis内存数据中获取指定sessid的客户端信息字典
    '''
    client_dict = {}
    client = RedisClient(0)
    for key in client.conn.hkeys(sessid):
        client_dict[key.decode()] = client.conn.hget(sessid, key.decode()).decode()
    return client_dict