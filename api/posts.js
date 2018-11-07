var express = require('express');
var router = express.Router();
var checkLogin = require('../middlewares/check-api').checkLogin
var CODE = require('./constant')
var PostModel = require('../models/posts');

// ajax自动提示
router.post('/search', function (req, res, next) {
    var keyword = req.fields.title;
    var isLogin = false;
    // 未登录不能看私有文章
    if (req.session.user)
        isLogin = true;
    PostModel.getPostBySearch(keyword, isLogin).then(function (data) {
        res.json({
            code: CODE.OK,
            data: data
        });
    }).catch(next);
});

// 文章归档
router.post('/archives', function (req, res, next) {
    var isLogin = false;
    // 未登录不能看私有文章
    if (req.session.user)
        isLogin = true;
    PostModel.getArchivePosts(isLogin).then(function (data) {
        res.json({
            code: CODE.OK,
            data: data
        });
    }).catch(next);
})

module.exports = router