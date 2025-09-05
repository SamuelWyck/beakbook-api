const asyncHandler = require("express-async-handler");
const db = require("../db/querys.js");



const getChatUsers = asyncHandler(async function(req, res) {
    if (!req.params || !req.params.chatId) {
        return res.status(400).json(
            {errors: [{msg: "Missing chatroom id"}]}
        );
    }

    const userId = req.user.id;
    const chatId = req.params.chatId;

    let users = null;
    try {
        users = await db.findUsers({
            where: {
                chatRooms: {
                    some: {
                        id: chatId
                    },
                    some: {
                        users: {
                            some: {
                                id: userId
                            }
                        }
                    }
                }
            },
            select: {
                id: true,
                profileImgUrl: true,
                username: true
            },
            orderBy: {
                username: "desc"
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to find users"}]}
        );
    }
    if (!users) {
        return res.status(400).json(
            {errors: [{msg: "Unable to find users"}]}
        );
    }
    return res.json({chatUsers: users});
});



module.exports = {
    getChatUsers
};