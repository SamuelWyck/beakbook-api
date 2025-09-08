const asyncHandler = require("express-async-handler");
const db = require("../db/querys.js");
const pageManger = require("../utils/pagination.js");
const {validationResult} = require("express-validator");
const {createChatVal} = require("../utils/validators.js");
const { connect } = require("../routes/messagesRoute.js");



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



const createChatPost = asyncHandler(async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const connectionArray = [];
    for (let id of req.body.ids) {
        connectionArray.push({
            id: id
        });
    }
    connectionArray.push({id: req.user.id});

    let chat = null;
    try {
        chat = await db.createChat({
            data: {
                users: {
                    connect: connectionArray
                }
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to create chat"}]}
        );
    }
    if (!chat) {
        return res.status(400).json(
            {errors: [{msg: "Unable to create chat"}]}
        );
    }

    return res.json({chat});
});



const leaveChatPut = asyncHandler(async function(req, res) {
    if (!req.body || !req.body.roomId) {
        return res.status(400).json(
            {errors: [{msg: "Missing room id"}]}
        );
    }

    const userId = req.user.id;
    const roomId = req.body.roomId;

    let chat = null;
    try {
        chat = await db.updateChat({
            where: {
                id: roomId
            },
            data: {
                users: {
                    disconnect: [{id: userId}]
                }
            },
            include: {
                users: true
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to leave chat"}]}
        );
    }
    if (!chat) {
        return res.status(400).json(
            {errors: [{msg: "Unable to leave chat"}]}
        );
    }

    if (chat.users.length === 0) {
        try {
            await db.deleteChat({
                where: {
                    id: roomId
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    return res.json({chat});
});



module.exports = {
    getChatUsers,
    createChatPost: [
        createChatVal,
        createChatPost
    ],
    leaveChatPut
};