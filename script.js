var aniworldextractor = require('./lib/AnimeworldAPI/AniWorld_Extractor');
var logger = require('./lib/LS-Common-Lib/node-js/logger')
var managerFiles = require('./lib/LS-Common-Lib/node-js/managerFiles')
var managerFolders = require('./lib/LS-Common-Lib/node-js/managerFolders')
var json = require('./lib/LS-Common-Lib/node-js/json')
var downloader = require('./lib/LS-Common-Lib/node-js/downloader')

const VERSION = "01.08"

logger.info("script.js", "Version: " + VERSION)

managerFolders.createIfNotExists('./data');
managerFolders.createIfNotExists('./download');

const FILE_DATA = "data.json"
const PATH_DATA = "./data/"
const PATH_DOWNLOAD = "./download/"
var dataProgram = {
    minScanTimeMinute: 5,
    maxScanTimeMinute: 10,
    maxDownload: 5,
    list: []
}

//animeName:
//downloadType: all latest
//seasonIndex: 
//longTermAnime: true false




if (managerFiles.exists(PATH_DATA + FILE_DATA)) {
    var str = managerFiles.read(PATH_DATA + FILE_DATA)
    if (json.isJsonValid(str))
        dataProgram = JSON.parse(str)
    else
        managerFiles.write(PATH_DATA + FILE_DATA, JSON.stringify(dataProgram, null, "\t"))
}
else
    managerFiles.write(PATH_DATA + FILE_DATA, JSON.stringify(dataProgram, null, "\t"))





var getAnime = (data) => new Promise((resolve, reject) => {

    var searchString = data.animeName
    if (Number(data.seasonIndex) > 1 && !data.longTermAnime)
        searchString = searchString + " " + data.seasonIndex

    aniworldextractor.getLastEpIndex(searchString)
        .then(indexLast => {
            var filePath = PATH_DOWNLOAD + "/" + data.animeName + "/Season " + data.seasonIndex + "/"
            managerFolders.createIfNotExists(filePath)

            switch (data.downloadType) {
                case 'all':
                    logger.info("script.js", data.animeName + " " + data.seasonIndex + " Downloading options: all")

                    var episodes = []
                    for (let index = 1; index <= indexLast; index++) {
                        var fileName = data.seasonIndex + "X" + index + "_" + data.animeName + ".mp4"
                        if (!managerFiles.exists(filePath + fileName) && episodes.length < dataProgram.maxDownload) {
                            logger.info("script.js", "Downloading " + data.animeName + " " + data.seasonIndex + " Episode: " + index)
                            episodes.push(getvideo(searchString, index, filePath + fileName))
                        }
                    }

                    Promise.all(episodes).then(d => {
                        resolve()
                    })

                    break;

                case 'latest':
                default:
                    logger.info("script.js", data.animeName + " " + data.seasonIndex + " Downloading options: latest")

                    var fileName = data.seasonIndex + "X" + indexLast + "_" + data.animeName + ".mp4"
                    if (!managerFiles.exists(filePath + fileName)) {
                        aniworldextractor.getEpisodeLink(searchString, indexLast)
                            .then(link => {
                                logger.info("script.js", "Downloading " + data.animeName + " " + data.seasonIndex + " Episode: " + indexLast)
                                downloader.downloadMedia(link, filePath + fileName).then(success => {
                                    logger.info("script.js", data.animeName + " " + data.seasonIndex + " Episode: " + indexLast + " Download complete!")
                                    resolve()
                                })
                            })
                    }
                    else {
                        logger.info("script.js", data.animeName + " " + data.seasonIndex + " Episode: " + indexLast + " Already exists. Skip")
                        resolve()
                    }
                    break;
            }
        })

})


var getvideo = (searchString, index, path) => new Promise((resolve, reject) => {
    aniworldextractor.getEpisodeLink(searchString, index)
        .then(link => {
            downloader.downloadMedia(link, path).then(success => {
                resolve()
            })
        })
})

function scanLibrary() {

    var rand = Math.floor(Math.random() * (dataProgram.maxScanTimeMinute - dataProgram.minScanTimeMinute + 1) + dataProgram.minScanTimeMinute); //Generate Random number between 5 - 10

    var tasks = [];

    logger.info("script.js", 'Start scan');
    dataProgram.list.forEach(element => {
        tasks.push(getAnime(element))
    });


    Promise.all(tasks).then(d => {// when all tasks are done put out the result
        logger.info("script.js", 'Wait for ' + rand + ' minutes');
        setTimeout(scanLibrary, rand * 60000);//
    })

}

scanLibrary()





process.on('uncaughtException', function (err) {
    logger.error("script.js",err + "\n" + err.stack);
    process.exit();
})