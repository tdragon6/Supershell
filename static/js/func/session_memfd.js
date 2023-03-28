/*
    会话页内存执行相关js方法
*/


// 划分原始文件列表数据
function divide_clients(files_num, pages_size, files_list){
    // 按pages_size分割数组
    let num = Math.ceil(files_num / pages_size);
	let pages_list = new Array(num);
    let index = 0;
    let resindex = 0;
	while (index < files_num) {
    	pages_list[resindex++] = files_list.slice(index, (index += pages_size));
	}
    return pages_list
}


// 常用文件点击排序按钮方法
function sort_by_field_server_files(id_field, rev){
    let field = id_field.substring(6);
    server_files_list.sort(sortBy(field, rev));
    show_server_files_single_page(server_files_pages_size, server_files_list, 1);
    $('#' + id_field).attr('onclick', 'sort_by_field_server_files($(this).attr(\'id\'), ' + !rev + ')');
}


// 显示常用文件表格中文件信息
function show_server_files_table(files_list){
    let num = 0;
    let html = '';
    for (let i=0;i<files_list.length;i++){
        num = num + 1;
        let file_size = renderSize(files_list[i]['server_file_size']);
        let operate_html = '<a class="nav-link" href="javascript:void(0)" onclick="inject_local_memfd(\'' + files_list[i]['server_file_name'] + '\', \'' + sessid + '\')">\
               <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-vaccine" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
               <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
               <path d="M17 3l4 4"></path>\
               <path d="M19 5l-4.5 4.5"></path>\
               <path d="M11.5 6.5l6 6"></path>\
               <path d="M16.5 11.5l-6.5 6.5h-4v-4l6.5 -6.5"></path>\
               <path d="M7.5 12.5l1.5 1.5"></path>\
               <path d="M10.5 9.5l1.5 1.5"></path>\
               <path d="M3 21l3 -3"></path>\
            </svg>\
        </a>';
        html = html + '<tr>\
        <td>' + num.toString() + '</td>\
        <td style="color: #206BC4">' + files_list[i]['server_file_name'] + '</td>\
        <td>' + file_size + '</td>\
        <td>' + files_list[i]['server_file_time'] + '</td>\
        <td>' + operate_html + '</td>\
    </tr>';
    $('#server_files_table').html(html);
    }
}


// 设置常用文件某页页面属性
function set_server_files_pages(pages_list, files_num, pages_size, no){
    // 设置左边页数提示
    let start = (no-1) * pages_size + 1;
    let end = (no-1) * pages_size + pages_list[no-1].length;

    $('#serverFilesPages-info').text('显示第 ' + start.toString() + ' 到第 ' + end.toString() + ' 条记录; 共 ' + files_num.toString() + ' 条');
    // 设置右边页数按钮信息
    let pages_html = '<li id="serverFilespage-prev"><a class="page-link" href="javascript:void(0)"><svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><polyline points="15 6 9 12 15 18" /></svg></a></li>';
    for (let i=0;i<pages_list.length;i++){
        pages_html = pages_html + '<li id="serverFilespage-' + (i+1).toString() + '" class="page-item"><a class="page-link" href="javascript:void(0)" onclick="show_server_files_single_page(server_files_pages_size, server_files_list, ' + (i+1).toString() + ')">' + (i+1).toString() + '</a></li>';
    }
    pages_html = pages_html + '<li id="serverFilespage-next"><a class="page-link" href="javascript:void(0)"><svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><polyline points="9 6 15 12 9 18" /></svg></a></li>'
    $('#serverFilesPages-button').html(pages_html);
    // 设置右边页数按钮激活状态
    $('#serverFilespage-' + no.toString()).attr('class', 'page-item active');
    // 设置右边页数上一页按钮
    if (no === 1){
        $('#serverFilespage-prev').attr('class', 'page-item disabled');
        $('#serverFilespage-prev').children().attr('aria-disabled', 'true');
    }
    else {
        $('#serverFilespage-prev').attr('class', 'page-item');
        $('#serverFilespage-prev').children().attr('aria-disabled', 'false');
        $('#serverFilespage-prev').children().attr('onclick', 'show_server_files_single_page(server_files_pages_size, server_files_list, ' + (no-1).toString() + ');');
    }
    // 设置右边页数下一页按钮
    if (no === pages_list.length){
        $('#serverFilespage-next').attr('class', 'page-item disabled');
        $('#serverFilespage-next').children().attr('aria-disabled', 'true');
    }
    else {
        $('#serverFilespage-next').attr('class', 'page-item');
        $('#serverFilespage-next').children().attr('aria-disabled', 'false');
        $('#serverFilespage-next').children().attr('onclick', 'show_server_files_single_page(server_files_pages_size, server_files_list, ' + (no+1).toString() + ');');
    }
}


