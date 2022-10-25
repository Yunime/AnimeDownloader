var logger = require('./logger')
//var object = require('./object')
const fs = require('fs');
const https = require('https');
var fetch=require('node-fetch')


var downloadMedia = (link, path) => new Promise((resolve, reject) => {
    try {
        
        fetch(link)
            .then(response => {
                response.buffer()
                    .then(buffer => {
                        fs.writeFile(path, buffer, () =>
                            resolve());
                    })
            });

    }
    catch (err) {
        logger.error(err)
        reject(new Error(err))

    }
})


var downloadPageContent = (link) => new Promise((resolve, reject) => {
    var body = ""

    if(link.length==0)
    throw Error("aa")
    https.get(link, (res) => {
        res.on('data', (d) => {
            body += Buffer.alloc(d.length, d).toString('ascii')
            //
        });

        res.on("end", () => {
            resolve(body)
        });

    }).on('error', (e) => {
        reject(e)
    });
})

exports.downloadMedia = downloadMedia
exports.downloadPageContent = downloadPageContent