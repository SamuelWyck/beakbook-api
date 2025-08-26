const {PrismaClient} = require("../generated/prisma");

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.argv[2]
        }
    }
});


async function main() {
    console.log("seeding...");
    await prisma.chatRoom.create({
        data: {
            name: "Global chat"
        }
    });
    console.log("done");
};


main();