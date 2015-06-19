var director = require('director'),
    router = new director.Router({
        '/api' : function (arguments) {
            console.log(arguments);
            console.log(this);
            console.log(123);
        }
    });

router.dispatch('on', '/api', {
    name: 123
});
