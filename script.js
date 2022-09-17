var aniworldextractor = require('./lib/yunime/AniWorld_Extractor');
var datamanager = require('./lib/external/manageFiles');
const request = require('request');
const fs = require('fs');
var logger = require('./lib/external/logger.js');
var string = require('./lib/external/string.js')

//sudo dockerd
//sudo chmod 666 /var/run/docker.sock

const DOWNLOAD_PATH = "./data";// "/data"
const DATA_PATH = "./data/data.json";// "/data/data.json"
const CACHE_PATH = "./data/cache.json";// "/data/cache.json"
const DEBUG = false;

const MAX_DOWNLOAD = 5;

var cache = JSON.parse(datamanager.read(CACHE_PATH));
var animeData = JSON.parse(datamanager.read(DATA_PATH));
var packageconf = JSON.parse(datamanager.read('./package.json'));

logger.info('Script online');
logger.info('Version: ' + packageconf.version);


getAnime();
function myFunction() {
    var min = 5,
        max = 20;
    var rand = Math.floor(Math.random() * (max - min + 1) + min); //Generate Random number between 5 - 10
    console.log('Wait for ' + rand + ' minutes');
    getAnime();
    setTimeout(myFunction, rand * 60000);//
}

myFunction()


// if (DEBUG)
//     setInterval(getAnime, 60000);//10 sec
// else
//     setInterval(getAnime, 900000);//900000 = 15 min



function getAnime() {

    var downloaded = 0;

    console.clear();
    logger.info('Load latest datafile...');
    animeData = JSON.parse(datamanager.read(DATA_PATH));
    logger.info('Scan for new episodes...');

    for (var index = 0; !string.isnullorempty(animeData.list[index]); index++) {
        if (downloaded >= MAX_DOWNLOAD) {
            continue;
        }
        switch (animeData[animeData.list[index]].downloadType) {
            case 'last':
                var name = animeData.list[index];
                getLast(name, function (last) {
                    if (index > 0) {
                        var path = animeData[name].pathsave + "/Season " + animeData[name].season;
                        var filename = animeData[name].season + "X" + String(last) + " " + animeData[name].filename + ".mp4";
                        downloaded++;
                        downloadEpisode(name, last, path, filename, function (res) {
                            if (res) {
                                console.log("complete!")
                                cache[name].lastepisode = last
                                savecache();
                            }
                        })
                    }
                })
                break;


            case 'all':
                var name = animeData.list[index];

                getLast(name, function (last) {
                    for (var indexCurrent = 1; indexCurrent < last; indexCurrent++) {
                        var path = animeData[name].pathsave + "/Season " + animeData[name].season;
                        var filename = animeData[name].season + "X" + String(indexCurrent) + " " + animeData[name].filename + ".mp4";
                        if (fs.existsSync(path + '/' + filename)) {
                            continue;
                        }

                        if (downloaded >= MAX_DOWNLOAD) {
                            continue;
                        }
                        //scarica l'episodio
                        downloaded++;
                        downloadEpisode(name, indexCurrent, path, filename, function (res) {
                            if (res) {
                                console.log("complete!")
                                savecache();
                            }
                        })
                    }
                })
                break;

            case 'single':
                var name = animeData.list[index];
                var epIndex = animeData[name].episode
                var path = animeData[name].pathsave + "/Season " + animeData[name].season;
                var filename = animeData[name].season + "X" + String(epIndex) + " " + animeData[name].filename + ".mp4";

                getLast(name, function (last) {
                    if (Number(epIndex) <= last && !fs.existsSync(path + '/' + filename)) {
                        //scarica l'episodio se non presente
                        downloaded++;
                        downloadEpisode(name, epIndex, path, filename, function (res) {
                            if (res) {
                                console.log("complete!")
                                savecache();
                            }
                        })
                    }




                })
                break;

            default:
                break;
        }
    }
}

function savecache() {
    logger.info('Save config...');
    datamanager.write(CACHE_PATH, JSON.stringify(cache));
}

function getLast(name, callback) {

    logger.info("scan: " + name)
    aniworldextractor.get_last_episode(name, function (returnValue, title) {

        if (returnValue != 'error' && !string.isnullorempty(returnValue)) {
            callback(returnValue)
        }
        else {
            console.error("Number episode invalid!")
            callback(-1)
        }

    });

}

function downloadEpisode(name, episode, folder, filename, callback) {
    aniworldextractor.get_episode_aniWord(name, episode, function (returnValue) {

        if (returnValue != 'error' && !string.isnullorempty(returnValue)) {
            // var directorypath = animeData[name].pathsave;
            // var filename = animeData[name].filename + ' ' + animeData[name].season + 'x' + episode + '.mp4';
            var path = folder + '/' + filename;

            logger.info('Download from: ' + returnValue);
            // logger.info('Save in directory: ' + directorypath);
            // logger.info('File name: ' + filename);
            logger.info('Save in: ' + path);

            if (DEBUG != true) {


                if (!fs.existsSync(folder)) {
                    fs.mkdirSync(folder, { recursive: true });
                }

                try {
                    if (fs.existsSync(path)) {
                        logger.info('File already exists: ' + filename + ' deleting it...');
                        fs.unlinkSync(path);
                    }
                } catch (err) {
                    logger.error(err)
                    callback(false)
                }


                try {
                    request(returnValue, function (error, response, body) {
                        if (string.isnullorempty(error) && response.statusCode == 200)
                            callback(true)
                        else
                            callback(false)
                        // console.error('error:', error); // Print the error if one occurred
                        // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                        // console.log('body:', body); // Print the HTML for the Google homepage.
                    }).pipe(fs.createWriteStream(path))

                    // animeData[name].lastepisode = episode;
                    // datamanager.write(DATA_PATH, JSON.stringify(animeData));
                    // logger.info("Saved " + name + " episode " + episode)
                }
                catch (err) {
                    logger.error(err)
                    callback(false)
                    //animeData[name].lastepisode = episode;
                }

            }

            logger.info("nome: " + name + "  Ep: " + episode)

        }


    });
}






