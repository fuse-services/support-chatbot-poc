const axios = require('axios');
const { dbxmlTemplate } = require('../template/dbxl-template');

// The SOAP action, endpoint, and body
const soapAction = 'http://qdabra.com/querydbxldocumentwithuserkey/SubmitDocument';
const endpoint = 'https://www.formsboard.com/QdabraWebService/DbxlDocumentWithUserKeyService.asmx';

let soapBody = `
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <soap:Body>
        <SubmitDocument xmlns="http://qdabra.com/querydbxldocumentwithuserkey">
            <key>__KEY_VALUE__</key>
            <docTypeName>__DOCUMENT_TYPE__</docTypeName>
            <xml>__BODY_XML__</xml>
            <name>__NAME__</name>
            <author>__AUTHOR__</author>
            <description>__DESCTIPTION__</description>
            <allowOverwrite>__ALLOW_OVERWRITE__</allowOverwrite>
        </SubmitDocument>
    </soap:Body>
</soap:Envelope>`;
//<xml>&lt;test&gt;&lt;name&gt;test&lt;/name&gt;&lt;/test&gt;</xml>

 
const requestDBXL = async (xml) => {
    xml = xml.replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('&', '&amp;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');

    soapBody = soapBody.replace("__KEY_VALUE__", 'eyJhbGciOiJIUzEiLCJ0eXAiOiJKV1QifQ.eyJpZCI6InV1aWRfNjgyNDYzNGYtMGFlMC00NTYyLWE3N2UtMDY0ODk1ZmNhNTM0IiwidXNlcm5hbWUiOiJzdXBwb3J0Zm9ybSIsImNyZWF0ZWQiOiIyMDIzLTA4LTEwVDIyOjIwOjIyIiwiZXhwaXJlcyI6IjIwMjQtMDgtMDlUMjI6MjA6MjIifQ.9sJmHU41OF_W5MGLJIuwo_1K9SA')
            .replace("__BODY_XML__", xml)
            .replace("__DOCUMENT_TYPE__", "SupportStub")
            .replace("__NAME__", "Test")
            .replace("__AUTHOR__", "Hilary")
            .replace("__DESCTIPTION__", "test")
            .replace("__ALLOW_OVERWRITE__", "true");

    axios.post(endpoint, soapBody, {
        headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': soapAction,
        },
    }).then((response) => {
        console.log('Response:', response.data);
    }).catch((error) => {
        console.error('Error:', error);
    });
}

module.exports = { requestDBXL }