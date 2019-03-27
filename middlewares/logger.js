var winston = require('winston');
var expressWinston = require('express-winston');
require('winston-daily-rotate-file');
var path = require('path');

const LOGPATH = path.resolve('./logs')

expressWinston.requestWhitelist.push('fields')

function dailyRotateFileTransport(fileName) {
    return new winston.transports.DailyRotateFile({
        filename: path.join(LOGPATH, `${fileName}-%DATE%.log`),
        datePattern: 'YYYY-MM-DD', // 分隔设置，这里设置为按天
        zippedArchive: true, // 旧日志打包
        maxSize: '20m', // 超过多少大小日志将被分隔
        // maxFiles: '1d' // 决定最多保存多少天或者多少文件个数的日志，超过的将删除旧的，不设置不删除
    })
}

module.exports = {
    successLogger: expressWinston.logger({
        transports: [
            dailyRotateFileTransport('success')
        ]
    }),
    errorLogger: expressWinston.errorLogger({
        transports: [
            dailyRotateFileTransport('error')
        ]
    })
}