var express = require('express');
var router = express.Router();
var checkLogin = require('../middlewares/check-api').checkLogin
var CODE = require('./constant')
var TODO = require('../models/todo')

router.get('/list', function(req, res, next) {
    TODO.list().then(function(result) {
        res.json({
            code: CODE.OK,
            data: result
        })
    }).catch(next)
})

router.post('/create', checkLogin, function(req, res, next) {
    var todo = req.fields.todo;
    try {
        if(!todo.content.length) {
            throw new Error('请填写内容');
        }
    } catch(e) {
        return res.json({
            code: CODE.BAD_REQ,
            message: e.message
        })
    }
    Object.assign(todo, {
        completed: false,
        isDel: false
    })
    TODO.create(todo).then(function(result) {
        res.json({
            code: CODE.OK,
            data: result.ops[0]
        })
    }).catch(next)
})

router.post('/updateOne', checkLogin, function(req, res, next) {
    var todo = req.fields.todo
    var todoId = todo._id
    delete todo._id
    try {
        if(!todoId.length) {
            throw new Error('ID为空')
        }
    } catch(e) {
        return res.json({
            code: CODE.BAD_REQ,
            message: e.message
        })
    }
    TODO.updateOne(todoId, todo).then(function(result) {
        res.json({
            code: CODE.OK,
            data: result.result
        })
    }).catch(next)
})

router.post('/update', checkLogin, function(req, res, next) {
    var todo = req.fields.todo
    var todoIds = req.fields.todoIds
    try {
        if(!todoIds.length) {
            throw new Error('参数不完整')
        }
    } catch(e) {
        return res.json({
            code: CODE.BAD_REQ,
            message: e.message
        })
    }
    TODO.update(todoIds, todo).then(function(result) {
        res.json({
            code: CODE.OK,
            data: result.result
        })
    }).catch(next)
})

module.exports = router