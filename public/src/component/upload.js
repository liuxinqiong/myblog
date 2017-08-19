/**
 * Created by sky on 2017/7/3.
 */
// 实现拖拽上传
var area=$('#post-form').find('textarea');

area.on('dragenter drop dragover dragleave',function(e){
    e.preventDefault();
    var that=$(this);
    // 构建ajax上传数据对象
    var formData=new FormData();
    if(e.type=='dragenter'){
        that.addClass('dragenter');
    }else if(e.type=='dragleave'){
        that.removeClass('dragenter');
    }
    if(e.type=='drop'){
        that.removeClass('dragenter');
        files=event.dataTransfer.files;
        for(var i=0;i<files.length;i++){
            formData.append("file"+i,files[i]);
        }
        $.ajax({
            type:'post',
            url:'/file/upload',
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
                    alert("rs.data");
                }
            },
            error:function(jqXHR, textStatus, errorThrown){
                alert("文件上传出错！");
            }
        });
    }
});