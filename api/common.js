var express = require('express');
var router = express.Router();
var path = require('path');
var checkLogin = require('../middlewares/check-api').checkLogin
var CODE = require('../constant')
var imageFile = require('../lib/image-file')

var MAX_FILE_COUNT = 5;

function getFiles(files) {
    var result = [];
    for (var attr in files) {
        if (Object.prototype.hasOwnProperty.call(files, attr)) {
            result.push(files[attr]);
        }
    }
    return result;
}

router.post('/upload', checkLogin, function (req, res, next) {
    var files = getFiles(req.files || {});

    if (!files.length || files.length > MAX_FILE_COUNT) {
        imageFile.removeFiles(files);
        return res.json({
            code: CODE.BAD_REQ,
            data: 'INVALID_FILE_COUNT'
        });
    }

    for (var i = 0; i < files.length; i++) {
        if (!imageFile.isAllowedImage(files[i])) {
            imageFile.removeFiles(files);
            return res.json({
                code: CODE.BAD_REQ,
                data: 'ONLY_IMAGE_ALLOWED'
            });
        }
    }

    var result=[];
    files.forEach(function (file) {
        result.push({
            name:path.basename(file.name),
            path:'/img/'+file.path.split(path.sep).pop()
        })
    });

    res.json({
        code: CODE.OK,
        data: result
    });
});

module.exports = router;
