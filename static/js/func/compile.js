/*
    客户端生成相关js方法
*/


// 回车提交搜索
function search_enter_listen(){
    $("#search").keypress(function (e) {
        if (e.which == 13) {
          search_text = $("#search").val();
          $("#search").val('');
          if (search_text === ''){
            $("#search").attr('placeholder', '搜索');
          }
          else{
            $("#search").attr('placeholder', search_text);
          }
          update_compiled_client(search_text);
        }
    });
}


// 返回操作系统html
function get_os_html(os){
    let os_html = '';
    if (os === 'windows'){
        os_html = '<span>\
        <svg t="1675447033835" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7069" width="24" height="24">\
        <path d="M523.8 191.4v288.9h382V128.1zM523.8 833.6l382 62.2v-352h-382zM120.1 480.2H443V201.9l-322.9 53.5zM120.1 770.6L443 823.2V543.8H120.1z" p-id="7070" fill="#1296db"></path>\
        </svg>\
        &nbsp;windows\
        </span>';
    }
    else if (os === 'linux'){
        os_html = '<span>\
        <svg t="1675446761910" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5090" width="24" height="24">\
        <path d="M525.2 198.3c-8.6 5.6-15.2 13.8-18.9 23.4-3.8 12.4-3.2 25.6 1.5 37.7 3.9 12.7 11.7 23.8 22.2 31.8 5.4 3.8 11.6 6.2 18.2 7 6.6 0.8 13.2-0.3 19.1-3.3 7-3.9 12.6-10 15.9-17.3 3.2-7.4 5-15.3 5.2-23.3 0.7-10.2-0.6-20.4-3.8-30.1-3.5-10.6-10.3-19.7-19.5-25.9-4.7-3-9.9-5-15.4-5.8-5.5-0.8-11.1-0.2-16.3 1.8-2.9 1.2-5.7 2.7-8.3 4.5" fill="#FFFFFF" p-id="5091"></path>\
        <path d="M810.2 606.5c-5.1-28.3-13.1-56-23.8-82.6-7.3-19.8-17.2-38.6-29.5-55.8-12.4-16.5-28.1-30.4-40.2-47.1-6.4-8.7-11.8-18.4-18.5-26.9-2.7-5.6-5.3-11.2-7.9-16.8-8-17.5-15.3-35.4-24.8-52-1.5-2.6-3.1-5.2-4.6-7.7-1.2-16-2.9-32-3.8-48 0.7-32.1-2-64.3-8.1-95.9-4.2-15.1-10.6-29.6-19-42.8-9.8-15.6-22.4-29.2-37.2-40.1-24.1-17.1-52.9-26.3-82.4-26.4-21.7-0.5-43.2 4.4-62.5 14.4-20.3 11.1-36.7 28.2-47 48.9-9.6 20.9-14.7 43.5-15 66.5-0.8 22.6 1.3 45 2.2 67.6 0.9 23.4 0.4 46.9 2.3 70.3 0.6 7.5 1.5 15 1.5 22.6 0 3.8-0.2 7.6-0.3 11.3l-0.3 0.8c-10.2 17.3-21.5 34-33.8 49.9-8.6 10.9-17.2 21.7-25.9 32.4-11.3 12.7-20.9 26.8-28.5 42-5.1 13.2-9.2 26.8-12.4 40.6l-0.3 1.1c-4.8 15.9-10.8 31.3-18 46.2-0.7 1.4-1.4 2.9-2 4.2-4.3 8.9-8.8 17.8-13.5 26.5l-5.4 10.1c-3.4 6.1-6.4 12.4-9 18.8-1.5 3.9-2.7 7.9-3.4 12-1.3 8.7-0.7 17.5 1.6 25.9 0.5 2.1 1.2 4.2 1.9 6.3 2.2 6.2 4.8 12.3 7.9 18.1 1.4 2.7 2.9 5.3 4.3 8l1.3 1.9c1.4 2.5 2.9 5 4.4 7.4l0.2 0.3c1.7 2.8 3.6 5.5 5.4 8.2l0.3 0.4c1.9 2.6 3.8 5.3 5.8 7.9 7.4 28.9 21 55.8 39.7 79-2.9 5.1-5.5 10.1-8.4 15.1-10.2 14.8-18.6 30.7-25.1 47.4-2.7 8.6-3.4 17.7-1.9 26.6 1.4 9 6 17.1 13 23 4.7 3.6 10.1 6.1 15.8 7.3 5.7 1.2 11.6 1.8 17.5 1.5 22.2-1.7 44.2-6.1 65.4-12.9 12.8-3.4 25.6-6.4 38.6-9 13.5-3.1 27.2-5 41-5.6 3.4 0.1 6.8-0.1 10.1-0.3 9.4 1 18.8 1.4 28.3 1l3.5-0.2c2.4 0.3 4.9 0.4 7.4 0.6 16.6 0.9 33.1 2.6 49.5 5.1 14.4 2.2 28.8 5 43 8.5 21.9 6.6 44.4 11 67.3 12.9 6 0.3 12-0.2 18-1.4 5.9-1.2 11.5-3.8 16.3-7.4 7-5.8 11.6-13.9 13.1-22.9 1.5-8.9 0.8-18-1.9-26.6-6.6-16.7-15.1-32.6-25.5-47.3-3.6-6.1-7-12.4-10.6-18.5 15.5-17.3 29.2-36.3 40.7-56.5 7 0.4 13.9-0.4 20.6-2.6 17.5-5.9 32.7-17.3 43.3-32.5 3.2-4.5 5.7-9.5 7.2-14.8 6.9-10.7 11.6-22.7 13.8-35.3 3.2-20.8 2.7-42.1-1.5-62.7h-0.2z m0 0" fill="#020204" p-id="5092"></path>\
        <path d="M425.6 323.2c-3.1 4-5.3 8.7-6.4 13.6-1.1 4.9-1.8 10-1.9 15 0.3 10.1-0.5 20.2-2.5 30.1-3.5 10.3-8.8 19.8-15.6 28.3-11.7 14.7-20.9 31.2-27.2 48.8-3.2 10.9-4.3 22.3-3.1 33.7-12.1 17.9-22.6 36.9-31.3 56.7-13.4 29.9-22 61.8-25.5 94.4-4.3 40.1 1.6 80.6 17 117.8 11.3 26.8 28.5 50.8 50.3 70.1 11.2 9.7 23.5 17.9 36.7 24.4 46.7 22.8 101.4 22.3 147.6-1.4 23.1-13.5 44.2-30.2 62.6-49.5 11.9-10.8 22.5-22.9 31.8-36.1 15.5-26.9 24.6-57.1 26.5-88.1 9.6-53.6 3.7-108.8-16.9-159.2-8.1-16.8-18.8-32.2-31.8-45.6a252.5 252.5 0 0 0-20.2-68c-7.2-15.5-15.9-30.3-22.6-46.2-2.7-6.5-5.1-13.1-8.1-19.4-2.9-6.4-6.9-12.3-11.8-17.3-5.3-4.9-11.6-8.6-18.5-10.7-6.9-2.2-14-3.4-21.2-3.6-14.4-0.7-28.9 1.1-43.1 0.6-11.5-0.5-22.8-2.5-34.3-1.8-5.7 0.3-11.4 1.4-16.7 3.5-5.4 2.1-10.1 5.5-13.8 10m4.6-125.1c-5.4 0.4-10.5 2.7-14.4 6.4-3.9 3.7-6.8 8.4-8.4 13.5-2.7 10.4-3.4 21.3-1.9 32 0.2 9.7 1.9 19.4 5.1 28.6 1.8 4.5 4.4 8.7 7.8 12.2 3.4 3.5 7.7 6.1 12.4 7.3 4.5 1.1 9.2 0.9 13.5-0.5 4.3-1.4 8.3-3.8 11.5-7 4.7-4.8 8.1-10.7 9.8-17.1 1.7-6.4 2.5-13.1 2.3-19.8 0-8.3-1.3-16.6-3.8-24.6s-6.8-15.3-12.6-21.4c-2.8-2.9-6-5.4-9.6-7.2-3.7-1.7-7.7-2.6-11.7-2.4m95 0c-8.6 5.6-15.2 13.8-18.9 23.4-3.8 12.4-3.2 25.6 1.5 37.7 3.9 12.7 11.7 23.8 22.2 31.8 5.4 3.8 11.6 6.2 18.2 7 6.6 0.8 13.2-0.3 19.1-3.3 7-3.9 12.6-10 15.9-17.3 3.2-7.4 5-15.3 5.2-23.3 0.7-10.2-0.6-20.4-3.8-30.1-3.5-10.6-10.3-19.7-19.5-25.9-4.7-3-9.9-5-15.4-5.8-5.5-0.8-11.1-0.2-16.3 1.8-2.9 1.2-5.7 2.7-8.3 4.5" fill="#FFFFFF" p-id="5093"></path>\
        <path d="M544.5 223.6c-3.2 0.2-6.2 1.2-8.9 2.9s-5 4-6.8 6.6c-3.4 5.3-5.3 11.5-5.4 17.9-0.3 4.7 0.4 9.5 1.9 14s4.3 8.5 7.9 11.5c3.8 3.1 8.4 4.9 13.3 5.2 4.9 0.2 9.7-1.1 13.7-3.9 3.2-2.3 5.8-5.2 7.6-8.7 1.8-3.4 2.9-7.2 3.4-11 1-6.8-0.2-13.8-3.2-19.9-3.1-6.2-8.4-10.9-14.8-13.4-2.8-1.1-5.7-1.5-8.7-1.4" fill="#020204" p-id="5094"></path>\
        <path d="M430.2 198.3c-5.4 0.4-10.5 2.7-14.4 6.4-3.9 3.7-6.8 8.4-8.4 13.5-2.7 10.4-3.4 21.3-1.9 32 0.2 9.7 1.9 19.4 5.1 28.6 1.8 4.6 4.4 8.7 7.8 12.2 3.4 3.5 7.7 6.1 12.4 7.3 4.5 1.1 9.2 0.9 13.5-0.5 4.3-1.4 8.3-3.8 11.5-7 4.7-4.8 8.1-10.7 9.8-17.1 1.7-6.4 2.5-13.1 2.3-19.8 0-8.3-1.3-16.6-3.8-24.6s-6.8-15.3-12.6-21.4c-2.8-2.9-6-5.4-9.6-7.2-3.7-1.7-7.7-2.6-11.7-2.4" fill="#FFFFFF" p-id="5095"></path>\
        <path d="M417.3 242.8c-1.3 6.7-1 13.7 1.1 20.2 1.6 4.3 4 8.2 7.2 11.5 2 2.2 4.3 4.1 7 5.4 2.7 1.4 5.7 1.8 8.7 1.1 2.7-0.7 5-2.3 6.7-4.5 1.7-2.2 2.9-4.7 3.7-7.3 2.3-7.8 2.1-16.1-0.4-23.9-1.6-5.7-4.7-10.9-9.1-14.8-2.1-1.8-4.7-3.2-7.4-3.9-2.8-0.7-5.7-0.5-8.4 0.7-2.8 1.4-5.1 3.7-6.5 6.5-1.4 2.8-2.3 5.8-2.7 8.9" fill="#020204" p-id="5096"></path>\
        <path d="M404.6 326.9c0.2 0.9 0.5 1.8 1 2.5 0.9 1.4 2 2.5 3.4 3.4 1.3 0.9 2.6 1.7 3.9 2.5 6.9 4.7 13 10.5 17.9 17.3 6 9.4 13.5 17.8 22 25 6.5 4.5 14.1 7.2 22 7.9 9.2 0.7 18.5-0.4 27.4-3.2 8.2-2.4 16.1-5.8 23.5-10.3 12.7-10.2 26.3-19.2 40.7-26.7 3.4-1.2 6.8-2.1 10-3.6 3.3-1.4 6.1-3.8 7.8-7 1.1-3.2 1.8-6.6 1.9-10 0.5-3.6 1.7-7.1 2.3-10.7 0.8-3.6 0.5-7.3-0.8-10.8-1.4-2.7-3.6-4.9-6.3-6.3-2.7-1.3-5.7-2.1-8.7-2.2-6.1 0.2-12.1 0.8-18 1.8-8 0.7-16-0.3-24 0-9.9 0.3-19.8 2.5-29.8 2.9-11.4 0.6-22.7-1.2-34.1-1.7-4.9-0.3-9.9-0.1-14.8 0.7-4.9 0.7-9.6 2.5-13.7 5.3-3.8 3-7.3 6.2-10.7 9.6-1.8 1.6-3.8 3-5.9 4.1-2.2 1.1-4.5 1.7-7 1.6-1.2-0.2-2.5-0.2-3.7 0-0.7 0.3-1.4 0.7-1.9 1.2l-1.5 1.8c-1 1.5-1.9 3.1-2.6 4.7" fill="#D99A03" p-id="5097"></path>\
        <path d="M429.7 301.7c-4 2.4-7.9 5-11.8 7.7-2.1 1.3-3.8 3-5.1 5.1-0.7 1.6-1 3.3-0.9 5 0.1 1.7 0.1 3.4 0 5.1-0.1 1.1-0.5 2.3-0.5 3.5 0 0.6 0 1.2 0.2 1.7 0.2 0.6 0.4 1.1 0.8 1.5 0.5 0.5 1.2 0.9 2 1.1 0.7 0.2 1.5 0.3 2.3 0.5 3.5 1 6.7 2.9 9.3 5.4 2.7 2.4 5.1 5.2 8 7.5 8 6 17.7 9.1 27.6 9 9.9-0.2 19.7-1.6 29.2-4.1 7.5-1.6 14.9-3.6 22.1-6.1 11.2-4.2 21.5-10.3 30.4-18.2 3.9-3.8 8-7.2 12.4-10.3 4-2.5 8.7-4.2 12.7-6.6 0.4-0.2 0.7-0.5 1.1-0.7 0.3-0.3 0.6-0.6 0.8-1 0.3-0.7 0.3-1.5 0-2.2-0.2-0.7-0.5-1.3-0.9-1.8-0.5-0.6-1.1-1.2-1.7-1.7-4.6-3.4-10.1-5.3-15.8-5.5-5.8-0.4-11.3 0-16.9-1.1-5.2-1.1-10.3-2.6-15.3-4.4-5.3-1.7-10.7-3-16.3-3.9-13-2.1-26.2-1.8-39.1 1-12.1 2.7-23.8 7.3-34.6 13.5" fill="#604405" p-id="5098"></path>\
        <path d="M428.4 288.1c-5.8 3.9-11 8.7-15.5 14.1-2.6 3-4.7 6.5-6.1 10.3-0.9 3-1.5 6.1-2 9.2-0.3 1.1-0.5 2.3-0.5 3.5 0 0.6 0.1 1.2 0.3 1.7 0.2 0.6 0.5 1.1 0.9 1.5 0.7 0.7 1.6 1.1 2.6 1.3 0.9 0.2 1.9 0.2 2.9 0.3 4.4 0.7 8.5 2.5 12.1 5.1 3.6 2.5 7 5.4 10.7 7.8 8.4 5 18 7.7 27.8 7.9 9.8 0.2 19.5-0.8 29-2.9 7.6-1.4 15.1-3.5 22.4-6.3 10.9-4.7 21.1-10.8 30.4-18.2 4.3-3.2 8.5-6.6 12.4-10.3 1.3-1.3 2.6-2.6 4-3.8 1.4-1.2 3-2.1 4.7-2.7 2.7-0.7 5.5-0.8 8.3-0.1 2 0.5 4.1 0.7 6.2 0.7 1.1 0 2.1-0.2 3.1-0.5 1-0.4 1.9-1 2.5-1.8 0.9-1.1 1.3-2.4 1.3-3.8s-0.4-2.7-1.1-3.9c-1.5-2.3-3.8-4.1-6.3-5.1-3.5-1.4-7.1-2.5-10.8-3.2-11.3-2.7-22.3-6.7-32.7-11.9-5.2-2.6-10.1-5.4-15.3-8.1-5.2-2.9-10.6-5.4-16.2-7.2-12.9-3.5-26.6-2.9-39.1 1.8-14 4.9-26.5 13.4-36.1 24.7" fill="#F5BD0C" p-id="5099"></path>\
        <path d="M493.5 272.2c0.7 2.3 4.3 1.9 6.4 2.9 2.1 1 3.3 2.9 5.3 3.1 2.1 0.2 5-0.7 5.3-2.6 0.4-2.6-3.4-4.2-5.8-5.1-3.2-1.5-6.8-1.6-10-0.2-0.7 0.3-1.4 1.2-1.2 1.9z m-34.4-1.2c-2.7-0.9-7.1 3.8-5.8 6.3 0.4 0.7 1.6 1.5 2.4 1.1 0.8-0.4 2.3-3.1 3.6-4 1-0.8 0.8-3.1-0.2-3.4z m0 0" fill="#CD8907" p-id="5100"></path>\
        <path d="M887.7 829.8c-2 5.2-4.9 10-8.5 14.3-8.4 9-18.6 16.2-29.8 21.2-19 8.8-37.5 18.6-55.5 29.3-11.7 7.8-22.6 16.6-32.7 26.4-8.3 8.7-17.2 16.7-26.6 24.2-9.8 7.2-21.1 12.1-33.1 14-14.7 1.9-29.6-0.4-43.1-6.5-9.7-3.7-18.1-10.2-24-18.8-5-9.2-7.3-19.5-6.8-29.9 0.6-18.3 2.8-36.5 6.6-54.5 2.6-15 5.2-30 6.8-45.1 2.8-27.6 3.1-55.3 1-82.9-0.5-4.6-0.5-9.3 0-13.9 0.6-9.4 8.5-16.6 18-16.5 4.3-0.1 8.6 0.3 12.8 1.1 10 1.2 20 2.9 29.8 5.2 6.1 1.6 12.2 3.8 18.3 5.5 10.2 3 21 3.9 31.6 2.9 11.1-2.6 22.4-4.3 33.8-5.3 4.7 0.2 9.4 1 13.8 2.4 4.6 1.3 8.9 3.6 12.4 6.9 2.5 2.7 4.5 5.8 5.8 9.2 1.9 5.1 3.1 10.4 3.5 15.8 0.2 4.8 0.6 9.6 1.2 14.4 1.7 7.7 5.4 14.9 10.6 20.9 5.3 5.8 11 11.2 17.2 16 5.9 5.2 12.1 10 18.6 14.4 3.1 2.1 6.2 4 9.1 6.3 3 2.2 5.5 5 7.4 8.2 2.4 4.4 3.2 9.5 2 14.4" fill="#F5BD0C" p-id="5101"></path>\
        <path d="M887.7 829.8c-2 5.2-4.9 10-8.5 14.3-8.4 9-18.6 16.2-29.8 21.2-19 8.8-37.5 18.6-55.5 29.3-11.7 7.8-22.6 16.6-32.7 26.4-8.3 8.7-17.2 16.7-26.6 24.2-9.8 7.2-21.1 12.1-33.1 14-14.7 1.9-29.6-0.4-43.1-6.5-9.7-3.7-18.1-10.2-24-18.8-5-9.2-7.3-19.5-6.8-29.9 0.6-18.3 2.8-36.5 6.6-54.5 2.6-15 5.2-30 6.8-45.1 2.8-27.6 3.1-55.3 1-82.9-0.5-4.6-0.5-9.3 0-13.9 0.6-9.4 8.5-16.6 18-16.5 4.3-0.1 8.6 0.3 12.8 1.1 10 1.2 20 2.9 29.8 5.2 6.1 1.6 12.2 3.8 18.3 5.5 10.2 3 21 3.9 31.6 2.9 11.1-2.6 22.4-4.3 33.8-5.3 4.7 0.2 9.4 1 13.8 2.4 4.6 1.3 8.9 3.6 12.4 6.9 2.5 2.7 4.5 5.8 5.8 9.2 1.9 5.1 3.1 10.4 3.5 15.8 0.2 4.8 0.6 9.6 1.2 14.4 1.7 7.7 5.4 14.9 10.6 20.9 5.3 5.8 11 11.2 17.2 16 5.9 5.2 12.1 10 18.6 14.4 3.1 2.1 6.2 4 9.1 6.3 3 2.2 5.5 5 7.4 8.2 2.4 4.4 3.2 9.5 2 14.4M259.4 676.3c4.9-1.9 10.2-2.4 15.4-1.4 5.2 1 10.1 3.1 14.4 6.1 8.3 6.3 15.5 14.1 21.2 22.8 14.1 19.4 27.6 39.2 39.9 59.8 10 16.7 19.1 33.9 30.6 49.6 7.5 10.2 16 19.7 23.6 29.9 7.9 10 13.9 21.4 17.6 33.5 4.4 16.1 2.6 33.2-4.9 48.1-5.4 10.4-13.5 19.1-23.4 25.1-10 6-21.5 9-33.2 8.7-18.4-2.5-36.2-8.1-52.6-16.6-34.9-13.9-72.8-18.3-108.8-29.1-11.1-3.3-21.9-7.3-33.1-10.3-5-1.2-9.9-2.7-14.7-4.7-4.7-2-8.8-5.4-11.5-9.7-2-3.5-3-7.5-2.9-11.5 0.1-4 0.9-7.9 2.3-11.5 2.7-7.5 7.1-14.2 10-21.6 4.4-12.2 6.1-25.3 5-38.2-0.6-12.9-2.9-25.8-3.6-38.7-0.6-5.8-0.4-11.6 0.6-17.3 1.5-11.4 10.4-20.5 21.9-22.2 5.3-0.9 10.6-1.3 15.9-1 5.3 0.3 10.7 0.3 16 0 5.3-0.3 10.6-1.8 15.3-4.3 4.3-2.6 8.1-6.2 11-10.4 2.9-4.2 5.5-8.5 7.9-13 2.4-4.5 5.1-8.7 8.3-12.7 3-4.1 7.1-7.2 11.8-9.4" fill="#F5BD0C" p-id="5102"></path>\
        <path d="M259.4 676.4c4.9-1.9 10.2-2.4 15.4-1.4 5.2 1 10.1 3.1 14.4 6.1 8.3 6.3 15.5 14.1 21.2 22.8 14.1 19.4 27.6 39.2 39.9 59.8 10 16.7 19.1 33.9 30.6 49.6 7.5 10.2 16 19.7 23.6 29.9 7.9 10 13.9 21.4 17.6 33.5 4.4 16.1 2.6 33.2-4.9 48.1-5.4 10.4-13.5 19.1-23.4 25.1-10 6-21.5 9-33.2 8.7-18.4-2.5-36.2-8.1-52.6-16.6-34.9-13.9-72.8-18.3-108.8-29.1-11.1-3.3-21.9-7.3-33.1-10.3-5-1.2-9.9-2.7-14.7-4.7-4.7-2-8.8-5.4-11.5-9.7-2-3.5-3-7.5-2.9-11.5 0.1-4 0.9-7.9 2.3-11.5 2.7-7.5 7.1-14.2 10-21.6 4.4-12.2 6.1-25.3 5-38.2-0.6-12.9-2.9-25.7-3.6-38.7-0.6-5.8-0.4-11.6 0.6-17.3 1.5-11.4 10.4-20.5 21.9-22.2 5.3-0.9 10.6-1.3 15.9-1 5.3 0.3 10.7 0.3 16 0 5.3-0.3 10.6-1.8 15.3-4.3 4.3-2.6 8.1-6.2 11-10.4 2.9-4.2 5.5-8.5 7.9-13 2.4-4.5 5.1-8.7 8.3-12.7 3-4.1 7.1-7.3 11.8-9.4" fill="#F5BD0C" p-id="5103"></path>\
        <path d="M267.1 684.8c4.4-1.7 9.3-2 13.9-0.9s8.9 3.2 12.6 6.2c7.1 6.2 13.1 13.6 17.6 21.9 12 19.4 23.7 39 34.6 59 7.9 15.3 16.8 30.1 26.6 44.2 6.8 9.2 14.6 17.6 21.6 26.6 7.3 8.9 12.8 19 16.2 29.9 4 14.3 2.3 29.6-4.5 42.9-5 9.4-12.5 17.3-21.7 22.6-9.2 5.4-19.8 8-30.4 7.5-16.7-2.6-32.9-7.6-48.2-14.9-30.4-11.1-63.5-12.5-94.7-21.2-11.2-3-22.1-7.1-33.4-9.9-5-1.1-10-2.5-14.8-4.3-4.8-1.8-9-5.2-11.8-9.5-1.8-3.4-2.7-7.2-2.5-11 0.2-3.8 1-7.6 2.4-11.2 2.7-7.1 7-13.6 9.7-20.7 3.8-11 5.1-22.6 3.9-34.2-0.8-11.5-2.9-22.9-3.5-34.5-0.4-5.1-0.2-10.3 0.7-15.4 0.9-5.1 3.3-9.8 6.9-13.6 4.2-3.8 9.4-6.3 15-7 5.6-0.7 11.2-0.7 16.7 0 5.6 0.7 11.2 0.9 16.8 0.8 11 0 21-6.4 25.7-16.4 2.3-4.5 4.3-9.2 5.9-13.9 1.7-4.8 4-9.3 6.7-13.6 2.8-4.3 6.8-7.7 11.5-9.7" fill="#F5BD0C" p-id="5104"></path>\
        </svg>\
        &nbsp;linux\
        </span>';
    }
    else if (os === 'darwin' || os === 'ios'){
        os_html = '<span>\
        <svg t="1675447925342" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12762" width="24" height="24">\
        <path d="M849.124134 704.896288c-1.040702 3.157923-17.300015 59.872622-57.250912 118.190843-34.577516 50.305733-70.331835 101.018741-126.801964 101.909018-55.532781 0.976234-73.303516-33.134655-136.707568-33.134655-63.323211 0-83.23061 32.244378-135.712915 34.110889-54.254671 2.220574-96.003518-54.951543-130.712017-105.011682-70.934562-102.549607-125.552507-290.600541-52.30118-416.625816 36.040844-63.055105 100.821243-103.135962 171.364903-104.230899 53.160757-1.004887 103.739712 36.012192 136.028093 36.012192 33.171494 0 94.357018-44.791136 158.90615-38.089503 27.02654 1.151219 102.622262 11.298324 151.328567 81.891102-3.832282 2.607384-90.452081 53.724599-89.487104 157.76107C739.079832 663.275355 847.952448 704.467523 849.124134 704.896288M633.69669 230.749408c29.107945-35.506678 48.235584-84.314291 43.202964-132.785236-41.560558 1.630127-92.196819 27.600615-122.291231 62.896492-26.609031 30.794353-50.062186 80.362282-43.521213 128.270409C557.264926 291.935955 604.745311 264.949324 633.69669 230.749408" p-id="12763" fill="#8a8a8a"></path>\
        </svg>\
        &nbsp;darwin\
        </span>';
    }
    else if (os === 'android'){
        os_html = '<span>\
        <svg t="1678808526019" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4462" width="200" height="200">\
            <path d="M856.576 373.76c12.8 0 23.552 4.096 32.256 12.288 8.704 8.192 13.312 17.92 13.312 29.696V660.48c0 11.264-4.608 20.48-13.312 28.672s-19.456 12.288-32.256 12.288h-14.848c-12.8 0-23.552-4.096-32.256-12.288-8.704-8.192-13.312-17.408-13.312-28.672V415.232c0-11.776 4.608-21.504 13.312-29.696 8.704-8.192 19.456-12.288 32.256-12.288 0 0.512 14.848 0.512 14.848 0.512zM182.272 373.76c12.8 0 23.04 4.096 31.744 12.288 8.192 8.192 12.288 17.92 12.288 29.696V660.48c0 11.264-4.096 20.48-12.288 28.672-8.192 8.192-18.944 12.288-31.744 12.288h-14.848c-12.8 0-23.552-4.096-32.256-12.288-8.704-8.192-13.312-17.408-13.312-28.672V415.232c0-11.776 4.608-21.504 13.312-29.696 8.704-8.192 19.456-12.288 32.256-12.288 0 0.512 14.848 0.512 14.848 0.512z m458.752-193.024c9.728 4.608 20.48 10.752 31.232 18.432 10.752 7.68 20.992 16.896 31.232 27.648 9.728 10.752 18.944 22.016 26.112 34.304 7.68 12.288 12.8 25.6 16.384 39.424H273.92c8.704-29.184 23.04-53.248 41.984-72.192 18.944-18.944 38.4-33.792 57.856-45.056l-42.496-66.56c-1.024-1.024-1.024-3.072-0.512-6.144s3.584-6.144 8.704-9.728c4.608-4.096 8.704-5.632 12.288-5.632 4.096 0.512 6.144 1.024 7.68 2.048l43.008 68.096c15.36-7.168 31.744-12.8 49.152-16.384 17.408-3.584 34.816-5.632 53.248-5.632 37.888 0 72.704 7.68 105.472 23.04l44.032-69.12c1.024-1.024 3.072-1.536 6.144-1.536s7.68 1.536 13.824 5.12c5.632 2.56 8.704 5.12 9.728 7.68 1.024 2.048 0.512 4.096-0.512 5.12l-42.496 67.072zM409.6 252.416c7.168 0 13.312-2.56 18.432-7.68s7.68-11.264 7.68-18.432-2.56-13.312-7.68-18.432-11.264-7.68-18.432-7.68-13.312 2.56-18.432 7.68-7.68 11.264-7.68 18.432 2.56 13.312 7.68 18.432 10.752 7.68 18.432 7.68z m204.288-3.072c7.168 0 13.312-2.56 18.432-7.68s7.68-11.264 7.68-18.432-2.56-13.312-7.68-18.432-11.264-7.68-18.432-7.68-13.312 2.56-18.432 7.68-7.68 11.264-7.68 18.432 2.56 13.312 7.68 18.432 11.264 7.68 18.432 7.68zM745.984 353.28l1.024 374.272c0 12.288-4.096 22.528-12.288 30.72-8.192 8.192-17.92 12.288-29.696 12.288h-11.776v116.224c0 11.264-4.096 20.992-12.288 29.184-8.192 8.192-17.92 12.288-29.696 12.288h-24.064c-11.264 0-20.48-4.096-28.672-12.288-8.192-8.192-12.288-17.92-12.288-29.184v-116.224H434.176v116.224c0 11.264-4.096 20.992-12.288 29.184-8.192 8.192-17.92 12.288-29.696 12.288H368.64c-11.264 0-20.48-4.096-28.672-12.288-8.192-8.192-12.288-17.92-12.288-29.184v-116.224h-9.216c-11.776 0-21.504-4.096-29.696-12.288-8.192-8.192-12.288-18.432-12.288-30.72V353.28h469.504z" fill="#5FBC39" p-id="4463"></path>\
        </svg>\
        &nbsp;android\
        </span>';
    }
    else {
        os_html = os;
    }
    return os_html;
}


