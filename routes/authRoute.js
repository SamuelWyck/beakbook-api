const {Router} = require("express");
const authController = require("../controllers/authController.js");
const {isLoggedIn, isNotLoggedIn} = require("../utils/authMiddleware.js");



const authRoute = Router();

authRoute.post("/signup", isNotLoggedIn, authController.signupPost);
authRoute.post("/login", isNotLoggedIn, authController.loginPost);
authRoute.post("/logout", isLoggedIn, authController.logoutPost);
authRoute.get("/status", authController.checkAuthStatusGet);



module.exports = authRoute;