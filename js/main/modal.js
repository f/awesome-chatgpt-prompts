function initializeModalListeners() {
  const modalOverlay = document.getElementById("modalOverlay");
  const modalClose = document.querySelector(".modal-close");

  if (!modalOverlay || !modalClose) return;

  modalClose.addEventListener("click", hideModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      hideModal();
    }
  });
}

// Add global event listener for Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    hideModal();
    
    // Also hide YAML modal if it exists
    const yamlModal = document.getElementById("yamlModalOverlay");
    if (yamlModal) {
      yamlModal.style.display = "none";
      document.body.style.overflow = "";
      yamlModal.remove();
    }
  }
});

function createModal() {
  const modalHTML = renderModalHtml();
  document.body.insertAdjacentHTML("beforeend", modalHTML);
  initializeModalListeners();
}

// Modify the existing showModal function
function showModal(title, content, promptType = 'TEXT') {
  let modalOverlay = document.getElementById("modalOverlay");
  if (!modalOverlay) {
    createModal();
    modalOverlay = document.getElementById("modalOverlay");
  }

  const modalTitle = modalOverlay.querySelector(".modal-title");
  const modalContent = modalOverlay.querySelector(".modal-content");
  
  // Check if this is a JSON prompt
  const isJsonPrompt = promptType === 'JSON' || isValidJson(content);

  // Extract variables from content
  const variables = extractVariables(content);

  // Create variable inputs container if variables exist (only for TEXT prompts)
  if (variables.length > 0 && !isJsonPrompt) {
    const variableContainer = document.createElement("div");
    variableContainer.className = "variable-container";

    const form = createVariableInputs(variables, variableContainer);

    // Initialize the modal content with updated prompt preview if variables exist
    const previewText = updatePromptPreview(content, form);
    modalContent.innerHTML = previewText;

    // Add event listeners for real-time updates
    form.addEventListener("input", () => {
      const previewText = updatePromptPreview(content, form);
      modalContent.innerHTML = previewText;

      // Update chat button data
      const modalChatButton = modalOverlay.querySelector(".modal-chat-button");
      if (modalChatButton) {
        modalChatButton.dataset.content = previewText;
      }
    });

    // Insert variable container before content
    modalContent.parentElement.insertBefore(variableContainer, modalContent);
  } else if (isJsonPrompt) {
    // Render JSON content with syntax highlighting
    modalTitle.textContent = title;
    modalContent.innerHTML = `<pre class="json-content modal-json">${formatJsonWithHighlighting(content)}</pre>`;
  } else {
    modalTitle.textContent = title;
    modalContent.textContent = content;
  }

  const modalCopyButton = modalOverlay.querySelector(".modal-copy-button");
  const modalContributor = modalOverlay.querySelector(".modal-contributor");
  const modalChatButton = modalOverlay.querySelector(".modal-chat-button");

  if (!modalTitle || !modalContent) return;

  // Update chat button text with platform name and handle visibility
  const platform = document.querySelector(".platform-tag.active");
  const isDevMode = document.getElementById("audienceSelect").value === "developers";

  if (platform) {
    const shouldHideChat = ["gemini", "llama"].includes(
      platform.dataset.platform
    );
    modalChatButton.style.display = shouldHideChat ? "none" : "flex";

    if (!shouldHideChat) {
      const chatIcon = modalChatButton.querySelector(".chat-icon");
      const terminalIcon = modalChatButton.querySelector(".terminal-icon");

      if (chatIcon && terminalIcon) {
        chatIcon.style.display = isDevMode ? "none" : "block";
        terminalIcon.style.display = isDevMode ? "block" : "none";
      }

      modalChatButton.innerHTML = `
        <svg class="chat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: ${
          isDevMode ? "none" : "block"
        }">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <svg class="terminal-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: ${
          isDevMode ? "block" : "none"
        }">
        <polyline points="4 17 10 11 4 5"></polyline>
        <line x1="12" y1="19" x2="20" y2="19"></line>
        </svg>
        Chat with ${platform.textContent}
    `;
    }
  }

  // Store content for chat button
  modalChatButton.dataset.content = modalContent.textContent;

  // Find the contributor for this prompt
  const promptCard = Array.from(document.querySelectorAll(".prompt-card")).find(
    (card) =>
      card.querySelector(".prompt-title").textContent.trim() === title.trim()
  );

  if (promptCard) {
    const contributorBadge = promptCard.querySelector(".contributor-badge");
    if (contributorBadge) {
      modalContributor.href = contributorBadge.href;
      modalContributor.textContent = `Contributed by ${contributorBadge.textContent}`;
    }
  }

  // Add copy functionality
  modalCopyButton.addEventListener("click", async () => {
    try {
      copyPrompt(modalCopyButton, modalContent.textContent);
      modalCopyButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    `;
      setTimeout(() => {
        modalCopyButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        `;
      }, 2000);
    } catch (err) {
      alert("Failed to copy prompt to clipboard");
    }
  });

  modalOverlay.style.display = "block";
  document.body.style.overflow = "hidden";
}

function hideModal() {
  const modalOverlay = document.getElementById("modalOverlay");
  if (!modalOverlay) return;

  modalOverlay.style.display = "none";
  document.body.style.overflow = "";

  // Optional: Remove modal from DOM when hidden
  modalOverlay.remove();
}
