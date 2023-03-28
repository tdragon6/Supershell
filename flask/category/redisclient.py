'''
    redis连接池类
'''

from const import redis_ip, redis_port, redis_password
import redis


class Singleton(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


class RedisClient(metaclass=Singleton):

    def __init__(self, db_no):
        self.pool = redis.ConnectionPool(host=redis_ip, port=redis_port, password=redis_password, db=db_no)

    @property
    def conn(self):
        if not hasattr(self, '_conn'):
            self.getConnection()
        return self._conn

    def getConnection(self):
        self._conn = redis.Redis(connection_pool = self.pool)