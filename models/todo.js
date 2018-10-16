var TODO = require('../lib/mongo').TODO;

module.exports = {
    create: function(todo) {
        return TODO.create(todo).exec();
    },
    update: function(todoId, data) {
        return TODO
            .update({ _id: todoId }, { $set: data })
            .exec()
    }
}