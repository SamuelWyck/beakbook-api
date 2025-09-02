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
            maxAge: 7 * 24 * 60 * 60 * 1000 //one week
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

io.on("connection", function(socket) {
    socket.on("join-room", function(room) {
        socket.join(room);
    });

    socket.on("leave-room", function(room) {
        socket.leave(room);
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
                    }
                }
            });
            io.in(roomId).emit("message", message);
        } catch (error) {
            console.log(error);
        }
    });
});


const PORT = process.env.PORT;


server.listen(PORT, function() {
    console.log(`Server running on port ${PORT}!`);
});