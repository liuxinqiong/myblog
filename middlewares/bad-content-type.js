/**
 * 背景1：网络机器请求，发送一些 content-length 不为0，但是不指定 content-type 类型的请求，导致formidable报错，由于系统有错误监控，会频繁给我发送邮件，有点恼火，而且我不关心这些错误
 * 背景2：瞎他妈指定内容类型，无法处理亦导致报错
 */
const CODE = require('../constant')
module.exports = function (req, res, next) {
    // 一些奇怪请求头导致formidable报错
    const contentLength = parseInt(req.headers['content-length'], 10)
    const contentType = req.headers['content-type']
    // 有内容长度，但不指定内容类型，认定为非法请求，直接over
    if (!!contentLength && !contentType) {
        res.send(CODE.BAD_REQ);
        return
    }
    // GET 请求可以不指定内容类型，因为没有内容体
    if (contentType) {
        // 只处理指定类型
        if (contentType.match(/octet-stream/i) || contentType.match(/urlencoded/i) ||
            contentType.match(/multipart/i) || contentType.match(/json/i)) {
            next();
        } else {
            res.send(CODE.BAD_REQ);
        }
    } else {
        next()
    }
}