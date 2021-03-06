/**
 * Created by sky on 2017/7/3.
 */
/**
 * Created by sky on 2017/5/13.
 */
var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs')

var randomPath = path.resolve('./public/asset/bg')

router.get('/random', function(req, res, next) {
    // 模拟 https://source.unsplash.com/random/
    fs.readdir(randomPath, function(err, files) {
        var randomIndex = Math.floor(Math.random() * files.length)
        var filePath = randomPath + '/' + randomIndex + '.jpg'
        fs.readFile(filePath, 'binary', function(err, data) {
            res.writeHead(200, {
                'Content-Type': 'image/jpg',
                'Cache-Control': 'public, must-revalidate, max-age=' + getMaxAge()
            })
            res.write(data, 'binary')
            res.end()
        })
    })
})

function getExpiresTime() {
    var now = new Date()
    now.setDate(now.getDate() + 1)
    now.setHours(8)
    now.setMinutes(0)
    now.setSeconds(0)
    return now.toGMTString()
}

function getMaxAge() {
    var now = new Date()
    now.setDate(now.getDate() + 1)
    now.setHours(0)
    now.setMinutes(0)
    now.setSeconds(0)
    return (now.getTime() - new Date().getTime()) / 1000
}

module.exports = router;
