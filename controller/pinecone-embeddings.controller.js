const xmlbuilder = require('xmlbuilder');
const { storeEmbeddings, createPineconeIndex, removePineconeIndex, updateEmbeddingById } = require('../services/pinecone-embeddings.service');


const embeddingsOperations =  async(req, res, next) =>{
    try {
        if(req.query.action === 'create-index') {
            await createPineconeIndex();
            res.send('Index created successfully');
        } else if(req.query.action === 'remove-index') {
            console.log(typeof(removePineconeIndex));
            await removePineconeIndex();
            res.send('Index removed successfully');
        } else {
            res.status(400).send('action not permitted');
        }
    } catch(ex){
        console.log(ex);
        res.status(500).send('internal server error');
    }
};

const addSupportEmbedding = async (req, res) => {
    try {
        const {issueDetail, reproSteps, actualResult, expectedResult, base64File} = req.body;
        if(!issueDetail || !reproSteps || !actualResult || !expectedResult) {
            return res.status(400).send('required field missing');
        }

        const xmlData = xmlbuilder
            .create('support-ticket')
            .ele('issue-detail', issueDetail).up()
            .ele('repro-steps', reproSteps).up()
            .ele('actual-result', actualResult).up()
            .ele('expected-result', expectedResult).up()
            // .ele('xsn-file', { base64: base64 }).up()
            .end({ pretty: true });

                
        const embeddingData = {
            issueDetail, reproSteps, actualResult, expectedResult, xmlData
        }
        console.log(embeddingData);
        const embeddingResponse = await storeEmbeddings(embeddingData);
        console.log(embeddingResponse);
        res.status(200).send('embedding stored successfully');

    } catch(ex) {
        console.log(ex);
        res.status(500).send('internal server error');
    }
}

const updateSupportEmbedding = async (req, res) =>{
    try {
        const {question, answer, company, id} = req.body;
        if(!question || !answer || !company || !id) {
            return res.status(400).send('required field missing');
        }
        const embeddingData = {
            id,
            question,
            answer,
            company
        }
        console.log(embeddingData);
    
        const embeddingResponse = await updateEmbeddingById([embeddingData]);
        // console.log("embeddingResponse", embeddingResponse);
        if(embeddingResponse.error) {
            return res.status(400).send(embeddingResponse.error);
        }
        res.status(200).send('embedding updated successfully');

    } catch(ex) {
        if(ex.response?.data) {
            console.log(ex.response.data);
        } else {
            console.log(ex);
        }
        res.status(500).send('internal server error');
    }
}

const deleteSupportEmbeddingById = async(req, res) => {
    const id = req.param.id;
    const index = pinecone.Index(pineconeIndexName);
    const response = await index.delete1({
        ids : [id],
        namespace: pinceconeNamespace,
    });
    return response;
}

module.exports = {
    embeddingsOperations, addSupportEmbedding, updateSupportEmbedding, deleteSupportEmbeddingById
};