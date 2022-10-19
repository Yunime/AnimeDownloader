# AnimeDownloader

On the file ```data.json``` add a new element on the array called ```list```.
```
        {
            "animeName": "One Piece",
            "downloadType": "latest",
            "seasonIndex": 21,
            "longTermAnime": true
        }
```
 **Explaination parameters**
  - ```animeName``` : the name of the anime
  - ```downloadType``` : type of download
    - all : not implemented
    - latest : download the latest episode available
  - ```longTermAnime``` if the anime is without end like One piece, Conan, Naruto... set it *true*.
