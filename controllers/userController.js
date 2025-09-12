const asyncHandler = require("express-async-handler");
const db = require("../db/querys.js");
const upload = require("../utils/multer.js");
const { validationResult } = require("express-validator");
const {changePasswordVal} = require("../utils/validators.js");
const bcrypt = require("bcryptjs");
const cloudinary = require("../utils/cloudinary.js");
const path = require("node:path");



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
    if (!req.file) {
        return res.status(400).json(
            {errors: [{msg: "Missing image file"}]}
        );
    }

    const userId = req.user.id;
    const filePath = path.resolve(req.file.path);

    let user = null;
    let imageInfo = null;
    try {
        [user, imageInfo] = await Promise.all([
            db.findUniqueUser({
                where: {
                    id: userId
                }
            }),
            cloudinary.uploadImage(filePath)
        ]);
    } catch (error) {
        return res.status(500).json(
            {errors: [{msg: "Unable to upload image"}]}
        );
    }
    if (imageInfo.errors) {
        return res.status(500).json({errors: imageInfo.errors});
    }


    if (user.profileImgAssetId !== null) {
        const result = await cloudinary.deleteImage(
            user.profileImgAssetId
        );
        if (result.errors) {
            return res.status(500).json(
                {errors: result.errors}
            );
        }
    }

    
    let updatedUser = null;
    try {
        updatedUser = await db.updateUser({
            where: {
                id: userId
            },
            data: {
                profileImgUrl: imageInfo.secure_url,
                profileImgAssetId: imageInfo.public_id
            },
            select: {
                id: true,
                profileImgUrl: true,
                username: true
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to save image"}]}
        );
    }
    if (!user) {
        return res.status(400).json(
            {errors: [{msg: "Unable to save image"}]}
        );
    }

    return res.json({user: updatedUser});
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



const changeUserPassword = asyncHandler(async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const userId = req.user.id;
    const newPwdHash = await bcrypt.hash(
        req.body.newPassword, 10
    );

    let user = null;
    try {
        user = await db.updateUser({
            where: {
                id: userId
            },
            data: {
                password: newPwdHash
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to update password"}]}
        );
    }
    if (!user) {
        return res.status(400).json(
            {errors: [{msg: "Unable to update password"}]}
        );
    }

    return res.json({result: "success"});
});



const userImageDelete = asyncHandler(async function(req, res) {
    const userId = req.user.id;

    let user = null;
    try {
        user = await db.findUniqueUser({
            where: {
                id: userId
            },
            select: {
                profileImgAssetId: true
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to find user"}]}
        );
    }
    if (!user || !user.profileImgAssetId) {
        return res.status(400).json(
            {errors: [{msg: "Unable to find user"}]}
        );
    }
    const result = await cloudinary.deleteImage(
        user.profileImgAssetId
    );
    if (result.errors) {
        return res.status(500).json({errors: result.errors});
    }

    let updatedUser = null;
    try {
        updatedUser = await db.updateUser({
            where: {
                id: userId
            },
            data: {
                profileImgUrl: null,
                profileImgAssetId: null
            },
            select: {
                id: true,
                profileImgUrl: true,
                username: true
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to update user"}]}
        );
    }

    return res.json({user: updatedUser});
});



module.exports = {
    userDataGet,
    userImageUpload: [
        upload.single("image"),
        userImageUpload
    ],
    userProfileDataGet,
    changeUserPassword: [
        changePasswordVal,
        changeUserPassword
    ],
    userImageDelete
};