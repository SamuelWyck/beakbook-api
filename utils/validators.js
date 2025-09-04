const {body, param} = require("express-validator");
const db = require("../db/querys.js");



async function isUniqueEmail(email) {
    const user = await db.findUniqueUser({
        where: {
            email: email
        }
    });
    if (user) {
        throw new Error("Email taken");
    }

    return true;
};


async function isUniqueUsername(username) {
    const user = await db.findUniqueUser({
        where: {
            username: username
        }
    });
    if (user) {
        throw new Error("Username taken");
    }

    return true;
};


function passwordsMatch(confirmPwd, {req}) {
    return confirmPwd === req.body.password;
};



const signupVal = [
    body("email").trim()
        .notEmpty().withMessage("Email required")
        .isEmail().withMessage("Invalid email")
        .custom(isUniqueEmail).withMessage("Email must be unique"),
    body("username").trim()
        .notEmpty().withMessage("Username required")
        .isLength({max: 100}).withMessage("Username must be less than 100 characters")
        .custom(isUniqueUsername).withMessage("Username taken")
        .matches(/^[^\s]*$/).withMessage("Username cannot contain spaces")
        .matches(/[^\d\s]/).withMessage("Username must contain at least one letter"),
    body("password")
        .notEmpty().withMessage("Password required")
        .isLength({min: 6}).withMessage("Password must be at least 6 characters"),
    body("confirm")
        .custom(passwordsMatch).withMessage("Passwords do not match")
];


const loginVal = [
    body("username").trim()
        .notEmpty().withMessage("Username required"),
    body("password")
        .notEmpty().withMessage("Password required")
];


const maxMsgLength = 10000;


const messageVal = [
    body("message").trim()
        .notEmpty().withMessage("Message must not be empty")
        .isLength({max: maxMsgLength}).withMessage("Text must be shorter than 10000 characters"),
    param("messageId").trim()
        .notEmpty().withMessage("Missing message id param")
];


const friendRequestVal = [
    body("receivingUserId").trim()
        .notEmpty().withMessage("Missing user id")
];


module.exports = {
    signupVal,
    loginVal,
    messageVal,
    friendRequestVal
};