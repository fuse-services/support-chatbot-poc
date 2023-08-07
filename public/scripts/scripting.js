const url = window.location.protocol + '//' + window.location.host;
let modifiedAnswer = 0;
const processFlow = `1. The issues/problems/features are gathered from user.
    2. The questions are used to gather information from user such as steps, actual result, expected result and so on.
    3. This information are send to chatgpt and also stored in our database.
    4. The support form is filled automatically based on the questions and a qdabra staff is assigned to the ticket.
    5. A new support ticekt and pdf is generated.
    6. Mail is sent to the user regarding the support ticket along with link to the support ticket and the pdf.
    7. The qdabra staff will follow up for more information.`

const userIntention = [""];

// const contextMessage =[
//     {"role": "system", "content": "You are the Qdabra support agent. You are assisting a client with an issue. To help you better understand the problem, please answer the following questions one by one. After each question, provide your response in the format:\n\n`Answer: Your answer here`\n\nIf you have any files or images related to the issue, you can attach them to the 6th and 7th questions."},
//     {"role": "system", "content": "What is the issue/problem?\nQuestion Type: Issue"},
//     {"role": "user", "content": ""},
//     {"role": "system", "content": "What are the steps that you encountered the issue?\nQuestion Type: description"},
//     {"role": "user", "content": ""},
//     {"role": "system", "content": "What is the actual result that you got?\nQuestion Type: actual_result"},
//     {"role": "user", "content": ""},
//     {"role": "system", "content": "What is your expected result?\nQuestion Type: expected_result"},
//     {"role": "user", "content": ""},
//     {"role": "system", "content": "If you have any issue related screenshots, please attach them here.\nQuestion Type: screenshot_attachment"},
//     {"role": "user", "content": ""},
//     {"role": "system", "content": "Additionally, if you have xsn file, please attach them here.\nQuestion Type: file_attachment"},
//     {"role": "user", "content": ""}
//   ]

// const questionContext =[{
//     "role": "system", "content": `You are a Qdabra Support Assistant, that assists the user in filling out the support ticket form.
//     Your task is to ask the below questions to the user one by one in less than 30 words, the user will answer the question and provide the response as in json object as below.
//     Here is the question format:
//     [{
//         "question": "What is the issue/problem?",
//         "question_type": "issue"
//     }, {
//         "question": "What are the steps that you encountered the issue?",
//         "question_type": "description"
//     }, {
//         "question": "What is the actual result that you got?",
//         "question_type": "actual_result"
//     }, {
//         "question": "What is your expected result?",
//         "question_type": "expected_result"
//     }, {
//         "question": "Would you like to attach screenshot?",
//         "question_type": "attach_screenshot"
//     }, {
//         "question": "Would you like to attach xsn file?",
//         "question_type": "attach_xsnfile"
//     },{
//         "question": "Would you like to submit the support ticket?",
//         "question_type": "submit_support"
//     },{
//         "question_detail": "Would you like to submit the support ticket?",
//         "question": "submit_support"
//     }]

//     Here is the response format:
//     {
//         question_type: "",
//         question: ""
//     }
//     The question_type is of type string, that is the question you have asked, the question that should be asked to the user.
//     Please keep in mind your response should be a single json object with above mentioned json format.

//     Once you have asked for issue, description/steps, actual result and expected result, you have to confirm with the user if they want to rectify the provided answer.
//     After all the questions are asked, you have to check the flow and answer any queries by the user.
//     Process flow: ${processFlow}
//     `
// }]

