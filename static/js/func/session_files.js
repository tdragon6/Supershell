/*
    会话页文件管理相关js方法
*/


// 回车时间监听
function files_enter_listen(){
    $('#file_path').keydown(function(event) {
        if (event.keyCode == 13) {
            get_files_list($('#file_path').val(), sessid);
        }
    });
}


// 删除数组中指定元素，返回新数组
function delete_arry_element(arr, ele){
    let new_arr = [];
    for (let i=0;i<arr.length;i++){
        if (arr[i] !== ele){
            new_arr.push(arr[i]);
        }
    }
    return new_arr;
}


// 显示面包屑路径条
function show_bread_path(path){
    let path_list = delete_arry_element(path.split('/'), '');
    let item_path = ''
    let bread_html = '';
    for (let p=0;p<path_list.length;p++){
        if (p === (path_list.length - 1)){
            bread_html = bread_html + '<li class="breadcrumb-item active"><a>' + path_list[p] + '</a></li>';
        }
        else{
            item_path = item_path + '/' + path_list[p];
            bread_html = bread_html + '<li class="breadcrumb-item"><a href="javascript:void(0);" onclick="get_files_list(\'' + item_path + '\', \'' + sessid + '\');" style="text-decoration:none;">' + path_list[p] + '</a></li>';
        }
    }
    $('#bread_path').html(bread_html);
}


// 设置路径输入框默认当前路径
function set_default_path(default_path){
    if (default_path.stat === 'failed'){
        toastr.error(default_path.result, '获取默认路径失败');
    }
    else if (default_path.stat === 'success'){
        $('#file_path').val(default_path.result);
        show_bread_path(default_path.result);
    }
    else{
        toastr.error('Error', '获取默认路径失败');
    }
}



// 设置目录树根目录
function set_root_folder(root_folder, tree_setting, zNodes){
    if (root_folder.stat === 'failed'){
        toastr.error(root_folder.result, '获取目录树根目录失败')
    }
    else if (root_folder.stat === 'success'){
        for (let f=0;f<root_folder.result.length;f++){
            zNodes.push({name: root_folder.result[f], path: root_folder.result[f],  icon: "/static/img/icon/disk.svg", open: false, children: []});
        }
        zTreeObj = $.fn.zTree.init($("#tree"), tree_setting, zNodes)
    }
    else{
        toastr.error('Error', '获取目录树根目录失败')
    }
}


// 点击排序按钮方法
function sort_by_field(id_field, rev){
    let field = id_field.substring(6);
    files_list.sort(sortBy(field, rev));
    show_single_page(pages_size, files_list, 1);
    $('#' + id_field).attr('onclick', 'sort_by_field($(this).attr(\'id\'), ' + !rev + ')');
}


// 获取表格中目录和文件的类型html
function get_file_type_html(file_type_str){
    let file_type_html = ''
    if (file_type_str === 'folder'){
        file_type_html = '<svg t="1677502267327" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7234" width="24" height="24">\
        <path d="M918.673 883H104.327C82.578 883 65 867.368 65 848.027V276.973C65 257.632 82.578 242 104.327 242h814.346C940.422 242 958 257.632 958 276.973v571.054C958 867.28 940.323 883 918.673 883z" fill="#FFE9B4" p-id="7235"></path>\
        <path d="M512 411H65V210.37C65 188.597 82.598 171 104.371 171h305.92c17.4 0 32.71 11.334 37.681 28.036L512 411z" fill="#FFB02C" p-id="7236"></path>\
        <path d="M918.673 883H104.327C82.578 883 65 865.42 65 843.668V335.332C65 313.58 82.578 296 104.327 296h814.346C940.422 296 958 313.58 958 335.332v508.336C958 865.32 940.323 883 918.673 883z" fill="#FFCA28" p-id="7237"></path>\
        </svg>'
    }
    else{
        file_type_html = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-file-description" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
        <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>\
        <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>\
        <path d="M9 17h6"></path>\
        <path d="M9 13h6"></path>\
     </svg>'
    }
    return file_type_html;
}


// 获取表格中文件名html
function get_file_filename_html(file_path, file_type_str, file_name){
    let filename_html = '';
    if (file_type_str === 'folder'){
        filename_html = '<a href="javascript:void(0);" onclick="get_files_list(\'' + file_path + '\', \'' + sessid + '\');" style="text-decoration:none;">' + file_name + '</a>';
    }
    else{
        filename_html = file_name;
    }
    return filename_html;
}


