let selectedPlatform =
  localStorage.getItem("selected-platform") || "github-copilot"; // Get from localStorage or default to github

// Platform toggle functionality
document.querySelectorAll(".platform-tag").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".platform-tag")
      .forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    selectedPlatform = button.dataset.platform;
    localStorage.setItem("selected-platform", selectedPlatform);

    // Hide/show chat buttons based on platform
    const chatButtons = document.querySelectorAll(
      ".chat-button, .modal-chat-button"
    );
    const shouldHideChat = ["gemini", "llama"].includes(selectedPlatform);
    chatButtons.forEach((btn) => {
      btn.style.display = shouldHideChat ? "none" : "flex";
    });

    // Auto-select technical tone and developers audience for GitHub Copilot
    if (selectedPlatform === "github-copilot") {
      const toneSelect = document.getElementById('toneSelect');
      const audienceSelect = document.getElementById('audienceSelect');
      
      // Set tone to technical
      toneSelect.value = 'technical';
      localStorage.setItem('selected-tone', 'technical');
      
      // Set audience to developers
      audienceSelect.value = 'developers';
      localStorage.setItem('audience', 'developers');
      
      // Update dev mode class on body
      document.body.classList.add('dev-mode');
      
      // Update chat button icons
      updateChatButtonIcons(true);
      
      // Trigger prompt filtering for dev mode
      filterPrompts();
    }
  });
});

// Set active platform from localStorage and handle initial button visibility
const platformToActivate =
  document.querySelector(`[data-platform="${selectedPlatform}"]`) ||
  document.querySelector('[data-platform="github-copilot"]');
platformToActivate.classList.add("active");

// Set initial chat button visibility
const shouldHideChat = ["gemini", "llama"].includes(selectedPlatform);
document.querySelectorAll(".chat-button, .modal-chat-button").forEach((btn) => {
  btn.style.display = shouldHideChat ? "none" : "flex";
});

// Function to open prompt in selected AI chat platform
function openInChat(button, encodedPrompt) {
  const promptText = buildPrompt(encodedPrompt);
  const platform = document.querySelector(".platform-tag.active");

  if (!platform) return;

  const baseUrl = platform.dataset.url;
  console.log(baseUrl);
  let url;

  switch (platform.dataset.platform) {
    case "github-copilot":
      url = `${baseUrl}?prompt=${encodeURIComponent(promptText)}`;
      break;
    case "chatgpt":
      url = `${baseUrl}?prompt=${encodeURIComponent(promptText)}`;
      break;
    case "grok":
      url = `${baseUrl}&q=${encodeURIComponent(promptText)}`;
      break;
    case "claude":
      url = `${baseUrl}?q=${encodeURIComponent(promptText)}`;
      break;
    case "perplexity":
      url = `${baseUrl}/search?q=${encodeURIComponent(promptText)}`;
      break;
    case "mistral":
      url = `${baseUrl}?q=${encodeURIComponent(promptText)}`;
      break;
    default:
      url = `${baseUrl}?q=${encodeURIComponent(promptText)}`;
  }

  window.open(url, "_blank");
}

function buildPrompt(encodedPrompt) {
  let promptText = decodeURIComponent(encodedPrompt);
  
  // Check if this is a JSON prompt
  const isJsonPrompt = isValidJson(promptText);

  // Get language, tone and audience preferences (shared for both JSON and TEXT)
  const languageSelect = document.getElementById('languageSelect');
  const customLanguage = document.getElementById('customLanguage');
  const toneSelect = document.getElementById('toneSelect');
  const customTone = document.getElementById('customTone');
  const audienceSelect = document.getElementById('audienceSelect');

  const language = languageSelect.value === 'custom' ? customLanguage.value : languageSelect.value;
  const tone = toneSelect.value === 'custom' ? customTone.value : toneSelect.value;
  const audience = audienceSelect.value;

  // Handle JSON prompts differently
  if (isJsonPrompt) {
    try {
      // Clean up curly quotes if present
      let cleanedJson = promptText
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'");
      
      const data = JSON.parse(cleanedJson);
      
      // Add preferences as a structured JSON object
      data.preferences = {
        language: language,
        tone: tone,
        for_developers: audience === 'developers'
      };
      
      // Return prettified JSON
      return JSON.stringify(data, null, 2);
    } catch (e) {
      console.warn('Failed to merge preferences into JSON prompt:', e);
      // Fallback: return original prompt if JSON parsing fails
      return promptText;
    }
  }

  // TEXT prompt handling (existing logic)
  // If there's a modal open, use the current state of variables
  const modalContent = document.querySelector(".modal-content");
  if (modalContent) {
    // Get all variable inputs
    const form = document.querySelector(".variable-form");
    if (form) {
      const inputs = form.querySelectorAll(".variable-input");
      inputs.forEach((input) => {
        const value = input.value.trim();
        const variable = input.dataset.variable;
        const defaultValue = input.dataset.default;
        const pattern = new RegExp(`\\$\{${variable}[^}]*\}`, "g");

        // Use value or default value
        const replacement = value || defaultValue || variable;
        promptText = promptText.replace(pattern, replacement);
      });
    }
  }

  // Clean up newlines and normalize whitespace
  promptText = promptText.replace(/\s+/g, ' ').trim();

  // Append preferences as a new line for TEXT prompts
  promptText += ` Reply in ${language} using ${tone} tone for ${audience}.`;

  return promptText;
}

