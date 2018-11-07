var express = require('express');
var router = express.Router();
var checkLogin = require('../middlewares/check-api').checkLogin
var CODE = require('./constant')

router.get('/list', function(req, res, next) {
    res.json({
        code: CODE.OK,
        data: 'THIS IS A TEST'
    })
})

module.exports = router