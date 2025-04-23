// Dark mode functionality
function toggleDarkMode() {
  const body = document.body;
  const toggle = document.querySelector(".dark-mode-toggle");
  const sunIcon = toggle.querySelector(".sun-icon");
  const moonIcon = toggle.querySelector(".moon-icon");

  body.classList.toggle("dark-mode");
  const isDarkMode = body.classList.contains("dark-mode");

  localStorage.setItem("dark-mode", isDarkMode);
  sunIcon.style.display = isDarkMode ? "none" : "block";
  moonIcon.style.display = isDarkMode ? "block" : "none";
}

// Add these new functions at the top
function extractVariables(text) {
  const variables = [];
  
  // Extract ${var:default} format variables
  const regex1 = /\${([^}]+)}/g;
  let match;
  while ((match = regex1.exec(text)) !== null) {
    const [variable, defaultValue] = match[1].split(":").map((s) => s.trim());
    variables.push({ name: variable, default: defaultValue || "" });
  }
  
  // Extract {{var}} format variables
  const regex2 = /\{\{([^}]+)\}\}/g;
  while ((match = regex2.exec(text)) !== null) {
    const variable = match[1].trim();
    if (!variables.some(v => v.name === variable)) {
      variables.push({ name: variable, default: "" });
    }
  }

  return [...new Set(variables.map((v) => JSON.stringify(v)))].map((v) =>
    JSON.parse(v)
  ); // Remove duplicates
}

function createVariableInputs(variables, container) {
  const form = document.createElement("div");
  form.className = "variable-form";

  variables.forEach((variable) => {
    const wrapper = document.createElement("div");
    wrapper.className = "variable-input-wrapper";

    const label = document.createElement("label");
    label.textContent = variable.name;
    label.style.fontWeight = "600";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "variable-input";
    input.placeholder = variable.default || `Enter ${variable.name}`;
    input.dataset.variable = variable.name;
    input.dataset.default = variable.default || "";

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    form.appendChild(wrapper);
  });

  container.appendChild(form);
  return form;
}

// Function to update the prompt preview with user input or default values
function updatePromptPreview(promptText, form) {
  const variables = extractVariables(promptText);

  if (variables.length === 0) {
    return promptText; // Return original text if no variables found
  }

  let previewText = promptText;
  // Replace variables with their default values without editting (for prompt cards, copy buttons, chat)
  if (!form) {
    variables.forEach(variable => {
      // Handle old-style ${var:default} format
      const pattern1 = new RegExp(`\\$\{${variable.name}[^}]*\}`, 'g');
      const replacement = variable.default || `<b>${variable.name}</b>`;
      previewText = previewText.replace(pattern1, replacement);
      
      // Handle new-style {{var}} format
      const pattern2 = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g');
      previewText = previewText.replace(pattern2, replacement);
    });
  }
  // Replace variables according to the user inputs.
  else {
    const inputs = form.querySelectorAll(".variable-input");

    inputs.forEach((input) => {
      const value = input.value.trim();
      const variable = input.dataset.variable;
      const defaultValue = input.dataset.default;
      
      // Handle old-style ${var:default} format
      const pattern1 = new RegExp(`\\$\{${variable}[^}]*\}`, 'g');
      // Handle new-style {{var}} format
      const pattern2 = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
      
      let replacement;
      if (value) {
        // User entered value
        replacement = value;
      } else if (defaultValue) {
        // Show default value with highlight
        replacement = defaultValue;
      } else {
        // No value or default, show variable name
        replacement = variable;
      }
      replacement = `<b>${replacement}</b>`;

      previewText = previewText.replace(pattern1, replacement);
      previewText = previewText.replace(pattern2, replacement);
    });
  }
  return previewText;
}

