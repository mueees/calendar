var cheerio = require('cheerio');
var html = '<div>' +
    '<div><img src="http://google.com"/></div>' +
    '</div>';

var $img = cheerio.load(html)('img');

console.log(cheerio.load(html)('img').eq(0).attr('src'));