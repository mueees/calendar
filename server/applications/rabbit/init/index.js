var rabbitConfig = require('../config'),
    log = require('common/log')(module),
    _ = require('underscore'),
    Feed = require('../common/resources/feed');

var feeds = [
    'https://blog.arduino.cc/feed',
    'http://rss.cnn.com/rss/cnn_topstories.rss',
    'http://www.theguardian.com/uk/rss',
    'http://9gagrss.com/feed',
    'http://news.ycombinator.com/rss',
    'http://feeds.gawker.com/lifehacker/vip',
    'http://www.alistapart.com/rss.xml',
    'http://feeds.feedburner.com/failblog',
    'http://www.reddit.com/r/node/.rss',
    'http://tumblr.memecenter.com/rss',
    'http://www.newslookup.com/rss/business/bloomberg.rss',
    'http://feeds.nytimes.com/nyt/rss/HomePage',
    'http://rssfeeds.usatoday.com/usatoday-NewsTopStories',
    'http://www.uen.org/feeds/rss/news.xml.php',
    'http://www2.ed.gov/rss/edgov.xml',
    'http://feeds.nytimes.com/nyt/rss/Education',
    'http://www.smartbrief.com/servlet/rss?b=ASCD',
    'http://www.pbs.org/teachers/learning.now/rss2/index.xml',
    'http://www.npr.org/rss/rss.php?id=1013',
    'http://hosted.ap.org/lineups/SCIENCEHEADS-rss_2.0.xml?SITE=OHLIM&SECTION=HOME',
    'http://www.techlearning.com/RSS',
    'http://feeds.sciencedaily.com/sciencedaily',
    'http://feeds.nature.com/nature/rss/current',
    'http://www.nasa.gov/rss/image_of_the_day.rss',
    'http://feeds.wired.com/wired/index',
    'http://rss.macworld.com/macworld/feeds/main',
    'http://hosted.ap.org/lineups/SPORTSHEADS-rss_2.0.xml?SITE=VABRM&SECTION=HOME'
];

// connect to database
require("common/mongooseConnect").initConnection(rabbitConfig).then(function () {
    Feed.remove({}, function () {
        var prepearedFeeds = _.map(feeds, function (url) {
            return {
                url: url
            }
        });

        Feed.create(prepearedFeeds, function (err, feed) {
            if (err) {
                log.error(err.message);
                return;
            }

            log.info('Test feeds were created');

            process.exit();
        });
    });
});