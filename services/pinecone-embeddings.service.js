const { OpenAIApi, Configuration } = require('openai');
const { PineconeClient } = require("@pinecone-database/pinecone");
const { v4: uuidv4 } = require('uuid');

const pinecone = new PineconeClient();
const pineconeIndexName = process.env.PINECONE_INDEX;
const pinceconeNamespace = "pinecone-namespace";

pinecone.init({
    apiKey: process.env.PINECONE_APIKEY,
    environment: process.env.PINECONE_ENVIRONMENT || 'asia-southeast1-gcp-free',
    projectName: 'support-chatbot-demo'
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


module.exports = {
    storeEmbeddings, createPineconeIndex, removePineconeIndex, updateEmbeddingById
};
