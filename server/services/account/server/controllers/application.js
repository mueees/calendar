var validator = require('validator'),
    async = require('async'),
    HttpError = require('common/errors/HttpError'),
    configuration = require("configuration"),
    accountConfig = require("../config"),
    User = require('common/resources/user');

var controller = {
    getById: function (request, response, next) {
        response.send({
            name: 'getById'
        });
    },

    getAll: function (request, response, next) {
        response.send([
            {
                _id: '123',
                name: 'test',
                publicKey: 'this is public',
                privateKey: 'this is private',
                date_create: new Date(),
                redirectUrl: 'http://google.com'
            },
            {
                _id: '321',
                name: 'tset',
                publicKey: 'this is public',
                privateKey: 'this is private',
                date_create: new Date(),
                redirectUrl: 'http://google.com'
            }
        ]);
    }
};

module.exports = controller;