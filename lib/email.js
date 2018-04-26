/**
 * Created by sky on 2017/11/1.
 */
var nodemailer = require('nodemailer');

module.exports = function (credentials) {
    var mailTransport = nodemailer.createTransport({
        service: 'qq',
        auth: {
            user: credentials.qmail.user,
            pass: credentials.qmail.password
        }
    });

    var from = '"Ethan | 博客" <' + credentials.qmail.user + '>';
    var errprRecipient = '372513646@qq.com';
    var adminRecipient = '372513646@qq.com';

    return {
        send: function (to, subj, body) {
            mailTransport.sendMail({
                from: from,
                to: to,
                subject: subj,
                html: body,
                generateTextFromHtml: true
            }, function (err) {
                if (err) console.log('unable to send email')
            });
        },

        sendNotification: function (subj, body) {
            mailTransport.sendMail({
                from: from,
                to: adminRecipient,
                subject: subj,
                html: body,
                generateTextFromHtml: true
            }, function (err) {
                if (err) console.log('unable to send email')
            })
        },

        emailError: function (message, filename, exception) {
            var body = '<h1>Ethan 博客 Error</h1>' +
                'message:<br><pre>' + message + '</pre><br>';
            if (exception) body += 'exception:<br><pre>' + exception + '</pre><br>';
            if (filename) body += 'filename:<br><pre>' + filename + '</pre><br>';
            mailTransport.sendMail({
                from: from,
                to: errprRecipient,
                subject: 'Website Error',
                html: body,
                generateTextFromHtml: true
            }, function (err) {
                if (err) console.log('unable to send email')
            });
        }
    }
}