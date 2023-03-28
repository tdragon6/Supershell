/*
    日志相关方法
*/


// 设置标题
function set_title(name){
    $('#active-' + name).addClass('active');
    if (name === 'flask'){
        $('#log-title').text('业务日志')
    }
    else if (name === 'gunicorn'){
        $('#log-title').text('gunicorn日志')
    }
}


// 获取日志
function get_log_text(name){
    $('#loader').html('<div class="spinner-border spinner-border-sm text-muted" role="status"></div>');
    let input_data = {
        'name': name
    };
    $.ajax({
        type: "POST",
        url: "/supershell/log/read",
        contentType: 'application/json',
        data: JSON.stringify(input_data),
        success: function(res) {
            $('#log-size').text(renderSize(res['size']));
            $('#log-text').val(res['result']);
            $('#loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M5 12l5 5l10 -10"></path>\
            </svg>');
        },
        error: function(data, type, error) {
            console.log(error);
            toastr.error(error.name + ": " + error.message, '获取日志失败');
            $('#loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M5 12l5 5l10 -10"></path>\
            </svg>');
        },
    });
}