// 返回表格操作html
function get_operate_html(filename){
    let operate_html = '<td><div class="dropdown">\
        <a href="javascripy:void(0)" class="btn-action" data-bs-toggle="dropdown" aria-expanded="false">\
          <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-dots-vertical" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
            <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>\
            <path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>\
            <path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>\
          </svg>\
        </a>\
        <div class="dropdown-menu">\
          <a class="dropdown-item" href="/supershell/compile/download/' + filename + '">\
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-download" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
               <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
               <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path>\
               <path d="M7 11l5 5l5 -5"></path>\
               <path d="M12 4l0 12"></path>\
            </svg>\
            &nbsp;&nbsp;下载\
          </a>\
          <div class="dropdown-divider"></div>\
          <a class="dropdown-item" href="javascript:void(0);" onclick="show_deleteCompileFile(\'' + filename + '\');">\
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-trash" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
               <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
               <path d="M4 7l16 0"></path>\
               <path d="M10 11l0 6"></path>\
               <path d="M14 11l0 6"></path>\
               <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>\
               <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>\
            </svg>\
            &nbsp;&nbsp;删除\
          </a>\
        </div>\
      </div></td>';
    return operate_html;
}


// 处理表格每行信息的html
function row_data(i, filename, address, os, arch, filetype, size, version, time){
    let row_html = '<tr>\
    <td><span class="text-muted">' + (i+1).toString() + '</span></td>\
    <td>' + filename + '</td>\
    <td>' + address + '</td>\
    <td>' + get_os_html(os) + '</td>\
    <td>' + arch + '</td>\
    <td>' + filetype + '</td>\
    <td>' + renderSize(size) + '</td>\
    <td>' + version + '</td>\
    <td>' + time + '</td>' + get_operate_html(filename) + '</tr>';
    return row_html;
}


