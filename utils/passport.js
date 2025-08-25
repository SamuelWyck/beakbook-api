const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const db = require("../db/querys.js");



passport.use(new LocalStrategy(async function(username, password, done) {
    const errorMsg = "Incorrect username or password";

    try {
        const user = await db.findUniqueUser({
            where: {
                username: username
            }
        });
    
        if (!user) {
            return done(null, false, {message: errorMsg});
        }
    
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return done(null, false, {message: errorMsg});
        }
    
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));


passport.deserializeUser(async function(userId, done) {
    try {
        const user = await db.findUniqueUser({
            where: {
                id: userId
            }
        });
        if (!user) {
            throw new Error("User not found");
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
});


passport.serializeUser(function(user, done) {
    return done(null, user.id);
});



module.exports = passport;