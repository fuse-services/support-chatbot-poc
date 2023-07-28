
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