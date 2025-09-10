const asyncHandler = require("express-async-handler");
const db = require("../db/querys.js");
const upload = require("../utils/multer.js");



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
                    notifications: {
                        where: {
                            active: true,
                            chatRoom: {
                                name: null
                            }
                        }
                    },
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
                globalChat: globalChat,
                notifications: userData.notifications
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to fetch user data"}]}
        );
    }
});



const userImageUpload = asyncHandler(async function(req, res) {
    console.log(res.file);

    return res.end();
});



const userProfileDataGet = asyncHandler(async function(req, res) {
    const userId = req.user.id;

    let user = null;
    try {
        user = await db.findUniqueUser({
            where: {
                id: userId
            },
            select: {
                id: true,
                username: true,
                profileImgUrl: true
            }
        });
    } catch (error) {
        return res.status(500).json(
            {errors: [{msg: "Unable to get user data"}]}
        );
    }
    if (!user) {
        return res.status(400).json(
            {errors: [{msg: "Unable to get user data"}]}
        );
    }

    return res.json({user});
});



module.exports = {
    userDataGet,
    userImageUpload: [
        upload.single("image"),
        userImageUpload
    ],
    userProfileDataGet
};