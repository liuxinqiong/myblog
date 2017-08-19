/**
 * Created by sky on 2017/8/18.
 */

$(document).ready(function () {
    var auto_self=$('#searchText');

    var container=document.createElement('div');
    var $container=$(container);
    $container.attr('id','auto_complete_container');

    auto_self.parent().append($container);

    function fixAutoCompleteContainerPos(){
        // 在父容器的位置
        var position=auto_self.position();
        var width=auto_self.innerWidth()
        var height=auto_self.outerHeight();
        $container.css({
            left:position.left,
            top:position.top+height,
            width:width,
            position:'absolute',
            'z-index':10
        });
    }
    fixAutoCompleteContainerPos();

    $(document.body).on('click',function () {
        $container.html('');
    })

    $(window).on('resize',function(){
        fixAutoCompleteContainerPos();
    })

    var request=null;
    $('#searchText').on('input',function (e) {
        var value=$(this).val();

        // 空不查询
        if(!value){
            $container.html('');
            return;
        }

        // 新的输入来了，上一个请求还没返回，直接终止
        request&&request.abort();
        var data=JSON.stringify({title:value});
        var ajaxUtil=new AjaxUtil('POST','/posts/search',data,function(data){
            console.log(data);
            var html='<ul>';
            for(var i=0;i<data.length;i++){
                var target=data[i];
                html+='<li><a href="/posts/'+target._id+'">'+target.title+'</a></li>'
            }
            html+='</ul>';
            $container.html(html);
        });
        request=ajaxUtil.send();
    });
});






(function(app){

    function AjaxUtil(method,url,data,callback){
        this.method=method;
        this.url=url;
        this.data=data;
        this.callback=callback;
    }

    AjaxUtil.prototype.send=function () {
        var that=this;
        var request=new XMLHttpRequest();
        request.open(this.method,this.url);
        request.onreadystatechange=function(){
            if(request.readyState===4&&request.status===200){
                var type=request.getResponseHeader('Content-Type');
                if(type.indexOf('xml')!==-1 && request.responseXML){
                    that.callback(request.responseXML);
                }else if(type.indexOf('application/json')!==-1){
                    that.callback(JSON.parse(request.responseText));
                }else{
                    that.callback(request.responseText);
                }
            }
        }
        request.setRequestHeader('Content-Type','application/json');
        this.method.toUpperCase()==='POST'?request.send(this.data):request.send(null);
        return request;
    }

    app.AjaxUtil=AjaxUtil;
})(window);