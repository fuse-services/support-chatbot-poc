
// Attach event listener to form submission
var messageForm = document.getElementById('message-form');
messageForm.addEventListener('submit', sendMessage);

const submitIssue = document.getElementById('issue-detail');
submitIssue.addEventListener('submit', submitIssueForm);

// const btnGenerateSolution = document.getElementById('btn-generate-solution');
// btnGenerateSolution.addEventListener('click', generateSolution);

function makeOpenAICall(contentToken) {
    // Show typing indicator
    renderTypingIndicator();
    
    // Send message to the chatbot API and render the response
    fetch(`${url}/openai/chatbot`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer fc8a16f44802352a2a3899f23f511f00'
        },
        // body: JSON.stringify({ message: message, contentToken: contentToken, model: 'gpt-4', formText: formText })
        body: JSON.stringify({ contentToken: contentToken, model: 'gpt-4' })
    }).then(response => response.json())
    .then(data => {
        renderDebugContextDiv("/openai/chatbot", contentToken[contentToken.length-1], data);
        if (userContentToken.length > 20) {
            userContentToken = userContentToken.slice(3);
        }

        userContentToken.push({ "role": "assistant", "content": data.response });
        renderMessage('Chatbot', data.response);

        if (questions[questionCounter] && questions[questionCounter].question == "attach_screenshot") {
            renderAttachScreenShotFileDiv();
        }

        if (questions[questionCounter] && questions[questionCounter].question == "attach_xsnfile") {
            renderAttachXsnFileDiv();
        }
    }).catch(error => {
        console.error('Error:', error);
        renderDebugContextDiv("/openai/chatbot", contentToken[contentToken.length-1], error);
    });
}


// Function to handle form submission
function sendMessage(event) {
     event.preventDefault();
     var messageInput = document.getElementById('message-input');
     var message = messageInput.value.trim();

     // Check if user has entered a message
     if (message === '') {
         return;
     }

     // Clear input field
     messageInput.value = '';

     // Display user's message in chat history
     renderMessage('User', message);

     userContentToken.push({
         "role": "user",
         "content": message
     });

     if (questionCounter < questions.length && questions[questionCounter].question == "submit_support") {
        if(message.toLowerCase() == "yes") {
            showLoader(true);
            document.getElementById('submit-issue').click();
            questionCounter++;
            // submitIssueForm();
            return;
        }
     }
    let contentToken = getQuestionContext(message);
    if (contentToken.length > 0) {
        userContentToken = userContentToken.concat(contentToken);
        //  questionContext.push({
        //     "role": "user",
        //     "content": message
        // });
    
        makeOpenAICall(userContentToken);
    }    
   
}


function submitIssueForm(e) {
    e.preventDefault();
    showLoader(true);
    const body = loadFormData();
    
    if (!body) {
        showLoader(false);
        return;
    }

    try {
        fetch(`${url}/submit-issue`, { method: 'POST', body: body })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                renderSolutionMessage(data.response, data.solutions);
                // renderSearchedSolution(data);
                renderDebugContextDiv("/submit-issue", body, data);
                showLoader(false);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error occured while submitting the issue. Please try again later.');
                renderDebugContextDiv("/submit-issue", body, error);
                showLoader(false);
            });
    } catch (ex) {
        console.log(ex);
        alert('Error occured while submitting the issue. Please try again later.');
        showLoader(false);
    }

}

function loadFormData() {
    try {
        const formData = new FormData();

        formData.append('companyName',  validateElementValue('txt-company-name'));
        formData.append('name', validateElementValue('txt-name'));
        formData.append('email', validateElementValue('txt-email'));
        formData.append('issueDetail', validateElementValue('answer-txt0'));
        formData.append('reproSteps', validateElementValue('answer-txt1'));
        formData.append('actualResult', validateElementValue('answer-txt2'));
        formData.append('expectedResult', validateElementValue('answer-txt3'));
        formData.append('threshold', "0.9");

        const files = document.getElementById('screenshot-input').files;
        for (const file of files) {
            formData.append('imageFiles', file);
        }

        const xsnFile = document.getElementById('xsn-file-input').files[0];
        if (xsnFile) {
            formData.append('xsnFile', xsnFile);
        }

        return formData;
    } catch (err) {
        console.log(err);
        return null;
    }
}

function validateElementValue(elementId) {
    const element = document.getElementById(elementId);
    
    if (element.value == "") {
        element.style.border = "3px solid red";
        element.focus();
        throw Error("required field violation!")
    } else {
        element.style.border = "1px solid black";
        return element.value;
    }
}


function generateSolution(e) {
    e.preventDefault();
    // showLoader(true);
    const generatedSolution = document.querySelector('.generated-solution');
    generatedSolution.innerHTML = "";

    const issueDetail = document.getElementById('answer-txt0').value;
    const reproSteps = document.getElementById('answer-txt1').value;
    const actualResult = document.getElementById('answer-txt2').value;
    const expectedResult = document.getElementById('answer-txt3').value;
   
    const promises = [
        makeSupportSolutionAPICall(issueDetail, reproSteps, actualResult, expectedResult, "gpt-4"),
        makeSupportSolutionAPICall(issueDetail, reproSteps, actualResult, expectedResult, "gpt-3.5-turbo-0613"),
    ];

    Promise.all(promises).then((data) => {
        showLoader(false);
    })
}

function makeSupportSolutionAPICall(issueDetail, reproSteps, actualResult, expectedResult, model) {
    const body = { issueDetail, reproSteps, actualResult, expectedResult, model };

    fetch(`${url}/openai/generate-solution`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer fc8a16f44802352a2a3899f23f511f00'
        },
        body: JSON.stringify(body)
    }).then(response => response.json())
    .then(data => {
        // return {response: data.response, requestTimer: data.requestTimer, model};
        renderGeneratedSolution(data, model);
        return
    }).catch(error => {
        console.error('Error:', error);
    });
}