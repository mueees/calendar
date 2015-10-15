var RabbitRequest = require('common/request/rabbit'),
    Category = require('applications/rabbit/common/resources/category'),
    Q = require('q'),
    rabbitConfig = require('applications/rabbit/config');

var testCategory = {
        name: 'Test category'
    },
    userId = '559bfe2016bd17920826b366';

describe('account-api', function () {
    before(function (done) {
        // database connection
        require("common/mongooseConnect").initConnection(rabbitConfig).then(function () {
            done();
        });
    });

    afterEach(function (done) {
        Category.remove({}, done);
    });

    it('should create category', function (done) {
        RabbitRequest.createCategory(testCategory, userId).then(function (res) {
            if (res.body._id) {
                done();
            } else {
                done(new Error('Cannot create new category'));
            }
        }, function (err) {
            done(new Error(err.body.message));
        });
    });

    it('should delete category', function (done) {
        RabbitRequest.createCategory(testCategory, userId).then(function (res) {
            RabbitRequest.deleteCategory(res.body._id, userId).then(function (res) {
                done();
            }, function () {
                done(new Error(res.body.message));
            });
        }, function (err) {
            done(new Error(err.body.message));
        });
    });

    it('should return all categories', function (done) {
        Q.all([
            RabbitRequest.createCategory(testCategory, userId),
            RabbitRequest.createCategory(testCategory, userId)
        ]).then(function () {
            RabbitRequest.getCategories(userId).then(function (res) {
                if(res.body.length == 2){
                    done()
                }else{
                    done(new Error('Cannot get all categories'));
                }
            }, function (err) {
                done(new Error(err.body.message));
            });
        });
    });
});