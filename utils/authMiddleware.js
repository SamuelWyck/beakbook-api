function isLoggedIn(req, res, next) {
    if (!req.user) {
        return res.status(403).json(
            {errors: [{msg: "Client not authenticated"}]}
        );
    }
    return next();
};


function isNotLoggedIn(req, res, next) {
    if (req.user) {
        return res.status(403).json(
            {errors: [{msg: "Client already authenticated"}]}
        );
    }
    return next();
};


function addUserToRes(req, res, next) {
    if (req.user) {
        res.user = req.user;
        delete req.user.password;
        delete req.user.email;
    }
    return next();
};



module.exports = {
    isLoggedIn,
    isNotLoggedIn,
    addUserToRes
};