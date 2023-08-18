const { Configuration, OpenAIApi } = require('openai');
const { readFileSync, writeFileSync } = require('fs');
const { searchPineconeEmbeddings } = require('../services/pinecone-embeddings.service');
const xmlbuilder = require('xmlbuilder');
const { sendMail } = require('../services/mail.service');
const { supportEmailTemplate } = require('../template/support-template');
const { selectUniqueItems } = require('../helpers/helper');
const { getTextfromImage } = require('../services/google-api.service');
const { requestDBXL } = require('../helpers/dbxl');

const makeOpenAiApiCall = async (chatCompletionOption) => {
    console.log(process.env.OPEN_AI_API_KEY);
    const configuration = new Configuration({
        apiKey: process.env.OPEN_AI_API_KEY,
        organization_id: process.env.OPEN_AI_oRG_KEY,
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

const generateSupportSolution = async (req, res) => {
    try {
        const startTimer = new Date();
        const { issueDetail, reproSteps, expectedResult, actualResult, model } = req.body;
        const contentToken = [{
            "role": "system",
            "content": `You are a Qdabra Support Assistant. Your task is to understand the user's issue and provide a feasible solution for the issue detail, steps taken, error result and expected result by the user in less than 100 words with steps and instructions.
            Here is the issue information:
            Issue Detail : ${issueDetail}
            Steps: ${reproSteps}
            Error Result: ${actualResult}
            Expected Result: ${expectedResult}`
        }];

        const response = await makeOpenAiApiCall({ messages: contentToken, model });
        console.log(response);
        return res.send({ response: response.data.choices[0].message.content, requestTimer: `${((new Date()) - startTimer)}ms` });
    } catch (ex) {
        console.log("ex", ex)
        return {
            status: 500,
            message: ex.message
        }
    }
}

const searchSupportResolution = async (req, res) => {
    try {
        // TODO:: db call and get support ticket info
        const suportTicket = {id: 123};

        const xml = await generateXmlFile(req.body, req.files);

        const dbxlResponse = await requestDBXL(xml);

        const emailBody = supportEmailTemplate.replace("__Company_Name__", req.body.companyName)
                          .replace("__Name__", req.body.name)
                          .replace("__Product__", "")
                          .replace("__Issue_Summary__", req.body.issueDetail)
                          .replace("__Issue_Steps__", req.body.reproSteps)
                          .replace("__Actual_Result__", req.body.actualResult)
                          .replace("__Expected_Result__", req.body.expectedResult);

        // Email content
        const mailOptions = {
            from: 'Support@qdabra.com',
            to: req.body.email,
            subject: `Qdabra Support Ticket ${suportTicket.id} is created`,
            html: emailBody,
            headers: {
                'X-MAILED-BY': 'mailed by ujjwal',
                'X-SIGNED-BY': 'signed by ujjwal'
              }
        };

        sendMail(mailOptions);

        const embeddingData = [{
                type: 'issue-detail',
                text: req.body.issueDetail
            }, {
                type: 'steps',
                text: req.body.reproSteps
            },
            {
                type: 'expected-result',
                text: req.body.expectedResult
            }, {
                type: 'actual-result',
                text: req.body.actualResult
            }
        ];

        // const embeddings = await searchPineconeEmbeddings(embeddingData[0], req.body.threshold);
        // res.status(200).send({embeddings, xml});
        const promise = embeddingData.map(async itm => await searchPineconeEmbeddings(itm, req.body.threshold));
        
        const uniqueSolution = await Promise.all(promise)
            .then(resp => {
                const similarIssues = resp[0].map(itm => ({id: itm.id, score: itm.score, text: itm.text, type: "Issue Detail", company: itm.company, ticketNo: itm.ticketNo, resolution: itm.resolution }));
                const similarSteps = resp[1].map(itm => ({id: itm.id, score: itm.score, text: itm.text, type: "Steps", company: itm.company, ticketNo: itm.ticketNo, resolution: itm.resolution}));
                const similarExpectedResult = resp[2].map(itm => ({id: itm.id, score: itm.score, text: itm.text, type: "Expected Result", company: itm.company, ticketNo: itm.ticketNo, resolution: itm.resolution}));
                const similarActualResult = resp[3].map(itm => ({id: itm.id, score: itm.score, text: itm.text, type: "Actual Result", company: itm.company, ticketNo: itm.ticketNo, resolution: itm.resolution}));
                const solutions = similarIssues.concat(similarSteps).concat(similarExpectedResult).concat(similarActualResult);
                const uniqueSolution = selectUniqueItems(solutions);
                return uniqueSolution;
            })
            .catch(err => {
                console.log("err",err);
                res.status(500).send('internal server error');
            });

        const contentToken = [{
            "role": "system",
            "content": `You are a Qdabra Support Assistant. 
            Your task is to generate a friendly response with excitement or disappointment specifying the number of solutions to user in less than 20 words.
            Number of Solutions: ${uniqueSolution.length}`
        }];

        const response = await makeOpenAiApiCall({ messages: contentToken, model: 'gpt-4' });
        res.send({solutions: uniqueSolution, response: response.data.choices[0].message.content, xml});

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

    if (files.imageFiles && files.imageFiles.length > 0) {
        let xmlScreenshots = xmlData.ele('my:screenshots');
            
        // files.imageFiles.forEach(async (file) => {
        for (let i = 0; i < files.imageFiles.length; i++) {
            const file = files.imageFiles[i];
            let base64 = "";
            if (file) {
                const fileData = readFileSync(file.path);
                base64 = fileData.toString('base64');

                // writeFileData = Buffer.from(base64, 'base64');
                // const testFilePath='./test.png';
                // writeFileSync(testFilePath, writeFileData);
            }
            let xmlScreenshot = xmlScreenshots.ele('my:screenshot');
            let xmlImage = xmlScreenshot.ele('my:image', base64);
            xmlImage.att('xsi:nil', 'true');
            xmlImage.att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');

            let imageText = await getTextfromImage(file.path);
            xmlScreenshot.ele('my:imageText', imageText);
        };
    }

    if(files.xsnFile && files.xsnFile.length > 0) {
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
    return xmlDocument;
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
  

module.exports = { generateSupportChatbotResponse, searchSupportResolution, generateSupportSolution };