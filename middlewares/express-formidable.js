/**
 * Created by sky on 2017/11/1.
 * express-formidable 存在 bug 且作者没有修改，考虑到源代码不多的情况下，直接修改覆盖，目前发现的bug
 * 1. 奇怪内容类型报错且导致宕机，比如 content-type:application/x-java-serialized-object
 * 2. 网友碰到导致重复响应的问题，自己的日志确实有，一直没找到原因，待测
 * 3. formiable 有时候会出现 this._parser.write is not a function，导致服务重启，不知道会不会也是这里的问题，待测
 */
'use strict';

const formidable = require('formidable');

function parse(opts) {

    return (req, res, next) => {
        const form = new formidable.IncomingForm();
        Object.assign(form, opts);
        form.parse(req, (err, fields, files) => {
            if (err) {
                next(err);
                return;
            }
            Object.assign(req, {fields, files});
            next();
        });
    };
}

module.exports = parse;
exports.parse = parse; // backword compatibility