// 显示表格所有行客户端信息
function show_table(clients_list){
    let row_html = '';
    for (let i=0;i < clients_list.length;i++){
        let filename = clients_list[i]['filename']; // 文件名
        let address = clients_list[i]['address']; // 地址
        let os = clients_list[i]['os']; // 操作系统
        let arch = clients_list[i]['arch']; // 操作系统架构
        let filetype = clients_list[i]['filetype']; // 文件类型
        let size = clients_list[i]['size']; // Payload类型
        let version = clients_list[i]['version']; // 客户端版本
        let time = clients_list[i]['time']; // 时间
        // 拼接表格每行数据html
        row_html = row_html + row_data(i, filename, address, os, arch, filetype, size, version, time)
    }
    $('#compiled_table').html(row_html);
}


// 划分原始客户端列表数据
function divide_clients(clients_num, pages_size, clients_list){
    // 按pages_size分割数组
    let num = Math.ceil(clients_num / pages_size);
	let pages_list = new Array(num);
    let index = 0;
    let resindex = 0;
	while (index < clients_num) {
    	pages_list[resindex++] = clients_list.slice(index, (index += pages_size));
	}
    return pages_list
}


// 设置某页页面属性
function set_pages(pages_list, clients_num, pages_size, no){
    // 设置左边页数提示
    let start = (no-1) * pages_size + 1;
    let end = (no-1) * pages_size + pages_list[no-1].length;

    $('#pages-info').text('显示第 ' + start.toString() + ' 到第 ' + end.toString() + ' 条记录; 共 ' + clients_num.toString() + ' 条');
    // 设置右边页数按钮信息
    let pages_html = '<li id="page-prev"><a class="page-link" href="javascript:void(0)"><svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><polyline points="15 6 9 12 15 18" /></svg></a></li>';
    for (let i=0;i<pages_list.length;i++){
        pages_html = pages_html + '<li id="page-' + (i+1).toString() + '" class="page-item"><a class="page-link" href="javascript:void(0)" onclick="show_single_page(pages_size, clients_list, ' + (i+1).toString() + ')">' + (i+1).toString() + '</a></li>';
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
        $('#page-prev').children().attr('onclick', 'show_single_page(pages_size, clients_list, ' + (no-1).toString() + ');');
    }
    // 设置右边页数下一页按钮
    if (no === pages_list.length){
        $('#page-next').attr('class', 'page-item disabled');
        $('#page-next').children().attr('aria-disabled', 'true');
    }
    else {
        $('#page-next').attr('class', 'page-item');
        $('#page-next').children().attr('aria-disabled', 'false');
        $('#page-next').children().attr('onclick', 'show_single_page(pages_size, clients_list, ' + (no+1).toString() + ');');
    }
}


