const {Router} = require("express");
const chatController = require("../controllers/chatController.js");
const {isLoggedIn} = require("../utils/authMiddleware.js");



const chatRoute = Router();


chatRoute.use(isLoggedIn);

chatRoute.get("/users/:chatId", chatController.getChatUsers);
chatRoute.post("/new", chatController.createChatPost);



module.exports = chatRoute;