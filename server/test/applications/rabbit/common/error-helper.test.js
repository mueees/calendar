var errorHelper = require('applications/rabbit/common/error/helper'),
    expect = require('chai').expect;

describe('Rabbit error helper method', function () {
    it('should validate error', function () {
        expect(errorHelper.isValidError({})).to.be.not.ok;

        expect(errorHelper.isValidError({
            data: {}
        })).to.be.not.ok;

        expect(errorHelper.isValidError({
            errorCode: 1,
            data: {}
        })).to.be.not.ok;

        expect(errorHelper.isValidError({
            errorCode: 1,
            data: {
                feedId: 123
            }
        })).to.be.ok;

        expect(errorHelper.isValidError({
            errorCode: 666
        })).to.be.ok;
    });
});