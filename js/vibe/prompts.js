// Render main prompts grid
function renderMainPrompts(prompts) {
  const container = document.querySelector('.prompts-grid');
  if (!container) return;

  container.innerHTML = '';

  // Add contribute card first
  const contributeCard = document.createElement('div');
  contributeCard.className = 'prompt-card contribute-card';
  contributeCard.innerHTML = renderVibeContributeCardHtml();
  container.appendChild(contributeCard);

  prompts.forEach((prompt, index) => {
    const card = document.createElement('div');
    card.className = 'prompt-card';
    card.dataset.index = index;
    
    const encodedPrompt = encodeURIComponent(prompt.prompt);
    
    card.innerHTML = renderVibeCardHtml({
      app: prompt.app,
      prompt: prompt.prompt,
      contributor: prompt.contributor || '@f',
      techstack: prompt.techstack || '',
      encodedPrompt
    });

    // Add click event for showing modal
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.copy-button') && !e.target.closest('.contributor-badge')) {
        showModal(prompt);
      }
    });

    container.appendChild(card);
  });

  updatePromptCount(prompts.length);
}

// Render sidebar prompts list
function renderSidebarPrompts(prompts) {
  const sidebar = document.querySelector('.sidebar-prompts');
  if (!sidebar) return;

  sidebar.innerHTML = '';

  prompts.forEach((prompt, index) => {
    const item = document.createElement('div');
    item.className = 'sidebar-prompt-item';
    item.dataset.index = index;
    item.textContent = prompt.app;
    
    item.addEventListener('click', () => {
      scrollToPrompt(index);
    });

    sidebar.appendChild(item);
  });
}

// Scroll to a specific prompt card
function scrollToPrompt(index) {
  const cards = document.querySelectorAll('.prompt-card:not(.contribute-card)');
  if (cards[index]) {
    cards[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    cards[index].classList.add('highlight');
    setTimeout(() => {
      cards[index].classList.remove('highlight');
    }, 2000);
  }
}

// Update prompt count display
function updatePromptCount(count) {
  const countElement = document.getElementById('promptCount');
  if (countElement) {
    countElement.textContent = count;
  }
}
