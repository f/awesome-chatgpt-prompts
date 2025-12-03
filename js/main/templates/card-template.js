// Template for rendering prompt card HTML
function renderPromptCardHtml({ title, content, contributor, encodedPrompt, promptType, isJsonPrompt }) {
  // Render content based on type
  let renderedContent;
  if (isJsonPrompt) {
    renderedContent = `<pre class="json-content">${formatJsonWithHighlighting(content)}</pre>`;
  } else {
    renderedContent = `<p class="prompt-content">${updatePromptPreview(content)}</p>`;
  }

  // JSON icon HTML - only show for JSON prompts
  const jsonIconHtml = isJsonPrompt ? `
      <span class="prompt-json-icon" title="JSON Prompt">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"></path>
              <path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1"></path>
          </svg>
      </span>
  ` : '';

  return `
  <div class="prompt-title">
      ${title}
      <div class="action-buttons">
      ${jsonIconHtml}
      <button class="chat-button" title="Open in AI Chat" onclick="openInChat(this, '${encodedPrompt}')">
          <svg class="chat-icon"xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
      <button class="copy-button" title="Copy prompt" onclick="copyPrompt(this, '${encodedPrompt}')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          </svg>
      </button>
      </div>
  </div>
  ${renderedContent}
  <a href="https://github.com/${contributor}" class="contributor-badge" target="_blank" rel="noopener">@${contributor}</a>
  `;
}

// Template for contribute card HTML
function renderContributeCardHtml() {
  return `
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
}
