var User = require('common/resources/user'),
    email = 'mue.miv@gmail.com',
    password = 123123;

User.signup(email, password, function (err, user) {
    if (err) {
        console.log(err);
        return;
    }

    user.status = 200;
    user.confirmationId = '';
    user.date_confirm = new Date();

    user.save(function (err) {
        if (err) {
            console.log(err);
            return;
        }

        console.log('User ' + email + ' was saved');
    });
});