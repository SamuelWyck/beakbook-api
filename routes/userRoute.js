const {Router} = require("express");
const userController = require("../controllers/userController.js");
const {isLoggedIn} = require("../utils/authMiddleware.js");



const userRoute = Router();


userRoute.get("/", isLoggedIn, userController.userDataGet);
userRoute.post("/upload-image", userController.userImageUpload);
userRoute.get("/profile", userController.userProfileDataGet);



module.exports = userRoute;