// 显示单页数据
function show_single_page(pages_size, clients_list, no){
    let clients_num = clients_list.length; // 获取原始列表类型客户端数据有多少条数据
    let pages_list = divide_clients(clients_num, pages_size, clients_list); //划分原始列表类型客户端数据
    if (pages_list.length === 0){
        $('#pages-info').text('无数据');
        $('#compiled_table').html('');
        $('#pages-button').html('');
        return;
    }
    set_pages(pages_list, clients_num, pages_size, no); // 设置某页页面属性
    show_table(pages_list[no-1]); // 显示表格数据
}


// 服务端redis中更新客户端列表
function update_compiled_client(search_text){
    $('#compiled-loader').html('<div class="spinner-border spinner-border-sm text-muted" role="status"></div>');
    let input_data = {
        'search_text': search_text,
    };
    $.ajax({
        type: "POST",
        url: "/supershell/compile/update",
        contentType: 'application/json',
        data: JSON.stringify(input_data),
        success: function(res) {
            show_single_page(pages_size, res['clients_list'], 1);
            $('#compiled-loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M5 12l5 5l10 -10"></path>\
            </svg>');
        },
        error: function(data, type, error) {
            console.log(error);
            toastr.error(error.name + ": " + error.message, '获取已生成客户端失败');
            $('#compiled-loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-exclamation-mark" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M12 19v.01"></path>\
                <path d="M12 15v-10"></path>\
            </svg>')
        },
    });
}


