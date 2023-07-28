 
// Function to render user and chatbot messages
function renderMessage(sender, message) {
    // Remove typing indicator
    const chatlog = document.getElementById('chatlog');
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<div style="text-align: left;"><strong>${sender}:</strong> ${message}</div>`;

    chatlog.appendChild(messageElement);
}

// Function to render chatbot typing indicator
function renderTypingIndicator() {
    const chatlog = document.getElementById('chatlog');
    const typingIndicator = document.createElement('div');
    typingIndicator.innerHTML = `<div id="chatbot-icon"></div>`;
    chatlog.appendChild(typingIndicator);
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
            makeOpenAICall(contentToken);
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
            makeOpenAICall(contentToken);
        }
    });
}