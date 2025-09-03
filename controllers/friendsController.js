const asyncHandler = require("express-async-handler");
const db = require("../db/querys.js");



const friendRequestPost = asyncHandler(async function(req, res) {
    const receivingUsername = req.body.username;
    const requestingUserId = req.user.id;
    if (!receivingUsername || receivingUsername === "") {
        return res.status(400).json(
            {errors: [{msg: "Username required"}]}
        );
    }

    let receivingUser = null;
    try {
        receivingUser = await db.findUniqueUser({
            where: {
                username: receivingUsername
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
            {error: [{msg: "User not found"}]}
        );
    }

    let friendRequest = null;
    try {
        friendRequest = await db.createFriendRequest({
            data: {
                requestingUserId: requestingUserId,
                receivingUserId: receivingUser.id
            },
            include: {
                requestingUser: {
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



module.exports = {
    friendRequestPost
};