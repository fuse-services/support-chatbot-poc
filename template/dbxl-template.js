const dbxmlTemplate = `
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



module.exports = { dbxmlTemplate };