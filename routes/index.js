module.exports = function (app, vhost) {
    app.get('/', vhost('blog.*', function (req, res) {
        res.redirect('/posts');
    }));

    // 限定域名，否则Express中的路由机制默认不会把子域名考虑在内
    app.use('/signup', vhost('blog.*', require('./signup')));
    app.use('/signin', vhost('blog.*', require('./signin')));
    app.use('/signout', vhost('blog.*', require('./signout')));
    app.use('/posts', vhost('blog.*', require('./posts')));
    app.use('/file', vhost('blog.*', require('./file')));
    // 404 page
    app.use(function (req, res) {
        console.log('我是404处理器:' + req.path);
        if (!res.headersSent) {
            res.status(404).render('404');
        }
    });
};