// 显示删除已生成客户端模态框
function show_deleteCompileFile(filename){
    $('#delete-loader').css('display', 'none');
    $('#delete-btn').css('display', 'block');
    $('#delete_file_name').text(filename);
    $('#delete').modal('show');
}


// 删除已生成客户端方法
function deleteCompileFile(filename){
    $('#delete-btn').css('display', 'none');
    $('#delete-loader').css('display', 'block');
    let input_data = {
        'filename': filename
    };
    $.ajax({
        type: "POST",
        url: "/supershell/compile/delete",
        contentType: 'application/json',
        data: JSON.stringify(input_data),
        success: function(res) {
            if (res.stat === 'failed'){
                $('#delete-loader').css('display', 'none');
                $('#delete-btn').css('display', 'block');
                $('#delete').modal('hide');
                toastr.error(res.result, '删除失败');
            }
            else if (res.stat === 'success'){
                $('#delete-loader').css('display', 'none');
                $('#delete-btn').css('display', 'block');
                $('#delete').modal('hide');
                toastr.success(res.result, '删除成功');
                update_compiled_client(search_text);
            }
        },
        error: function(data, type, error) {
            $('#delete-loader').css('display', 'none');
            $('#delete-btn').css('display', 'block');
            $('#delete').modal('hide');
            console.log(error);
            toastr.error(error.name + ": " + error.message, '删除失败');
        },
    });
}


