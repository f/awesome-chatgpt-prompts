const select = document.getElementById('prompt-select');

fetch("../prompts.csv")
.then(response => response.text())
.then(data => {
  // Parse the CSV file with PapaParse
  const results = Papa.parse(data, { header: true });
  const prompts = results.data;
  
  // Populate the select element with the parsed data
  prompts.forEach(item => {
    const option = document.createElement('option');
    option.value = item.prompt;
    option.textContent = item.act;
    select.appendChild(option);
  });
});

// Find the select button on the page
const selectButton = document.getElementById('select-button');

// Add an event listener to the select button
selectButton.addEventListener('click', () => {
  // Get the currently selected prompt
  const prompt = select.value;
  console.log("Select button clicked. Prompt = " + prompt)

  // Get the active tab in the current window
  browser.tabs.query({ active: true, currentWindow: true })
    .then(tabs => {
      // Get the first tab in the list of active tabs
      const tab = tabs[0];
      console.log("Found active tab = " + tab)

      // Send a message to the content script in the tab
      browser.tabs.sendMessage(tab.id, { prompt: prompt });
    });

  // Close the pop-up window
  window.close();
});

browser.tabs.executeScript({file: "../content/content.js"})