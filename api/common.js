var express = require('express');
var router = express.Router();
var path = require('path');
var checkLogin = require('../middlewares/check-api').checkLogin
var CODE = require('./constant')

router.post('/upload', checkLogin, function (req, res, next) {
    var result=[];
    for(attr in req.files){
        result.push({
            name:req.files[attr].name,
            path:'/img/'+req.files[attr].path.split(path.sep).pop()
        })
    }
    res.json({
        code: CODE.OK,
        data: result
    });
});