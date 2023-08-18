 
// Function to render user and chatbot messages
function renderMessage(sender, message) {
    // Remove typing indicator
    const chatlog = document.getElementById('chatlog');
    const messageElement = document.createElement('div');
    
    const imgTag = `<img src="./static/${sender == "User" ? "user3" : "qdabra"}-icon.png" style="height:50px;width:45px"></img>`
    messageElement.innerHTML = ``;
    
    let fontStyle = "border: 2px solid #ccc;background-color: #f0f0f0;display:flex;padding: 5px 10px;";
    
    if (sender == "User") {
        messageElement.style = "display:flex;align-self:flex-end";
        fontStyle += "text-align: right;font-style:normal;border-radius: 10px 10px 0 10px;;margin-right:5px;";
        messageElement.innerHTML += `<div style="${fontStyle}">${message}</div><div style="text-align: left;" class="sender-icon">${imgTag}</div>`;
    } else {
        messageElement.style = "display:flex;align-self:flex-start;";
        fontStyle += "text-align: left;font-style:italic;border-radius: 10px 10px 10px 0;margin-left:5px;";
        messageElement.innerHTML += `<div style="text-align: left;" class="sender-icon">${imgTag}</div><div style="${fontStyle}">${message}</div>`;
    }

    chatlog.appendChild(messageElement);
    chatlog.scrollTop = chatlog.scrollHeight;
}

