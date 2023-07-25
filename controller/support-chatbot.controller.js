const { Configuration, OpenAIApi } = require('openai');

const makeOpenAiApiCall = async (chatCompletionOption) => {
    const configuration = new Configuration({
        apiKey: process.env.OPEN_AI_API_KEY
    });
    const openai = new OpenAIApi(configuration);

    console.log("[[chatCompletionOption]]", chatCompletionOption);
    const gptResponse = await openai.createChatCompletion(chatCompletionOption)
    return gptResponse;
    
}

const generateSupportChatbotResponse = async (req, res) => {
    try {
        const {contentToken, model} = req.body;
        const response = await makeOpenAiApiCall({ messages: contentToken, model});
        console.log(response); 
        return res.send({ response: response.data.choices[0].message.content});
    } catch (ex) {
        console.log("ex", ex)
        return {
            status: 500,
            message: ex.message
        }
    }
}

module.exports = { generateSupportChatbotResponse };