var rabbitConfig = require('../config'),
    log = require('common/log')(module),
    Feed = require('../common/resources/feed');

var feeds = [
    {
        title: 'Arduino',
        url: 'https://blog.arduino.cc/feed'
    },
    {
        title: 'Cnn',
        url: 'http://rss.cnn.com/rss/cnn_topstories.rss'
    },
    {
        title: 'Gurdian',
        url: 'http://www.theguardian.com/uk/rss'
    },
    {
        title: '9gag',
        url: 'http://9gagrss.com/feed'
    },
    {
        title: 'Hacker news',
        url: 'http://news.ycombinator.com/rss'
    },
    {
        title: 'Lifehacker',
        url: 'http://feeds.gawker.com/lifehacker/vip'
    },
    {
        title: 'Alistapart',
        url: 'http://www.alistapart.com/rss.xml'
    },
    {
        title: 'Fail blog',
        url: 'http://feeds.feedburner.com/failblog'
    },
    {
        title: 'Reddit Nodejs',
        url: 'http://www.reddit.com/r/node/.rss'
    },
    {
        title: 'Meme center',
        url: 'http://tumblr.memecenter.com/rss'
    },
    {
        title: 'Bloomberg',
        url: 'http://www.newslookup.com/rss/business/bloomberg.rss'
    },
    {
        title: 'New Your Time',
        url: 'http://feeds.nytimes.com/nyt/rss/HomePage'
    },
    {
        title: 'USA Today',
        url: 'http://rssfeeds.usatoday.com/usatoday-NewsTopStories'
    },
    {
        title: 'Utah Education',
        url: 'http://www.uen.org/feeds/rss/news.xml.php'
    },
    {
        title: 'U. S. Department of Education',
        url: 'http://www2.ed.gov/rss/edgov.xml'
    },
    {
        title: 'New York Time Education',
        url: 'http://feeds.nytimes.com/nyt/rss/Education'
    },
    {
        title: 'ASCD',
        url: 'http://www.smartbrief.com/servlet/rss?b=ASCD'
    },
    {
        title: 'Learning now',
        url: 'http://www.pbs.org/teachers/learning.now/rss2/index.xml'
    },
    {
        title: 'NPR Topics: Education',
        url: 'http://www.npr.org/rss/rss.php?id=1013'
    },
    {
        title: 'TeachLearning.com',
        url: 'http://www.techlearning.com/RSS'
    },
    {
        title: 'AP Top science news',
        url: 'http://hosted.ap.org/lineups/SCIENCEHEADS-rss_2.0.xml?SITE=OHLIM&SECTION=HOME'
    },
    {
        title: 'Science Daily',
        url: 'http://feeds.sciencedaily.com/sciencedaily'
    },
    {
        title: 'Nature com',
        url: 'http://feeds.nature.com/nature/rss/current'
    },
    {
        title: 'Nasa image of day',
        url: 'http://www.nasa.gov/rss/image_of_the_day.rss'
    },
    {
        title: 'Wired top stories',
        url: 'http://feeds.wired.com/wired/index'
    },
    {
        title: 'Mac world',
        url: 'http://rss.macworld.com/macworld/feeds/main'
    },
    {
        title: 'AP Top Sports News',
        url: 'http://hosted.ap.org/lineups/SPORTSHEADS-rss_2.0.xml?SITE=VABRM&SECTION=HOME'
    }
];

// connect to database
require("common/mongooseConnect").initConnection(rabbitConfig).then(function () {
    Feed.remove({}, function () {
        Feed.create(feeds, function (err, feed) {
            if (err) {
                log.error(err.message);
                return;
            }

            log.info('Test feeds were created');

            process.exit();
        });
    });
});