// Template for rendering vibe prompt card HTML
function renderVibeCardHtml({ app, prompt, contributor, techstack, encodedPrompt }) {
  return `
    <div class="prompt-title">
      ${app}
      <div class="action-buttons">
        <button class="copy-button" title="Copy prompt" onclick="copyPrompt(this, '${encodedPrompt}')">
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
  `;
}

// Template for vibe contribute card HTML
function renderVibeContributeCardHtml() {
  return `
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
  `;
}
