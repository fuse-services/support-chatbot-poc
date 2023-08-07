const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const path = require('path');
const supportChatbotRouter = require('./controller/support-chatbot.controller');
const pineconeEmbeddingRouter = require('./controller/pinecone-embeddings.controller');
const { upload } = require('./helpers/multer');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, function() {
  console.log(`app listening on port ${PORT}!`);
});

app.post("/openai/chatbot", supportChatbotRouter.generateSupportChatbotResponse);
app.post("/openai/generate-solution", supportChatbotRouter.generateSupportSolution);
app.post('/submit-issue', upload.fields([{ name: 'imageFiles', maxCount: 5 }, { name: 'xsnFile', maxCount: 1 }]), supportChatbotRouter.searchSupportResolution);
app.get('/test', (req, res) => { res.send("ok") });

// app.get("/embeddings/pinecone", pineconeEmbeddingRouter.embeddingsOperations);
// app.post('/embeddings/pinecone', pineconeEmbeddingRouter.addSupportEmbedding);
// app.put('/embeddings/pinecone/:id', pineconeEmbeddingRouter.updateSupportEmbedding);
// app.delete('/embeddings/pinecone/:id', pineconeEmbeddingRouter.deleteSupportEmbeddingById);