// 渲染select框
function load_select(){
    var el;
    window.TomSelect && (new TomSelect(el = document.getElementById('select-tags'), {
        copyClassesToDropdown: false,
        dropdownClass: 'dropdown-menu ts-dropdown',
        optionClass:'dropdown-item',
        controlInput: '<input>',
        render:{
            item: function(data,escape) {
                if( data.customProperties ){
                    return '<div><span class="dropdown-item-indicator">' + data.customProperties + '</span>' + escape(data.text) + '</div>';
                }
                return '<div>' + escape(data.text) + '</div>';
            },
            option: function(data,escape){
                if( data.customProperties ){
                    return '<div><span class="dropdown-item-indicator">' + data.customProperties + '</span>' + escape(data.text) + '</div>';
                }
                return '<div>' + escape(data.text) + '</div>';
            },
        },
    }));
}


// 显示客户端支持生成的操作系统架构
function show_support_os_arch(support_os_arch_list){
    let choose_os_arch_html = '';
    for (let i=0;i<support_os_arch_list.length;i++){
        choose_os_arch_html = choose_os_arch_html + '<option value="' + support_os_arch_list[i] + '">' + support_os_arch_list[i] + '</option>';
    }
    $('#select-tags').html(choose_os_arch_html);
    load_select();
}


