var CODE = require('../api/constant')

module.exports = {
    checkLogin: function checkLogin(req, res, next) {
        if (!req.session.user) {
            return res.json({
                code: CODE.NOT_LOGIN,
                data: 'NOT LOGIN'
            });
        }
        next();
    }
};