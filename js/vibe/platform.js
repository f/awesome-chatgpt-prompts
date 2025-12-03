// Copy prompt to clipboard
async function copyPrompt(button, encodedPrompt) {
  try {
    const promptText = decodeURIComponent(encodedPrompt);
    await navigator.clipboard.writeText(promptText);
    const originalHTML = button.innerHTML;
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
    setTimeout(() => {
      button.innerHTML = originalHTML;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
}

// Open prompt in AI chat platform
function openInChat(button, encodedPrompt) {
  const promptText = decodeURIComponent(encodedPrompt);
  // Default to ChatGPT for vibe prompts
  const url = `https://chat.openai.com/?prompt=${encodeURIComponent(promptText)}`;
  window.open(url, '_blank');
}

// Toggle dark mode
function toggleDarkMode() {
  const body = document.body;
  const isDarkMode = body.classList.toggle('dark-mode');
  localStorage.setItem('dark-mode', isDarkMode);
  
  const toggle = document.querySelector('.dark-mode-toggle');
  if (toggle) {
    const sunIcon = toggle.querySelector('.sun-icon');
    const moonIcon = toggle.querySelector('.moon-icon');
    if (sunIcon && moonIcon) {
      sunIcon.style.display = isDarkMode ? 'none' : 'block';
      moonIcon.style.display = isDarkMode ? 'block' : 'none';
    }
  }
}
