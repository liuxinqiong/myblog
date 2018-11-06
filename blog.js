var path = require('path');
var express = require('express');
var http = require('http');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var config = require('config-lite')(__dirname);
var winston = require('winston');
var expressWinston = require('express-winston');
var cookieParser = require('cookie-parser')
// var bodyParser = require("body-parser");
// var vhost = require('vhost');

var routes = require('./routes');
var pkg = require('./package');
var errorDomain = require('./middlewares/error-domain')
var credentials = require('./config/credentials');
var emailService = require('./lib/email.js')(credentials);
var badContentType = require('./middlewares/bad-content-type')
var cros = require('./middlewares/cros')

var app = express();

var server = http.createServer(app);

// 设置模板目录
app.set('views', path.join(__dirname, 'views'));
// 设置模板引擎为 ejs
app.set('view engine', 'ejs');

app.use(errorDomain({
    server: server,
    killTimeout: 5000
}));

// 设置body解析, 但本项目使用formidable中间件，可同时处理表单和文件（req.fields），因此可不使用
// app.use(bodyParser.urlencoded({ extended: false }));

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

// session 中间件
app.use(session({
    name: config.session.key, // 设置 cookie 中保存 session id 的字段名称
    secret: config.session.secret, // 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
    resave: true, // 强制更新 session
    saveUninitialized: false, // 设置为 false，强制创建一个 session，即使用户未登录
    cookie: {
        maxAge: config.session.maxAge // 过期时间，过期后 cookie 中的 session id 自动删除
    },
    store: new MongoStore({ // 将 session 存储到 mongodb
        url: config.mongodb // mongodb 地址
    })
}));

// flash 中间件，用来显示通知
app.use(flash());

app.use(badContentType)

// 处理表单及文件上传的中间件,本质使用formidable，进行了简单中间件处理
app.use(require('./middlewares/express-formidable')({
    uploadDir: path.join(__dirname, 'public/img'), // 上传文件目录
    keepExtensions: true // 保留后缀
}));

// 设置模板全局常量
app.locals.blog = {
    title: pkg.title,
    description: pkg.description,
    website: pkg.website,
    author: pkg.author,
    keywords: pkg.keywords
};

// 添加模板必需的三个变量
app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    res.locals.success = req.flash('success').toString();
    res.locals.error = req.flash('error').toString();
    next();
});

// 正常请求的日志
app.use(expressWinston.logger({
    transports: [
        // 避免日志太多，控制台不打印正常日志
        new(winston.transports.Console)({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: 'logs/success.log'
        })
    ]
}));

if (app.get('env') === 'development') {
    // 线上环境是Nginx代理，为避免重复请求头问题，因此限定开发环境才设置允许跨域
    app.all('*', cros);
}

app.disable('x-powered-by');

// 路由
routes(app);

// 错误请求的日志
app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: 'logs/error.log'
        })
    ]
}));

// error page
app.use(function (err, req, res, next) {
    if(err.code === 'EBADCSRFTOKEN') {
        console.log('CSRF验证不通过');
        res.send("Don't mess with me, please");
    } else {
        console.log('我是错误处理器');
        emailService.emailError('我是错误处理器', err.stack, err.message)
        res.render('error', {
            error: err
        });
    }
});

// 监听端口，启动程序。直接启动 index.js 则会监听端口启动程序，如果 index.js 被 require 了，则导出 app，通常用于测试。
function startServer() {
    server.listen(config.port, function () {
        console.log(`${pkg.title} started in ${app.get('env')} mode on port ${config.port}`);
    });
}

if (module.parent) {
    // module.exports = app;
    module.exports = startServer;
} else {
    // 监听端口，启动程序
    startServer();
    // app.listen(config.port, function () {
    //     console.log(`${pkg.title} listening on port ${config.port}`);
    // });
}