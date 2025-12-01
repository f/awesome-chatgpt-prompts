// Show modal with prompt details
function showModal(prompt) {
  let modalOverlay = document.getElementById('vibeModalOverlay');
  
  if (!modalOverlay) {
    const modalHTML = `
      <div class="modal-overlay" id="vibeModalOverlay">
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
              <div class="techstack-badges"></div>
            </div>
            <div class="modal-footer-right">
              <a class="modal-contributor" target="_blank" rel="noopener"></a>
              <button class="modal-chat-button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Open in Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    modalOverlay = document.getElementById('vibeModalOverlay');

    // Add event listeners
    const modalClose = modalOverlay.querySelector('.modal-close');
    modalClose.addEventListener('click', hideModal);
    
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        hideModal();
      }
    });

    // Escape key handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideModal();
      }
    });
  }

  const modalTitle = modalOverlay.querySelector('.modal-title');
  const modalContent = modalOverlay.querySelector('.modal-content');
  const modalCopyButton = modalOverlay.querySelector('.modal-copy-button');
  const modalContributor = modalOverlay.querySelector('.modal-contributor');
  const modalChatButton = modalOverlay.querySelector('.modal-chat-button');
  const techstackBadges = modalOverlay.querySelector('.techstack-badges');

  modalTitle.textContent = prompt.app;
  modalContent.innerHTML = `<p>${prompt.prompt.replace(/\\n/g, '<br>')}</p>`;
  
  // Set contributor
  const contributor = prompt.contributor || '@f';
  modalContributor.href = `https://github.com/${contributor.replace('@', '')}`;
  modalContributor.textContent = contributor;

  // Set techstack badges
  if (prompt.techstack) {
    techstackBadges.innerHTML = prompt.techstack.split(',').map(tech => 
      `<span class="tech-badge">${tech.trim()}</span>`
    ).join('');
  } else {
    techstackBadges.innerHTML = '';
  }

  // Copy button handler
  modalCopyButton.onclick = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
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
      console.error('Failed to copy:', err);
    }
  };

  // Chat button handler
  modalChatButton.onclick = () => {
    openInChat(null, encodeURIComponent(prompt.prompt));
  };

  modalOverlay.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

// Hide modal
function hideModal() {
  const modalOverlay = document.getElementById('vibeModalOverlay');
  if (modalOverlay) {
    modalOverlay.style.display = 'none';
    document.body.style.overflow = '';
  }
}
