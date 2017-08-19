/**
 * Created by sky on 2017/7/3.
 */
/**
 * Created by sky on 2017/5/13.
 */
var express = require('express');
var router = express.Router();
var path = require('path');

// POST /signin 用户登录
router.post('/upload',function (req, res, next) {
    if (!req.session.user) {
        return res.json({
            code:-1,
            data:'not login,upload failed'
        });
    }
    var result=[];
    for(attr in req.files){
        result.push({
            name:req.files[attr].name,
            path:'/img/'+req.files[attr].path.split(path.sep).pop()
        })
    }
    res.json({
        code:0,
        data:result
    });
});

module.exports = router;
