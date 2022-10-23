var logger = require('../LS/logger')
var object = require('../LS/object')

const fs = require('fs');



var downloadMedia = (link, path) => new Promise((resolve, reject) => {
    const fetch = require('node-fetch');


    fetch(link)
        .then(response => {
            response.buffer()
                .then(buffer => {
                    fs.writeFile(path, buffer, () =>
                        resolve());
                })
        });

})

exports.downloadMedia = downloadMedia