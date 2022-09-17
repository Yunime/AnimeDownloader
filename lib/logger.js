const fs = require('fs');
var datamanager = require('../manageFiles.js');


module.exports = {
    warning: function(logtext) {
        makeLog(logtext, 1)
    },
    error: function(logtext) {
        makeLog(logtext, 2)
    },
    info: function(logtext) {
        makeLog(logtext, 0)
    },
    log: function(logtext) {
        var log = date() + '\t' + time() + '\t \t' + logtext;
        console.log(log)
    },
    auth: function(logtext) {
        makeLog(logtext, 4)
    }
};


function makeLog(logtext, type) {
    var log = date() + '\t' + time() + '\t' + getTypeLog(type) + '\t' + logtext;
    var filename = './LOG/' + date() + '_LOG.log';

    console.log(log);

    if (!fs.existsSync('./LOG/')) { //create the log folder if not exists
        fs.mkdirSync('./LOG/', { recursive: true });
    }
    datamanager.append(filename, log + "\n");
}

function getTypeLog(num) {
    if (num == 0)
        return "INFO"
    else if (num == 1)
        return "WARNING"
    else if (num == 2)
        return "ERROR"
    else if (num == 3)
        return "."
    else if (num == 4)
        return "AUTH"
    else
        return "INFO"
}


function date() {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    return (year + "-" + month + "-" + date)
}

function time() {
    let date_ob = new Date();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    return (twoChar(hours.toString()) + ":" + twoChar(minutes.toString()) + ":" + twoChar(seconds.toString()))
}

function twoChar(numin) {
    if (numin.length < 2)
        return "0" + numin;
    else
        return numin;
}