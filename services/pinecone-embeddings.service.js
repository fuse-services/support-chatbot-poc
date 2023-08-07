const { OpenAIApi, Configuration } = require('openai');
const { PineconeClient } = require("@pinecone-database/pinecone");
const { v4: uuidv4 } = require('uuid');

const pinecone = new PineconeClient();
const pineconeIndexName = process.env.PINECONE_INDEX;
const pinceconeNamespace = "test-namespace";

pinecone.init({
    apiKey: process.env.PINECONE_APIKEY,
    environment: process.env.PINECONE_ENVIRONMENT || 'us-west4-gcp-free',
    projectName: 'survey-gpt'
});

async function getEmbeddings(data) {
    const configuration = new Configuration({
        apiKey: process.env.OPEN_AI_API_KEY
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createEmbedding({
        input: data,
        model: 'text-embedding-ada-002',
    });
    return response.data.data.map((el) => el.embedding);
}

const createPineconeIndex = async () => {
    console.log('creating pinecone index');
    await pinecone.createIndex({
        createRequest: {
            name: process.env.PINECONE_INDEX,
            dimension: 1536,
            metadataConfig: {
                indexed: ["issue-detail","repro-steps", "actual-result", "expected-result"],
            },
        },
    });
    return;
}

const removePineconeIndex = async () => {
    console.log('removing pinecone index');
    const response = await pinecone.deleteIndex({
        indexName: pineconeIndexName,
    });
    return response;
}

const updateEmbeddingById = async (embeddingData) => {
    const {company, question, answer, id} = embeddingData[0];
    // update vector in pinecone
    const vectorData = await getVectorByIds([id]);
    // console.log(vectorData);
    if(!vectorData.vectors[id]) {
        return ({error: 'vector not found'})
    }
    // console.log('-------------------------')
    const embeddings = await getEmbeddings([question]);
    const index = pinecone.Index(pineconeIndexName);
    const updateRequest = {
      id,
      values: embeddings,
      setMetadata: { 
        company: company,
        question: question,
        answer: answer
       },
      namespace: pinceconeNamespace,
    };
    // console.log(updateRequest);
    const updateResponse = await index.update({ updateRequest });
    return updateResponse;
}

const storeEmbeddings = async (embeddingData) => {
    try {
        console.log('storing embeddings');
        const embeddings = await getEmbeddings(embeddingData.xmlData);
        const upsertData = embeddings.map((el) => ({
            id: `support_ticket_${uuidv4().toLocaleUpperCase()}`,
            values: el,
            metadata: {
                "issue-detail": embeddingData.issueDetail,
                "repro-steps": embeddingData.reproSteps,
                "actual-result": embeddingData.actualResult,
                "expected-result": embeddingData.expectedResult,
            }
        }));
        console.log(upsertData)
        
        const upsertRequest = {
            vectors: upsertData,
            namespace: pinceconeNamespace
        }

        const pineconeInsert = await pinecone.Index(pineconeIndexName);
        const upsertResponse = await pineconeInsert.upsert({
            upsertRequest
        });

        return upsertResponse;
    } catch(err) {
        console.log(err.message);
        return err.message;
    }
}   

const searchPineconeEmbeddings = async (data, threshold) => {
    console.log('searching pinecone');
    const {type,text} = data;
    const embeddings = await getEmbeddings(text);
    // console.log(embeddings)
    // return ;
    const index = pinecone.Index(pineconeIndexName);
    const queryRequest = {
        vector: embeddings,
        filter: {
            type
        },
        topK: 5,
        includeValues: true,
        includeMetadata: true,
        namespace: pinceconeNamespace,
    };
    const queryResponse = await index.query({ queryRequest });
    console.dir(queryResponse);
    const similarQAs = queryResponse.matches
        .map((el) => ({id: el.id, score: el.score, text: el.metadata.text, type, company: el.metadata.company, ticketNo: el.metadata.ticket_no, resolution: el.resolution }))
        .filter(el => el.score >= threshold ) ;
    
    return similarQAs;
}


module.exports = {
    storeEmbeddings, createPineconeIndex, removePineconeIndex, updateEmbeddingById, searchPineconeEmbeddings
};
