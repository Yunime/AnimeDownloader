var logger = require('../LS/logger')
var object = require('../LS/object')
const request = require('request');
const fs = require('fs');



var downloadMedia = (link,path) => new Promise((resolve, reject) => {
    try {
        request(link, function (error, response, body) {
            if (object.isNull(error) && response.statusCode == 200)
                resolve()
            else
               reject()
        }).pipe(fs.createWriteStream(path))

    }
    catch (err) {
        logger.error(err)
        reject()
        
    }
})

exports.downloadMedia=downloadMedia