// Initialize everything after DOM loads
document.addEventListener("DOMContentLoaded", () => {
  // Initialize audience selector and dev mode
  const audienceSelect = document.getElementById('audienceSelect');
  const initialAudience = localStorage.getItem('audience') || 'everyone';
  audienceSelect.value = initialAudience;
  document.body.classList.toggle('dev-mode', initialAudience === 'developers');

  // Handle audience changes
  audienceSelect.addEventListener('change', (e) => {
    const isDevMode = e.target.value === 'developers';
    document.body.classList.toggle('dev-mode', isDevMode);
    localStorage.setItem('audience', e.target.value);
    
    // Update chat button icons
    updateChatButtonIcons(isDevMode);

    // Check if we should show Copilot suggestion
    if (isDevMode) {
      const currentPlatform = document.querySelector(".platform-tag.active");
      const shouldNotShow = localStorage.getItem("copilot-suggestion-hidden") === "true";

      if (currentPlatform && 
          currentPlatform.dataset.platform !== "github-copilot" && 
          !shouldNotShow) {
        showCopilotSuggestion();
      }
    }

    // Trigger prompt filtering
    filterPrompts();
  });

  // Fetch GitHub stars
  fetch("https://api.github.com/repos/f/awesome-chatgpt-prompts")
    .then((response) => response.json())
    .then((data) => {
      const stars = data.stargazers_count;
      document.getElementById("starCount").textContent = stars.toLocaleString();
    })
    .catch((error) => {
      console.error("Error fetching star count:", error);
      document.getElementById("starCount").textContent = "122k+";
    });

  // Create prompt cards
  createPromptCards();

  // Initialize dark mode
  const isDarkMode = localStorage.getItem("dark-mode");
  const toggle = document.querySelector(".dark-mode-toggle");
  const sunIcon = toggle.querySelector(".sun-icon");
  const moonIcon = toggle.querySelector(".moon-icon");

  // Set dark mode by default if not set
  if (isDarkMode === null) {
    localStorage.setItem("dark-mode", "true");
    document.body.classList.add("dark-mode");
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
  } else if (isDarkMode === "true") {
    document.body.classList.add("dark-mode");
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
  } else {
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
  }

  // Initialize search functionality
  initializeSearch();

  // Initialize language and tone selectors
  initializeLanguageAndTone();
});

// Search functionality
async function initializeSearch() {
  try {
    const response = await fetch("/prompts.csv");
    const csvText = await response.text();
    const prompts = parseCSV(csvText);

    // Sort prompts alphabetically by act
    prompts.sort((a, b) => a.act.localeCompare(b.act));

    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");
    const promptCount = document.getElementById("promptCount");
    const isDevMode = document.getElementById("audienceSelect").value === "developers";

    // Update prompt count
    const totalPrompts = isDevMode
      ? prompts.filter((p) => p.for_devs === true).length
      : prompts.length;
    updatePromptCount(totalPrompts, totalPrompts);

    // Show filtered prompts initially
    const filteredPrompts = isDevMode
      ? prompts.filter((p) => p.for_devs === true)
      : prompts;
    displaySearchResults(filteredPrompts);

    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const isDevMode = document.getElementById("audienceSelect").value === "developers";

      const filteredPrompts = prompts.filter((prompt) => {
        const matchesSearch =
          prompt.act.toLowerCase().includes(searchTerm) ||
          prompt.prompt.toLowerCase().includes(searchTerm);

        return isDevMode
          ? matchesSearch && prompt.for_devs === true
          : matchesSearch;
      });

      // Update count with filtered results
      const totalPrompts = isDevMode
        ? prompts.filter((p) => p.for_devs === true).length
        : prompts.length;
      updatePromptCount(filteredPrompts.length, totalPrompts);
      displaySearchResults(filteredPrompts);
    });
  } catch (error) {
    console.error("Error loading prompts:", error);
  }
}

function updatePromptCount(filteredCount, totalCount) {
  const promptCount = document.getElementById("promptCount");
  const countLabel = promptCount.querySelector(".count-label");
  const countNumber = promptCount.querySelector(".count-number");

  if (filteredCount === totalCount) {
    promptCount.classList.remove("filtered");
    countLabel.textContent = "All Prompts";
    countNumber.textContent = totalCount;
  } else {
    promptCount.classList.add("filtered");
    countLabel.textContent = `Found ${filteredCount} of ${totalCount}`;
    countNumber.textContent = filteredCount;
  }
}

