/*
    共享Shell登录相关js方法
*/


// 回车提交登录
function login_enter_listen(){
    $('#share_password').keydown(function(event) {
        if (event.keyCode == 13) {
          $('button').click();
        }
    });
}


// 显示密码图标
function show_password(){
    var hide_html = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-eye-off" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
    <path d="M3 3l18 18"></path>\
    <path d="M10.584 10.587a2 2 0 0 0 2.828 2.83"></path>\
    <path d="M9.363 5.365a9.466 9.466 0 0 1 2.637 -.365c4 0 7.333 2.333 10 7c-.778 1.361 -1.612 2.524 -2.503 3.488m-2.14 1.861c-1.631 1.1 -3.415 1.651 -5.357 1.651c-4 0 -7.333 -2.333 -10 -7c1.369 -2.395 2.913 -4.175 4.632 -5.341"></path>\
 </svg>'
    $('#share_password').attr('type', 'text');
    $('#share_password_icon').html(hide_html);
    $('#share_password_icon').attr('href', 'javascript:hide_password();');
    $('#share_password_icon').attr('data-bs-original-title', '隐藏密码');
}


// 隐藏密码图标
function hide_password(){
    var show_html = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-eye" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
    <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>\
    <path d="M22 12c-2.667 4.667 -6 7 -10 7s-7.333 -2.333 -10 -7c2.667 -4.667 6 -7 10 -7s7.333 2.333 10 7"></path>\
 </svg>'
    $('#share_password').attr('type', 'password');
    $('#share_password_icon').html(show_html);
    $('#share_password_icon').attr('href', 'javascript:show_password();')
    $('#share_password_icon').attr('data-bs-original-title', '显示密码');
}


// 登录
function login(sessid){
    input_data = {
        'share_password': $('input').val(),
        'sessid': sessid
    }
    $.ajax({
        type: "POST",
        url: "/supershell/share/shell/login/auth",
        contentType: 'application/json',
        data: JSON.stringify(input_data),
        success: function(res) {
            $('input').val('');
            if (res.result === 'success'){
                location.href = '/supershell/shell?arg=' + res.sessid;
            }
            else{
                toastr.error('用户名或密码错误');
            }
        },
        error: function() {
            $('#share_password').val('');
            toastr.error('登录异常');
        },
    });
}