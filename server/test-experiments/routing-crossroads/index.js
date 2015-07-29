var crossroads = require('crossroads');

var router = crossroads.create();

router.addRoute('/news/{id}', function(data, id){
    console.log(id);
});

router.parse('/news/123', [{
    data: 'test'
}, 'some string']);