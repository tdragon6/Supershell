/*
    监控台相关方法
*/


// 获取连接rssh状态
function get_rssh_status(){
    $.ajax({
        type: "POST",
        url: "/supershell/monitor/status",
        success: function(res) {
            if (res.stat === 'success'){
                $('#status-logo').attr('class', 'status-indicator status-green status-indicator-animated');
                $('#status-title').attr('class', 'green');
                $('#status-title').text('正常');
            }
            else if (res.stat === 'failed'){
                $('#status-logo').attr('class', 'status-indicator status-red status-indicator-animated');
                $('#status-title').attr('class', 'red');
                $('#status-title').text('异常');
            }
            $('#status-text').text(res.result);
        },
        error: function(data, type, error) {
            console.log(error);
            toastr.error(error.name + ": " + error.message, '获取连接rssh服务器状态信息失败');
        },
    });
}


// 获取客户端个数
function get_clients_num(){
    $.ajax({
        type: "POST",
        url: "/supershell/monitor/clients",
        success: function(res) {
            if (res.stat === 'success'){
                $('#client-num').text(res.result.all_num.toString());
                $('#client-online-num').text(res.result.online_num.toString());
            }
            else if (res.stat === 'failed'){
                toastr.error(res.result, '获取客户端个数失败');
            }
        },
        error: function(data, type, error) {
            console.log(error);
            toastr.error(error.name + ": " + error.message, '获取客户端个数失败');
        },
    });
}


// 获取已生成客户端Payload个数和大小
function get_compiled_num_size(){
    $.ajax({
        type: "POST",
        url: "/supershell/monitor/compiled",
        success: function(res) {
            if (res.stat === 'success'){
                $('#compiled-num').text(res.result.num.toString());
                $('#compiled-size').text(renderSize(res.result.size));
            }
            else if (res.stat === 'failed'){
                toastr.error(res.result, '获取已生成客户端Payload个数和大小失败');
            }
        },
        error: function(data, type, error) {
            console.log(error);
            toastr.error(error.name + ": " + error.message, '获取已生成客户端Payload个数和大小失败');
        },
    });
}


// 获取常用文件个数和大小
function get_server_file_num_size(){
    $.ajax({
        type: "POST",
        url: "/supershell/monitor/server",
        success: function(res) {
            if (res.stat === 'success'){
                $('#serverFile-num').text(res.result.num.toString());
                $('#serverFile-size').text(renderSize(res.result.size));
            }
            else if (res.stat === 'failed'){
                toastr.error(res.result, '获取常用文件个数和大小失败');
            }
        },
        error: function(data, type, error) {
            console.log(error);
            toastr.error(error.name + ": " + error.message, '获取常用文件个数和大小失败');
        },
    });
}


// 获取日志总大小
function get_log_size(){
    $.ajax({
        type: "POST",
        url: "/supershell/monitor/log",
        success: function(res) {
            if (res.stat === 'success'){
                $('#log-size').text(renderSize(res.result.size));
            }
            else if (res.stat === 'failed'){
                toastr.error(res.result, '获取日志大小失败');
            }
        },
        error: function(data, type, error) {
            console.log(error);
            toastr.error(error.name + ": " + error.message, '获取日志大小失败');
        },
    });
}


// 获取rssh服务器版本和连接数
function get_rssh_version_num(){
    $.ajax({
        type: "POST",
        url: "/supershell/monitor/rssh",
        success: function(res) {
            if (res.stat === 'success'){
                if (res.result.version === ''){
                    $('#rssh-version').text('v1.0.16');
                }
                else{
                    $('#rssh-version').text(res.result.version);
                }
                $('#rssh-num').text(res.result.num);
            }
            else if (res.stat === 'failed'){
                toastr.error(res.result, '获取rssh服务器版本和连接数失败');
            }
        },
        error: function(data, type, error) {
            console.log(error);
            toastr.error(error.name + ": " + error.message, '获取rssh服务器版本和连接数失败');
        },
    });
}


// 显示supershell版本信息描述条目
function show_supershell_version_description(description_list){
    let html = '';
    for(let i=0;i<description_list.length;i++){
        html = html + '<div>\
            <svg xmlns="http://www.w3.org/2000/svg" class="icon text-green" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
            <path d="M5 12l5 5l10 -10"></path></svg>&nbsp;&nbsp;' + description_list[i] + '</div>';
    }
    $('#supershell-version-description').html(html);
}


// 获取Supershell版本信息
function get_supershell_version_info(){
    $.ajax({
        type: "POST",
        url: "/supershell/monitor/version",
        success: function(res) {
            if (res.stat === 'success'){
                $('#supershell-version').text(res.result.version);
                $('#supershell-version-mtime').text(res.result.mtime);
                show_supershell_version_description(res.result.description_list);
            }
            else if (res.stat === 'failed'){
                toastr.error(res.result, '获取Supershell版本信息失败');
            }
        },
        error: function(data, type, error) {
            console.log(error);
            toastr.error(error.name + ": " + error.message, '获取Supershell版本信息失败');
        },
    });
}


// 获取Supershell运行时间
function get_run_time(){
    $.ajax({
        type: "POST",
        url: "/supershell/monitor/time",
        success: function(res) {
            if (res.stat === 'success'){
                $('#run-time').text(res.result);
            }
            else if (res.stat === 'failed'){
                toastr.error(res.result, '获取Supershell运行时间失败');
            }
        },
        error: function(data, type, error) {
            console.log(error);
            toastr.error(error.name + ": " + error.message, '获取Supershell运行时间失败');
        },
    });
}


// 获取监控台全部信息
function get_monitor_info(){
    // 获取连接rssh状态
    get_rssh_status();

    // 获取客户端个数
    get_clients_num();

    // 获取已生成客户端Payload个数和大小
    get_compiled_num_size();

    // 获取常用文件个数和大小
    get_server_file_num_size();

    // 获取日志总大小
    get_log_size();

    // 获取rssh服务器版本和连接数
    get_rssh_version_num();

    // 获取Supershell版本信息
    get_supershell_version_info();

    // 获取Supershell运行时间
    get_run_time();
}