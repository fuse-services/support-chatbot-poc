const vision = require('@google-cloud/vision');
const axios = require('axios');
const fs = require('fs');

const getTextfromImage = async (imagePath) => {
    let imageText = "";

    try {
        const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_API_KEY}`;
       
        // Read the image file as a buffer
        const imageBuffer = fs.readFileSync(imagePath);

        const requestData = {
            requests: [
              {
                image: {
                  content: imageBuffer.toString('base64'), // Convert buffer to base64
                },
                features: [
                  {
                    type: 'TEXT_DETECTION',
                    maxResults: 1,
                  },
                ],
              },
            ],
        };
               
        const response = await axios.post(apiUrl, requestData);
        console.log(response.data.responses[0].textAnnotations);
        
        const textAnnotations = response.data.responses[0].textAnnotations;
        for(let i=1; i< textAnnotations.length; i++) {
            console.log(textAnnotations[i].description);
            imageText += " " + textAnnotations[i].description;
        };
        console.log(imageText);

        return imageText;
    } catch(err) {
        console.log(err);
        return imageText;
    }
}
module.exports = { getTextfromImage }