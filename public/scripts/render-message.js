 
// Function to render user and chatbot messages
function renderMessage(sender, message) {
    // Remove typing indicator
    const chatlog = document.getElementById('chatlog');
    const messageElement = document.createElement('div');
    
    const imgTag = `<img src="./static/${sender == "User" ? "user" : "chatbot"}-icon.png" style="height:50px;width:50px"></img>`
    messageElement.innerHTML = ``;
    
    if (sender == "User") {
        messageElement.style = "display:flex;align-self:flex-end";
        fontStyle = "padding:0 5px;font-style:normal;";
        messageElement.innerHTML += `<div style="${fontStyle}">${message}</div><div style="text-align: left;" class="sender-icon">${imgTag}</div>`;
    } else {
        messageElement.style = "display:flex;align-self:flex-start";
        fontStyle = "padding:0 5px;font-style:italic;";
        messageElement.innerHTML += `<div style="text-align: left;" class="sender-icon">${imgTag}</div><div style="${fontStyle}">${message}</div>`;
    }

    chatlog.appendChild(messageElement);
}

// Function to render chatbot typing indicator
function renderTypingIndicator() {
    // const chatlog = document.getElementById('chatlog');
    // const typingIndicator = document.createElement('div');
    // typingIndicator.innerHTML = `<div id="chatbot-icon"></div>`;
    // chatlog.appendChild(typingIndicator);
}

function renderAttachScreenShotFileDiv() {
    // Dynamically add a new div
    var chatlog = document.getElementById('chatlog');
    const newDiv = document.createElement("div");
    newDiv.id = "image-upload-div";

    const spanElement = document.createElement("span");
    spanElement.classList.add("drop-message");
    spanElement.id = "screenshot-name-span";
    spanElement.innerHTML = "Drag and Drop or click to upload the screenshot images.";

    newDiv.appendChild(spanElement);
    chatlog.appendChild(newDiv);

    const fileUploadDiv = document.getElementById("image-upload-div");

    // Trigger file input click when the drop area is clicked
    fileUploadDiv.addEventListener("click", function () {
        document.getElementById("screenshot-input").click();
    });

    const screenshotInput = document.getElementById('screenshot-input');

    screenshotInput.addEventListener('change', (event) => {
        const selectedFiles = event.target.files;

        if (Array.from(selectedFiles).length > 0 && (questionCounter < questions.length && questions[questionCounter].question == "attach_screenshot")) {
            let contentToken = getQuestionContext("");
            if (contentToken.length > 0) {
                makeOpenAICall(contentToken);
            }            
        }
    });
}

function renderAttachXsnFileDiv() {
    // Dynamically add a new div
    var chatlog = document.getElementById('chatlog');
    const newDiv = document.createElement("div");
    newDiv.id = "file-upload-div";

    const spanElement = document.createElement("span");
    spanElement.classList.add("drop-message");
    spanElement.id = "xsn-file-span";
    spanElement.innerHTML = "Drag and Drop or click to upload the xsn file.";

    newDiv.appendChild(spanElement);
    chatlog.appendChild(newDiv);

    const fileUploadDiv = document.getElementById("file-upload-div");

    // Trigger file input click when the drop area is clicked
    fileUploadDiv.addEventListener("click", function () {
        document.getElementById("xsn-file-input").click();
    });

    const screenshotInput = document.getElementById('xsn-file-input');

    screenshotInput.addEventListener('change', (event) => {
        const selectedFile = event.target.files[0];

        if (selectedFile && (questionCounter < questions.length && questions[questionCounter].question == "attach_xsnfile")) {
            let contentToken = getQuestionContext("");
            if (contentToken.length > 0) {
                makeOpenAICall(contentToken);
            }
        }
    });
}

function renderSearchedSolution(response) {
    if (!response) {
        showLoader(false);
        return;
    }

    const searchedSolution = document.getElementById('SearchedSolution');
    searchedSolution.style.display = "block";

    const similarIssueDiv = document.getElementById('similar-issues');
    similarIssueDiv.innerHTML = "";

    const similarIssues = response.solutions.map((issue, idCounter) => {
        return `<div class="qa">
                    <span class="qa_score">${issue.score.toFixed(2)}</span>
                    <div class="qa_pair">
                        <p class="qa_answer" id="answer_${idCounter}">${issue.issue}</p>
                    </div>
                    </div>`

                    //<p class="qa_answer" id="answer_${idCounter}">${issue.resolution}</p>
    }).join("<br>");

    similarIssueDiv.innerHTML += `<h3>Found ${response.solutions.length} number of similar issues.</h3>${similarIssues}`;
    similarIssueDiv.style.display = "block";

    showLoader(false);
}

function renderGeneratedSolution(res, model) {
    model = model == "gpt-4" ? "GPT-4" : "GPT-3.5";

    const generatedSolution = document.getElementById('generated-solution');
    
    const spanResponseElement = document.createElement("span");
    spanResponseElement.classList.add("span-generated-solution");
    spanResponseElement.innerHTML = `<b>${model}</b> ${res.response} `;

    generatedSolution.appendChild(spanResponseElement);

    const spanTimerElement = document.createElement("span");
    spanTimerElement.classList.add("span-timer");
    spanTimerElement.innerHTML = `</br>${res.requestTimer}</br>`;

    generatedSolution.appendChild(spanTimerElement);
}