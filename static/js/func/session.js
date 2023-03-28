/*
    session共用的方法
*/


// 设置菜单栏指向的链接
function set_menu_link(sessid){
    let menu_list = ['info', 'shell', 'files', 'memfd', 'advanced']
    for (let i = 0;i < menu_list.length;i++){
        let menu_name = menu_list[i];
        $('#session-' + menu_name).attr('href', '/supershell/session/' + menu_name + '?arg=' + sessid);
    }
}