// Function to render user and chatbot messages
function renderSolutionMessage(message, solutions) {
    // Remove typing indicator
    const chatlog = document.getElementById('chatlog');
    const messageElement = document.createElement('div');
    messageElement.innerHTML = ``;
    messageElement.style = "display:flex;align-self:flex-start;";

    const imgTag = `<img src="./static/qdabra-icon.png" style="height:50px;width:45px"></img>`
    
    const solutionMessage = solutions.map((issue, index) => {
        return `<div class="qa">
                    <span class="qa_score">${issue.score.toFixed(2)}</span>
                    <div class="qa_pair">
                        <span class="qa_answer" id="answer_${index}"><b>${issue.type}:</b>${issue.text}</span>
                        <span class="qa_answer" id="resolution_${index}"><b>Resolution:</b>${issue.resolution ? issue.resolution : "" }</span>
                    </div>
                </div>`
    }).join("<br>");

    let fontStyle = "border: 2px solid #ccc;background-color: #f0f0f0;display:inline;padding: 5px 10px;text-align:left;font-style:italic;border-radius: 10px 10px 10px 0;margin-left:5px;";
    messageElement.innerHTML += `<div style="text-align: left;" class="sender-icon">${imgTag}</div>`;
    messageElement.innerHTML += `<div style="${fontStyle}">${message}<br/>${solutionMessage}</div>`;

    chatlog.appendChild(messageElement);
    chatlog.scrollTop = chatlog.scrollHeight;

    
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
    newDiv.id = `image-upload-div-${attachmentRectifiedCounter}`;
    newDiv.classList.add("image-upload-div");

    const spanElement = document.createElement("span");
    spanElement.classList.add("drop-message");
    spanElement.id = "screenshot-name-span";
    spanElement.innerHTML = "Drag and Drop or click to upload the screenshot images.";

    newDiv.appendChild(spanElement);
    chatlog.appendChild(newDiv);

    const fileUploadDiv = document.getElementById(`image-upload-div-${attachmentRectifiedCounter}`);

    // Trigger file input click when the drop area is clicked
    fileUploadDiv.addEventListener("click", function () {
        document.getElementById("screenshot-input").click();
    });

    const screenshotInput = document.getElementById('screenshot-input');

    screenshotInput.addEventListener('change', (event) => {
        const selectedFiles = event.target.files;

        // document.getElementById("question-div4").style.color ="black";

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
    newDiv.id = `file-upload-div-${attachmentRectifiedCounter}`;
    newDiv.classList.add(`file-upload-div`);

    const spanElement = document.createElement("span");
    spanElement.classList.add("drop-message");
    spanElement.id = "xsn-file-span";
    spanElement.innerHTML = "Drag and Drop or click to upload the xsn file.";

    newDiv.appendChild(spanElement);
    chatlog.appendChild(newDiv);

    const fileUploadDiv = document.getElementById(`file-upload-div-${attachmentRectifiedCounter}`);

    // Trigger file input click when the drop area is clicked
    fileUploadDiv.addEventListener("click", function () {
        document.getElementById("xsn-file-input").click();
    });

    const screenshotInput = document.getElementById('xsn-file-input');

    screenshotInput.addEventListener('change', (event) => {
        const selectedFile = event.target.files[0];

        // document.getElementById("question-div5").style.color ="1px solid black";

        if (selectedFile && (questionCounter < questions.length && questions[questionCounter].question == "attach_xsnfile")) {
            let contentToken = getQuestionContext("");
            if (contentToken.length > 0) {
                makeOpenAICall(contentToken);
            }
        }
        
    });
}

function renderDebugContextDiv(url, body, response) {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString(); // Adjust the format as needed
    console.log(formattedDate);

    debugContext.push({url, payload: body, result: response, datetime: formattedDate});

    const debugSection = document.querySelector('.debug-section');
    const debugDiv = document.createElement("div");
    debugDiv.classList.add("debug-div");

    const urlDiv = document.createElement("div");
    urlDiv.classList.add("debug-url-div");
    urlDiv.id = `debug-url-div-${expandImgCounter}`;
    const urlSpan = document.createElement("span");
    urlSpan.classList.add("debug-text");
    urlSpan.innerText = url;
    urlDiv.appendChild(urlSpan);

    const bodyDiv = document.createElement("div");
    bodyDiv.classList.add("debug-body-div");
    bodyDiv.id = `debug-body-div-${expandImgCounter}`;
    const bodySpan = document.createElement("span");
    bodySpan.classList.add("debug-text");
    bodySpan.innerText = JSON.stringify(body) ;
    bodyDiv.appendChild(bodySpan);

    const responseDiv = document.createElement("div");
    responseDiv.classList.add("debug-response-div");
    responseDiv.id = `debug-response-div-${expandImgCounter}`;
    const responseSpan = document.createElement("span");
    responseSpan.classList.add("debug-text");
    responseSpan.innerText = JSON.stringify(response);
    responseDiv.appendChild(responseSpan);

    const dateTimeDiv = document.createElement("div");
    dateTimeDiv.classList.add("debug-date-div");
    dateTimeDiv.id = `debug-date-div-${expandImgCounter}`;
    const dateTimeSpan = document.createElement("span");
    dateTimeSpan.classList.add("debug-text");
    dateTimeSpan.innerText = formattedDate;
    dateTimeDiv.appendChild(dateTimeSpan);

    const expandDiv = document.createElement("div");
    expandDiv.classList.add("debug-expand-div");
    expandDiv.id = `debug-expand-div-${expandImgCounter}`;
    const img = document.createElement("img");
    img.id = `expand-collapse-img-${expandImgCounter}`;
    img.classList.add("expand-collapse-img");
    img.src = "./static/collapse-icon.png";
    expandDiv.appendChild(img);

    debugDiv.appendChild(dateTimeDiv);
    debugDiv.appendChild(urlDiv);
    debugDiv.appendChild(bodyDiv);
    debugDiv.appendChild(responseDiv);
    debugDiv.appendChild(expandDiv);
    debugSection.insertBefore(debugDiv, debugSection.firstChild);
    // debugSection.appendChild(debugDiv);

    // debugSection.scrollTop = debugSection.scrollHeight;
    const expandCollapseImg = document.getElementById(`expand-collapse-img-${expandImgCounter}`);
    expandCollapseImg.addEventListener('click', toggleExpandCollapseIcon);

    function toggleExpandCollapseIcon(e) {
        srcElement = e.srcElement.id.split("-");
        i = srcElement[srcElement.length-1];

        const debugUrlDiv = document.getElementById(`debug-url-div-${i}`);
        const debugBodyDiv = document.getElementById(`debug-body-div-${i}`);
        const debugResponseDiv = document.getElementById(`debug-response-div-${i}`);
        const debugDateDiv = document.getElementById(`debug-date-div-${i}`);
        const debugExpandDiv = document.getElementById(`debug-expand-div-${i}`);
        debugExpandDiv.focus();

        console.log("inside toggle from img");
        console.log(e.srcElement.src);
        if (e.srcElement.src.includes("expand")) {
            e.srcElement.src = "./static/collapse-icon.png";

            debugUrlDiv.style.height = "20px";
            debugBodyDiv.style.height = "20px";
            debugResponseDiv.style.height = "20px";
            debugDateDiv.style.height = "20px";
            debugExpandDiv.style.height = "20px";
            // "height:20px;overflow-y:hidden;overflow-x:hidden;";
        } else {
            e.srcElement.src = "./static/expand-icon.png";
            debugUrlDiv.style.height = "auto";
            debugBodyDiv.style.height = "auto";
            debugResponseDiv.style.height = "auto";
            debugDateDiv.style.height = "auto";
            debugExpandDiv.style.height = "auto";
            // "height:auto;overflow-y:visible;overflow-x:hidden;";
        }
    }

    expandImgCounter++;
}

function renderSearchedSolution(response) {
    if (!response) {
        showLoader(false);
        return;
    }

    const searchedSolution = document.querySelector('.solution-section');
    searchedSolution.style.display = "block";

    const similarCountDiv = document.getElementById('similar-count');
    similarCountDiv.innerHTML = `<h3>Found ${response.solutions.length} similar issues.</h3>`;

    const similarIssueDiv = document.querySelector('.similar-issues');
    similarIssueDiv.innerHTML = "";
    
    const similarIssues = response.solutions.map((issue, index) => {
        return `<div class="qa">
                    <span class="qa_score">${issue.score.toFixed(2)}</span>
                    <div class="qa_pair">
                        <p class="qa_answer" id="answer_${index}"><b>${issue.type}:</b>${issue.text}</p>
                        <p class="qa_answer" id="resolution_${index}"><b>Resolution:</b>${issue.resolution ? issue.resolution : "" }</p>
                    </div>
                    </div>`

                    //<p class="qa_answer" id="answer_${index}">${issue.resolution}</p>
    }).join("<br>");

    similarIssueDiv.innerHTML += `${similarIssues}`;
    similarIssueDiv.style.display = "block";

    showLoader(false);
}

function renderGeneratedSolution(res, model) {
    model = model == "gpt-4" ? "GPT-4" : "GPT-3.5";

    const generatedSolutionSection = document.querySelector('.generated-solution-section');
    generatedSolutionSection.style.display= "block";

    const generatedSolution = document.querySelector('.generated-solution');
    
    const spanResponseElement = document.createElement("span");
    spanResponseElement.classList.add("span-generated-solution");
    spanResponseElement.innerHTML = `<b>${model}</b> ${res.response} `;

    generatedSolution.appendChild(spanResponseElement);

    const spanTimerElement = document.createElement("span");
    spanTimerElement.classList.add("span-timer");
    spanTimerElement.innerHTML = `</br>${res.requestTimer}</br>`;

    generatedSolution.appendChild(spanTimerElement);
}