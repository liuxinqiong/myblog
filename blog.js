var path = require('path');
var express = require('express');
var http = require('http');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var config = require('config-lite')(__dirname);
var routes = require('./routes');
var pkg = require('./package');
var winston = require('winston');
var expressWinston = require('express-winston');
// var bodyParser = require("body-parser");
var errorDomain = require('./middlewares/error-domain')
var credentials = require('../config/credentials');
var emailService = require('../lib/email.js')(credentials);

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

// 设置body解析,这个很关键，貌似不需要了,通过req.fields读取，formidable很牛逼的样子
// app.use(bodyParser.urlencoded({ extended: false }));

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// session 中间件
app.use(session({
    name: config.session.key,// 设置 cookie 中保存 session id 的字段名称
    secret: config.session.secret,// 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
    resave: true,// 强制更新 session
    saveUninitialized: false,// 设置为 false，强制创建一个 session，即使用户未登录
    cookie: {
        maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
    },
    store: new MongoStore({// 将 session 存储到 mongodb
        url: config.mongodb// mongodb 地址
    })
}));

// flash 中间件，用来显示通知
app.use(flash());

// 一些奇怪请求头导致formidable报错
app.use(function (req, res, next) {
    if (req.headers['content-type']) {
        if (req.headers['content-type'].match(/octet-stream/i) || req.headers['content-type'].match(/urlencoded/i) ||
            req.headers['content-type'].match(/multipart/i) || req.headers['content-type'].match(/json/i)) {
            next();
        } else {
            res.send("Don't mess with me, please");
        }
    } else {
        next();
    }
});

// 处理表单及文件上传的中间件,本质使用formidable，进行了简单中间件处理
app.use(require('./middlewares/express-formidable')({
    uploadDir: path.join(__dirname, 'public/img'),// 上传文件目录
    keepExtensions: true// 保留后缀
}));

// 设置模板全局常量
app.locals.blog = {
    title: pkg.name,
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
        new (winston.transports.Console)({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: 'logs/success.log'
        })
    ]
}));

// 线上环境是Nginx代理，为避免重复请求头问题，因此限定开发环境才设置允许跨域
if (app.get('env') === 'development') {
    app.all('*', function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
        res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
        if (req.method == "OPTIONS") res.send(200);/*让options预检请求快速返回*/
        else  next();
    });
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
    console.log('我是错误处理器');
    emailService.emailError('我是错误处理器', err.stack, err.message)
    res.render('error', {
        error: err
    });
});

// 监听端口，启动程序。直接启动 index.js 则会监听端口启动程序，如果 index.js 被 require 了，则导出 app，通常用于测试。
function startServer() {
    server.listen(config.port, function () {
        console.log(`${pkg.name} started in ${app.get('env')} mode on port ${config.port}`);
    });
}

if (module.parent) {
    // module.exports = app;
    module.exports = startServer;
} else {
    // 监听端口，启动程序
    startServer();
    // app.listen(config.port, function () {
    //     console.log(`${pkg.name} listening on port ${config.port}`);
    // });
}
