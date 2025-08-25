require("dotenv").config();
const express = require("express");
const expressSession = require("express-session");
const {PrismaSessionStore} = require("@quixo3/prisma-session-store");
const {PrismaClient} = require("./generated/prisma");
const passport = require("./utils/passport.js");
const {addUserToRes} = require("./utils/authMiddleware.js");
const cors = require("cors");
const authRoute = require("./routes/authRoute.js");



const app = express();


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


app.get("/", function(req, res) {
    return res.json({user: res.user});
});
app.use("/auth", authRoute);


const PORT = process.env.PORT;


app.listen(PORT, function() {
    console.log(`Server running on port ${PORT}!`);
});