let questions = [{
        "question_id": 0,
        "question": "issue",
        "prompt": "You are a Qdabra Support Assistant. Your task is to greet customer and ask for the issue/problem the customer is facing and any assistance needed or not in less than 50 words."
    }, {
        "question_id": 1,
        "question": "description",
        "prompt": "You are a Qdabra Support Assistant. Your task is to ask for steps and detail that customer has taken that encountered the issue/problem in less than 40 words."
    }, {
        "question_id": 2,
        "question": "actual_result",
        "prompt": "You are a Qdabra Support Assistant. Your task is to ask for the actual result got by the customer in less than 40 words."
    }, {
        "question_id": 3,
        "question": "expected_result",
        "prompt": "You are a Qdabra Support Assistant. Your task is to ask for the expected result by the customer in less than 40 words."
    }, {
        "question_id": 4,
        "question": "confirm_answer",
        "prompt": `You are a Qdabra Support Assistant. Your task is to ask the user to verify if the user wants to rectify the above answers. If they want to rectify then ask the user to type "'Yes' to modify the answer" otherwise "'No' to skip" to continue as response in less than 30 word.`
    }, {
        "question_id": 5,
        "question": "answer_option",
        "prompt": `You are a Qdabra Support Assistant. Your task is to ask for which answer the user would like to modify the answer and show the option below as it is and ask the user to provide the response in same format in less than 40 words.
                Option:
                '<br/> 
                1 => "What is the issue/problem?" <br/>
                2 => "What are the steps that you encountered the issue?" <br/>
                3 => "What is the actual result that you got?" <br/>
                4 => "What is your expected result?" <br/> '
                Please display the option as it is and do not change or remove any tag or text from the option but exclude the '' from the option.`
    }, {
        "question_id": 6,
        "question": "rectify_answer",
        "prompt": "You are a Qdabra Support Assistant. Your task is to ask if the customer would like to attach screenshot, image in less than 30 words."
    }, {
        "question_id": 7,
        "question": "attach_screenshot",
        "prompt": "You are a Qdabra Support Assistant. Your task is to ask if the customer would like to attach screenshot, image in less than 30 words."
    }, {
        "question_id": 8,
        "question": "attach_xsnfile",
        "prompt": "You are a Qdabra Support Assistant. Your task is to ask if the customer would like to the infopath xsn file in less than 30 words."
    },{
        "question_id": 9,
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
        // questions[questionCounter].answer = message;
        const answerTxtbox = document.getElementById(`answer-txt${questionCounter + 1}`);
        if (answerTxtbox) {
            answerTxtbox.value = message;
        }

        if (questions[questionCounter].question == "confirm_answer" && message.toUpperCase() == "NO") {
            // skip the rectify answer part and continue with attach image
            // since we are incrementing the value of counter, thus setting the question counter to rectify answer.
            questionCounter = questions.filter(q => q.question == "rectify_answer")[0].question_id;
        } else if (questions[questionCounter].question == "answer_option") {
            if (/^\d+$/.test(message)) {
                //messageSplit = message.split("=>");
            
                // setting the id of modified question
                modifiedAnswer = message;
                // modify the answer of the question based on the option.
                const answerTxtbox = document.getElementById(`answer-txt${message.trim()}`);
                if (answerTxtbox) {
                    // answerTxtbox.value = messageSplit[1].trim();
                    answerTxtbox.style.borderColor = "red";
                    document.getElementById("message-input").value = answerTxtbox.value;
                }
                
                // confirm again with user if they want to rectify another answer.
                // since we are incrementing the value of counter, thus setting the question to expected result.
                questionCounter = questions.filter(q => q.question == "rectify_answer")[0].question_id;
                return [];
            } else {
                contentToken.push({
                    "role": "system",
                    "content": `You are a Qdabra Support Assistant. Your task is ask the user to select between the option 1,2,3 or 4.
                        User Reply: ${message}`
                });

                return contentToken;
            }
            
        } else if (questions[questionCounter].question == "rectify_answer") {
        
            // modify the answer of the question based on the option.
            const answerTxtbox = document.getElementById(`answer-txt${modifiedAnswer}`);
            if (answerTxtbox) {
                answerTxtbox.value = message;
                answerTxtbox.style.borderColor = "black";
            }
            
            // confirm again with user if they want to rectify another answer.
            // since we are incrementing the value of counter, thus setting the question to expected result.
            questionCounter = questions.filter(q => q.question == "expected_result")[0].question_id;            
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