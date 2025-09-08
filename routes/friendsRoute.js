const {Router} = require("express");
const friendsController = require("../controllers/friendsController.js");
const {isLoggedIn} = require("../utils/authMiddleware.js");



const friendsRoute = Router();

friendsRoute.use(isLoggedIn);

friendsRoute.post("/request", friendsController.friendRequestPost);
friendsRoute.delete("/request/delete/:requestId", friendsController.delFriendRequest);
friendsRoute.post("/add", friendsController.addFriendPost);
friendsRoute.delete("/delete/:relationId", friendsController.delFriend);
friendsRoute.get("/", friendsController.getFriends);



module.exports = friendsRoute;