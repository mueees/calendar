var dnode = require('dnode');

var server,
    stream = dnode.connect(5004, function (r) {
        var i = 0;

        setInterval(function(){
            i++;
            sendRequest();
        }, 1);


        function sendRequest(){
            var start = new Date();

            r.transform('string', function (data) {
                var time = (new Date()).getTime() - start;

                console.log(time);
            });
        }
    });