// 获取表格中操作html
function get_operate_html(file_path, file_type_str){
    let operate_html = '';
    if (file_type_str === 'file'){
        let encode_path = encodeURIComponent(file_path);
        let download_link = '/supershell/session/files/download?path=' + encode_path + '&' + 'sessid=' + sessid;
        operate_html = '<div class="dropdown">\
        <a href="javascripy:void(0)" class="btn-action" data-bs-toggle="dropdown" aria-expanded="false">\
          <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-dots-vertical" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
            <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>\
            <path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>\
            <path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>\
          </svg>\
        </a>\
        <div class="dropdown-menu">\
          <a class="dropdown-item" href="javascript:void(0);" onclick="copyText(\'' + file_path + '\')">\
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-copy" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z"></path>\
                <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2"></path>\
            </svg>\
            &nbsp;&nbsp;复制路径\
          </a>\
          <a class="dropdown-item" href="javascript:void(0);" onclick="show_renamePath(\'' + file_path + '\');">\
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-rotate-rectangle" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M10.09 4.01l.496 -.495a2 2 0 0 1 2.828 0l7.071 7.07a2 2 0 0 1 0 2.83l-7.07 7.07a2 2 0 0 1 -2.83 0l-7.07 -7.07a2 2 0 0 1 0 -2.83l3.535 -3.535h-3.988"></path>\
                <path d="M7.05 11.038v-3.988"></path>\
            </svg>\
            &nbsp;&nbsp;重命名\
          </a>\
          <a class="dropdown-item" href="javascript:void(0);" onclick="show_editFile(\'' + file_path + '\');">\
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-edit" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1"></path>\
                <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z"></path>\
                <path d="M16 5l3 3"></path>\
            </svg>\
            &nbsp;&nbsp;编辑文件\
          </a>\
          <a class="dropdown-item" href="' + download_link + '">\
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-download" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path>\
                <path d="M7 11l5 5l5 -5"></path>\
                <path d="M12 4l0 12"></path>\
            </svg>\
            &nbsp;&nbsp;下载文件\
          </a>\
          <div class="dropdown-divider"></div>\
          <a class="dropdown-item" href="javascript:void(0);" onclick="show_deletePath(\'file\', \'' + file_path + '\');">\
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-trash" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
               <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
               <path d="M4 7l16 0"></path>\
               <path d="M10 11l0 6"></path>\
               <path d="M14 11l0 6"></path>\
               <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>\
               <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>\
            </svg>\
            &nbsp;&nbsp;删除文件\
          </a>\
        </div>\
      </div>';
    }
    else{
        operate_html = '<div class="dropdown">\
        <a href="javascripy:void(0)" class="btn-action" data-bs-toggle="dropdown" aria-expanded="false">\
          <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-dots-vertical" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
            <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>\
            <path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>\
            <path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>\
          </svg>\
        </a>\
        <div class="dropdown-menu">\
          <a class="dropdown-item" href="javascript:void(0);" onclick="copyText(\'' + file_path + '\')">\
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-copy" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z"></path>\
                <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2"></path>\
            </svg>\
            &nbsp;&nbsp;复制路径\
          </a>\
          <a class="dropdown-item" href="javascript:void(0);" onclick="show_renamePath(\'' + file_path + '\');">\
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-rotate-rectangle" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M10.09 4.01l.496 -.495a2 2 0 0 1 2.828 0l7.071 7.07a2 2 0 0 1 0 2.83l-7.07 7.07a2 2 0 0 1 -2.83 0l-7.07 -7.07a2 2 0 0 1 0 -2.83l3.535 -3.535h-3.988"></path>\
                <path d="M7.05 11.038v-3.988"></path>\
            </svg>\
            &nbsp;&nbsp;重命名\
          </a>\
          <div class="dropdown-divider"></div>\
          <a class="dropdown-item" href="javascript:void(0);" onclick="show_deletePath(\'folder\', \'' + file_path + '\', sessid);">\
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-trash" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
               <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
               <path d="M4 7l16 0"></path>\
               <path d="M10 11l0 6"></path>\
               <path d="M14 11l0 6"></path>\
               <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>\
               <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>\
            </svg>\
            &nbsp;&nbsp;删除目录\
          </a>\
        </div>\
      </div>';
    }
    return operate_html;
}


// 显示表格中文件信息
function show_files_table(files_list){
    let html = '';
    for (let i=0;i<files_list.length;i++){
        let file_type_html = get_file_type_html(files_list[i]['file_type']);
        let file_name_html = get_file_filename_html(files_list[i]['file_path'], files_list[i]['file_type'], files_list[i]['file_name']);
        let file_size = renderSize(files_list[i]['file_size']);
        let operate_html = get_operate_html(files_list[i]['file_path'], files_list[i]['file_type']);
        html = html + '<tr>\
        <td>' + file_type_html + '</td>\
        <td>' + file_name_html + '</td>\
        <td>' + file_size + '</td>\
        <td>' + files_list[i]['file_mode'] + '</td>\
        <td>' + files_list[i]['file_time'] + '</td>\
        <td>' + operate_html + '</td>\
    </tr>';
    $('#files_table').html(html);
    }
}


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


// 设置某页页面属性
function set_pages(pages_list, files_num, pages_size, no){
    // 设置左边页数提示
    let start = (no-1) * pages_size + 1;
    let end = (no-1) * pages_size + pages_list[no-1].length;

    $('#pages-info').text('显示第 ' + start.toString() + ' 到第 ' + end.toString() + ' 条记录; 共 ' + files_num.toString() + ' 条');
    // 设置右边页数按钮信息
    let pages_html = '<li id="page-prev"><a class="page-link" href="javascript:void(0)"><svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><polyline points="15 6 9 12 15 18" /></svg></a></li>';
    for (let i=0;i<pages_list.length;i++){
        pages_html = pages_html + '<li id="page-' + (i+1).toString() + '" class="page-item"><a class="page-link" href="javascript:void(0)" onclick="show_single_page(pages_size, files_list, ' + (i+1).toString() + ')">' + (i+1).toString() + '</a></li>';
    }
    pages_html = pages_html + '<li id="page-next"><a class="page-link" href="javascript:void(0)"><svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><polyline points="9 6 15 12 9 18" /></svg></a></li>'
    $('#pages-button').html(pages_html);
    // 设置右边页数按钮激活状态
    $('#page-' + no.toString()).attr('class', 'page-item active');
    // 设置右边页数上一页按钮
    if (no === 1){
        $('#page-prev').attr('class', 'page-item disabled');
        $('#page-prev').children().attr('aria-disabled', 'true');
    }
    else {
        $('#page-prev').attr('class', 'page-item');
        $('#page-prev').children().attr('aria-disabled', 'false');
        $('#page-prev').children().attr('onclick', 'show_single_page(pages_size, files_list, ' + (no-1).toString() + ');');
    }
    // 设置右边页数下一页按钮
    if (no === pages_list.length){
        $('#page-next').attr('class', 'page-item disabled');
        $('#page-next').children().attr('aria-disabled', 'true');
    }
    else {
        $('#page-next').attr('class', 'page-item');
        $('#page-next').children().attr('aria-disabled', 'false');
        $('#page-next').children().attr('onclick', 'show_single_page(pages_size, files_list, ' + (no+1).toString() + ');');
    }
}


// 显示单页数据
function show_single_page(pages_size, files_list, no){
    let files_num = files_list.length; // 获取原始列表类型文件数据有多少条数据
    let pages_list = divide_clients(files_num, pages_size, files_list); //划分原始列表类型文件数据
    if (pages_list.length === 0){
        $('#pages-info').text('无数据');
        $('#files_table').html('');
        $('#pages-button').html('');
        return;
    }
    set_pages(pages_list, files_num, pages_size, no); // 设置某页页面属性
    show_files_table(pages_list[no-1]); // 显示表格数据
}


// 根据路径获取文件列表的请求方法
function get_files_list(path, sessid){
    $('#loader').html('<div class="spinner-border spinner-border-sm text-muted" role="status"></div>')
    $('#file_path').val(path);
    let input_data = {
        'path': path,
        'sessid': sessid,
    };
    // 请求编号，在基础上加一
    files_no = files_no + 1;
    let self_no = files_no;
    $.ajax({
        type: "POST",
        url: "/supershell/session/files/list",
        contentType: 'application/json',
        data: JSON.stringify(input_data),
        success: function(res) {
            if (res.stat === 'failed'){
                // 判断该次请求是不是最后一次请求，如果不是则忽略
                if (self_no !== files_no){
                    return;
                }
                toastr.error(res.result, '获取文件列表失败');
                $('#loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-alert-triangle-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M11.99 1.968c1.023 0 1.97 .521 2.512 1.359l.103 .172l7.1 12.25l.062 .126a3 3 0 0 1 -2.568 4.117l-.199 .008h-14l-.049 -.003l-.112 .002a3 3 0 0 1 -2.268 -1.226l-.109 -.16a3 3 0 0 1 -.32 -2.545l.072 -.194l.06 -.125l7.092 -12.233a3 3 0 0 1 2.625 -1.548zm.02 12.032l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -6a1 1 0 0 0 -.993 .883l-.007 .117v2l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-2l-.007 -.117a1 1 0 0 0 -.993 -.883z" stroke-width="0" fill="currentColor"></path>\
             </svg>')
            }
            else if (res.stat === 'success'){
                // 判断该次请求是不是最后一次请求，如果不是则忽略
                if (self_no !== files_no){
                    return;
                }
                files_list = res.result;
                show_single_page(pages_size, res.result, 1);
                show_bread_path(path);
                $('#loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                    <path d="M5 12l5 5l10 -10"></path>\
                </svg>')
            }
        },
        error: function(data, type, error) {
            // 判断该次请求是不是最后一次请求，如果不是则忽略
            if (self_no !== files_no){
                return;
            }
            console.log(error);
            toastr.error(error.name + ": " + error.message, '获取文件列表失败');
            $('#loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-alert-triangle-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
            <path d="M11.99 1.968c1.023 0 1.97 .521 2.512 1.359l.103 .172l7.1 12.25l.062 .126a3 3 0 0 1 -2.568 4.117l-.199 .008h-14l-.049 -.003l-.112 .002a3 3 0 0 1 -2.268 -1.226l-.109 -.16a3 3 0 0 1 -.32 -2.545l.072 -.194l.06 -.125l7.092 -12.233a3 3 0 0 1 2.625 -1.548zm.02 12.032l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -6a1 1 0 0 0 -.993 .883l-.007 .117v2l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-2l-.007 -.117a1 1 0 0 0 -.993 -.883z" stroke-width="0" fill="currentColor"></path>\
         </svg>')
        },
    });
}


// 目录树展开前执行的方法
function zTreeOnExpand(event, treeId, treeNode) {
    $('#tree-loader').html('<div class="spinner-border spinner-border-sm text-muted" role="status"></div>')
    zTreeObj.removeChildNodes(treeNode);
    let input_data = {
        'path': treeNode.path,
        'sessid': sessid,
    };
    // 请求编号，在基础上加一
    tree_no = tree_no + 1;
    let self_no = tree_no;
    $.ajax({
        type: "POST",
        url: "/supershell/session/files/tree/folder",
        contentType: 'application/json',
        data: JSON.stringify(input_data),
        success: function(res) {
            if (res.stat === 'failed'){
                toastr.error(res.result, '获取目录树失败');
                zTreeObj.addNodes(treeNode, []);
                // 判断该次请求是不是最后一次请求，如果不是则不会把状态图标置对勾
                if (self_no !== tree_no){
                    return;
                }
                $('#tree-loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-alert-triangle-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M11.99 1.968c1.023 0 1.97 .521 2.512 1.359l.103 .172l7.1 12.25l.062 .126a3 3 0 0 1 -2.568 4.117l-.199 .008h-14l-.049 -.003l-.112 .002a3 3 0 0 1 -2.268 -1.226l-.109 -.16a3 3 0 0 1 -.32 -2.545l.072 -.194l.06 -.125l7.092 -12.233a3 3 0 0 1 2.625 -1.548zm.02 12.032l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -6a1 1 0 0 0 -.993 .883l-.007 .117v2l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-2l-.007 -.117a1 1 0 0 0 -.993 -.883z" stroke-width="0" fill="currentColor"></path>\
             </svg>');
            }
            else if (res.stat === 'success'){
                folder_list = res.result;
                if (folder_list.length === 0){
                    zTreeObj.addNodes(treeNode, []);
                }
                else{
                    for (let f=0;f<folder_list.length;f++){
                        let sep = '/';
                        if (treeNode.path.substr(-1) === '/'){
                            sep = '';
                        }
                        let child = [{
                                    name: folder_list[f],
                                    path: treeNode.path + sep + folder_list[f],
                                    iconClose: "/static/img/icon/folder-close.svg",
                                    iconOpen: "/static/img/icon/folder-open.svg",
                                    open: false,
                                    children: []
                                }];
                        zTreeObj.addNodes(treeNode, child);
                    }
                }
                // 判断该次请求是不是最后一次请求，如果不是则不会把状态图标置对勾
                if (self_no !== tree_no){
                    return;
                }
                $('#tree-loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                    <path d="M5 12l5 5l10 -10"></path>\
                </svg>')
            }
        },
        error: function(data, type, error) {
            console.log(error);
            toastr.error(error.name + ": " + error.message, '获取目录树失败');
            zTreeObj.addNodes(treeNode, []);
            // 判断该次请求是不是最后一次请求，如果不是则不会把状态图标置对勾
            if (self_no !== tree_no){
                return;
            }
            $('#tree-loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-alert-triangle-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
            <path d="M11.99 1.968c1.023 0 1.97 .521 2.512 1.359l.103 .172l7.1 12.25l.062 .126a3 3 0 0 1 -2.568 4.117l-.199 .008h-14l-.049 -.003l-.112 .002a3 3 0 0 1 -2.268 -1.226l-.109 -.16a3 3 0 0 1 -.32 -2.545l.072 -.194l.06 -.125l7.092 -12.233a3 3 0 0 1 2.625 -1.548zm.02 12.032l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -6a1 1 0 0 0 -.993 .883l-.007 .117v2l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-2l-.007 -.117a1 1 0 0 0 -.993 -.883z" stroke-width="0" fill="currentColor"></path>\
         </svg>');
        },
    });
    return false;
}


// 目录树节点点击方法
function zTreeOnClick(event, treeId, treeNode) {
    get_files_list(treeNode.path, sessid);
}


// 显示新建目录模态框
function show_mkdir(){
    $('#make_dir_name').val('');
    $('#mkdir-loader').css('display', 'none');
    $('#mkdir-btn').css('display', 'block');
    let path_list = delete_arry_element($('#file_path').val().split('/'), '');
    let path = '';
    for (let p=0;p<path_list.length;p++){
        path = path + '/' + path_list[p];
    }
    path = path + '/';
    $('#make_dir_path').text(path);
    $('#make_dir_name').attr('oninput', 'update_mkdir_path(\'' + path + '\')');
    $('#make_dir').modal('show');
}


// 实时更新新建目录输入
function update_mkdir_path(ori_path){
    $('#make_dir_path').text(ori_path + $('#make_dir_name').val());
}


// 新建目录方法
function mkdir(path, sessid){
    $('#mkdir-btn').css('display', 'none');
    $('#mkdir-loader').css('display', 'block');
    $('#make_dir_name').attr('disabled', 'disabled');
    let input_data = {
        'path': path,
        'sessid': sessid
    };
    $.ajax({
        type: "POST",
        url: "/supershell/session/files/mkdir",
        contentType: 'application/json',
        data: JSON.stringify(input_data),
        success: function(res) {
            if (res.stat === 'failed'){
                $('#mkdir-loader').css('display', 'none');
                $('#mkdir-btn').css('display', 'block');
                $('#make_dir_name').removeAttr('disabled');
                toastr.error(res.result, '新建目录失败');
            }
            else if (res.stat === 'success'){
                $('#mkdir-loader').css('display', 'none');
                $('#mkdir-btn').css('display', 'block');
                $('#make_dir_name').removeAttr('disabled');
                $('#make_dir').modal('hide');
                toastr.success(res.result, '新建目录成功，请重新进入目录刷新');
            }
        },
        error: function(data, type, error) {
            $('#mkdir-loader').css('display', 'none');
            $('#mkdir-btn').css('display', 'block');
            $('#make_dir_name').removeAttr('disabled');
            console.log(error);
            toastr.error(error.name + ": " + error.message, '新建目录失败');
        },
    });
}


// 显示重命名模态框
function show_renamePath(ori_path){
    $('#rename_name').val('');
    $('#renamePath-loader').css('display', 'none');
    $('#renamePath-btn').css('display', 'block');
    let ori_path_list = delete_arry_element(ori_path.split('/'), '');
    let new_path = '';
    for (let p=0;p<ori_path_list.length;p++){
        if (p === (ori_path_list.length - 1)){
            continue;
        }
        new_path = new_path + '/' + ori_path_list[p];
    }
    new_path = new_path + '/';
    $('#ori_rename_path').text(ori_path);
    $('#new_rename_path').text(new_path);
    $('#rename_name').attr('oninput', 'update_rename_path(\'' + new_path + '\')');
    $('#rename_path').modal('show');
}


// 实时更新重命名输入
function update_rename_path(ori_new_path){
    $('#new_rename_path').text(ori_new_path + $('#rename_name').val());
}


// 重命名方法
function renamePath(ori_path, new_path, sessid){
    $('#renamePath-btn').css('display', 'none');
    $('#renamePath-loader').css('display', 'block');
    $('#rename_name').attr('disabled', 'disabled');
    let input_data = {
        'ori_path': ori_path,
        'new_path': new_path,
        'sessid': sessid
    };
    $.ajax({
        type: "POST",
        url: "/supershell/session/files/rename",
        contentType: 'application/json',
        data: JSON.stringify(input_data),
        success: function(res) {
            if (res.stat === 'failed'){
                $('#renamePath-loader').css('display', 'none');
                $('#renamePath-btn').css('display', 'block');
                $('#rename_name').removeAttr('disabled');
                toastr.error(res.result, '重命名失败');
            }
            else if (res.stat === 'success'){
                $('#renamePath-loader').css('display', 'none');
                $('#renamePath-btn').css('display', 'block');
                $('#rename_name').removeAttr('disabled');
                $('#rename_path').modal('hide');
                toastr.success(res.result, '重命名成功，请重新进入目录刷新');
            }
        },
        error: function(data, type, error) {
            $('#renamePath-loader').css('display', 'none');
            $('#renamePath-btn').css('display', 'block');
            $('#rename_name').removeAttr('disabled');
            console.log(error);
            toastr.error(error.name + ": " + error.message, '重命名失败');
        },
    });
}


// 显示删除模态框
function show_deletePath(file_type_str, path){
    let des_file_type = '文件';
    if (file_type_str === 'folder'){
        des_file_type = '目录';
    }
    $('#deletePath-loader').css('display', 'none');
    $('#deletePath-btn').css('display', 'block');
    $('#delete_path_title').text('确认要删除' + des_file_type + '吗？');
    $('#delete_path_content').text(path);
    $('#deletePath-btn').attr('onclick', 'deletePath(\'' + file_type_str + '\', \'' + path + '\', \'' + sessid + '\');');
    $('#delete_path').modal('show');
}


// 删除方法
function deletePath(file_type_str, path, sessid){
    $('#deletePath-btn').css('display', 'none');
    $('#deletePath-loader').css('display', 'block');
    let input_data = {
        'file_type': file_type_str,
        'path': path,
        'sessid': sessid
    };
    $.ajax({
        type: "POST",
        url: "/supershell/session/files/delete",
        contentType: 'application/json',
        data: JSON.stringify(input_data),
        success: function(res) {
            if (res.stat === 'failed'){
                $('#deletePath-loader').css('display', 'none');
                $('#deletePath-btn').css('display', 'block');
                $('#delete_path').modal('hide');
                toastr.error(res.result, '删除失败');
            }
            else if (res.stat === 'success'){
                $('#deletePath-loader').css('display', 'none');
                $('#deletePath-btn').css('display', 'block');
                $('#delete_path').modal('hide');
                toastr.success(res.result, '删除成功，请重新进入目录刷新');
            }
        },
        error: function(data, type, error) {
            $('#deletePath-loader').css('display', 'none');
            $('#deletePath-btn').css('display', 'block');
            $('#delete_path').modal('hide');
            console.log(error);
            toastr.error(error.name + ": " + error.message, '删除失败');
        },
    });
}


// 读取文件方法
function read_file(path){
    let input_data = {
        'path': path,
        'sessid': sessid
    };
    $.ajax({
        type: "POST",
        url: "/supershell/session/files/read",
        contentType: 'application/json',
        data: JSON.stringify(input_data),
        success: function(res) {
            if (res.stat === 'failed'){
                $('#editFile-loader').css('display', 'none');
                $('#editFile-btn').css('display', 'none');
                $('#edit_file_content').val(res.result);
                $('#edit_file_content').attr('disabled', 'disabled');
            }
            else if (res.stat === 'success'){
                $('#editFile-loader').css('display', 'none');
                $('#editFile-btn').css('display', 'block');
                $('#edit_file_content').val(res.result);
                $('#edit_file_content').removeAttr('disabled');
            }
        },
        error: function(data, type, error) {
            $('#editFile-loader').css('display', 'none');
            $('#editFile-btn').css('display', 'none');
            $('#edit_file_content').val(error.name + ": " + error.message);
            $('#edit_file_content').attr('disabled', 'disabled');
            console.log(error);
        },
    });
}


// 显示编辑文件模态框
function show_editFile(path){
    $('#edit_file_content').val('');
    $('#edit_file_content').attr('disabled', 'disabled');
    $('#editFile-btn').css('display', 'none');
    $('#editFile-loader').css('display', 'block');

    $('#edit_file_path').text(path);
    $('#edit_file').modal('show');
    read_file(path);
}


// 编辑文件方法
function editFile(path, content, sessid){
    $('#editFile-btn').css('display', 'none');
    $('#editFile-loader').css('display', 'block');
    $('#edit_file_content').attr('disabled', 'disabled');
    let input_data = {
        'path': path,
        'content': content,
        'sessid': sessid,
        'overwrite': 'true'
    };
    $.ajax({
        type: "POST",
        url: "/supershell/session/files/write",
        contentType: 'application/json',
        data: JSON.stringify(input_data),
        success: function(res) {
            if (res.stat === 'failed'){
                $('#editFile-loader').css('display', 'none');
                $('#editFile-btn').css('display', 'block');
                $('#edit_file_content').removeAttr('disabled');
                toastr.error(res.result, '写入文件失败');
            }
            else if (res.stat === 'success'){
                $('#editFile-loader').css('display', 'none');
                $('#editFile-btn').css('display', 'block');
                $('#edit_file_content').removeAttr('disabled');
                $('#edit_file').modal('hide');
                toastr.success(res.result, '写入文件成功，请重新进入目录刷新');
            }
        },
        error: function(data, type, error) {
            $('#editFile-loader').css('display', 'none');
            $('#editFile-btn').css('display', 'block');
            $('#edit_file_content').removeAttr('disabled');
            console.log(error);
            toastr.error(error.name + ": " + error.message, '写入文件失败');
        },
    });
}


// 显示新建文件模态框
function show_newFile(){
    $('#new_file_name').val('');
    $('#new_file_content').val('');
    $('#newFile-loader').css('display', 'none');
    $('#newFile-btn').css('display', 'block');
    let path_list = delete_arry_element($('#file_path').val().split('/'), '');
    let path = '';
    for (let p=0;p<path_list.length;p++){
        path = path + '/' + path_list[p];
    }
    path = path + '/';
    $('#new_file_path').text(path);
    $('#new_file_name').attr('oninput', 'update_newFile_path(\'' + path + '\')');
    $('#new_file').modal('show');
}


// 实时更新新建文件的文件名输入
function update_newFile_path(ori_path){
    $('#new_file_path').text(ori_path + $('#new_file_name').val());
}


// 新建文件方法
function newFile(path, content, sessid){
    $('#newFile-btn').css('display', 'none');
    $('#newFile-loader').css('display', 'block');
    $('#new_file_name').attr('disabled', 'disabled');
    $('#new_file_content').attr('disabled', 'disabled');
    let input_data = {
        'path': path,
        'content': content,
        'sessid': sessid,
        'overwrite': 'false'
    };
    $.ajax({
        type: "POST",
        url: "/supershell/session/files/write",
        contentType: 'application/json',
        data: JSON.stringify(input_data),
        success: function(res) {
            if (res.stat === 'failed'){
                $('#newFile-loader').css('display', 'none');
                $('#newFile-btn').css('display', 'block');
                $('#new_file_name').removeAttr('disabled');
                $('#new_file_content').removeAttr('disabled');
                toastr.error(res.result, '写入文件失败');
            }
            else if (res.stat === 'success'){
                $('#newFile-loader').css('display', 'none');
                $('#newFile-btn').css('display', 'block');
                $('#new_file_name').removeAttr('disabled');
                $('#new_file_content').removeAttr('disabled');
                $('#new_file').modal('hide');
                toastr.success(res.result, '写入文件成功，请重新进入目录刷新');
            }
        },
        error: function(data, type, error) {
            $('#newFile-loader').css('display', 'none');
            $('#newFile-btn').css('display', 'block');
            $('#new_file_name').removeAttr('disabled');
            $('#new_file_content').removeAttr('disabled');
            console.log(error);
            toastr.error(error.name + ": " + error.message, '写入文件失败');
        },
    });
}


/*
    常用文件显示相关js方法
*/


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
        let operate_html = '<a class="nav-link" href="javascript:void(0)" onclick="upload_server_check(\'' + files_list[i]['server_file_name'] + '\', \'' + $('#upload_file_path').text() + '\', \'' + sessid + '\')">\
                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-upload" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path>\
                <path d="M7 9l5 -5l5 5"></path>\
                <path d="M12 4l0 12"></path>\
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


// 显示上传文件模态框
function show_uploadFile(){
    get_server_files_list();
    let path_list = delete_arry_element($('#file_path').val().split('/'), '');
    let path = '';
    for (let p=0;p<path_list.length;p++){
        path = path + '/' + path_list[p];
    }
    $('#upload_file_path').text(path);
    $('#upload_file').modal('show');
}


/*
    上传文件相关js方法
*/


// 从常用文件上传文件检查方法
function upload_server_check(filename, path, sessid){
    $('#upload-loader').attr('style', '');
    let input_data = {
        'path': path,
        'sessid': sessid
    };
    $.ajax({
        type: "POST",
        url: "/supershell/session/files/upload/server/check",
        contentType: 'application/json',
        headers: {'filename': filename},
        data: JSON.stringify(input_data),
        success: function(res) {
            if (res.stat === 'failed'){
                $('#upload-loader').css('display', 'none');
                toastr.error(res.result, '文件上传检查不通过');
            }
            else if (res.stat === 'success'){
                if ($("div[uploadId='upload-progress-item-" + filename + "']") !== null) {
                    $("div[uploadId='upload-progress-item-" + filename + "']").remove();
                }
                let progress_html = '<div uploadId="upload-progress-item-' + filename + '" class="list-group-item">\
                    <div class="row align-items-center">\
                    <div class="col-auto"><span uploadId="upload-progress-status-' + filename + '" class="status-dot status-dot-animated bg-blue d-block"></span></div>\
                    <div class="col text-truncate">\
                        <div class="text-body d-block">\
                            <strong uploadId="upload-progress-filename-' + filename + '"></strong>\
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\
                            <span uploadId="upload-progress-info-' + filename + '" class="text-muted">上传中...</span>\
                        </div>\
                        <div class="d-block text-muted text-truncate mt-n1">\
                        <div class="progress mt-2">\
                            <div uploadId="upload-progress-bar-' + filename + '" class="progress-bar progress-bar-indeterminate bg-blue" role="progressbar">\
                            </div>\
                        </div>\
                        </div>\
                    </div>\
                    </div>\
                </div>';
                $('#upload-progress').append(progress_html);
                $("strong[uploadId='upload-progress-filename-" + filename + "']").text(filename);
                upload_from_server(filename, path, sessid);
                $('#upload-loader').css('display', 'none');
                $('#upload_file').modal('hide');
                $('#bell-info').dropdown('show');
                toastr.info(filename + ': 已添加到上传列表');
            }
        },
        error: function(data, type, error) {
            $('#upload-loader').css('display', 'none');
            console.log(error);
            toastr.error(error.name + ": " + error.message, '文件上传检查不通过');
        },
    });
}

// 从常用文件上传至目标目录方法
function upload_from_server(filename, path, sessid){
    let input_data = {
        'path': path,
        'sessid': sessid
    };
    $.ajax({
        type: "POST",
        url: "/supershell/session/files/upload/server",
        contentType: 'application/json',
        headers: {'filename': filename},
        data: JSON.stringify(input_data),
        success: function (res) {
            if (res.stat === 'failed'){
                $("span[uploadId='upload-progress-info-" + filename + "']").text('上传失败');
                $("span[uploadId='upload-progress-status-" + filename + "']").attr('class', 'status-dot d-block');
                $("div[uploadId='upload-progress-bar-" + filename + "']").attr('class', 'progress-bar');
                toastr.error(res.result, '上传失败');
            }
            else if (res.stat === 'success'){
                $("span[uploadId='upload-progress-info-" + filename + "']").text('上传成功');
                $("div[uploadId='upload-progress-bar-" + filename + "']").css('width', '100%');
                $("div[uploadId='upload-progress-bar-" + filename + "']").attr('class', 'progress-bar bg-green');
                $("span[uploadId='upload-progress-status-" + filename + "']").attr('class', 'status-dot bg-green d-block');
                toastr.success(res.result, '上传成功，请重新进入目录刷新');
            }
        },
        error: function (data, type, error) {
            $("span[uploadId='upload-progress-info-" + filename + "']").text('上传失败');
            $("span[uploadId='upload-progress-status-" + filename + "']").attr('class', 'status-dot d-block');
            $("div[uploadId='upload-progress-bar-" + filename + "']").attr('class', 'progress-bar');
            console.log(error);
            toastr.error(error.name + ": " + error.message, '上传失败');
        }
    });
}


// 从本地上传文件至目标目录检查方法
$('#local-file-upload').change(function(){
    $('#upload-loader').attr('style', '');
    let upload_file_local = $('#local-file-upload').prop("files")[0];
    $('#local-file-upload').val('');
    if (upload_file_local === undefined){
        return;
    }
    let filename = upload_file_local.name;
    let path = $('#file_path').val();
    let headers = {
        'filename': filename,
        'path': path,
        'sessid': sessid,
        'size': upload_file_local.size
    };
    $.ajax({
        type: "POST",
        url: "/supershell/session/files/upload/local/check",
        contentType: 'application/json',
        headers: headers,
        success: function(res) {
            if (res.stat === 'failed'){
                $('#upload-loader').css('display', 'none');
                toastr.error(res.result, '文件上传检查不通过');
            }
            else if (res.stat === 'success'){
                if ($("div[uploadId='upload-progress-item-" + filename + "']") !== null){
                    $("div[uploadId='upload-progress-item-" + filename + "']").remove();
                }
                let progress_html = '<div uploadId="upload-progress-item-' + filename + '" class="list-group-item">\
                    <div class="row align-items-center">\
                    <div class="col-auto"><span uploadId="upload-progress-status-' + filename + '" class="status-dot status-dot-animated bg-blue d-block"></span></div>\
                    <div class="col text-truncate">\
                        <div class="text-body d-block">\
                            <strong uploadId="upload-progress-filename-' + filename + '"></strong>\
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\
                            <span uploadId="upload-progress-size-' + filename + '" class="text-muted"></span>\
                            &nbsp;&nbsp;&nbsp;&nbsp;\
                            <span uploadId="upload-progress-percent-' + filename + '" class="text-muted"></span>\
                            &nbsp;&nbsp;&nbsp;&nbsp;\
                            <span uploadId="upload-progress-speed-' + filename + '" class="text-muted"></span>\
                            &nbsp;&nbsp;&nbsp;&nbsp;\
                            <span uploadId="upload-progress-time-' + filename + '" class="text-muted"></span>\
                        </div>\
                        <div class="d-block text-muted text-truncate mt-n1">\
                        <div class="progress mt-2">\
                            <div uploadId="upload-progress-bar-' + filename + '" class="progress-bar" role="progressbar">\
                            </div>\
                        </div>\
                        </div>\
                    </div>\
                    </div>\
                </div>';
                $('#upload-progress').append(progress_html);
                $("strong[uploadId='upload-progress-filename-" + filename + "']").text(filename);
                upload_from_local(filename, path, sessid, upload_file_local);
                $('#upload-loader').css('display', 'none');
                $('#upload_file').modal('hide');
                $('#bell-info').dropdown('show');
                toastr.info(filename + ': 已添加到上传列表');
            }
        },
        error: function(data, type, error) {
            $('#upload-loader').css('display', 'none');
            console.log(error);
            toastr.error(error.name + ": " + error.message, '文件上传检查不通过');
        },
    });
})


// 从本地上传文件至目标目录方法
function upload_from_local(filename, path, sessid, upload_file_local){
    let headers = {
        'filename': filename,
        'path': path,
        'sessid': sessid
    };
    $.ajax({
        url: '/supershell/session/files/upload/local',
        type: 'POST',
        headers: headers,
        data: upload_file_local,
        processData: false,
        contentType: false,
        xhr: function() {
            let xhr = new XMLHttpRequest();
            let lastTime = 0;
            let lastSize = 0;
            xhr.upload.addEventListener('progress', function (event) {
                let pro_size = renderSize(event.loaded) + '/' + renderSize(event.total);
                let nowTime = new Date().getTime();
                let intervalTime = (nowTime - lastTime)/1000;
                let intervalSize = event.loaded - lastSize;

                lastTime = nowTime;
                lastSize = event.loaded;

                let bspeed = intervalSize/intervalTime;
                let speed = speedUnit(bspeed);

                let leftTime = ((event.total - event.loaded) / bspeed);
                leftTime = formatSeconds(leftTime);

                let progressRate = (event.loaded / event.total) * 99;
                progressRate = parseInt(progressRate).toString() + '%';

                $("span[uploadId='upload-progress-size-" + filename + "']").text(pro_size);
                $("span[uploadId='upload-progress-percent-" + filename + "']").text(progressRate);
                $("span[uploadId='upload-progress-speed-" + filename + "']").text(speed);
                $("span[uploadId='upload-progress-time-" + filename + "']").text(leftTime);
                $("div[uploadId='upload-progress-bar-" + filename + "']").css('width', progressRate);
            })
            return xhr;
        },
        success: function (res) {
            if (res.stat === 'failed'){
                $("span[uploadId='upload-progress-speed-" + filename + "']").text('上传失败');
                $("span[uploadId='upload-progress-time-" + filename + "']").text('');
                $("span[uploadId='upload-progress-status-" + filename + "']").attr('class', 'status-dot d-block');
                toastr.error(res.result, '上传失败');
            }
            else if (res.stat === 'success'){
                $("span[uploadId='upload-progress-percent-" + filename + "']").text('100%');
                $("span[uploadId='upload-progress-speed-" + filename + "']").text('上传成功');
                $("span[uploadId='upload-progress-time-" + filename + "']").text('');
                $("div[uploadId='upload-progress-bar-" + filename + "']").css('width', '100%');
                $("div[uploadId='upload-progress-bar-" + filename + "']").attr('class', 'progress-bar bg-green');
                $("span[uploadId='upload-progress-status-" + filename + "']").attr('class', 'status-dot bg-green d-block');
                toastr.success(res.result, '上传成功，请重新进入目录刷新');
            }
        },
        error: function (data, type, error) {
            $("span[uploadId='upload-progress-speed-" + filename + "']").text('上传失败');
            $("span[uploadId='upload-progress-time-" + filename + "']").text('');
            $("span[uploadId='upload-progress-status-" + filename + "']").attr('class', 'status-dot d-block');
            console.log(error);
            toastr.error(error.name + ": " + error.message, '文件上传检查不通过');
        }
    });
}