const {Router} = require("express");
const friendsController = require("../controllers/friendsController.js");
const {isLoggedIn} = require("../utils/authMiddleware.js");



const friendsRoute = Router();

friendsRoute.use(isLoggedIn);

friendsRoute.post("/request", friendsController.friendRequestPost);



module.exports = friendsRoute;