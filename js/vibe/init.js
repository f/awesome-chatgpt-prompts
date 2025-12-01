// Initialize vibe page
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize dark mode
  const isDarkMode = localStorage.getItem('dark-mode');
  const toggle = document.querySelector('.dark-mode-toggle');
  
  if (toggle) {
    const sunIcon = toggle.querySelector('.sun-icon');
    const moonIcon = toggle.querySelector('.moon-icon');

    // Set dark mode by default if not set
    if (isDarkMode === null) {
      localStorage.setItem('dark-mode', 'true');
      document.body.classList.add('dark-mode');
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
    } else if (isDarkMode === 'true') {
      document.body.classList.add('dark-mode');
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
    } else {
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
    }
  }

  // Fetch GitHub stars
  try {
    const response = await fetch('https://api.github.com/repos/f/awesome-chatgpt-prompts');
    const data = await response.json();
    const starCount = document.getElementById('starCount');
    if (starCount) {
      starCount.textContent = data.stargazers_count.toLocaleString();
    }
  } catch (error) {
    console.error('Error fetching star count:', error);
    const starCount = document.getElementById('starCount');
    if (starCount) {
      starCount.textContent = '129k+';
    }
  }

  // Load and render prompts
  try {
    const prompts = await loadPrompts();
    renderMainPrompts(prompts);
    renderSidebarPrompts(prompts);
    setupSearch(prompts);
  } catch (error) {
    console.error('Error loading prompts:', error);
  }
});
