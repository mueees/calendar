var oauth = require('../modules/oauth');

var server = oauth.createServer();

// if user accept, create auth_code, and redirect with this code
// if user reject, redirect without auth_code
module.exports.auth = [
    /*
    * 1. check that we have the sign in user
    * 2. check that we have applicationId
    * 3. check that we have valid application
    * 4. check if application has already auth_code
    *   yes: check if this auth_code is exchanged ?
      *   yes: return error
    *
    * . create auth_code and associate it with application
    * 5.
    * */


];
module.exports.exchange = [];