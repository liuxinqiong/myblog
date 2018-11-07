/**
 * Created by sky on 2017/7/3.
 */

$(document).ready(function () {
    // 实现拖拽上传
    var area = $('#post-form').find('textarea');

    // 当前光标插入内容
    function insertIntoPositon(textarea, content, resplaceContent) {
        var start, end;
        var index = textarea.value.indexOf(content);
        if (index !== -1) {
            // 执行替换操作
            start = index;
            // 如果紧跟(),不是显示网速，就是具体url，如果要替换，则此部分也要计算进去
            if (textarea.value.charAt(index + content.length) === '(') {
                end = textarea.value.indexOf(')', index+content.length)+1;
            } else {
                end = index + content.length;
            }
        } else {
            // 首次插入，从光标开始
            start = textarea.selectionStart;
            end = textarea.selectionEnd;
        }
        // 如果有替换内容，使用替换内容
        if (resplaceContent) {
            content = resplaceContent;
        }
        textarea.value = textarea.value.substring(0, start) + content
            + textarea.value.substring(end);
    }

    // ![Uploading contact-bg_822926.jpg . . .]
    // file对象格式 lastModified,lastModifiedDate name,size,type,webkitRelativePath

    function checkIsImage(name) {
        var bool = true;
        var extStart = name.lastIndexOf(".");
        var ext = name.substring(extStart + 1).toUpperCase();
        if (ext != "BMP" && ext != "PNG" && ext != "GIF" && ext != "JPG" && ext != "JPEG") {
            bool = false;
        }
        return bool;
    }

    area.on('dragenter drop dragover dragleave', function (e) {
        e.preventDefault();
        var that = $(this);
        // 构建ajax上传数据对象
        var formData = new FormData();
        if (e.type == 'dragenter') {
            that.addClass('dragenter');
        } else if (e.type == 'dragleave') {
            that.removeClass('dragenter');
        }
        if (e.type == 'drop') {
            that.removeClass('dragenter');
            files = event.dataTransfer.files;
            var tipStr = "![Uploading ";
            for (var i = 0; i < files.length; i++) {
                var tagCount = tagCounter.getAvailableCount();
                tipStr = tipStr + files[i].name + '_' + tagCount;
                formData.append("file" + i, files[i]);
            }
            tipStr += ' ...]';
            var request = new XMLHttpRequest();
            request.open('POST', '/api/common/upload');
            request.onreadystatechange = function (e) {
                if (request.readyState === 4 && request.status === 200) {
                    var rs = JSON.parse(request.responseText);
                    if (rs.code == 0) {
                        var textarea = that[0];
                        var picStr = "";
                        for (i in rs.data) {
                            picStr += '\n' + '![' + rs.data[i].name + '](' + rs.data[i].path + ')' + '\n';
                        }
                        insertIntoPositon(textarea, tipStr, picStr);
                    }
                    if (rs.code == -1) {
                        alert(rs.data);
                    }
                }
            }
            var loaded = 0;
            var st = new Date();
            request.upload.onprogress = function (e) {
                var textarea = that[0];
                if (e.lengthComputable) {
                    // 计算网速 约50ms响应一次
                    var et = new Date();
                    var kbs = (e.loaded - loaded) / 1024;
                    var second = (et - st) / 1000;
                    var speed = Math.round(kbs / second);
                    loaded = e.loaded;
                    st = et;
                    var percentComplete = Math.round(e.loaded * 100 / e.total);
                    var content = '(' + percentComplete + '%-' + speed + 'kb/s)';
                    insertIntoPositon(textarea, tipStr, tipStr + content);
                } else {
                    // 不能计算进度
                    console.log('unable to compute progress');
                    insertIntoPositon(textarea, tipStr);
                }
            }
            request.error = function (e) {
                alert('upload error');
            }
            request.abort = function (e) {
                alert('upload abort');
            }
            request.send(formData);

            /*
             $.ajax({
             type:'post',
             url:'/api/common/upload',
             data:formData,
             dataType: 'json',
             contentType: false,
             processData: false,//此处指定对上传数据不做默认的读取字符串的操作
             success:function(rs){
             if(rs.code==0){
             var textarea=that[0];
             var start = textarea.selectionStart;
             var end = textarea.selectionEnd;
             var picStr="";
             for(i in rs.data){
             picStr+='\n'+'!['+rs.data[i].name+']('+rs.data[i].path+')'+'\n';
             }
             textarea.value = textarea.value.substring(0, start) + picStr
             + textarea.value.substring(end);
             }
             if(rs.code==-1){
             alert(rs.data);
             }
             },
             error:function(jqXHR, textStatus, errorThrown){
             alert("文件上传出错！");
             }
             });
             */
        }
    });
});

(function (app) {

    var count = 0;

    var tagCounter = {}

    tagCounter.getAvailableCount = function () {
        return 'pig1024File' + (++count);
    }

    app.tagCounter = tagCounter;
})(window);