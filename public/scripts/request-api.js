
// Attach event listener to form submission
var messageForm = document.getElementById('message-form');
messageForm.addEventListener('submit', sendMessage);

const submitIssue = document.getElementById('issue-detail');
submitIssue.addEventListener('submit', submitIssueForm);

const btnGenerateSolution = document.getElementById('btn-generate-solution');
btnGenerateSolution.addEventListener('click', generateSolution);

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
    const formData = new FormData();
    const files = document.getElementById('screenshot-input').files;
              
    for (const file of files) {
        formData.append('imageFiles', file);
    }

    const xsnFile = document.getElementById('xsn-file-input').files[0];
    if (xsnFile) {
        formData.append('xsnFile', xsnFile);
    }

    formData.append('issueDetail', document.getElementById('answer-txt1').value);
    formData.append('reproSteps', document.getElementById('answer-txt2').value);
    formData.append('actualResult', document.getElementById('answer-txt3').value);
    formData.append('expectedResult', document.getElementById('answer-txt4').value);
    formData.append('threshold', "0.8");
    const options = {
        method: 'POST',
        body: formData
    }
    try {
        fetch(`${url}/submit-issue`, options)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                renderSearchedSolution(data);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error occured while submitting the issue. Please try again later.');
                showLoader(false);
            });
    } catch (ex) {
        console.log(ex);
        alert('Error occured while submitting the issue. Please try again later.');
        showLoader(false);
    }

}

function generateSolution(e) {
    e.preventDefault();
    showLoader(true);
    const generatedSolution = document.getElementById('generated-solution');
    generatedSolution.innerHTML = "";

    const issueDetail = document.getElementById('answer-txt1').value;
    const reproSteps = document.getElementById('answer-txt2').value;
    const actualResult = document.getElementById('answer-txt3').value;
    const expectedResult = document.getElementById('answer-txt4').value;
   
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