'''
    gunicorn启动入口
'''

from const import log_path
import gevent.monkey
gevent.monkey.patch_all()

import multiprocessing


debug = False
loglevel = 'info'
bind = '0.0.0.0:5000'
errorlog = log_path + '/gunicorn.log'
# accesslog = log_path + '/gunicorn.log'
# access_log_format = '%(t)s %(p)s %(h)s "%(r)s" %(s)s %(L)s %(b)s %(f)s" "%(a)s"'

# 超时时间
timeout = 0

# 启动的进程数
workers = multiprocessing.cpu_count() * 2 + 1
# 使用gevent协程实现高并发
worker_class = 'gunicorn.workers.ggevent.GeventWorker'