// 显示常用文件单页数据
function show_server_files_single_page(pages_size, files_list, no){
    let files_num = files_list.length; // 获取原始常用文件列表类型文件数据有多少条数据
    let pages_list = divide_clients(files_num, pages_size, files_list); //划分原始列表类型文件数据
    if (pages_list.length === 0){
        $('#serverFilesPages-info').text('无数据');
        $('#server_files_table').html('');
        $('#serverFilesPages-button').html('');
        return;
    }
    set_server_files_pages(pages_list, files_num, pages_size, no); // 设置常用文件某页页面属性
    show_server_files_table(pages_list[no-1]); // 显示常用文件表格数据
}


// 根据路径获取常用文件列表的请求方法
function get_server_files_list(){
    $('#serverFiles-loader').html('<div class="spinner-border spinner-border-sm text-muted" role="status"></div>')
    $.ajax({
        type: "POST",
        url: "/supershell/server/files/list",
        contentType: 'application/json',
        success: function(res) {
            if (res.stat === 'failed'){
                toastr.error(res.result, '获取常用文件列表失败');
                $('#serverFiles-loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-alert-triangle-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M11.99 1.968c1.023 0 1.97 .521 2.512 1.359l.103 .172l7.1 12.25l.062 .126a3 3 0 0 1 -2.568 4.117l-.199 .008h-14l-.049 -.003l-.112 .002a3 3 0 0 1 -2.268 -1.226l-.109 -.16a3 3 0 0 1 -.32 -2.545l.072 -.194l.06 -.125l7.092 -12.233a3 3 0 0 1 2.625 -1.548zm.02 12.032l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -6a1 1 0 0 0 -.993 .883l-.007 .117v2l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-2l-.007 -.117a1 1 0 0 0 -.993 -.883z" stroke-width="0" fill="currentColor"></path>\
             </svg>')
            }
            else if (res.stat === 'success'){
                server_files_list = res.result;
                show_server_files_single_page(server_files_pages_size, res.result, 1);
                $('#serverFiles-loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                    <path d="M5 12l5 5l10 -10"></path>\
                </svg>')
            }
        },
        error: function(data, type, error) {
            console.log(error);
            toastr.error(error.name + ": " + error.message, '获取常用文件列表失败');
            $('#serverFiles-loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-alert-triangle-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
            <path d="M11.99 1.968c1.023 0 1.97 .521 2.512 1.359l.103 .172l7.1 12.25l.062 .126a3 3 0 0 1 -2.568 4.117l-.199 .008h-14l-.049 -.003l-.112 .002a3 3 0 0 1 -2.268 -1.226l-.109 -.16a3 3 0 0 1 -.32 -2.545l.072 -.194l.06 -.125l7.092 -12.233a3 3 0 0 1 2.625 -1.548zm.02 12.032l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -6a1 1 0 0 0 -.993 .883l-.007 .117v2l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-2l-.007 -.117a1 1 0 0 0 -.993 -.883z" stroke-width="0" fill="currentColor"></path>\
         </svg>')
        },
    });
}


// 显示本地注入模态框
function show_localInject(){
    get_server_files_list();
    $('#local_inject').modal('show');
}


// 去除首尾空格
function trim(string) {
    if(string.trim) {
        return string.trim();
    }else {
        let reg = /^\s+|\s+$/g;
        return string.replace(reg,"");
    }
}


// 远程注入方法
function inject_remote_memfd(sessid){
    let url = $('#remote_url').val();
    if (trim(url) === ''){
        toastr.error('远程链接不能为空', '远程注入失败');
        return;
    }
    let frame_url = '/supershell/memfd/inject?arg=' + sessid + '&arg=' + url;
    $('#inject-shell').attr('src', frame_url);
    toastr.success(url, '远程注入成功');
}


// 本地注入方法
function inject_local_memfd(filename, sessid){
    if (trim(filename) === ''){
        toastr.error('文件名不能为空', '本地注入失败');
        return;
    }
    let url = 'rssh://' + filename;
    let frame_url = '/supershell/memfd/inject?arg=' + sessid + '&arg=' + url;
    $('#inject-shell').attr('src', frame_url);
    $('#local_inject').modal('hide');
    toastr.success(url, '本地注入成功');
}