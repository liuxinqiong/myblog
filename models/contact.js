/**
 * Created by sky on 2017/11/8.
 */
var Contact = require('../lib/mongo').Contact;

module.exports = {
    // 创建一个联系信息
    create: function create(contact) {
        return Contact.create(contact).exec();
    }
};