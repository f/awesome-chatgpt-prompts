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
      document.getElementById("starCount").textContent = "129k+";
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

  // Initialize sidebar toggle
  initializeSidebarToggle();

  filterPrompts();
});
