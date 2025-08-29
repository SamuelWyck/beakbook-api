require("dotenv").config();
const express = require("express");
const expressWs = require("express-ws");
const expressSession = require("express-session");
const db = require("./db/querys.js");
const {PrismaSessionStore} = require("@quixo3/prisma-session-store");
const {PrismaClient} = require("./generated/prisma");
const passport = require("./utils/passport.js");
const {addUserToRes} = require("./utils/authMiddleware.js");
const cors = require("cors");
const authRoute = require("./routes/authRoute.js");
const userRoute = require("./routes/userRoute.js");
const messageRoute = require("./routes/messageRoute.js");



const app = express();
expressWs(app);


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
app.use("/messages", messageRoute);

app.ws("/ws/:roomId", function(ws, req) {
    ws.on("message", function(msg) {
        const maxMsgLength = 10000;
        msg = JSON.parse(msg);
        if (msg.message.trim() === "") {
            return;
        }
        if (msg.message.length > maxMsgLength) {
            return;
        }
        
        try {
            db.createMessage({
                data: {
                    authorId: req.user.id,
                    text: msg.message,
                    chatRoomId: req.params.roomId
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
            }).then(function(res) {
                ws.send(JSON.stringify(res));
            });
        } catch (error) {
            console.log(error);
        }
    });
});


const PORT = process.env.PORT;


app.listen(PORT, function() {
    console.log(`Server running on port ${PORT}!`);
});