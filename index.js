const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');
const supportChatbotRouter = require('./controller/support-chatbot.controller');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, function () {
    console.log(`app listening on port ${PORT}!`);
});

app.post("/openai/chatbot", supportChatbotRouter.generateSupportChatbotResponse);

app.get('/test', (req, res) => { res.send("ok")});

app.get("/", function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
})
