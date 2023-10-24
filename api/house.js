var express = require('express')
var router = express.Router()
var axios = require('axios')
var FormData = require('form-data')
var CODE = require('../constant')

router.get('/floor-info', function (req, res, next) {
  var code = req.query.code
  var url = 'http://222.240.149.21:8081'
  var formData = new FormData()
  formData.append('ywzh', code)
  axios
    .post(url + '/hslist', formData)
    .then(function (data) {
      res.json({
        code: CODE.OK,
        data: data.data,
      })
    })
    .catch(next)
})

module.exports = router
