var logger = require('../LS-Common-Lib/node-js/logger');
var downloader = require('../LS-Common-Lib/node-js/downloader');


var getLastEpIndex = (title) => new Promise((resolve, reject) => {
  try {
    getAnimePageLink(title)
      .then(pagelink => {
        if (!isnullorempty(pagelink)) {
          downloader.downloadPageContent(pagelink).then(body => {//go on the anime page
            checkRedirect(body, "https://www.animeworld.tv").then(body => {
              str = extract(body.split('\n'), "data-episode-num");//split line containing anime data
              str = regrp_ep_server_aniworld(str);
              str = getMultilink(str);
              var episodes = str.split('\n');
              var result = Lenght(episodes)
              resolve(result);

            })


          });
        }
      });
  }
  catch {
    logger.error('errore in get_last_episode');
    reject(new Error('errore in get_last_episode'));
  }
})


var getEpisodeLink = (title, episode) => new Promise((resolve, reject) => {//callback function
  getAnimePageLink(title)
    .then(pagelink => {
      getEpisodeFromAnimePage(pagelink, episode)
        .then(episodeLink => {
          resolve(episodeLink);
        });
    });
})


var getEpisodeFromAnimePage = (link, ep_num) => new Promise((resolve, reject) => {//callback function
  if (!isnullorempty(link)) {


    downloader.downloadPageContent(link).then(body => {//go on the anime page
      checkRedirect(body, "https://www.animeworld.tv").then(body => {

        var str = extract(body.split('\n'), "data-episode-num");//split line containing anime data

        str = regrp_ep_server_aniworld(str);
        str = getMultilink(str);

        var url = getEpisodesFromList(str, ep_num);

        downloader.downloadPageContent(url).then(body => {//go on the episode page

          str = extract(body.split('\n'), "alternativeDownloadLink");//split line containing anime data

          var result = getDownloadLink(str);
          resolve(result);

        });
      })

      //else



    });
  }
})



var getAnimePageLink = (title) => new Promise((resolve, reject) => {//callback function
  var link = "https://www.animeworld.tv/search?keyword=" + title.replace(" ", "+");

  downloader.downloadPageContent(link).then(body => { //search anime

    var data = extract(body.split('\n'), "data-jtitle");//split line containing anime data
    var str = search_most_similar(data, title);//get data anime required
    resolve("https://www.animeworld.tv" + getLink(str));

  });
})



function extract(lnArray, iddata) {
  var result = "";
  if (!isnullorempty(lnArray)) {
    lnArray.forEach(element => {
      if (element.includes(iddata)) {
        result += element + "\n";
      }
    });
    return result;
  }

  return "";


}

function search_most_similar(data, title) {
  var maxcorresp = 0;
  var current = "";
  var actual = 0;
  if (!isnullorempty(data)) {
    try {
      var arr_d = data.split('\n');
      var arr_t = title.split(' ');

      arr_d.forEach(line => {

        arr_t.forEach(word => {
          if (line.toLowerCase().includes(word.toLowerCase())) {
            actual++;
          }
        });

        if (actual > maxcorresp) {
          maxcorresp = actual;
          current = line;
        }
        actual = 0;
      });

      return current;
    }
    catch
    {
      logger.error('errore in search_most_similar');
    }

  }

  return "";
}

function getLink(data) {
  if (!isnullorempty(data)) {
    var res = "";
    var spl = data.split('"');


    spl.forEach(line0 => {
      if (line0.includes("/") && line0.includes("/play/")) {
        res = line0;
      }

    });

    return res;
  }
  return "";

}

function getDownloadLink(data) {
  if (!isnullorempty(data)) {
    var res = "";
    var spl = data.split('"');


    spl.forEach(line0 => {
      if (line0.includes("/") && (line0.includes("https://") || line0.includes("www."))) {
        res = line0;
      }

    });

    return res;
  }
  return "";
}

function getStream(data) {
  if (!isnullorempty(data)) {
    var res = "";
    var spl = data.split('"');


    spl.forEach(line0 => {
      if (line0.includes("/") && line0.includes("/play/")) {
        res = line0;
      }

    });

    return res;
  }
  return "";
}

function getMultilink(data) {
  if (!isnullorempty(data)) {
    var res = "";
    var episodes = data.split('\n');
    //var count = 1;


    episodes.forEach(line0 => {

      var spl = line0.split('"');

      spl.forEach(element => {
        if (element.includes("/") && element.includes("/play/")) {

          res += "https://www.animeworld.tv" + element + "\n";
          //logger.log(count + " " + element);
          //count++;

        }
      });
    });

    return res;
  }
  return "";
}

function getEpisodesFromList(data, idEp) {
  if (!isnullorempty(data)) {
    var episodes = data.split('\n');

    if (Lenght(episodes) >= idEp && idEp > 0) {
      return episodes[idEp - 1];
    }
    else {
      logger.error("Episode index out of range! Get last");
      return episodes[Lenght(episodes) - 1];
    }
  }

  return "";
}

function Lenght(data) {
  if (!isnullorempty(data)) {
    var lenght = 0;
    data.forEach(element => {
      if (element != "")
        lenght++;
    });
    return lenght;
  }
  return 0;
}

function regrp_ep_server_aniworld(data) {
  if (!isnullorempty(data)) {
    try {
      let episodes = "";
      var epnum = 1;
      var arr_d = data.split('\n');

      arr_d.forEach(line => {
        if (line.includes("data-episode-num=\"" + epnum + "\"")) {
          episodes += line + "\n";
          epnum++;
        }
        if (line.includes((epnum - 1) + "-" + epnum)) {
          episodes += line + "\n";
          epnum++;
        }
        // else if (line.includes("data-episode-num=\"1\"") && episodes > 1) {
        //   return true;
        // }



      });


      return episodes;
    }
    catch {
      logger.error('errore in regrp_ep_server_aniworld');
    }
  }
  return "";

}


function isnullorempty(data) {
  if (data == undefined || data == "" || data == null)
    return true
  else
    return false
}



var checkRedirect = (body, link) => new Promise((resolve, reject) => {
  if (body.toLowerCase().includes("redirect")) {
    var a = body.split(' ')
    var pt2=a[a.length - 1]
    downloader.downloadPageContent(link + pt2).then(body => {
      resolve(body)
    })
  }
  else
    resolve(body)
})

exports.getLastEpIndex = getLastEpIndex;
exports.getEpisodeLink = getEpisodeLink;