var EmailAction = require('common/actions/email');

// send template from common folder
new EmailAction({
    to: 'mue.miv@gmail.com',
    template: 'views/test.jade',
    subject: "Confirmation account"
}).execute(function () {
        console.log('done');
    });