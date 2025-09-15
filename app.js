require("dotenv").config();
const express = require("express");
const {Server} = require("socket.io");
const {createServer} = require("http");
const expressSession = require("express-session");
const db = require("./db/querys.js");
const {PrismaSessionStore} = require("@quixo3/prisma-session-store");
const {PrismaClient} = require("./generated/prisma");
const passport = require("./utils/passport.js");
const {addUserToRes} = require("./utils/authMiddleware.js");
const cors = require("cors");
const authRoute = require("./routes/authRoute.js");
const userRoute = require("./routes/userRoute.js");
const messagesRoute = require("./routes/messagesRoute.js");
const friendsRoute = require("./routes/friendsRoute.js");
const chatRoute = require("./routes/chatRoute.js");



const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: process.env.FRONT_END_DOMAIN
});


app.use(cors({
    origin: process.env.FRONT_END_DOMAIN,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(
    expressSession({
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000, //one week
            sameSite: "none"
        },
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        store: new PrismaSessionStore(
            new PrismaClient(),
            {
                checkPeriod: 2 * 60 * 1000, //two minutes
                dbRecordIdIsSessionId: true,
                dbRecordIdFunction: undefined
            }
        )
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(addUserToRes);


app.use("/user", userRoute);
app.use("/auth", authRoute);
app.use("/messages", messagesRoute);
app.use("/friends", friendsRoute);
app.use("/chat", chatRoute);

io.on("connection", function(socket) {
    const userId = socket.client.request._query.userId;
    if (!userId) {
        socket.disconnect();
    }
    socket.join(userId);


    socket.on("join-room", function(room) {
        socket.join(room);
    });

    socket.on("leave-room", function(room) {
        socket.leave(room);
    });

    socket.on("add-chat", function(chat, roomIds) {
        io.to(roomIds).emit("add-chat", chat);
    });

    socket.on("left-chat", function(chat, roomIds) {
        io.to(roomIds).emit("left-chat", chat);
    });

    socket.on("friend-request", function(request, room) {
        io.to(room).emit("friend-request", request);
    });

    socket.on("sent-request", function(request, room) {
        io.to(room).emit("sent-request", request);
    });

    socket.on("del-request", function(request, room) {
        io.to(room).emit("del-request", request);
    });

    socket.on("del-sent-request", function(request, room) {
        io.to(room).emit("del-sent-request", request);
    });

    socket.on("add-friend", function(friendInfo, room) {
        io.to(room).emit("add-friend", friendInfo);
    });

    socket.on("del-friend", function(relationId, userId, room) {
        io.to(room).emit("del-friend", relationId, userId);
    });

    socket.on("edit-msg", function(message) {
        io.to(message.chatRoomId).emit("edit-msg", message);
    });

    socket.on("delete-msg", function(msgInfo) {
        io.to(msgInfo.roomId).emit("delete-msg", msgInfo);
    });
    
    socket.on("message", async function(msg, roomId) {
        const maxMsgLength = 10000;
        if (!msg.userId || !msg.message || !roomId) {
            return;
        }
        const text = msg.message.trim();
        if (maxMsgLength < text.length || text === "") {
            return;
        }

        try {
            const message = await db.createMessage({
                data: {
                    text: text,
                    authorId: msg.userId,
                    chatRoomId: roomId
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            profileImgUrl: true
                        }
                    },
                    chatRoom: {
                        include: {
                            users: {
                                select: {
                                    id: true
                                }
                            }
                        }
                    }
                }
            });

            const chatRoom = message.chatRoom;
            delete message.chatRoom;
            io.to(roomId).emit("message", message);
            if (chatRoom.name === null) {
                const roomIds = [];
                for (let user of chatRoom.users) {
                    roomIds.push(user.id);
                }
                io.to(roomIds).emit("new-msg", chatRoom.id);
                await db.updateManyNotifications({
                    where: {
                        chatRoomId: roomId,
                        NOT: {
                            userId: {
                                in: Array.from(socket.rooms)
                            }
                        }
                    },
                    data: {
                        active: true
                    }
                });
            }
        } catch (error) {
            console.log(error);
        }
    });
});


app.use(function(req, res) {
    return res.status(404).json(
        {errors: [{msg: "Route not found"}]}
    );
});
app.use(function(error, req, res, next) {
    console.log(error);
    return res.status(500).json(
        {errors: [{msg: "Server error"}]}
    );
});


const PORT = process.env.PORT;


server.listen(PORT, function() {
    console.log(`Server running on port ${PORT}!`);
});