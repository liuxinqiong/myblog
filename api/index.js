module.exports = function (app) {
    app.use('/api/common', require('./common'));
    app.use('/api/todo', require('./todo'));
    app.use('/api/link', require('./link'));
    app.use('/api/posts', require('./posts'));
    app.use('/api/wechat', require('./wechat'))
};
