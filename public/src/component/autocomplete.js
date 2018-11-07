/**
 * Created by sky on 2017/8/18.
 */

$(document).ready(function () {
    /**
     * add auto_complete_container
     */
    var auto_self = $('#searchText');
    var container = document.createElement('div');
    var $container = $(container);
    $container.attr('id', 'auto_complete_container');
    auto_self.parent().append($container);

    function fixAutoCompleteContainerPos() {
        // 在父容器的位置
        var position = auto_self.position();
        var width = auto_self.innerWidth()
        var height = auto_self.outerHeight();
        $container.css({
            left: position.left,
            top: position.top + height,
            width: width,
            position: 'absolute',
            'z-index': 10
        });
    }
    fixAutoCompleteContainerPos();

    $(window).on('resize', function () {
        fixAutoCompleteContainerPos();
    })

    /**
     * send ajax
     */
    var request = null;
    $('#searchText').on('input', function (e) {
        var value = $(this).val();

        // 空不查询
        if (!value) {
            $container.html('');
            return;
        }

        // 新的输入来了，上一个请求还没返回，直接终止
        request && request.abort();
        var data = JSON.stringify({
            title: value
        });
        var ajaxUtil = new AjaxUtil('POST', '/api/posts/search', data, function (data) {
            if(data.code === CODE.OK) {
                var html = '<ul>';
                data = data.data
                for (var i = 0; i < data.length; i++) {
                    var target = data[i];
                    html += '<li><a href="/posts/' + target._id + '">' + target.title + '</a></li>'
                }
                html += '</ul>';
                $container.html(html);
            }
        });
        request = ajaxUtil.send();
    });

    /**
     * key up|down
     */
    $('#searchText').on('click', function(e) {
        e.stopPropagation()
    })
    $('#searchText').on('focus', function() {
        $(document).on('keydown', keyHandler)
        $(document.body).on('click', emptyContainer)
    })
    $('#searchText').on('blur', function() {
        $(document).off('keydown', keyHandler)
        $(document.body).off('click', emptyContainer)
    })

    function keyHandler(e) {
        var keyCode = e.keyCode
        if(keyCode !== 40 && keyCode !== 38) {
            return
        }
        var list = $container.find('ul>li')
        var target = $container.find('ul>li.active')
        // 有数据才处理
        if(list.length) {
            target.removeClass('active')
            var next = target.next().length ? target.next() : $(list[0])
            var prev = target.prev().length ? target.prev() : $(list[list.length - 1])
            // 下
            if(keyCode === 40) {
                next.addClass('active')
            } else if(keyCode === 38) {
                // 上
                prev.addClass('active')
            }
        }
    }

    function emptyContainer() {
        $container.html('');
    }

    $('#searchForm').on('submit', function(e) {
        var target = $container.find('ul>li.active')
        if(target.length) {
            target.children()[0].click()
            return false
        }
    })
    $('#searchForm button').on('click', function(e) {
        // 避免触发 body click 事件
        e.stopPropagation()
    })

    // 自动聚焦 autofocus在页面加载时就聚焦， 此时本js未完成加载，导致相关逻辑失效，因此采用js完成自动聚焦
    $('#searchText').focus()

});






(function (app) {

    function AjaxUtil(method, url, data, callback) {
        this.method = method;
        this.url = url;
        this.data = data;
        this.callback = callback;
    }

    AjaxUtil.prototype.send = function () {
        var that = this;
        var request = new XMLHttpRequest();
        request.open(this.method, this.url);
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                var type = request.getResponseHeader('Content-Type');
                if (type.indexOf('xml') !== -1 && request.responseXML) {
                    that.callback(request.responseXML);
                } else if (type.indexOf('application/json') !== -1) {
                    that.callback(JSON.parse(request.responseText));
                } else {
                    that.callback(request.responseText);
                }
            }
        }
        request.setRequestHeader('Content-Type', 'application/json');
        this.method.toUpperCase() === 'POST' ? request.send(this.data) : request.send(null);
        return request;
    }

    app.AjaxUtil = AjaxUtil;
})(window);