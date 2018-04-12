const request = require('request');
const cheerio = require('cheerio');

function gethtml(URL) {
    return new Promise((resolve, reject) => {
        request(URL, function(err, res, body) {
            resolve(body);
        })
    });
}

request('http://wifi.hinet.net/pwlan/search_hotspot.php?area=P07&type=T0', (error, response, body) => {
    const $ = cheerio.load(body)

    let countString = $('#maincolumn_big center').text();
    let totalCount = countString.substring(countString.indexOf('有') + 1, countString.indexOf('筆'));
    let pages = (totalCount / 100);
    let requests = [];
    let page;
    for (page = 0; page < pages; page++) {
        let start = page * 100;
        let url = 'http://wifi.hinet.net/pwlan/search_hotspot.php?area=P07&type=T0&start=' + start;
        requests.push(gethtml(url))
    }

    Promise.all(requests)
        .then((results) => {
            let list = [];
            for (let i = 0; i < results.length; i++) {
                const $ = cheerio.load(results[i]);
                let limit = 103;
                var step;
                for (step = 3; step < limit; step++) {
                    let hotspot = {};
                    if (list.length < totalCount) {
                        hotspot.id = $('.contentpaneopen:nth-child(2) tr td br+table tr:nth-child(' + step + ') td:nth-child(1)').text();
                        hotspot.name = $('.contentpaneopen:nth-child(2) tr td br+table tr:nth-child(' + step + ') td:nth-child(2)').text();
                        hotspot.address = $('.contentpaneopen:nth-child(2) tr td br+table tr:nth-child(' + step + ') td:nth-child(3)').text();
                        list.push(hotspot);
                    }
                }
            }
        })
        .catch(err => console.log(err)); // First rejected promise
})