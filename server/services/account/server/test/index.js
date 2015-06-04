var accountConfig = require('../config');


require("common/mongooseConnect").initConnection(accountConfig);

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Child = new Schema({
    name: {
        type: String,
        default: ''
    }
});

var Parent = new Schema({
    members: {
        type: [Child],
        default: []
    }
});



var ChildModel = mongoose.model('child', Child);
var ParentModel = mongoose.model('parent', Parent);

var parent = new ParentModel({
    members: [{
        name: 'vitalii'
    }]
});

parent.save(function (err, parent) {
    if(err){
        return console.log(err);
    }

    var child = parent.members[0];

    child.name = 'irina';

    parent.save();
});
