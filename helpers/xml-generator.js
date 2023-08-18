const { readFileSync, writeFileSync } = require('fs');
const xmlbuilder = require('xmlbuilder');
const { getTextfromImage } = require('../services/google-api.service');

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

    if(issueInfo.debugContext && issueInfo.debugContext != "") {
        const debugContext = JSON.parse(issueInfo.debugContext);
        let chats = xmlData.ele('my:Chats');
            
        // files.imageFiles.forEach(async (file) => {
        for (let i = 0; i < debugContext.length; i++) {
            const debugChat = debugContext[i];
            
            chats.ele('my:Chat')
                .ele('my:date', debugChat.datetime).up()
                .ele('my:url', debugChat.url).up()
                .ele('my:body', JSON.stringify(debugChat.payload)).up()
                .ele('my:response', JSON.stringify(debugChat.result)).up()
        };
    }
        
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

module.exports = { generateXmlFile }