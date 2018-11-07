var express = require('express');
var router = express.Router();
var checkLogin = require('../middlewares/check-api').checkLogin
var CODE = require('./constant')

module.exports = router