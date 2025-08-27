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



module.exports = {
    findUniqueUser,
    createUser,
    findChatRoom,
    createMessage
};