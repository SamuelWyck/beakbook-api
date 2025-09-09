const {Router} = require("express");
const chatController = require("../controllers/chatController.js");
const {isLoggedIn} = require("../utils/authMiddleware.js");



const chatRoute = Router();


chatRoute.use(isLoggedIn);

chatRoute.get("/users/:chatId", chatController.getChatUsers);
chatRoute.post("/new", chatController.createChatPost);
chatRoute.put("/leave", chatController.leaveChatPut);
chatRoute.put("/join", chatController.joinChatPut);
chatRoute.post("/find", chatController.getOrCreateChat);



module.exports = chatRoute;