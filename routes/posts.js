/**
 * Created by sky on 2017/5/13.
 */
var express = require('express');
var router = express.Router();
var PostModel = require('../models/posts');
var CommentModel = require('../models/comments');
var checkLogin = require('../middlewares/check').checkLogin;

// GET /posts 所有用户或者特定用户的文章页
// eg: GET /posts?author=xxx
router.get('/', function (req, res, next) {
    var author = req.query.author;
    var page = req.query.page;
    var keyword = req.query.keyword;
    var isLogin = false;
    // 未登录不能看私有文章
    if (req.session.user)
        isLogin = true;
    Promise.all([
        PostModel.getPosts(author, keyword, page,isLogin),
        PostModel.getCount(author, keyword,isLogin)
    ]).then(function (result) {
        var posts = result[0];
        var total = result[1];
        var totalpage = parseInt(total / 5);
        if (total % 5 !== 0) {
            totalpage = totalpage + 1;
        }
        res.render('posts', {
            posts: posts,
            total: total,
            totalpage: totalpage,
            page: page || 1,
            keyword: keyword || "",
            author: author || "",
            tags:""
        });
    }).catch(next);
});

// ajax自动提示
router.post('/search', function (req, res, next) {
    var keyword = req.fields.title;
    var isLogin = false;
    // 未登录不能看私有文章
    if (req.session.user)
        isLogin = true;
    PostModel.getPostBySearch(keyword,isLogin).then(function (data) {
        res.json(data);
    }).catch(next);
});

// 文章所有标签
router.get('/tags',function(req,res,next){
    var isLogin = false;
    // 未登录不能看私有文章
    if (req.session.user)
        isLogin = true;
    PostModel.getTags(isLogin).then(function (data) {
        console.log(data);
        res.render('tags', {
            tags: data
        })
    }).catch(next);
});

router.get('/tags/:tags',function(req,res,next){
    var tags = req.params.tags;
    var page = req.query.page;
    var isLogin = false;
    // 未登录不能看私有文章
    if (req.session.user)
        isLogin = true;
    console.log(tags,page,isLogin);
    Promise.all([
        PostModel.getPostByTags(tags,page,isLogin),
        PostModel.getCountByTags(tags,isLogin)
    ]).then(function (result) {
        console.log(result);
        var posts = result[0];
        var total = result[1];
        var totalpage = parseInt(total / 5);
        if (total % 5 !== 0) {
            totalpage = totalpage + 1;
        }
        res.render('posts', {
            posts: posts,
            total: total,
            totalpage: totalpage,
            page: page || 1,
            keyword: "",
            author: "",
            tags: tags || ""
        });
    }).catch(next);
});

// GET /posts/create 发表文章页
router.get('/create', checkLogin, function (req, res, next) {
    res.render('create');
});

// POST /posts 发表一篇文章
router.post('/', checkLogin, function (req, res, next) {
    var author = req.session.user._id;
    var title = req.fields.title;
    var content = req.fields.content;
    var tags = req.fields.tags;
    var isPrivate = req.fields.isPrivate;
    console.log(isPrivate);
    // 校验参数
    try {
        if (!title.length) {
            throw new Error('请填写标题');
        }
        if (!content.length) {
            throw new Error('请填写内容');
        }
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('back');
    }

    var post = {
        author: author,
        title: title,
        content: content,
        pv: 0,
        tags: tags
    };

    PostModel.create(post)
        .then(function (result) {
            // 此 post 是插入 mongodb 后的值，包含 _id
            post = result.ops[0];
            req.flash('success', '发表成功');
            // 发表成功后跳转到该文章页
            res.redirect(`/posts/${post._id}`);
        })
        .catch(next);
});

// GET /posts/:postId 单独一篇的文章页
router.get('/:postId', function (req, res, next) {
    var postId = req.params.postId;

    Promise.all([
        PostModel.getPostById(postId),// 获取文章信息
        CommentModel.getComments(postId),// 获取该文章所有留言
        PostModel.incPv(postId)// pv 加 1
    ])
        .then(function (result) {
            var post = result[0];
            var comments = result[1];
            if (!post) {
                throw new Error('该文章不存在');
            }

            res.render('post', {
                post: post,
                comments: comments
            });
        })
        .catch(next);
});

// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, function (req, res, next) {
    var postId = req.params.postId;
    var author = req.session.user._id;

    PostModel.getRawPostById(postId)
        .then(function (post) {
            if (!post) {
                throw new Error('该文章不存在');
            }
            if (author.toString() !== post.author._id.toString()) {
                throw new Error('权限不足');
            }
            res.render('edit', {
                post: post
            });
        })
        .catch(next);
});

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function (req, res, next) {
    var postId = req.params.postId;
    var author = req.session.user._id;
    var title = req.fields.title;
    var content = req.fields.content;
    var tags = req.fields.tags;
    var isPrivate = req.fields.isPrivate ? true : false;
    PostModel.updatePostById(postId, author, {title: title, content: content, tags: tags, isPrivate: isPrivate})
        .then(function () {
            req.flash('success', '编辑文章成功');
            // 编辑成功后跳转到上一页
            res.redirect(`/posts/${postId}`);
        })
        .catch(next);
});

// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function (req, res, next) {
    var postId = req.params.postId;
    var author = req.session.user._id;

    PostModel.delPostById(postId, author)
        .then(function () {
            req.flash('success', '删除文章成功');
            // 删除成功后跳转到主页
            res.redirect('/posts');
        })
        .catch(next);
});

// POST /posts/:postId/comment 创建一条留言
router.post('/:postId/comment', checkLogin, function (req, res, next) {
    var author = req.session.user._id;
    var postId = req.params.postId;
    var content = req.fields.content;
    var comment = {
        author: author,
        postId: postId,
        content: content
    };

    CommentModel.create(comment)
        .then(function () {
            req.flash('success', '留言成功');
            // 留言成功后跳转到上一页
            res.redirect('back');
        })
        .catch(next);
});

// GET /posts/:postId/comment/:commentId/remove 删除一条留言
router.get('/:postId/comment/:commentId/remove', checkLogin, function (req, res, next) {
    var commentId = req.params.commentId;
    var author = req.session.user._id;

    CommentModel.delCommentById(commentId, author)
        .then(function () {
            req.flash('success', '删除留言成功');
            // 删除成功后跳转到上一页
            res.redirect('back');
        })
        .catch(next);
});

module.exports = router;