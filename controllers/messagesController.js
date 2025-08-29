const asyncHandler = require("express-async-handler");
const {validationResult} = require("express-validator");
const {messageVal} = require("../utils/validators.js");
const db = require("../db/querys.js");



const chatMessagesGet = asyncHandler(async function(req, res) {
    if (!req.params.roomId) {
        return res.status(400).json(
            {errors: [{msg: "Missing room id"}]}
        );
    }

    const roomId = req.params.roomId;
    const userId = req.user.id;

    let messages = null;
    try {
        const chatRoom = await db.findChatRoom({
            where: {
                id: roomId,
                users: {
                    some: {
                        id: userId
                    }
                }
            },
            include: {
                messages: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                profileImgUrl: true
                            }
                        }
                    }
                }
            }
        });
        messages = chatRoom.messages;
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to fetch messages"}]}
        );
    }

    return res.json({messages});
});


const editMessagePost = asyncHandler(async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(
            {errors: errors.array()}
        );
    }

    const userId = req.user.id;
    const newText = req.body.message;
    const messageId = req.params.messageId;

    let editedMessage = null;
    try {
        editedMessage = await db.editMessage({
            where: {
                authorId: userId,
                id: messageId
            },
            data: {
                text: newText
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to edit message"}]}
        );
    }
    if (!editedMessage) {
        return res.status(400).json(
            {errors: [{msg: "Unable to edit message"}]}
        );
    }

    return res.json({result: "success"});
});


const deleteMessageDelete = asyncHandler(async function(req, res) {
    if (!req.params.messageId) {
        return res.status(400).json(
            {errors: [{msg: "Missing message id param"}]}
        );
    }
    const messageId = req.params.messageId;
    const userId = req.user.id;

    let deletedMessage = null;
    try {
        deletedMessage = await db.deleteMessage({
            where: {
                id: messageId,
                authorId: userId
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to delete message"}]}
        );
    }
    if (!deletedMessage) {
        return res.status(400).json(
            {errors: [{msg: "Unable to delete message"}]}
        );
    }

    return res.json({result: "success"});
});



module.exports = {
    chatMessagesGet,
    editMessagePost: [
        messageVal,
        editMessagePost
    ],
    deleteMessageDelete
};