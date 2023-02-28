(function() {
  // Listen for messages from the extension
  browser.runtime.onMessage.addListener((message) => {
    console.log("Message recieved, prompt = " + message.prompt)
    // Find the text area element on the page
    const textArea = document.querySelector("textarea")

    // Fill the text area with the prompt
    textArea.value = message.prompt;
  });
})();