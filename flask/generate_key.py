'''
    生成rssh连接的公私钥对
'''

from const import key_file, public_key_file, log_path
import paramiko
import logging
import os


logging.basicConfig(level=logging.INFO,
                    filename=log_path + '/flask.log',
                    filemode='a',
                    format='%(asctime)s - %(levelname)s - %(filename)s - %(funcName)s - %(lineno)s - %(message)s'
                    )


def generateSSHKey(private_filepath, public_filepath):
    '''
        生成rssh连接的公私钥对
    '''
    if os.path.exists(private_filepath):
        logging.info('SSH Key Existed, Skip Generate Key.')
        return
    key = paramiko.RSAKey.generate(2048)
    key.write_private_key_file(private_filepath)
    with open(public_filepath, "w") as public:
        public.write("%s %s" % (key.get_name(), key.get_base64()))
    logging.info('New SSH Key Generated.')


if __name__ == "__main__":
    generateSSHKey(key_file, public_key_file)