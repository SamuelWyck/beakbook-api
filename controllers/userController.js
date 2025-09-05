const asyncHandler = require("express-async-handler");
const db = require("../db/querys.js");



const userDataGet = asyncHandler(async function(req, res) {
    try {
        const [globalChat, userData] = await Promise.all([
            db.findChatRoom({
                where: {
                    name: "Global chat"
                }
            }),
            db.findUniqueUser({
                where: {
                    id: req.user.id
                },
                include: {
                    chatRooms: {
                        where: {
                            name: null
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
                    },
                    friends: {
                        include: {
                            friend: {
                                select: {
                                    id: true,
                                    username: true,
                                    profileImgUrl: true
                                }
                            }
                        }
                    },
                    friendShips: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    profileImgUrl: true
                                }
                            }
                        }
                    },
                    friendRequests: {
                        include: {
                            requestingUser: {
                                select: {
                                    id: true,
                                    username: true,
                                    profileImgUrl: true
                                }
                            }
                        }
                    },
                    sentFriendRequests: {
                        include: {
                            receivingUser: {
                                select: {
                                    id: true,
                                    username: true,
                                    profileImgUrl: true
                                }
                            }
                        }
                    }
                }
            })
        ]);

        return res.json({
            userData: {
                user: req.user,
                chatRooms: userData.chatRooms,
                friends: userData.friends,
                friendShips: userData.friendShips,
                friendRequests: userData.friendRequests,
                sentRequests: userData.sentFriendRequests,
                globalChat: globalChat
            }
        });

    } catch {
        return res.status(500).json(
            {errors: [{msg: "Unable to fetch user data"}]}
        );
    }
});



module.exports = {
    userDataGet
};