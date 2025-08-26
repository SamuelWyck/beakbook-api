const asyncHandler = require("express-async-handler");
const {validationResult} = require("express-validator");
const {signupVal, loginVal} = require("../utils/validators.js");
const passport = require("../utils/passport.js");
const db = require("../db/querys.js");
const bcrypt = require("bcryptjs");



const signupPost = asyncHandler(async function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const username = req.body.username.trim();
    const email = req.body.email.trim();
    const pwdHash = await bcrypt.hash(req.body.password, 10);

    try {
        await db.createUser({
            data: {
                username: username,
                email: email,
                password: pwdHash
            }
        });
    } catch {
        throw new Error("Unable to create user");
    }

    return next();
});


const loginPost = asyncHandler(async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(401).json(
            {errors: errors.array()}
        );
    }

    const authfunction = passport.authenticate("local", function(err, user, info) {
        if (err) {
            return res.status(500).json(
                {errors: [{msg: "Internal server error"}]}
            );
        }
        if (info) {
            return res.status(401).json({errors: [info]});
        }

        req.login(user, function(error) {
            if (error) {
                return res.status(500).json(
                    {errors: [{msg: "Internal server error"}]}
                );
            }
            
            delete user.password;
            delete user.email;
            return res.json({user});
        });
    });

    authfunction(req, res);
});


const logoutPost = asyncHandler(async function(req, res) {
    req.logout(function(error) {
        if (error) {
            return res.status(500).json(
                {errors: [{msg: "Internal server error"}]}
            );
        }
        return res.json({result: "success"});
    });
});



module.exports = {
    signupPost: [
        signupVal,
        signupPost,
        loginVal,
        loginPost
    ],
    loginPost: [
        loginVal,
        loginPost
    ],
    logoutPost
};