const { Configuration, OpenAIApi } = require('openai');
const { readFileSync, writeFileSync } = require('fs');
const { storeEmbeddings } = require('../services/pinecone-embeddings.service');
const xmlbuilder = require('xmlbuilder');


const makeOpenAiApiCall = async (chatCompletionOption) => {
    console.log(process.env.OPEN_AI_API_KEY);
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
        const { contentToken, model } = req.body;
        const response = await makeOpenAiApiCall({ messages: contentToken, model });
        console.log(response);
        return res.send({ response: response.data.choices[0].message.content });
    } catch (ex) {
        console.log("ex", ex)
        return {
            status: 500,
            message: ex.message
        }
    }
}

const submitIssue = async (req, res) => {
    try {
        await generateXmlFile(req.body, req.files);
        // search pinecone
        res.send("support ticket is created!");

    } catch (ex) { console.log(ex); res.status(500).send('internal server error') }
}

const generateXmlFile = async (issueInfo, files) => {

    const formattedDateTime = getCurrentDateInCustomFormat();
    const infoPathSolutionInstruction = `<?mso-infoPathSolution solutionVersion="1.0.0.1" productVersion="16.0.0.0" PIVersion="1.0.0.0" name="urn:schemas-microsoft-com:office:infopath:Form:-myXSD-${formattedDateTime}" ?>`;
    const applicationInstruction = '<?mso-application progid="InfoPath.Document" versionProgid="InfoPath.Document.4"?>';
    const xmlDeclaration = `<?xml version="1.0" encoding="UTF-8"?>\n${infoPathSolutionInstruction}\n${applicationInstruction}\n`;

    let xmlData = xmlbuilder.create('my:mySupportTicket', {
        headless: true,
    }).att("xmlns:my", `http://schemas.microsoft.com/office/infopath/2003/myXSD/${formattedDateTime}`);

    xmlData = xmlData.ele('my:issueDetail', issueInfo.issueDetail).up()
        .ele('my:reproSteps', issueInfo.reproSteps).up()
        .ele('my:actualResult', issueInfo.actualResult).up()
        .ele('my:expectedResult', issueInfo.expectedResult).up();

    if (files.imageFiles.length > 0) {
        let xmlScreenshots = xmlData.ele('my:screenshots');
            
        files.imageFiles.forEach((file) => {
            let base64 = "";
            if (file) {
                base64 = readFileSync(file.path, { encoding: 'base64' });
            }
            let xmlScreenshot = xmlScreenshots.ele('my:screenshot', base64);
            let xmlImage = xmlScreenshot.ele('my:image');
            xmlImage.att('xsi:nil', 'true');
            xmlImage.att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
        });
    }

    if(files.xsnFile.length > 0) {
        const file = files.xsnFile[0];
        let base64 = "";
        if (file) {
            base64 = readFileSync(file.path, { encoding: 'base64' });
        }
        let xmlXsnFile = xmlData.ele('my:xsn', base64);
        xmlXsnFile.att('xsi:nil', 'true');
        xmlXsnFile.att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
    }

    const xmlDocument = xmlDeclaration + xmlData.end({ pretty: true, indent: '  ' });

    await writeFileSync(`xml/myXSD-${formattedDateTime}.xml`, xmlDocument);
    return;
}

const getCurrentDateInCustomFormat = () => {
    const now = new Date();
  
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    const formattedDate = `${year}-${month}-${day}T${hours}-${minutes}-${seconds}`;
    return formattedDate;
}
  

module.exports = { generateSupportChatbotResponse, submitIssue };