var User = require('common/resources/user'),
    email = 'mue.miv@gmail.com',
    pass = 123;

User.registerNewUser(email, pass).then(function (user) {
    user.status = 200;
    user.save(function (err) {
        if (err) {
            console.log('Cannot save ' + email + ' user');
            console.log(err);
            return;
        }

        console.log('User ' + email + ' was saved');
    });
}, function (err) {
    console.log('Cannot register ' + email);
    console.log(err);
});