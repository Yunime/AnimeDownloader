var nodemailer = require('nodemailer');
var datamanager = require('./manageFiles.js');
var configFile = JSON.parse(datamanager.read('./data/config.json'));
var logger = require('./logger.js');

var transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',//smtp.office365.com
    secureConnection: true,//enable tls
    port: 587,
    auth: {
        user: configFile.notify.mail,
        pass: configFile.notify.password
    },
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false,
    }
});




module.exports = {
    sendEmail: function (to, subject, text, callback) {

        var mailOptions = {
            from: configFile.notify.mail,
            to: to,
            subject: subject,
            text: text
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                logger.error("Error during the send of the email ERROR: " + error, "ORDE");
                callback(false)
            } else {
                //console.log('Email sent: ' + info.response);
                callback(true)
            }
        });
    }
};