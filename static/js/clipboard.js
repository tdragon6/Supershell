/**
 * @description 复制文字内容到剪切板，更多内容参见：https://www.zhangxinxu.com/wordpress/?p=10150
 * @author zhangxinxu(.com)
 * @created 2021-10-22
 */

var copyText = function (button, content, success) {
    if (!button) {
        return;
    }

    if (typeof content == 'function') {
        success = content;
        content = null;
    }

    success = success || function () {};

    // 是否降级使用
    var isFallback = !navigator.clipboard;

    if (typeof button == 'string' && !content) {
        if (content === false) {
            isFallback = true;
        }
        content = button;
        button = null;
    }

    var eleTextarea = document.querySelector('#tempTextarea');
    if (!eleTextarea && isFallback) {
        eleTextarea = document.createElement('textarea');
        eleTextarea.style.width = 0;
        eleTextarea.style.position = 'fixed';
        eleTextarea.style.left = '-999px';
        eleTextarea.style.top = '10px';
        eleTextarea.setAttribute('readonly', 'readonly');
        document.body.appendChild(eleTextarea);
    }

    var funCopy = function (text, callback) {
        callback = callback || function () {};

        if (!isFallback) {
            navigator.clipboard.writeText(text).then(function () {
                callback();
                // 成功回调
                success(text);
            }, function() {
                // 禁止写入剪切板后使用兜底方法
                copyText(text, false);
                callback();
                // 成功回调
                success(text);
            });

            return;
        }

        eleTextarea.value = text;
        eleTextarea.select();
        document.execCommand('copy', true);

        callback();
        // 成功回调
        success(text);
    };

    if (!button) {
        funCopy(content);
        return;
    }

    // 事件绑定
    button.addEventListener('click', function (event) {
        var strCopy = content;
        if (content && content.tagName) {
            strCopy = content.textContent || content.value;
        }
        // 复制的文字内容
        if (!strCopy) {
            return;
        }

        funCopy(strCopy, function () {
            // 复制成功提示
            var eleTips = document.createElement('span');
            eleTips.className = 'text-popup';
            eleTips.innerHTML = '复制成功';
            document.body.appendChild(eleTips);
            // 事件
            eleTips.addEventListener('animationend', function() {
                eleTips.parentNode.removeChild(eleTips);
            });
            // For IE9
            if (!history.pushState) {
                setTimeout(function () {
                    eleTips.parentNode.removeChild(eleTips);
                }, 1000);
            }
            eleTips.style.left = (event.pageX - eleTips.clientWidth / 2) + 'px';
            eleTips.style.top = (event.pageY - eleTips.clientHeight) + 'px';
        });
    });

    var strStyle = '.text-popup { animation: textPopup 1s both; -ms-transform: translateY(-20px); color: #01cf97; user-select: none; white-space: nowrap; position: absolute; z-index: 99; }@keyframes textPopup {0%, 100% { opacity: 0; } 5% { opacity: 1; } 100% { transform: translateY(-50px); }}'

    var eleStyle = document.querySelector('#popupStyle');
    if (!eleStyle) {
        eleStyle = document.createElement('style');
        eleStyle.id = 'popupStyle';
        eleStyle.innerHTML = strStyle;
        document.head.appendChild(eleStyle);
    }
};
