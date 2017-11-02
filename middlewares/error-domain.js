/**
 * Created by sky on 2017/11/1.
 */
var credentials = require('../config/credentials');
var emailService = require('../lib/email.js')(credentials);

// use domains for better error handling
/*
 * 捕捉异步回调中出现的异常
 * 接口中特别注意使用promise的地方必须用catch住next函数，这样会被500处理器处理，但是不会宕机
 * */
module.exports = function (options) {
    // 参数准备
    options = options || {};
    options.killTimeout = options.killTimeout || 30000;
    if (!options.server) {
        throw new Error('server required!');
    }
    return function (req, res, next) {
        // 为请求创建域
        var domain = require('domain').create();
        // 错误处理器，未捕获错误就会调用这个函数
        domain.on('error', function (err) {
            console.error('DOMAIN ERROR CAUGHT\n', err.stack);
            try {
                // 在5秒内进行故障保护关机
                setTimeout(function () {
                    console.error('safe shutdown.');
                    process.exit(1);
                }, options.killTimeout);

                // 从集群中断开，防止分配更多的请求
                var worker = require('cluster').worker;
                if (worker) worker.disconnect();

                options.server.close();

                try {
                    // 尝试使用Express的错误路由
                    next(err);
                } catch (error) {
                    // 如果Express错处路由失效，退回去用普通Node API响应 plain Node response
                    console.error('Express error mechanism failed.\n', error.stack);
                    emailService.emailError('Express error mechanism failed.', error.stack, error.message);
                    res.statusCode = 500;
                    res.setHeader('content-type', 'text/plain');
                    res.end('Server error.');
                }
            } catch (error) {
                // 全部失败，记录错误，客户端得不到响应，最终超时
                console.error('Unable to send 500 response.\n', error.stack);
                emailService.emailError('Unable to send 500 response.', error.stack, error.message);
            }
        });

        // 一旦设置好未处理异常处理器，就把请求和响应对象添加到域中(允许哪些对象上的所有方法抛出的错误都由域处理)
        domain.add(req);
        domain.add(res);

        // 执行该域中剩余的请求链
        domain.run(next);
    }
};
