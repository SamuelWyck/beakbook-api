const asyncHandler = require("express-async-handler");
const db = require("../db/querys.js");
const {validationResult} = require("express-validator");
const {friendRequestVal} = require("../utils/validators.js");



const friendRequestPost = asyncHandler(async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const userId = req.user.id;
    const receivingUserId = req.body.receivingUserId;

    let receivingUser = null;
    try {
        receivingUser = await db.findUniqueUser({
            where: {
                id: receivingUserId,
                friends: {
                    none: {
                        userId: userId
                    }
                },
                friendRequests: {
                    none: {
                        requestingUserId: userId
                    }
                },
                sentFriendRequests: {
                    none: {
                        requestingUserId: receivingUserId
                    }
                }
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to find user"}]}
        );
    }
    if (!receivingUser) {
        return res.status(400).json(
            {errors: [{msg: "Could not add friend"}]}
        );
    }

    let friendRequest = null;
    try {
        friendRequest = await db.createFriendRequest({
            data: {
                requestingUserId: userId,
                receivingUserId: receivingUserId
            },
            include: {
                requestingUser: {
                    select: {
                        username: true,
                        id: true,
                        profileImgUrl: true
                    }
                },
                receivingUser: {
                    select: {
                        username: true,
                        id: true,
                        profileImgUrl: true
                    }
                }
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to send request"}]}
        );
    }

    if (!friendRequest) {
        return res.status(400).json(
            {errors: [{msg: "Unable to send request"}]}
        );
    }

    return res.json({friendRequest});
});



const delFriendRequest = asyncHandler(async function(req, res) {
    if (!req.params || !req.params.requestId || req.params.requestId === "") {
        return res.status(400).json(
            {errors: [{msg: "Missing request id"}]}
        );
    }

    const requestId = req.params.requestId;
    const userId = req.user.id;

    let request = null;
    try {
        request = await db.deleteFriendRequest({
            where: {
                id: requestId,
                OR: [
                    {
                        requestingUserId: userId
                    },
                    {
                        receivingUserId: userId
                    }
                ]
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to delete request"}]}
        );
    }
    if (!request) {
        return res.status(400).json(
            {errors: [{msg: "Unable to find request"}]}
        );
    }

    return res.json({request});
});



module.exports = {
    friendRequestPost: [
        friendRequestVal,
        friendRequestPost
    ],
    delFriendRequest
};