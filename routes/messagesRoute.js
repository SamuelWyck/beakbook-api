const {Router} = require("express");
const messagesController = require("../controllers/messagesController.js");
const {isLoggedIn} = require("../utils/authMiddleware.js");



const messagesRoute = Router();

messagesRoute.use(isLoggedIn);

messagesRoute.get("/:roomId", messagesController.chatMessagesGet);
messagesRoute.post("/edit/:messageId", messagesController.editMessagePost);
messagesRoute.delete("/delete/:messageId", messagesController.deleteMessageDelete);



module.exports = messagesRoute;