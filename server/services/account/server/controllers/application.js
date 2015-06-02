var validator = require('validator'),
    async = require('async'),
    HttpError = require('common/errors/HttpError'),
    configuration = require("configuration"),
    accountConfig = require("../config"),
    User = require('common/resources/user');

var controller = {
    getById: function (request, response, next) {
        response.send({
            name: 'blabla'
        });
    }
};

module.exports = controller;