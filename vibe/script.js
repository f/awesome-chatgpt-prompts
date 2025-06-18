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
        if (header === "app") {
          value = value.replace(/`/g, "");
        }
        entry[header] = value;
      });

      return entry;
    })
    .filter((entry) => entry.app && entry.prompt);
}

// Load prompts from CSV
async function loadPrompts() {
  const response = await fetch('/vibeprompts.csv');
  const text = await response.text();
  return parseCSV(text);
}

// Update prompt count
function updatePromptCount(filteredCount, totalCount) {
  const countElement = document.getElementById('promptCount');
  const countNumber = countElement.getElementsByClassName('count-number')[0];
  if (countElement) {
    countNumber.textContent = `${filteredCount}`;
  }
}

// Render prompts in the main content area
async function renderMainPrompts() {
  const prompts = await loadPrompts();
  const container = document.querySelector('#promptContent');
  if (container) {
    container.innerHTML = `<div class="prompts-grid">
      <div class="prompt-card contribute-card">
        <a href="https://github.com/f/awesome-chatgpt-prompts/pulls" target="_blank" style="text-decoration: none; color: inherit; height: 100%; display: flex; flex-direction: column;">
          <div class="prompt-title" style="display: flex; align-items: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            Add Your Vibe Prompt
          </div>
          <p class="prompt-content" style="flex-grow: 1;">
            Share your vibe prompts with the community! Submit a pull request to add your prompts to the collection.
          </p>
          <span class="contributor-badge">Contribute Now</span>
        </a>
      </div>
      ${prompts.map(({ app, prompt, contributor, techstack }) => `
        <div class="prompt-card">
          <div class="prompt-title">
            ${app}
            <div class="action-buttons">
              <button class="copy-button" title="Copy prompt" onclick="copyPrompt(this, '${encodeURIComponent(prompt)}')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
              </button>
            </div>
          </div>
          <p class="prompt-content">${prompt.replace(/\\n/g, '<br>')}</p>
          <div class="card-footer">
            <div class="techstack-badges">
              ${techstack.split(',').map(tech => `<span class="tech-badge">${tech.trim()}</span>`).join('')}
            </div>
            <a href="https://github.com/${contributor.replace('@', '')}" class="contributor-badge" target="_blank" rel="noopener">${contributor}</a>
          </div>
        </div>
      `).join('')}</div>`;

    // Add click handlers for modal
    const cards = container.querySelectorAll('.prompt-card:not(.contribute-card)');
    cards.forEach((card, index) => {
      card.addEventListener('click', (e) => {
        // Don't open modal if clicking on buttons or links
        if (!e.target.closest('.copy-button') && !e.target.closest('.contributor-badge')) {
          const promptData = prompts[index];
          showModal(promptData.app, promptData.prompt, promptData.contributor);
        }
      });
    });
  }
  updatePromptCount(prompts.length, prompts.length);
}

// Render prompts in the sidebar
async function renderSidebarPrompts() {
  const prompts = await loadPrompts();
  const searchResults = document.getElementById('searchResults');
  if (searchResults) {
    searchResults.innerHTML = prompts.map(({ app }) => `
      <li class="search-result-item" onclick="scrollToPrompt('${app}')">${app}</li>
    `).join('');
  }
}

// Scroll to prompt card function
function scrollToPrompt(title, prompt) {
  // Find the prompt card with matching title
  const cards = document.querySelectorAll('.prompt-card');
  const targetCard = Array.from(cards).find(card => {
    const cardTitle = card.querySelector('.prompt-title').textContent
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[\n\r]/g, '') // Remove newlines
      .trim();

    const searchTitle = title
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[\n\r]/g, '') // Remove newlines
      .trim();

    return cardTitle.toLowerCase().includes(searchTitle.toLowerCase()) ||
           searchTitle.toLowerCase().includes(cardTitle.toLowerCase());
  });

  if (targetCard) {
    // Remove highlight from all cards
    cards.forEach(card => {
      card.style.transition = 'all 0.3s ease';
      card.style.transform = 'none';
      card.style.boxShadow = 'none';
      card.style.borderColor = '';
    });

    // Different scroll behavior for mobile and desktop
    const isMobile = window.innerWidth <= 768;
    const headerHeight = document.querySelector('.site-header').offsetHeight;

    if (isMobile) {
      // On mobile, scroll the window
      const cardRect = targetCard.getBoundingClientRect();
      const scrollTop = window.pageYOffset + cardRect.top - headerHeight - 20;

      window.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    } else {
      // On desktop, scroll the main-content container
      const mainContent = document.querySelector('.main-content');
      const cardRect = targetCard.getBoundingClientRect();
      const scrollTop = mainContent.scrollTop + cardRect.top - headerHeight - 20;

      mainContent.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }

    // Add highlight effect after scrolling completes
    setTimeout(() => {
      targetCard.style.transform = 'scale(1.02)';
      targetCard.style.boxShadow = '0 0 0 2px var(--accent-color)';
      targetCard.style.borderColor = 'var(--accent-color)';

      // Remove highlight after animation
      setTimeout(() => {
        targetCard.style.transform = 'none';
        targetCard.style.boxShadow = 'none';
        targetCard.style.borderColor = '';
      }, 2000);
    }, 500); // Wait for scroll to complete
  }
}

// Search functionality
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  if (searchInput && searchResults) {
    searchInput.addEventListener('input', async (e) => {
      const query = e.target.value.toLowerCase();
      const prompts = await loadPrompts();
      const filtered = prompts.filter(({ app, prompt }) => 
        app.toLowerCase().includes(query) || prompt.toLowerCase().includes(query)
      );

      // Update prompt count
      updatePromptCount(filtered.length, prompts.length);

      // Show filtered results
      if (window.innerWidth <= 768 && !query.trim()) {
        searchResults.innerHTML = ''; // Clear results on mobile if no search query
      } else {
        searchResults.innerHTML = filtered.length === 0 
          ? `<div class="search-result-item add-prompt">
              <a href="https://github.com/f/awesome-chatgpt-prompts/pulls" target="_blank" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                Add this prompt
              </a>
            </div>`
          : filtered.map(({ app, prompt }) => `
              <li class="search-result-item" onclick="scrollToPrompt('${app}', '${prompt}')">
                ${app}
              </li>
            `).join('');
      }
    });
  }
}

// Fetch GitHub stars
async function fetchGitHubStars() {
  try {
    const response = await fetch("https://api.github.com/repos/f/awesome-chatgpt-prompts");
    const data = await response.json();
    const stars = data.stargazers_count;
    const starCount = document.getElementById("starCount");
    if (starCount) {
      starCount.textContent = stars.toLocaleString();
    }
  } catch (error) {
    console.error("Error fetching star count:", error);
    const starCount = document.getElementById("starCount");
    if (starCount) {
      starCount.textContent = "129k+";
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  renderMainPrompts();
  renderSidebarPrompts();
  setupSearch();
  fetchGitHubStars();
});

// Dark mode toggle
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('dark-mode', isDark);
}

// Initialize dark mode from localStorage
const savedDarkMode = localStorage.getItem('dark-mode') === 'true';
if (savedDarkMode) {
  document.body.classList.add('dark-mode');
}

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
    console.error("Failed to copy text: ", err);
  }
}

// Open prompt in AI chat
function openInChat(button, encodedPrompt) {
  const promptText = decodeURIComponent(encodedPrompt);
  const platform = document.querySelector(".platform-tag.active");

  if (!platform) return;

  const baseUrl = platform.dataset.url;
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

// Add modal functionality
function showModal(app, prompt, contributor) {
  let modalOverlay = document.getElementById('modalOverlay');
  if (!modalOverlay) {
    // Create modal if it doesn't exist
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
          <div class="modal-content">
            <div class="modal-hint">
              Copy and paste this onto <a href="https://code.visualstudio.com/docs/copilot/overview" target="_blank">VSCode Copilot</a>, 
              <a href="https://codeium.com/windsurf" target="_blank">Windsurf</a> or 
              <a href="https://cursor.com" target="_blank">Cursor</a>
            </div>
            <div class="content-well">
              <pre><code></code></pre>
            </div>
          </div>
          <div class="modal-footer">
            <div class="modal-footer-left">
              <a class="modal-contributor" target="_blank" rel="noopener"></a>
            </div>
            <div class="modal-footer-right">
            <button class="modal-chat-button">
                <svg class="terminal-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="4 17 10 11 4 5"></polyline>
                    <line x1="12" y1="19" x2="20" y2="19"></line>
                </svg>
                Run on AI IDE
                </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    modalOverlay = document.getElementById('modalOverlay');

    // Add event listeners
    const modalClose = modalOverlay.querySelector('.modal-close');
    modalClose.addEventListener('click', hideModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        hideModal();
      }
    });

    // Add copy functionality
    const modalCopyButton = modalOverlay.querySelectorAll('.modal-copy-button, .modal-chat-button');
    modalCopyButton.forEach(button => {
      button.addEventListener('click', () => {
        // TODO: Add open in chat functionality
        copyPrompt(button, encodeURIComponent(prompt));
        if (button.classList.contains('modal-chat-button')) {
          alert('Now you can paste the prompt into your AI IDE, deeplinks to AI IDEs are coming soon (I hope)! — IDE devs, please DM me!');
        }
      });
    });
  }

  const modalTitle = modalOverlay.querySelector('.modal-title');
  const modalCode = modalOverlay.querySelector('.modal-content code');
  const modalContributor = modalOverlay.querySelector('.modal-contributor');

  modalTitle.textContent = app;
  modalCode.innerHTML = prompt.replace(/\\n/g, '<br>');
  if (contributor) {
    modalContributor.href = `https://github.com/${contributor.replace('@', '')}`;
    modalContributor.textContent = `Contributed by ${contributor}`;
  }

  modalOverlay.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function hideModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  if (!modalOverlay) return;

  modalOverlay.style.display = 'none';
  document.body.style.overflow = '';
}

// Add global event listener for Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    hideModal();
  }
});
