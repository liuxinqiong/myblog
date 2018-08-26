/**
 * Created by sky on 2017/11/7.
 */
var express = require('express');
var router = express.Router();
var ContactModel = require('../models/contact');
var credentials = require('../config/credentials');
var emailService = require('../lib/email.js')(credentials);

router.get('/', function (req, res, next) {
    var csrfToken = parseInt(Math.random() * 999999999, 10)
    res.cookie('_csrf', csrfToken)
    res.render('contact', {
        csrfToken
    });
});

router.post('/', function (req, res, next) {
    var name = req.fields.name;
    var email = req.fields.email;
    var phone = req.fields.phone;
    var message = req.fields.message;
    var _csrf = req.fields._csrf;
    var _csrfToken = req.cookies._csrf;
    // 校验参数
    try {
        // 防御CSRF攻击
        if(!_csrf || !_csrfToken || _csrf !== _csrfToken) {
            throw new Error('非法请求');
        }
        console.log("csrf check", _csrf, _csrfToken)
        if (!(name && name.trim().length > 0)) {
            throw new Error('名字不能为空');
        }
        if (!(email && email.trim().length > 0)) {
            throw new Error('邮箱不能为空');
        }
        if (!(phone && phone.trim().length > 0)) {
            throw new Error('手机号码不能为空');
        }
        if (!(message && message.trim().length > 0)) {
            throw new Error('消息不能为空');
        }
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/contact');
    }
    ContactModel.create({
        name: name,
        email: email,
        phone: phone,
        message: message
    }).then(function (result) {
        // 发送邮件
        var body = '<h1>Ethan 博客</h1>';
        if (name) body += '名字:<br><pre>' + name + '</pre><br>';
        if (email) body += '邮箱:<br><pre>' + email + '</pre><br>';
        if (phone) body += '电话:<br><pre>' + phone + '</pre><br>';
        if (message) body += '内容:<br><pre>' + message + '</pre><br>';
        emailService.sendNotification('有人在找你呢', body);
        req.flash('success', '发送成功');
        res.redirect('/contact');
    }).catch(next);

});

module.exports = router;