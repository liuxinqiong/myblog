var TODO = require('../lib/mongo').TODO;

module.exports = {
    create: function(todo) {
        return TODO
            .create(todo)
            .exec();
    },
    updateOne: function(todoId, data) {
        return TODO
            .update({ _id: todoId }, { $set: data })
            .exec()
    },
    // db.table_name.update(where, setNew, isInsert, multi);
    update: function(todoIds, data) {
        return TODO
            .update({ _id: { $in: todoIds } }, { $set: data }, { multi: true })
            .exec()
    },
    list: function() {
        return TODO
            .find({ isDel: false })
            .sort({ _id: -1 })
            .addCreatedAt()
            .exec()
    }
}