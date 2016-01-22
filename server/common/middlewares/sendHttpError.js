module.exports = function (req, res, next) {
    res.sendHttpError = function (error) {
        res.status(error.status || 500);

        res.send({
            message: error.message
        });
    };

    next();
};