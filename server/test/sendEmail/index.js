var EmailAction = require('common/actions/email');

// send template from common folder
new EmailAction({
    to: 'mue.miv@gmail.com',
    template: 'views/email/confirmEmail.jade',
    subject: "Confirmation account",
    data: {
        confirmationId: 'confirmationId',
        application: 'Calendar project'
    }
}).execute(function () {
        console.log('done')
    });

// send template from local folder
new EmailAction({
    to: 'mue.miv@gmail.com',
    template: __dirname + '/view/test.jade',
    subject: "Confirmation account",
    data: {
        confirmationId: 'confirmationId',
        application: 'Calendar project'
    }
}).execute(function () {
        console.log('done')
    });