const axios = require('axios');
const { dbxmlTemplate } = require('../template/dbxl-template');

// The SOAP action, endpoint, and body
const dbxlAction = 'http://qdabra.com/querydbxldocumentwithuserkey/SubmitDocument';
const dbxlUrl = 'https://www.formsboard.com/QdabraWebService/DbxlDocumentWithUserKeyService.asmx';
 
const requestDBXL = async (xml) => {
    try {
        xml = xml.replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('&', '&amp;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&apos;');

        const dbxlPayload = dbxmlTemplate.replace("__KEY_VALUE__", process.env.DBXL_USER_KEY)
            .replace("__BODY_XML__", xml)
            .replace("__DOCUMENT_TYPE__", "SupportStub")
            .replace("__NAME__", "Test")
            .replace("__AUTHOR__", "Hilary")
            .replace("__DESCTIPTION__", "test")
            .replace("__ALLOW_OVERWRITE__", "true");

        const config = {
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': dbxlAction,
            },
        }; 

        const response = await axios.post(dbxlUrl, dbxlPayload, config);
        console.log('Response:', response.data);

        return response;
    } catch (err) {
        console.log(err);
    }

}

module.exports = { requestDBXL }