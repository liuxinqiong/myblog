var axios = require('axios')
var credentials = require('../config/credentials');
var emailService = require('../lib/email')(credentials);

var countFailed = 0
var countSuccess = 0

// setInterval(function () {
//     axios.get('http://mc.jwx.com.cn/crmobile/onLineCtrl/getIsVisit').then(function (response) {
//         console.log(`小的已经成功${++countSuccess}次啦`)
//         emailService.sendNotification('服务恢复啦', '服务恢复啦，快去抢啊');
//         console.log(response)
//     }).catch(function (error) {
//         console.log(`小的已经失败${++countFailed}次啦`)
//     });
// }, 10000)


axios.post('http://mc.jwx.com.cn/crmobile/registerUser/saveOrUpdateResisterUser', {
    "token": "13_r5VNBhcvysDBMVPpLCvqCY6KQrrifPylyi71QUW9ltuiKYleRmPqklUYNemlXMCRSmvLTVuGg7V30ebmw2kPuK0b9aWzNGcbJPrbl0LtC1I",
    "reusId": "3032",
    "reusTrueName": "测试名称",
    "reusIDCardNo": "xxxxxxxxxxxxxxxxxx",
    "reusSex": "2",
    "reusBirthday": "1993-07-08",
    "reusAddress": "南山区后海",
    "reusMobile": "xxxxxxxxxxx",
    "reusArea": "440311"
}, {
    headers: {
        token: '13_r5VNBhcvysDBMVPpLCvqCY6KQrrifPylyi71QUW9ltuiKYleRmPqklUYNemlXMCRSmvLTVuGg7V30ebmw2kPuK0b9aWzNGcbJPrbl0LtC1I',
        cookie: 'JSESSIONID=5D5D9EB97053CFF7D16753518EEA2102'
    }
}).then(function (response) {
    console.log(response)
}).catch(function (error) {
    console.log(error)
});