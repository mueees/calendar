require('common/mongooseConnect');

var User = require('common/resources/user');

User.remove({}, function (err) {
    if (err) {
        console.log("Cannot clear users");
        return;
    }
    console.log("Users was cleared")
});