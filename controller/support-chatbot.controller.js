const { Configuration, OpenAIApi } = require('openai');
const { readFileSync, writeFile } = require('fs');

const xmlbuilder = require('xmlbuilder');

const path = require('path');
const multer = require('multer');





// Set up multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });

const upload = multer({ storage });

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

const submitIssue = async (req, res) => {
    try {
            
        
        upload.single('xsnFile')(req, res, async (err) => {
            console.log(err);
            console.log('file',req.file)
            let base64 = "";
            if(req.file) {
                //get base64 value of file reading the file 
                base64 = readFileSync(req.file.path, {encoding: 'base64'});
                console.log(base64);
                // Create XML data using xmlbuilder
                
                }
            console.log(req.body)
            // const { issue} = req.body
            const xmlData = xmlbuilder
                  .create('support-ticket')
                  .ele('issue-detail', req.body.issueDetail).up()
                  .ele('repro-steps', req.body.reproSteps).up()
                  .ele('actual-result', req.body.actualResult).up()
                  .ele('expected-result', req.body.expectedResult).up()
                  .ele('xsn-file', { base64: base64 }).up()
                  .end({ pretty: true });
            
            writeFile('uploads/issue.xml', xmlData, (err) => {
               res.send('issue submit successfully and xml file created'); 
            });
        });

    } catch(ex) {console.log(ex); res.status(500).send('internal server error')}
}

module.exports = { generateSupportChatbotResponse, submitIssue };