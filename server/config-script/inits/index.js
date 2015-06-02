require('common/mongooseConnect');

// require all files from inits folder
require("fs").readdirSync(require("path").join(__dirname, "scripts")).forEach(function(file) {
    require("./inits/" + file);
});