/*
    通用方法
*/


// 文件大小转换
function renderSize(value){
    if(value === null || value === '' || value === 0){
        return "0 B";
    }
    var unitArr = new Array("B","KB","MB","GB","TB","PB","EB","ZB","YB");
    var index = 0;
    var srcsize = parseFloat(value);
    index = Math.floor(Math.log(srcsize) / Math.log(1024));
    var size = srcsize / Math.pow(1024, index);
    size = size.toFixed(2);//保留的小数位数
    return size.toString() + ' ' + unitArr[index];
}


// 列表排序
var sortBy = function (field, rev) {
    rev = (rev) ? -1 : 1;
    return function (a, b) {
        a = a[field];
        b = b[field];
        if (a < b) { return rev * -1; }
        if (a > b) { return rev * 1; }
        return 1;
    }
};


// 速度单位转化
function speedUnit(bspeed){
    let speed = bspeed;
    let units = 'B/S';
    if(speed / 1024 > 1){
        speed = speed/1024;
        units = 'KB/S';
    }
    if(speed / 1024 > 1){
        speed = speed / 1024;
        units = 'MB/S';
    }
    return speed.toFixed(2).toString() + ' ' + units;
}


// 时间单位转换
function formatSeconds(value) {
    var theTime = parseInt(value);
    var theTime1 = 0;
    var theTime2 = 0;
    var theTime3 = 0;
    if(theTime > 60) {
        theTime1 = parseInt(theTime / 60);
        theTime = parseInt(theTime % 60);
        if(theTime1 > 60) {
            theTime2 = parseInt(theTime1 / 60);
            theTime1 = parseInt(theTime1 % 60);
            if(theTime2 > 24){
                theTime3 = parseInt(theTime2 / 24);
                theTime2 = parseInt(theTime2 % 24);
            }
        }
    }
    var result = '';
    if(theTime > 0){
        result = ""+parseInt(theTime) + "秒";
    }
    if(theTime1 > 0) {
        result = ""+parseInt(theTime1) + "分" + result;
    }
    if(theTime2 > 0) {
        result = ""+parseInt(theTime2) + "小时" + result;
    }
    if(theTime3 > 0) {
        result = ""+parseInt(theTime3) + "天" + result;
    }
    return result;
}