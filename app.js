const express = require("express");
require("dotenv").config();



const app = express();


app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.get("/", function(req, res) {
    return res.send("Hello world");
});


const PORT = process.env.PORT;


app.listen(PORT, function() {
    console.log(`Server running on port ${PORT}!`);
});