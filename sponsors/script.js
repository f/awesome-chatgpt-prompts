// GitHub Sponsors Profile Improver Script

// Dark mode functionality (global scope for onclick handler)
window.toggleDarkMode = function() {
  const body = document.body;
  const toggle = document.querySelector(".dark-mode-toggle");
  const sunIcon = toggle.querySelector(".sun-icon");
  const moonIcon = toggle.querySelector(".moon-icon");

  body.classList.toggle("dark-mode");
  const isDarkMode = body.classList.contains("dark-mode");

  localStorage.setItem("dark-mode", isDarkMode);
  sunIcon.style.display = isDarkMode ? "none" : "block";
  moonIcon.style.display = isDarkMode ? "block" : "none";
};

(function() {
  let sponsorPrompts = [];

  // Load prompts from JSON file
  async function loadSponsorsPrompts() {
    try {
      const response = await fetch('/sponsors/prompts.json');
      sponsorPrompts = await response.json();
      renderSponsorsPrompts();
      renderSidebarPrompts();
    } catch (error) {
      console.error('Error loading prompts:', error);
      const container = document.querySelector('#promptContent');
      if (container) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">Error loading prompts. Please try again later.</p>';
      }
    }
  }

  // Copy prompt to clipboard
  window.copySponsorPrompt = function(button, promptText) {
    navigator.clipboard.writeText(promptText).then(() => {
      const originalHTML = button.innerHTML;
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
      button.style.background = '#10b981';
      
      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.style.background = '';
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }

  // Open prompt in GitHub Copilot
  window.openInCopilot = function(promptText) {
    const encodedPrompt = encodeURIComponent(promptText);
    const copilotUrl = `https://github.com/copilot?prompt=${encodedPrompt}`;
    window.open(copilotUrl, '_blank');
  }

  // Render prompts in the sidebar
  function renderSidebarPrompts() {
    const searchResults = document.getElementById('searchResults');
    if (searchResults && sponsorPrompts.length > 0) {
      searchResults.innerHTML = sponsorPrompts.map(prompt => `
        <li class="search-result-item" onclick="scrollToPrompt('${prompt.title.replace(/'/g, "\\'")}')">${prompt.title}</li>
      `).join('');
    }
  }

  // Scroll to prompt card function
  window.scrollToPrompt = function(title) {
    const cards = document.querySelectorAll('.prompt-card');
    const targetCard = Array.from(cards).find(card => {
      const cardTitle = card.querySelector('.prompt-title')?.textContent?.trim();
      return cardTitle && cardTitle.includes(title);
    });

    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetCard.style.transform = 'scale(1.02)';
      targetCard.style.boxShadow = '0 8px 16px rgba(16, 185, 129, 0.2)';
      targetCard.style.borderColor = '#10b981';
      
      setTimeout(() => {
        targetCard.style.transform = '';
        targetCard.style.boxShadow = '';
        targetCard.style.borderColor = '';
      }, 2000);
    }
  }

  // Render prompts in the main content area
  function renderSponsorsPrompts() {
    const container = document.querySelector('#promptContent');
    if (!container) return;
    
    let html = '<div class="prompts-grid">';
    
    // Add a contribute card first (matching main site style)
    html += `
      <div class="prompt-card contribute-card">
        <a href="https://github.com/f/awesome-chatgpt-prompts/blob/main/sponsors/prompts.json" target="_blank" style="text-decoration: none; color: inherit; height: 100%; display: flex; flex-direction: column;">
          <div class="prompt-title" style="display: flex; align-items: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            Add Your Sponsors Prompt
          </div>
          <p class="prompt-content" style="flex-grow: 1;">
            Have a great prompt for improving GitHub Sponsors profiles? Contribute to <code>sponsors/prompts.json</code> in our repository!
          </p>
          <span class="contributor-badge">Contribute Now</span>
        </a>
      </div>
    `;
    
    // Add all prompts
    sponsorPrompts.forEach(prompt => {
    html += `
      <div class="prompt-card">
        <div class="prompt-title">
          ${prompt.title}
          <div class="action-buttons">
            <button class="copy-button" title="Copy prompt" onclick="copySponsorPrompt(this, \`${prompt.prompt.replace(/`/g, '\\`')}\`)">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
            </button>
            <button class="copy-button" title="Try in GitHub Copilot" onclick="openInCopilot(\`${prompt.prompt.replace(/`/g, '\\`')}\`)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </button>
          </div>
        </div>
        <p class="prompt-content">${prompt.prompt}</p>
        <div class="card-footer">
          <div class="techstack-badges">
            ${prompt.tags.map(tag => `<span class="tech-badge">${tag}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  });
  
    html += '</div>';
    container.innerHTML = html;
    
    // Update prompt count
    const countElement = document.getElementById('promptCount');
    if (countElement) {
      const countNumber = countElement.querySelector('.count-number');
      if (countNumber) {
        countNumber.textContent = sponsorPrompts.length;
      }
    }
  }

  // Fetch GitHub stars
  async function fetchGitHubStars() {
    try {
      const response = await fetch('https://api.github.com/repos/f/awesome-chatgpt-prompts');
      const data = await response.json();
      const starCount = document.getElementById('starCount');
      if (starCount) {
        starCount.textContent = data.stargazers_count.toLocaleString();
      }
    } catch (error) {
      console.error('Error fetching GitHub stars:', error);
      const starCount = document.getElementById('starCount');
      if (starCount) {
        starCount.textContent = '110k+'; // Fallback value
      }
    }
  }

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the sponsors page
    if (document.body.classList.contains('sponsors')) {
      loadSponsorsPrompts();
      fetchGitHubStars();
      
      // Hide cursor badge on sponsors page
      const cursorLogo = document.querySelector('.cursor-logo');
      if (cursorLogo) {
        cursorLogo.style.display = 'none';
      }
      
      // Apply dark mode preference
      const isDarkMode = localStorage.getItem("dark-mode") === "true";
      if (isDarkMode) {
        document.body.classList.add("dark-mode");
        const sunIcon = document.querySelector(".sun-icon");
        const moonIcon = document.querySelector(".moon-icon");
        if (sunIcon) sunIcon.style.display = "none";
        if (moonIcon) moonIcon.style.display = "block";
      }
    }
  });
})();
