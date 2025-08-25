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



module.exports = {
    findUniqueUser,
    createUser
};