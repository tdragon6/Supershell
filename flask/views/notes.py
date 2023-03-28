'''
    备忘录界面蓝图
'''

from flask import Blueprint, render_template, request, jsonify
from const import notes_path
from config import user


notes_view = Blueprint('notes', __name__)


@notes_view.route('/supershell/notes', methods=['GET'])
def notes():
    '''
        访问备忘录
    '''
    return render_template('notes.html', username=user)


@notes_view.route('/supershell/notes/read', methods=['POST'])
def read_notes():
    '''
        读取备忘录
    '''
    with open(notes_path, 'r', encoding='utf-8') as f:
        notes_text = f.read()
    return jsonify({'result': notes_text})


@notes_view.route('/supershell/notes/write', methods=['POST'])
def write_notes():
    '''
        保存备忘录
    '''
    data = request.json
    notes_text = data.get('notes_text')
    with open(notes_path, 'w', encoding='utf-8') as f:
        f.write(notes_text)
    return 'ok'