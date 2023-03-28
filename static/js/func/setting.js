/*
    设置相关js方法
*/


// 修改远程主机下载文件Chunk Size
function set_download_chunk_size(){
    $('#loader').html('<div class="spinner-border spinner-border-sm text-muted" role="status"></div>');
    new_download_chunk_size = $('#download-chunk-size').val();
    let input_data = {
        'chunk': new_download_chunk_size
    }
    $.ajax({
        type: "POST",
        url: "/supershell/setting/update/download/chunk",
        contentType: 'application/json',
        data: JSON.stringify(input_data),
        success: function(res) {
            if (res.stat === 'success'){
                $('#download-chunk-size').val(res.result);
                toastr.success(res.result, '修改下载Chunk Size成功');
            }
            else if (res.stat === 'failed'){
                toastr.error(res.result, '修改下载Chunk Size失败');
            }
            $('#loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M5 12l5 5l10 -10"></path>\
            </svg>');
        },
        error: function(data, type, error) {
            console.log(error);
            toastr.error(error.name + ": " + error.message, '修改下载Chunk Size失败');
            $('#loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M5 12l5 5l10 -10"></path>\
            </svg>');
        },
    });
}


// 修改远程主机上传文件最大Size
function set_upload_max_size(){
    $('#loader').html('<div class="spinner-border spinner-border-sm text-muted" role="status"></div>');
    new_upload_max_size = $('#upload-max-size').val();
    let input_data = {
        'size': new_upload_max_size
    }
    $.ajax({
        type: "POST",
        url: "/supershell/setting/update/upload/size",
        contentType: 'application/json',
        data: JSON.stringify(input_data),
        success: function(res) {
            if (res.stat === 'success'){
                $('#upload-max-size').val(res.result);
                $('#loader').css('display', 'block')
                toastr.success(res.result, '修改上传最大Size成功');
            }
            else if (res.stat === 'failed'){
                toastr.error(res.result, '修改上传最大Size失败');
            }
            $('#loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M5 12l5 5l10 -10"></path>\
            </svg>');
        },
        error: function(data, type, error) {
            console.log(error);
            toastr.error(error.name + ": " + error.message, '修改上传最大Size失败');
            $('#loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M5 12l5 5l10 -10"></path>\
            </svg>');
        },
    });
}


// 恢复默认设置
function recovery(){
    $('#loader').html('<div class="spinner-border spinner-border-sm text-muted" role="status"></div>');
    $.ajax({
        type: "POST",
        url: "/supershell/setting/recovery",
        success: function(res) {
            if (res.stat === 'success'){
                $('#download-chunk-size').val(res.result.download_chunk_size.toString());
                $('#upload-max-size').val(res.result.upload_max_size.toString());
                $('#loader').css('display', 'block')
                toastr.success('恢复默认设置成功');
            }
            else if (res.stat === 'failed'){
                toastr.error(res.result, '恢复默认设置失败');
            }
            $('#loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M5 12l5 5l10 -10"></path>\
            </svg>');
        },
        error: function(data, type, error) {
            console.log(error)
            toastr.error(error.name + ": " + error.message, '恢复默认设置失败');
            $('#loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M5 12l5 5l10 -10"></path>\
            </svg>');
        },
    });
}