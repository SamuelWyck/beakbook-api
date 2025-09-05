const {Router} = require("express");
const chatController = require("../controllers/chatController.js");
const {isLoggedIn} = require("../utils/authMiddleware.js");



const chatRoute = Router();


chatRoute.use(isLoggedIn);

chatRoute.get("/users/:chatId", chatController.getChatUsers);



module.exports = chatRoute;