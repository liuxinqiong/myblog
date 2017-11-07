/**
 * Created by sky on 2017/11/7.
 */
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('contact');
})

module.exports = router;