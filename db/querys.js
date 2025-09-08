const {PrismaClient} = require("../generated/prisma");



const prisma = new PrismaClient();


async function findUniqueUser(options) {
    const user = await prisma.user.findUnique(options);
    return user;
};


async function createUser(options) {
    const user = await prisma.user.create(options);
    return user;
};


async function findChatRoom(options) {
    const chatRoom = await prisma.chatRoom.findFirst(options);
    return chatRoom;
};


async function createMessage(options) {
    const message = await prisma.message.create(options);
    return message;
};


async function findChatMessages(options) {
    const messages = await prisma.message.findMany(options);
    return messages;
};


async function editMessage(options) {
    const message = await prisma.message.update(options);
    return message;
};


async function deleteMessage(options) {
    const message = await prisma.message.delete(options);
    return message;
};


async function createFriendRequest(options) {
    const request = await prisma.friendRequest.create(options);
    return request;
};


async function deleteFriendRequest(options) {
    const request = await prisma.friendRequest.delete(options);
    return request;
}


async function createFriend(options) {
    const friend = await prisma.userFriend.create(options);
    return friend;
};


async function deleteFriend(options) {
    const relation = await prisma.userFriend.delete(options);
    return relation;
};


async function findUsers(options) {
    const users = await prisma.user.findMany(options);
    return users;
};


async function findFriends(options) {
    const friends = await prisma.userFriend.findMany(options);
    return friends;
};


async function createChat(options) {
    const chat = await prisma.chatRoom.create(options);
    return chat;
};



module.exports = {
    findUniqueUser,
    createUser,
    findChatRoom,
    createMessage,
    findChatMessages,
    editMessage,
    deleteMessage,
    createFriendRequest,
    deleteFriendRequest,
    createFriend,
    deleteFriend,
    findUsers,
    findFriends,
    createChat
};