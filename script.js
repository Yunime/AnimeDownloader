var aniworldextractor = require('./lib/yunime/AniWorld_Extractor');
var logger = require('./lib/LS/logger')
var managerFiles = require('./lib/LS/managerFiles')
var managerFolders = require('./lib/LS/managerFolders')
var json = require('./lib/LS/json')
var downloader = require('./lib/AnimeDownloader/download')

const VERSION = "01.04"

logger.info("script.js", "Version: " + VERSION)

managerFolders.createIfNotExists('./data');
managerFolders.createIfNotExists('./download');

const FILE_DATA = "data.json"
const PATH_DATA = "./data/"
const PATH_DOWNLOAD = "./download/"
var dataProgram = {
    scanTimeMs: 200000,
    maxDownload: 5,
    list: []
}

//animeName:
//downloadType: all latest
//seasonIndex: 




if (managerFiles.exists(PATH_DATA + FILE_DATA)) {
    var str = managerFiles.read(PATH_DATA + FILE_DATA)
    if (json.isJsonValid(str))
        dataProgram = JSON.parse(str)
    else
        managerFiles.write(PATH_DATA + FILE_DATA, JSON.stringify(dataProgram))
}
else
    managerFiles.write(PATH_DATA + FILE_DATA, JSON.stringify(dataProgram))





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
            aniworldextractor.getLastEpIndex(data.animeName + " " + data.seasonIndex)
                .then(indexLast => {
                    var fileName = data.seasonIndex + "X" + indexLast + "_" + data.animeName + ".mp4"
                    var filePath = PATH_DOWNLOAD + "/" + data.animeName + "/Season " + data.seasonIndex + "/"
                    managerFolders.createIfNotExists(filePath)

                    if (!managerFiles.exists(filePath + fileName)) {
                        aniworldextractor.getEpisodeLink(data.animeName + " " + data.seasonIndex, indexLast)
                            .then(link => {
                                logger.info("script.js", "Downloading " + data.animeName + " " + data.seasonIndex + " Episode: " + indexLast)
                                downloader.downloadMedia(link, filePath + fileName).then(success => {
                                    resolve()
                                })
                            })
                    }
                    else{
                        logger.info("script.js", data.animeName + " " + data.seasonIndex + " Episode: " + indexLast+ " Already exists. Skip")
                        resolve()
                    }
                        

                })
            break;
    }
})


function scanLibrary() {
    var min = 5,
        max = 20;
    var rand = Math.floor(Math.random() * (max - min + 1) + min); //Generate Random number between 5 - 10
    
    var tasks = [];

    dataProgram.list.forEach(element => {
        tasks.push(getAnime(element))
    });


    Promise.all(tasks).then(d => {// when all tasks are done put out the result
        logger.info("script.js",'Wait for ' + rand + ' minutes');
        setTimeout(scanLibrary, rand * 60000);//
    })
    
}

scanLibrary()





