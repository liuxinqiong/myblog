/**
 * Created by sky on 2017/8/19.
 */
$(function () {
    var pageNav = $("#post-pager");
    var total = pageNav.data("total");
    var page = pageNav.data("page");
    var keyword = pageNav.data("keyword");
    var author = pageNav.data("author");
    var tags = pageNav.data("tags");
    $("#post-pager").createPage({
        totalPage: total,
        currPage: page,
        backFn: function (p) {
            var url = "/posts?page=" + p;
            if (keyword.toString().length > 0) {
                url += "&keyword=" + keyword;
            } else if (author.toString().length > 0) {
                url += "&author=" + author;
            } else if (tags.toString().length > 0) {
                url += "&tags=" + tags;
            }
            window.location.href = url;
        }
    });
})