// 获取客户端支持生成的操作系统架构
function get_support_os_arch(){
    $('#make-loader').html('<div class="spinner-border spinner-border-sm text-muted" role="status"></div>');
    $.ajax({
        type: "POST",
        url: "/supershell/compile/os",
        success: function(res) {
            show_support_os_arch(res['support_os_arch_list']);
            $('#make-loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M5 12l5 5l10 -10"></path>\
            </svg>');
        },
        error: function(data, type, error) {
            console.log(error);
            toastr.error(error.name + ": " + error.message, '获取支持生成的系统架构数据失败');
            $('#make-loader').html('<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-exclamation-mark" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">\
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>\
                <path d="M12 19v.01"></path>\
                <path d="M12 15v-10"></path>\
            </svg>')
        },
    });
}


// 生成客户端方法
function make_client_payload(){
    $('#make-progress-filename').text($('#make-compile-filename').val());
    $('#make-progress').modal('show');
    let input_data = {
        'filename': $('#make-compile-filename').val(),
        'address': $('#make-compile-address').val(),
        'port': $('#make-compile-port').val(),
        'os_arch': $("#select-tags option:selected").val(),
        'upx': $('#make-compile-upx').is(':checked'),
        'garble': $('#make-compile-garble').is(':checked'),
    };
    $.ajax({
        type: "POST",
        url: "/supershell/compile/make",
        contentType: 'application/json',
        data: JSON.stringify(input_data),
        success: function(res) {
            if (res.stat === 'failed'){
                toastr.error(res.result, '生成客户端Payload失败');
            }
            else if (res.stat === 'success'){
                toastr.success(res.result, '生成客户端Payload成功');
                update_compiled_client(search_text);
            }
            $('#make-progress').modal('hide');
        },
        error: function(data, type, error) {
            console.log(error);
            toastr.error(error.name + ": " + error.message, '生成客户端Payload失败');
            $('#make-progress').modal('hide');
        },
    });
}


// 选择系统架构点击事件，某些系统架构不支持upx
$('#select-tags').change(function (e){
    let os_arch = $("#select-tags option:selected").val();
    if (os_arch.startsWith('freebsd') ||
        os_arch.startsWith('netbsd') ||
        os_arch.startsWith('openbsd') ||
        os_arch === 'android/arm64' ||
        os_arch === 'linux/s390x' ||
        os_arch === 'linux/so'){
        $('#make-compile-upx').prop('checked', false);
        $('#make-compile-upx').attr('disabled', true);
    }
    else{
        $('#make-compile-upx').prop('checked', true);
        $('#make-compile-upx').attr('disabled', false);
    }
})