// Existing copy function
async function copyPrompt(button, encodedPrompt) {
  try {
    const promptText = buildPrompt(encodedPrompt);
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
    console.error("Failed to copy text: ", err);
  }
}

// Function to handle chat button click in modal
function openModalChat() {
  const modalContent = document.querySelector(".modal-content");
  if (modalContent) {
    const content = modalContent.textContent;
    openInChat(null, encodeURIComponent(content.trim()));
  }
}

// Function to handle embed button click in modal
function openEmbedDesigner() {
  const modalContent = document.querySelector(".modal-content");
  if (modalContent) {
    let content = modalContent.textContent || modalContent.innerText;
    
    // If there's a variable form, get the processed content with variables
    const form = document.querySelector(".variable-form");
    if (form) {
      content = buildPrompt(encodeURIComponent(content.trim()));
      // Remove the added language/tone preferences for embed
      content = content.replace(/\s*Reply in .+ using .+ tone for .+\.$/, '').trim();
    }
    
    // Build the embed URL
    const embedUrl = `/embed/?prompt=${encodeURIComponent(content)}&context=https://prompts.chat&model=gpt-4o&agentMode=chat&thinking=false&max=false&height=400`;
    
    // Open in new tab
    window.open(embedUrl, '_blank');
  }
}

// Add these functions before the closing script tag
function showCopilotSuggestion() {
  const modal = document.getElementById("copilotSuggestionModal");
  const backdrop = document.querySelector(".copilot-suggestion-backdrop");
  if (modal) {
    if (!backdrop) {
      const backdropDiv = document.createElement("div");
      backdropDiv.className = "copilot-suggestion-backdrop";
      document.body.appendChild(backdropDiv);
    }
    modal.style.display = "block";
    backdrop.style.display = "block";
    document.body.style.overflow = "hidden";
  }
}

function hideCopilotSuggestion(switchToCopilot) {
  const modal = document.getElementById("copilotSuggestionModal");
  const backdrop = document.querySelector(".copilot-suggestion-backdrop");
  const doNotShowCheckbox = document.getElementById("doNotShowAgain");

  if (doNotShowCheckbox && doNotShowCheckbox.checked) {
    localStorage.setItem("copilot-suggestion-hidden", "true");
  }

  if (switchToCopilot) {
    const copilotButton = document.querySelector(
      '[data-platform="github-copilot"]'
    );
    if (copilotButton) {
      copilotButton.click();
    }
  }

  if (modal) {
    modal.style.display = "none";
    if (backdrop) {
      backdrop.style.display = "none";
    }
    document.body.style.overflow = "";
  }
}

// Function to update chat button icons based on dev mode
function updateChatButtonIcons(isDevMode) {
  document
    .querySelectorAll(".chat-button, .modal-chat-button")
    .forEach((button) => {
      const chatIcon = button.querySelector(".chat-icon");
      const terminalIcon = button.querySelector(".terminal-icon");
      if (chatIcon && terminalIcon) {
        chatIcon.style.display = isDevMode ? "none" : "block";
        terminalIcon.style.display = isDevMode ? "block" : "none";
      }
    });
}
