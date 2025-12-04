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

// Open prompt in codename Goose
async function openInGoose(title, prompt, instructions, activities = undefined) {
  // Only generate if we have the required fields
  if (!title.trim() || !instructions.trim() || !instructions.trim()) {
    return '';
  }

  try {
    const recipeConfig = {
      version: "1.0.0",
      title,
      description: "[prompt.ng] Vibe",
      instructions,
      prompt: prompt.trim() || undefined,
      activities: activities.length > 0 ? activities : undefined
    };

    // Filter out undefined values
    Object.keys(recipeConfig).forEach(key => {
      if (recipeConfig[key] === undefined) {
        delete recipeConfig[key];
      }
    });

    // Use window.btoa for browser compatibility
    link = `goose://recipe?config=${window.btoa(JSON.stringify(recipeConfig))}`;

    window.open(link, "_blank");
  } catch (error) {
    console.error('Error generating recipe output:', error);
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

            <button class="modal-goose-button">
                <svg class="terminal-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <g clipPath="url(#clip0_2096_5193)">
                        <path 
                          d="M20.9093 19.3861L19.5185 18.2413C18.7624 17.619 18.1189 16.8713 17.6157 16.0313C16.9205 14.8706 15.9599 13.8912 14.8133 13.1735L14.2533 12.8475C14.0614 12.7141 13.9276 12.5062 13.9086 12.2716C13.8963 12.1204 13.9326 11.9852 14.0171 11.8662C14.3087 11.4553 15.896 9.74698 16.1722 9.51845C16.528 9.22442 16.9243 8.97987 17.2921 8.69986C17.3443 8.66 17.3968 8.62035 17.4485 8.57989C17.4503 8.57808 17.4529 8.57668 17.4545 8.57508C17.5725 8.48195 17.6838 8.383 17.7724 8.26563C18.2036 7.76631 18.195 7.3443 18.195 7.3443C18.195 7.3443 18.1954 7.3439 18.1956 7.3437C18.1497 7.23133 17.9847 6.88163 17.6492 6.71759C17.9458 6.71178 18.2805 6.82294 18.4323 6.97156C18.6148 6.68534 18.7328 6.49967 18.9162 6.18762C18.9599 6.11352 18.9831 5.97652 18.8996 5.89981C18.8996 5.89981 18.8992 5.89981 18.8988 5.89981C18.8988 5.89981 18.8988 5.8994 18.8988 5.899C18.8972 5.8974 18.8952 5.8962 18.8936 5.8946C18.892 5.893 18.891 5.89119 18.8892 5.88939C18.8892 5.88939 18.8888 5.88939 18.8884 5.88939C18.8884 5.88939 18.8884 5.88899 18.8884 5.88859C18.885 5.88518 18.8812 5.88258 18.8776 5.87938C18.8754 5.87717 18.8736 5.87457 18.8716 5.87217C18.8692 5.87016 18.8665 5.86836 18.8643 5.86616C18.8609 5.86275 18.8587 5.85855 18.8551 5.85534C18.8551 5.85534 18.8545 5.85514 18.8543 5.85534C18.8543 5.85534 18.8543 5.85494 18.8543 5.85454C18.8527 5.85294 18.8507 5.85174 18.8491 5.85013C18.8475 5.84853 18.8463 5.84653 18.8447 5.84493C18.8447 5.84493 18.8441 5.84473 18.8439 5.84493C18.8439 5.84493 18.8439 5.84453 18.8439 5.84413C18.7672 5.7606 18.6302 5.78384 18.5561 5.8275C18.1503 6.06625 17.7555 6.32322 17.3996 6.54855C17.3996 6.54855 16.9778 6.53973 16.4783 6.97116C16.3607 7.05989 16.2618 7.17125 16.1688 7.28902C16.167 7.29082 16.1654 7.29322 16.164 7.29503C16.1234 7.3465 16.0837 7.39898 16.0441 7.45145C15.7639 7.81939 15.5195 8.21556 15.2255 8.57128C14.9971 8.84768 13.2887 10.4348 12.8777 10.7264C12.7587 10.8109 12.6237 10.8474 12.4723 10.835C12.2379 10.8161 12.0298 10.6821 11.8965 10.4903L11.5704 9.93024C10.8527 8.78318 9.87332 7.82299 8.71264 7.12778C7.87262 6.62466 7.12514 5.98092 6.50264 5.22503L5.35778 3.83421C5.3013 3.76571 5.19314 3.77693 5.15268 3.85585C5.02249 4.10941 4.77393 4.64479 4.58346 5.36483C4.57885 5.38186 4.58286 5.39988 4.59407 5.4135C4.83082 5.69952 5.37901 6.32983 6.03196 6.863C6.07742 6.90005 6.04017 6.97336 5.98369 6.95774C5.42047 6.80432 4.87288 6.55796 4.46308 6.34805C4.42964 6.33103 4.38918 6.35226 4.38437 6.38951C4.32068 6.89985 4.30425 7.46027 4.37155 8.05112C4.37355 8.07035 4.38577 8.08697 4.4036 8.09479C4.87088 8.29808 5.61816 8.59311 6.40269 8.78078C6.45958 8.7944 6.45777 8.87632 6.40029 8.88733C5.78941 9.0023 5.14968 9.02794 4.62973 9.02113C4.59327 9.02073 4.56643 9.05518 4.57625 9.09023C4.6806 9.45896 4.822 9.8339 5.00847 10.2115C5.08559 10.3811 5.16951 10.5475 5.25944 10.7104C5.27486 10.7382 5.3047 10.7548 5.33655 10.7534C5.76577 10.7324 6.28452 10.6871 6.80608 10.595C6.89501 10.5794 6.94268 10.6964 6.86757 10.7466C6.51345 10.9834 6.13571 11.1873 5.7844 11.3551C5.73733 11.3777 5.72211 11.4378 5.75315 11.4797C5.96186 11.7625 6.19139 12.0301 6.44075 12.2794C6.44075 12.2794 7.66853 13.5441 7.70198 13.6432C8.41841 12.9096 9.59612 12.0964 10.8966 11.3864C9.15488 12.8036 8.18387 13.8499 7.69517 14.4444L7.35447 14.9225C7.17742 15.1708 7.02379 15.4346 6.89541 15.7112C6.46579 16.6356 5.75756 18.5051 5.75756 18.5051C5.70328 18.6515 5.74754 18.7959 5.84168 18.89C5.84388 18.8922 5.84609 18.8944 5.84849 18.8964C5.85069 18.8986 5.8527 18.901 5.8549 18.9032C5.94924 18.9976 6.09345 19.0416 6.23986 18.9874C6.23986 18.9874 8.10897 18.2791 9.03371 17.8495C9.31031 17.7211 9.57429 17.5673 9.82245 17.3905L10.349 17.0153C10.6278 16.8166 11.0096 16.8483 11.2517 17.0904L12.4655 18.3042C12.7148 18.5535 12.9824 18.7831 13.2652 18.9918C13.3073 19.0226 13.3672 19.0076 13.3898 18.9605C13.5579 18.6094 13.7618 18.2313 13.9983 17.8774C14.0486 17.8022 14.1657 17.8501 14.1499 17.9388C14.0576 18.4606 14.0127 18.9794 13.9915 19.4084C13.9899 19.44 14.0067 19.4701 14.0345 19.4855C14.1972 19.5756 14.3636 19.6595 14.5335 19.7364C14.911 19.9229 15.2862 20.0645 15.6547 20.1687C15.6897 20.1785 15.7242 20.1516 15.7238 20.1152C15.7168 19.595 15.7424 18.9553 15.8576 18.3446C15.8684 18.2869 15.9503 18.2851 15.9641 18.3422C16.1516 19.127 16.4466 19.8742 16.6501 20.3413C16.6579 20.3591 16.6744 20.3712 16.6938 20.3734C17.2847 20.4407 17.8451 20.4242 18.3554 20.3606C18.3929 20.3559 18.4141 20.3155 18.3969 20.2818C18.187 19.872 17.9406 19.3241 17.7872 18.7612C17.7718 18.7046 17.8449 18.6675 17.8819 18.713C18.4151 19.3659 19.0454 19.9141 19.3314 20.1508C19.345 20.1621 19.3633 20.1659 19.3801 20.1615C20.1003 19.9712 20.6357 19.7226 20.8891 19.5922C20.968 19.5518 20.9792 19.4436 20.9107 19.3871L20.9093 19.3861Z"
                          fill="currentColor"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_2096_5193">
                          <rect width="24" height="24" fill="white" />
                        </clipPath>
                      </defs>
                </svg>
                Run with codename Goose
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

    // Add project Goose functionality
    const modalGooseButton = modalOverlay.querySelectorAll('.modal-goose-button');
    modalGooseButton.forEach(button => {
      button.addEventListener('click', () => {
        instructions = "You are a vibe coding agent for " + contributor + "and are ready for their request";
        openInGoose(app, prompt, instructions, ["prompts.ng"]);
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
