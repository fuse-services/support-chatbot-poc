const url = window.location.protocol + '//' + window.location.host;

const processFlow = `1. The issues/problems/features are gathered from user.
    2. The questions are used to gather information from user such as steps, actual result, expected result and so on.
    3. This information are send to chatgpt and also stored in our database.
    4. The support form is filled automatically based on the questions and a qdabra staff is assigned to the ticket.
    5. A new support ticekt and pdf is generated.
    6. Mail is sent to the user regarding the support ticket along with link to the support ticket and the pdf.
    7. The qdabra staff will follow up for more information.`

const userIntention = [""];

let questions = [{
        "question_detail": "What is the issue/problem?",
        "answer": "",
        "question": "issue",
        "prompt": "You are a Qdabra Support Assistant. Your task is to greet customer and ask for the issue/problem the customer is facing and any assistance needed or not in less than 50 words."
    }, {
        "question_detail": "What are the steps that you encountered the issue?",
        "answer": "",
        "question": "description",
        "prompt": "You are a Qdabra Support Assistant. Your task is to ask for steps and detail that customer has taken that encountered the issue/problem in less than 40 words."
    }, {
        "question_detail": "What is the actual result that you got?",
        "answer": "",
        "question": "actual_result",
        "prompt": "You are a Qdabra Support Assistant. Your task is to ask for the actual result got by the customer in less than 40 words."
    }, {
        "question_detail": "What is your expected result?",
        "answer": "",
        "question": "expected_result",
        "prompt": "You are a Qdabra Support Assistant. Your task is to ask for the expected result by the customer in less than 40 words."
    }, {
        "question_detail": "Would you like to attach screenshot?",
        "answer": "",
        "question": "attach_screenshot",
        "prompt": "You are a Qdabra Support Assistant. Your task is to ask if the customer would like to attach screenshot, image in less than 30 words."
    }, {
        "question_detail": "Would you like to attach xsn file?",
        "answer": "",
        "question": "attach_xsnfile",
        "prompt": "You are a Qdabra Support Assistant. Your task is to ask if the customer would like to the infopath xsn file in less than 30 words."
    },{
        "question_detail": "Would you like to submit the support ticket?",
        "answer": "",
        "question": "submit_support",
        "prompt": `You are a Qdabra Support Assistant. You have asked for user's issue, repro steps, actual result and expected result, and also have attached screenshots and xsn file.
            Your task is to ask if the customer to verify if the provided information/images/files are ok and if ok then type "yes" to submit the support in less than 40 words.`
    },
];

let questionCounter = 0;

let userContentToken = [];

function getQuestionContext(message) {
    let contentToken = [];
    console.log(questionCounter);

    if (questionCounter < questions.length) {
        questions[questionCounter].answer = message;
        const answerTxtbox = document.getElementById(`answer-txt${questionCounter + 1}`);
        if (answerTxtbox) {
            answerTxtbox.value = message;
        }
    }

    questionCounter++;

    if (questionCounter < questions.length) {
        const customerMessage = message || message != "" ? `Customer message: ${message}` : "FYI, customer has attached screenshots of the issue/feature.";
        console.log('inside if');
        contentToken.push({
            "role": "system",
            "content": `${questions[questionCounter].prompt}
                ${customerMessage}`
        });
    } else if (questionCounter == questions.length) {
        console.log('inside else if');
        contentToken = [{
            "role": "system",
            "content": `You are a Qdabra Support Assistant. Your task is to thanks user for contacting, inform Qdabra team will reach out to the customer and ask if there is any other assistance that they need.`
        }];
        // questionCounter = 0;
    } else {
        console.log('inside else');
        contentToken = [{
            "role": "system",
            "content": `You are a Qdabra Support Assistant. 
                Your task is to generate an appropriate response based on user's query in less than 50 words.
                Here is the flow for your reference:
                ${processFlow}

                Here is user message:
                ${message}
            `
        }];
        // questionCounter = 0;
    }
    return contentToken;
}