var winston = require('winston');
var expressWinston = require('express-winston');
require('winston-daily-rotate-file');
var path = require('path');

const LOGPATH = path.resolve('./logs')

expressWinston.requestWhitelist.push('fields')

function dailyRotateFileTransport(fileName) {
    return new winston.transports.DailyRotateFile({
        filename: path.join(LOGPATH, `${fileName}-%DATE%.log`),
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '1d'
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