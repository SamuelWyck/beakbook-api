const {Router} = require("express");
const userController = require("../controllers/userController.js");
const {isLoggedIn} = require("../utils/authMiddleware.js");



const userRoute = Router();

userRoute.use(isLoggedIn);

userRoute.get("/", userController.userDataGet);
userRoute.post("/upload-image", userController.userImageUpload);
userRoute.get("/profile", userController.userProfileDataGet);
userRoute.put("/change-password", userController.changeUserPassword);
userRoute.delete("/delete-image", userController.userImageDelete);



module.exports = userRoute;