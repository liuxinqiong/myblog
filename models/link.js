var Link = require('../lib/mongo').Link;

module.exports = {
    create: function(link) {
        return Link.create(link).exec();
    },
    getAll: function() {
        return Link
            .find({ isDel: false })
            .sort({ _id: 1 })
            .exec();
    },
    delete: function(linkId) {
        return Link
            .update({ _id: linkId }, { $set: { isDel: true } })
            .exec();
    },
    update: function(linkId, data) {
        return Link
            .update({ _id: linkId }, { $set: data })
            .exec()
    }
}