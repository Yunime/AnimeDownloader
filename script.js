var aniworldextractor = require('./lib/yunime/AniWorld_Extractor');
var logger = require('./lib/LS/logger')
var managerFiles = require('./lib/LS/managerFiles')
var managerFolders = require('./lib/LS/managerFolders')
var json = require('./lib/LS/json')
var downloader = require('./lib/AnimeDownloader/download')

const VERSION = "01.07"

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

    switch (data.downloadType) {
        case 'all':
            logger.info("script.js", data.animeName + " " + data.seasonIndex + " Downloading options: all")
            logger.error("script.js", data.animeName + " " + data.seasonIndex + " Downloading options not yet implemented")
            resolve()
            break;

        case 'latest':
        default:
            logger.info("script.js", data.animeName + " " + data.seasonIndex + " Downloading options: latest")
            var searchString = data.animeName
            if (Number(data.seasonIndex) > 1 && !data.longTermAnime)
                searchString = searchString + " " + data.seasonIndex

            aniworldextractor.getLastEpIndex(searchString)
                .then(indexLast => {
                    var fileName = data.seasonIndex + "X" + indexLast + "_" + data.animeName + ".mp4"
                    var filePath = PATH_DOWNLOAD + "/" + data.animeName + "/Season " + data.seasonIndex + "/"
                    managerFolders.createIfNotExists(filePath)

                    if (!managerFiles.exists(filePath + fileName)) {
                        aniworldextractor.getEpisodeLink(searchString, indexLast)
                            .then(link => {
                                logger.info("script.js", "Downloading " + data.animeName + " " + data.seasonIndex + " Episode: " + indexLast)
                                downloader.downloadMedia(link, filePath + fileName).then(success => {
                                    logger.info("script.js", data.animeName + " " + data.seasonIndex + " Episode: " + indexLast +" Download complete!")
                                    resolve()
                                })
                            })
                    }
                    else {
                        logger.info("script.js", data.animeName + " " + data.seasonIndex + " Episode: " + indexLast + " Already exists. Skip")
                        resolve()
                    }


                })
            break;
    }
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





