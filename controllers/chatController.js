const asyncHandler = require("express-async-handler");
const db = require("../db/querys.js");
const pageManger = require("../utils/pagination.js");



const getChatUsers = asyncHandler(async function(req, res) {
    if (!req.params || !req.params.chatId) {
        return res.status(400).json(
            {errors: [{msg: "Missing chatroom id"}]}
        );
    }

    const userId = req.user.id;
    const chatId = req.params.chatId;
    const pageNum = (req.query.pageNum) ? 
    req.query.pageNum : 0;
    let users = null;
    try {
        users = await db.findUsers({
            take: pageManger.userTakeNum,
            skip: pageManger.calcUserSkip(pageNum),
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

    let moreUsers = false;
    if (users.length === pageManger.userTakeNum) {
        moreUsers = true;
        users.pop();
    }
    return res.json({chatUsers: users, moreUsers});
});



module.exports = {
    getChatUsers
};