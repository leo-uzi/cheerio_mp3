const fs = require('fs')
const axios = require('axios')
const path = require('path')
const cheerio = require('cheerio')
const baseUrl = 'http://www.app-echo.com/api/recommend/sound-day?page='
async function getPageData(pagenum) {
    const { data } = await axios.get(baseUrl + pagenum)
    data.list.forEach(async item => {
        let musicName = item.sound.name
        let musicUrl = item.sound.source
        let ext = path.parse(musicUrl).ext
        let title = path.parse(musicUrl).name
        let params = {
            "musicName": musicName,
            "musicUrl": musicUrl,
            "hashName": title
        }
        let jsonParams = JSON.stringify(params)
        fs.writeFile('./musicList.json', jsonParams, { flag: 'a', encoding: 'utf-8' }, (err) => {
            if (err) {
                console.log(err)
            }
        })
        if (ext) {
            let reg = /(.*?)\?\d/
            ext = reg.exec(ext)[1]
            loadMusic(musicUrl, title, ext)
        }
    });
}
async function loadMusic(url, title, ext) {
    const { data } = await axios.get(url, { responseType: 'stream' })
    const ws = fs.createWriteStream(`./music/${title}${ext}`)
    data.pipe(ws)
    data.on('close', () => {
        console.log(title + '写入流已完成')
        ws.close()
    })
}
getPageData(1)