function parseCSV(csv) {
  const lines = csv.split("\n");
  const headers = lines[0]
    .split(",")
    .map((header) => header.replace(/"/g, "").trim());

  return lines
    .slice(1)
    .map((line) => {
      const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
      const entry = {};

      headers.forEach((header, index) => {
        let value = values[index] ? values[index].replace(/"/g, "").trim() : "";
        // Remove backticks from the act/title
        if (header === "act") {
          value = value.replace(/`/g, "");
        }
        // Convert 'TRUE'/'FALSE' strings to boolean for for_devs
        if (header === "for_devs") {
          value = value.toUpperCase() === "TRUE";
        }
        entry[header] = value;
      });

      return entry;
    })
    .filter((entry) => entry.act && entry.prompt);
}

function displaySearchResults(results) {
  const searchResults = document.getElementById("searchResults");
  const searchInput = document.getElementById("searchInput");
  const isDevMode = document.getElementById("audienceSelect").value === "developers";

  // Filter results based on dev mode
  if (isDevMode) {
    results = results.filter((result) => result.for_devs === true);
  }

  searchResults.innerHTML = "";

  if (window.innerWidth <= 768 && !searchInput.value.trim()) {
    return;
  }

  if (results.length === 0) {
    const li = document.createElement("li");
    li.className = "search-result-item add-prompt";
    li.innerHTML = `
    <a href="https://github.com/f/awesome-chatgpt-prompts/pulls" target="_blank" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        Add this prompt
    </a>
    `;
    searchResults.appendChild(li);
    return;
  }

  results.forEach((result) => {
    const li = document.createElement("li");
    li.className = "search-result-item";
    li.textContent = result.act;
    li.addEventListener("click", () => {
      // Find the prompt card with matching title
      const cards = document.querySelectorAll(".prompt-card");
      const targetCard = Array.from(cards).find((card) => {
        const cardTitle = card
          .querySelector(".prompt-title")
          .textContent.replace(/\s+/g, " ") // Normalize whitespace
          .replace(/[\n\r]/g, "") // Remove newlines
          .trim();

        const searchTitle = result.act
          .replace(/\s+/g, " ") // Normalize whitespace
          .replace(/[\n\r]/g, "") // Remove newlines
          .trim();

        return (
          cardTitle.toLowerCase().includes(searchTitle.toLowerCase()) ||
          searchTitle.toLowerCase().includes(cardTitle.toLowerCase())
        );
      });

      if (targetCard) {
        // Remove highlight from all cards
        cards.forEach((card) => {
          card.style.transition = "all 0.3s ease";
          card.style.transform = "none";
          card.style.boxShadow = "none";
          card.style.borderColor = "";
        });

        // Different scroll behavior for mobile and desktop
        const isMobile = window.innerWidth <= 768;
        const headerHeight =
          document.querySelector(".site-header").offsetHeight;

        if (isMobile) {
          // On mobile, scroll the window
          const cardRect = targetCard.getBoundingClientRect();
          const scrollTop =
            window.pageYOffset + cardRect.top - headerHeight - 50;

          window.scrollTo({
            top: scrollTop,
            behavior: "smooth",
          });
        } else {
          // On desktop, scroll the main-content container
          const mainContent = document.querySelector(".main-content");
          const cardRect = targetCard.getBoundingClientRect();
          const scrollTop =
            mainContent.scrollTop + cardRect.top - headerHeight - 50;

          mainContent.scrollTo({
            top: scrollTop,
            behavior: "smooth",
          });
        }

        // Add highlight effect after scrolling completes
        setTimeout(() => {
          targetCard.style.transform = "scale(1.02)";
          targetCard.style.boxShadow = "0 0 0 2px var(--accent-color)";
          targetCard.style.borderColor = "var(--accent-color)";

          // Remove highlight after animation
          setTimeout(() => {
            targetCard.style.transform = "none";
            targetCard.style.boxShadow = "none";
            targetCard.style.borderColor = "";
          }, 2000);
        }, 500); // Wait for scroll to complete
      } else {
        console.log("Card not found for:", result.act);
      }
    });
    searchResults.appendChild(li);
  });
}

// Function to filter prompts based on dev mode
function filterPrompts() {
  const isDevMode = document.getElementById("audienceSelect").value === "developers";
  const searchInput = document.getElementById("searchInput");
  const searchTerm = searchInput.value.toLowerCase();

  // Re-fetch and filter prompts
  fetch("/prompts.csv")
    .then((response) => response.text())
    .then((csvText) => {
      const prompts = parseCSV(csvText);
      const filteredPrompts = prompts.filter((prompt) => {
        const matchesSearch =
          !searchTerm ||
          prompt.act.toLowerCase().includes(searchTerm) ||
          prompt.prompt.toLowerCase().includes(searchTerm);

        return isDevMode
          ? matchesSearch && prompt.for_devs === true
          : matchesSearch;
      });

      // Update count with filtered results
      updatePromptCount(
        filteredPrompts.length,
        isDevMode
          ? prompts.filter((p) => p.for_devs === true).length
          : prompts.length
      );
      displaySearchResults(filteredPrompts);

      // Update prompt cards visibility
      const promptsGrid = document.querySelector(".prompts-grid");
      if (promptsGrid) {
        const cards = promptsGrid.querySelectorAll(
          ".prompt-card:not(.contribute-card)"
        );
        cards.forEach((card) => {
          const title = card.querySelector(".prompt-title").textContent.trim();
          const matchingPrompt = prompts.find((p) => {
            const pTitle = p.act
              .replace(/\s+/g, " ")
              .replace(/[\n\r]/g, "")
              .trim();
            const cardTitle = title
              .replace(/\s+/g, " ")
              .replace(/[\n\r]/g, "")
              .trim();
            return (
              pTitle.toLowerCase() === cardTitle.toLowerCase() ||
              pTitle.toLowerCase().includes(cardTitle.toLowerCase()) ||
              cardTitle.toLowerCase().includes(pTitle.toLowerCase())
            );
          });

          // Show card if not in dev mode or if it's a dev prompt in dev mode
          card.style.display =
            !isDevMode || (matchingPrompt && matchingPrompt.for_devs === true)
              ? ""
              : "none";
        });
      }
    });
}

// Update the modal initialization and event listeners
function createPromptCards() {
  const container = document.querySelector(".container-lg.markdown-body");
  const promptsGrid = document.createElement("div");
  promptsGrid.className = "prompts-grid";

  // Add contribute box
  const contributeCard = document.createElement("div");
  contributeCard.className = "prompt-card contribute-card";
  contributeCard.innerHTML = `
    <a href="https://github.com/f/awesome-chatgpt-prompts/pulls" target="_blank" style="text-decoration: none; color: inherit; height: 100%; display: flex; flex-direction: column;">
    <div class="prompt-title" style="display: flex; align-items: center; gap: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        Add Your Prompt
    </div>
    <p class="prompt-content" style="flex-grow: 1;">
        Share your creative prompts with the community! Submit a pull request to add your prompts to the collection.
    </p>
    <span class="contributor-badge">Contribute Now</span>
    </a>
`;
  promptsGrid.appendChild(contributeCard);

  // Fetch prompts.csv to get for_devs information
  fetch("/prompts.csv")
    .then((response) => response.text())
    .then((csvText) => {
      const prompts = parseCSV(csvText);
      const isDevMode = document.getElementById("audienceSelect").value === "developers";

      const promptElements = document.querySelectorAll(
        "h2[id^=act] + p + blockquote"
      );

      promptElements.forEach((blockquote) => {
        const title =
          blockquote.previousElementSibling.previousElementSibling.textContent.trim();
        const content = blockquote.textContent.trim();

        // Find matching prompt in CSV
        const matchingPrompt = prompts.find((p) => {
          const csvTitle = p.act
            .replace(/\s+/g, " ")
            .replace(/[\n\r]/g, "")
            .trim();
          const elementTitle = title
            .replace(/\s+/g, " ")
            .replace(/[\n\r]/g, "")
            .trim();
          return (
            csvTitle.toLowerCase() === elementTitle.toLowerCase() ||
            csvTitle.toLowerCase().includes(elementTitle.toLowerCase()) ||
            elementTitle.toLowerCase().includes(csvTitle.toLowerCase())
          );
        });

        // Extract contributor from the paragraph element
        const contributorParagraph = blockquote.previousElementSibling;
        const contributorText = contributorParagraph.textContent;
        let contributor = null;

        // Try different contributor formats
        const formats = [
          /Contributed by: \[([^\]]+)\]/i,
          /Contributed by \[([^\]]+)\]/i,
          /Contributed by: @([^\s]+)/i,
          /Contributed by @([^\s]+)/i,
          /Contributed by: \[@([^\]]+)\]/i,
          /Contributed by \[@([^\]]+)\]/i,
        ];

        for (const format of formats) {
          const match = contributorText.match(format);
          if (match) {
            contributor = match[1];
            // Remove @ if it exists at the start
            contributor = contributor.replace(/^@/, "");
            break;
          }
        }

        // Set default contributor to 'f' if none found
        if (!contributor) {
          contributor = "f";
        }

        const card = document.createElement("div");
        card.className = "prompt-card";

        // Set initial visibility based on dev mode
        if (isDevMode && (!matchingPrompt || !matchingPrompt.for_devs)) {
          card.style.display = "none";
        }

        card.innerHTML = `
        <div class="prompt-title">
            ${title}
            <div class="action-buttons">
            <button class="chat-button" title="Open in AI Chat" onclick="openInChat(this, '${encodeURIComponent(
              updatePromptPreview(content.trim())
            )}')">
                <svg class="chat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <svg class="terminal-icon" style="display: none;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="4 17 10 11 4 5"></polyline>
                <line x1="12" y1="19" x2="20" y2="19"></line>
                </svg>
            </button>
            <button class="yaml-button" title="Show prompt.yml format" onclick="showYamlModal(event, '${encodeURIComponent(title)}', '${encodeURIComponent(content)}')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            </button>
            <button class="copy-button" title="Copy prompt" onclick="copyPrompt(this, '${encodeURIComponent(
              updatePromptPreview(content.trim())
            )}')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
            </button>
            </div>
        </div>
        <p class="prompt-content">${updatePromptPreview(content)}</p>
        <a href="https://github.com/${contributor}" class="contributor-badge" target="_blank" rel="noopener">@${contributor}</a>
        `;

        // Add click event for showing modal
        card.addEventListener("click", (e) => {
          if (
            !e.target.closest(".copy-button") &&
            !e.target.closest(".contributor-badge") &&
            !e.target.closest(".yaml-button")
          ) {
            showModal(title, content);
          }
        });

        const copyButton = card.querySelector(".copy-button");
        copyButton.addEventListener("click", async (e) => {
          e.stopPropagation();
          try {
            await navigator.clipboard.writeText(updatePromptPreview(content));
            copyButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            `;
            setTimeout(() => {
              copyButton.innerHTML = `
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

        promptsGrid.appendChild(card);
      });

      container.innerHTML = "";
      container.appendChild(promptsGrid);

      // Initialize modal event listeners
      initializeModalListeners();
    })
    .catch((error) => {
      console.error("Error loading prompts:", error);
    });
}

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
  const modalHTML = `
    <div class="modal-overlay" id="modalOverlay">
    <div class="modal">
        <div class="modal-header">
        <h2 class="modal-title"></h2>
        <div class="modal-actions">
            <button class="modal-copy-button" title="Copy prompt">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            </button>
            <button class="modal-close" title="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            </button>
        </div>
        </div>
        <div class="modal-content"></div>
        <div class="modal-footer">
        <div class="modal-footer-left">
            <a class="modal-contributor" target="_blank" rel="noopener"></a>
        </div>
        <div class="modal-footer-right">
            <button class="modal-chat-button" onclick="openModalChat()">
            <svg class="chat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <svg class="terminal-icon" style="display: none;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="4 17 10 11 4 5"></polyline>
                <line x1="12" y1="19" x2="20" y2="19"></line>
            </svg>
            Start Chat
            </button>
        </div>
        </div>
    </div>
    </div>
`;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
  initializeModalListeners();
}

// Modify the existing showModal function
function showModal(title, content) {
  let modalOverlay = document.getElementById("modalOverlay");
  if (!modalOverlay) {
    createModal();
    modalOverlay = document.getElementById("modalOverlay");
  }

  const modalTitle = modalOverlay.querySelector(".modal-title");
  const modalContent = modalOverlay.querySelector(".modal-content");

  // Extract variables from content
  const variables = extractVariables(content);

  // Create variable inputs container if variables exist
  if (variables.length > 0) {
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

  // Get language, tone and audience preferences
  const languageSelect = document.getElementById('languageSelect');
  const customLanguage = document.getElementById('customLanguage');
  const toneSelect = document.getElementById('toneSelect');
  const customTone = document.getElementById('customTone');
  const audienceSelect = document.getElementById('audienceSelect');

  const language = languageSelect.value === 'custom' ? customLanguage.value : languageSelect.value;
  const tone = toneSelect.value === 'custom' ? customTone.value : toneSelect.value;
  const audience = audienceSelect.value;

  // Append preferences as a new line
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

// Language and Tone Selection
function initializeLanguageAndTone() {
  const languageSelect = document.getElementById('languageSelect');
  const customLanguage = document.getElementById('customLanguage');
  const toneSelect = document.getElementById('toneSelect');
  const customTone = document.getElementById('customTone');

  // Load saved preferences
  const savedLanguage = localStorage.getItem('selected-language');
  const savedCustomLanguage = localStorage.getItem('custom-language');
  const savedTone = localStorage.getItem('selected-tone');
  const savedCustomTone = localStorage.getItem('custom-tone');

  if (savedLanguage) {
    languageSelect.value = savedLanguage;
    if (savedLanguage === 'custom' && savedCustomLanguage) {
      customLanguage.value = savedCustomLanguage;
      customLanguage.style.display = 'inline-block';
    }
  }

  if (savedTone) {
    toneSelect.value = savedTone;
    if (savedTone === 'custom' && savedCustomTone) {
      customTone.value = savedCustomTone;
      customTone.style.display = 'inline-block';
    }
  }

  // Language select handler
  languageSelect.addEventListener('change', (e) => {
    const isCustom = e.target.value === 'custom';
    customLanguage.style.display = isCustom ? 'inline-block' : 'none';
    localStorage.setItem('selected-language', e.target.value);
    
    if (!isCustom) {
      customLanguage.value = '';
      localStorage.removeItem('custom-language');
    }
  });

  // Custom language input handler
  customLanguage.addEventListener('input', (e) => {
    localStorage.setItem('custom-language', e.target.value);
  });

  // Tone select handler
  toneSelect.addEventListener('change', (e) => {
    const isCustom = e.target.value === 'custom';
    customTone.style.display = isCustom ? 'inline-block' : 'none';
    localStorage.setItem('selected-tone', e.target.value);
    
    if (!isCustom) {
      customTone.value = '';
      localStorage.removeItem('custom-tone');
    }
  });

  // Custom tone input handler
  customTone.addEventListener('input', (e) => {
    localStorage.setItem('custom-tone', e.target.value);
  });
}

// Function to show a modal with YAML format and GitHub create button
function showYamlModal(event, title, content) {
  event.stopPropagation();
  let modalOverlay = document.getElementById("yamlModalOverlay");
  if (!modalOverlay) {
    const modalHTML = `
      <div class="modal-overlay" id="yamlModalOverlay">
      <div class="modal">
          <div class="modal-header">
          <h2 class="modal-title">Prompt YAML</h2>
          <div class="modal-actions">
              <button class="modal-copy-button" title="Copy YAML">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              </button>
              <button class="modal-close" title="Close">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              </button>
          </div>
          </div>
          <div class="modal-content">
            <pre class="yaml-content"></pre>
          </div>
          <div class="modal-footer">
          <div class="modal-footer-left">
              <span class="modal-hint">You can create a new <code>.prompt.yml</code> file in your GitHub repository.</span>
          </div>
          <div class="modal-footer-right">
              <div class="github-form">
                <div class="github-inputs">
                  <input type="text" id="github-org" class="github-input" placeholder="Organization" value="">
                  <span>/</span>
                  <input type="text" id="github-repo" class="github-input" placeholder="Repository" value="">
                  <span>#</span>
                  <input type="text" id="github-branch" class="github-input" placeholder="Branch" value="main">
                </div>
                <button class="create-yaml-button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                Create .prompt.yml
                </button>
              </div>
          </div>
          </div>
      </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    modalOverlay = document.getElementById("yamlModalOverlay");
    
    // Add event listeners
    const modalClose = modalOverlay.querySelector(".modal-close");
    modalClose.addEventListener("click", () => {
      modalOverlay.style.display = "none";
      document.body.style.overflow = "";
      modalOverlay.remove();
    });
    
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.style.display = "none";
        document.body.style.overflow = "";
        modalOverlay.remove();
      }
    });
  }

  const yamlContent = modalOverlay.querySelector(".yaml-content");
  const modalCopyButton = modalOverlay.querySelector(".modal-copy-button");
  const createYamlButton = modalOverlay.querySelector(".create-yaml-button");
  
  // Create the YAML content
  const cleanTitle = decodeURIComponent(title).trim().replace(/^Act as a?n?\s*/ig, '');
  const cleanContent = decodeURIComponent(content).trim().replace(/\n+/g, ' ');
  
  // Convert variables from ${Variable: Default} format to {{Variable}} format
  const convertedContent = cleanContent.replace(/\${([^:}]+)(?::[^}]*)?}/g, (match, varName) => {
    return `{{${varName.trim()}}}`;
  });
  
  const yamlText = `name: ${cleanTitle}
model: gpt-4o-mini
modelParameters:
  temperature: 0.5
messages:
  - role: system
    content: | 
      ${convertedContent.replace(/\n/g, '\n      ')}`;
  
  // Apply basic syntax highlighting
  const highlightedYaml = yamlText
    .replace(/(name|model|modelParameters|temperature|messages|role|content):/g, '<span class="key">$1:</span>')
    .replace(/(gpt-4o-mini)/g, '<span class="string">$1</span>')
    .replace(/([0-9]\.?[0-9]*)/g, '<span class="number">$1</span>')
    .replace(/(true|false)/g, '<span class="boolean">$1</span>')
    .replace(/(\{\{[^}]+\}\})/g, '<span class="string">$1</span>'); // Highlight the new variable format
  
  yamlContent.innerHTML = highlightedYaml;
  
  // Add copy functionality - use the plain text version for clipboard
  modalCopyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(yamlText);
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
      alert("Failed to copy YAML to clipboard");
    }
  });
  
  // Add create functionality
  createYamlButton.addEventListener("click", () => {
    const orgName = document.getElementById('github-org').value.trim();
    const repoName = document.getElementById('github-repo').value.trim();
    const branchName = document.getElementById('github-branch').value.trim();
    const filename = cleanTitle.toLocaleLowerCase().replace(/\s+/g, '-') + '.prompt.yml';
    const encodedYaml = encodeURIComponent(yamlText);
    const githubUrl = `https://github.com/${orgName}/${repoName}/new/${branchName}?filename=${filename}&value=${encodedYaml}`;
    window.open(githubUrl, '_blank');
  });

  modalOverlay.style.display = "block";
  document.body.style.overflow = "hidden";
}
