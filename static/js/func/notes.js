/*
    备忘录相关方法
*/


// 渲染markdown
function preview_edit(){
    let text = $('#edit').val();
    let markdown_text = marked.parse(text);
    $('#preview').html(markdown_text);
}


// 获取备忘录内容
function get_notes_text(){
    $('#loader').html('<div class="spinner-border spinner-border-sm text-muted" role="status"></div>');
    $.ajax({
        type: "POST",
        url: "/supershell/notes/read",
        success: function(res) {
            $('#edit').val(res['result']);
            preview_edit();
            $('#loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M5 12l5 5l10 -10"></path>\
            </svg>');
        },
        error: function(data, type, error) {
            console.log(error);
            toastr.error(error.name + ": " + error.message, '读取备忘录失败');
            $('#loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M5 12l5 5l10 -10"></path>\
            </svg>');
        },
    });
}


// 保存备忘录内容
function write_notes_text(){
    $('#loader').html('<div class="spinner-border spinner-border-sm text-muted" role="status"></div>');
    let input_data = {
        'notes_text': $('#edit').val()
    };
    $.ajax({
        type: "POST",
        url: "/supershell/notes/write",
        contentType: 'application/json',
        data: JSON.stringify(input_data),
        success: function() {
            get_notes_text();
            toastr.success('保存成功');
            $('#loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M5 12l5 5l10 -10"></path>\
            </svg>');
        },
        error: function(data, type, error) {
            console.log(error);
            toastr.error(error.name + ": " + error.message, '保存备忘录失败');
            $('#loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M5 12l5 5l10 -10"></path>\
            </svg>');
        },
    });
}


// 绑定Ctrl+S事件
$(window).keydown(function(e) {
	if (e.keyCode === 83 && e.ctrlKey) {
		e.preventDefault();
		write_notes_text();
	}
});