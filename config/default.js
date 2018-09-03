/**
 * Created by sky on 2017/5/13.
 */
module.exports = {
    port: 8899,
    session: {
        secret: 'myblog',
        key: 'myblog',
        maxAge: 2592000000
    },
    redis: {
        port: 6379,
        host: '120.76.244.22',
        password: 'Betterlife0708!'
    },
    mongodb: 'mongodb://sky:Betterlife0708!@120.76.244.22:10008/myblog'
}