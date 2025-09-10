const asyncHandler = require("express-async-handler");
const db = require("../db/querys.js");
const pageManger = require("../utils/pagination.js");
const {validationResult} = require("express-validator");
const {createChatVal, addUserToChatVal} = require("../utils/validators.js");



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
        const [chat, chatUsers] = await Promise.all([
            db.findChatRoom({
                where: {
                    id: chatId,
                    users: {
                        some: {
                            id: userId
                        }
                    }
                }
            }),
            db.findUsers({
                take: pageManger.userTakeNum,
                skip: pageManger.calcUserSkip(pageNum),
                where: {
                    chatRooms: {
                        some: {
                            id: chatId
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
            })
        ]);
        if (!chat) {
            return res.status(401).json(
                {errors: [{msg: "Forbidden"}]}
            );
        }
        users = chatUsers;
        // users = await db.findUsers({
        //     take: pageManger.userTakeNum,
        //     skip: pageManger.calcUserSkip(pageNum),
        //     where: {
        //         chatRooms: {
        //             some: {
        //                 id: chatId
        //             }
        //         }
        //     },
        //     select: {
        //         id: true,
        //         profileImgUrl: true,
        //         username: true
        //     },
        //     orderBy: {
        //         username: "desc"
        //     }
        // });
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
            },
            include: {
                users: {
                    select: {
                        username: true,
                        id: true,
                        profileImgUrl: true
                    }
                }
            }
        });

        const notifyData = [];
        for (let user of connectionArray) {
            notifyData.push({
                userId: user.id,
                chatRoomId: chat.id
            });
        }
        await db.createManyNotifications({
            data: notifyData
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
    let notification = null;
    try {
        [chat, notification] = await Promise.all([
            db.updateChat({
                where: {
                    id: roomId
                },
                data: {
                    users: {
                        disconnect: [{id: userId}]
                    }
                },
                include: {
                    users: {
                        select: {
                            id: true,
                            username: true,
                            profileImgUrl: true
                        }
                    }
                }
            }),
            db.deleteNotification({
                where: {
                    userId_chatRoomId: {
                        userId: userId,
                        chatRoomId: roomId
                    }
                }
            })
        ]);
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to leave chat"}]}
        );
    }
    if (!chat || !notification) {
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



const joinChatPut = asyncHandler(async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const ids = req.body.ids;
    const roomId = req.body.roomId;
    const connectionIds = [];
    for (let id of ids) {
        connectionIds.push({id: id});
    }

    const notifyData = [];
    for (let user of connectionIds) {
        notifyData.push({
            chatRoomId: roomId,
            userId: user.id
        });
    };

    let chat = null;
    let notification = null;
    try {
        [chat, notification] = await Promise.all([
            db.updateChat({
                where: {
                    id: roomId
                },
                data: {
                    users: {
                        connect: connectionIds
                    }
                },
                include: {
                    users: {
                        select: {
                            id: true,
                            username: true,
                            profileImgUrl: true
                        }
                    }
                }
            }),
            db.createManyNotifications({
                data: notifyData
            })
        ]);
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to add users"}]}
        );
    }
    if (!chat || !notification) {
        return res.status(400).json(
            {errors: [{msg: "Unable to add users"}]}
        );
    }

    return res.json({chat});
});



const getOrCreateChat = asyncHandler(async function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const ids = [
        req.body.ids[0],
        req.user.id
    ];

    let chats = null;
    try {
        chats = await db.findManyChatRooms({
            where: {
                name: null,
                users: {
                    every: {
                        id: {
                            in: ids
                        }
                    }
                }
            },
            include: {
                _count: {
                    select: {
                        users: true
                    }
                },
                users: {
                    select: {
                        id: true,
                        username: true,
                        profileImgUrl: true
                    }
                }
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to find chat"}]}
        );
    }

    let chatRoom = null;
    for (let room of chats) {
        const userCount = room._count.users;
        if (userCount === ids.length) {
            delete room._count;
            chatRoom = room;
            break;
        }
    }
    if (!chatRoom) {
        return next();
    }

    return res.json({chat: chatRoom, found: true});
});



module.exports = {
    getChatUsers,
    createChatPost: [
        createChatVal,
        createChatPost
    ],
    leaveChatPut,
    joinChatPut: [
        addUserToChatVal,
        joinChatPut
    ],
    getOrCreateChat: [
        createChatVal,
        getOrCreateChat,
        createChatPost
    ]
};