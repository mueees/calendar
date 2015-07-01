require('common/mongooseConnect');

// require all files from inits folder
require("fs").readdirSync(require("path").join(__dirname, "scripts")).forEach(function (file) {
    require("./inits/" + file);
});

/*
 * 1. Create User
 * 2. Confirm User
 * 3. Create token_account for User
 * 4. Create Base Application
 * */