const redisClient = require('redis').createClient;
var redisConf = require('config-lite')(__dirname).redis;

const redisOptions = {};

if (redisConf.password) {
    redisOptions.password = redisConf.password;
}

const redis = redisClient(redisConf.port, redisConf.host, redisOptions);

module.exports = redis;

// module.exports = {
//     getItem(key) {
//         redis.get(key, (err, reply) => {
//             if (err) {
//                 throw new Error('redis error');
//             } else if (reply) {

//             } else {

//             }

//         })
//     }
// }
