// Shared utility functions used across multiple pages

// Dark mode functionality
function toggleDarkMode() {
  const body = document.body;
  const toggle = document.querySelector(".dark-mode-toggle");
  
  // Handle case where toggle doesn't exist
  if (!toggle) {
    body.classList.toggle("dark-mode");
    const isDarkMode = body.classList.contains("dark-mode");
    localStorage.setItem("dark-mode", isDarkMode);
    return;
  }
  
  const sunIcon = toggle.querySelector(".sun-icon");
  const moonIcon = toggle.querySelector(".moon-icon");

  body.classList.toggle("dark-mode");
  const isDarkMode = body.classList.contains("dark-mode");

  localStorage.setItem("dark-mode", isDarkMode);
  sunIcon.style.display = isDarkMode ? "none" : "block";
  moonIcon.style.display = isDarkMode ? "block" : "none";
}

// Parse CSV data into objects
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
        // Remove backticks from the act/title/app
        if (header === "act" || header === "app") {
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
    .filter((entry) => (entry.act || entry.app) && entry.prompt);
}

// Normalize text by removing extra whitespace and newlines
function normalizeText(text) {
  if (!text) return "";
  return text
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/[\n\r]/g, "") // Remove newlines
    .trim();
}

// Scroll to a prompt card with highlight animation
// Note: offset is set to -50 for consistent spacing across all pages
function scrollToPromptCard(targetCard, isMobile, headerHeight) {
  if (!targetCard) return;

  // Remove highlight from all cards
  const cards = document.querySelectorAll(".prompt-card");
  cards.forEach((card) => {
    card.style.transition = "all 0.3s ease";
    card.style.transform = "none";
    card.style.boxShadow = "none";
    card.style.borderColor = "";
  });

  // Different scroll behavior for mobile and desktop
  if (isMobile) {
    // On mobile, scroll the window
    const cardRect = targetCard.getBoundingClientRect();
    const scrollTop = window.pageYOffset + cardRect.top - headerHeight - 50;

    window.scrollTo({
      top: scrollTop,
      behavior: "smooth",
    });
  } else {
    // On desktop, scroll the main-content container
    const mainContent = document.querySelector(".main-content");
    if (!mainContent) {
      // Fallback to window scroll if main-content doesn't exist
      const cardRect = targetCard.getBoundingClientRect();
      const scrollTop = window.pageYOffset + cardRect.top - headerHeight - 50;
      window.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });
      return;
    }
    
    const cardRect = targetCard.getBoundingClientRect();
    const scrollTop = mainContent.scrollTop + cardRect.top - headerHeight - 50;

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
}

// Find prompt card by title with fuzzy matching
function findPromptCardByTitle(title) {
  const cards = document.querySelectorAll(".prompt-card");
  const normalizedSearchTitle = normalizeText(title);

  return Array.from(cards).find((card) => {
    const titleElement = card.querySelector(".prompt-title");
    if (!titleElement) return false;

    const cardTitle = normalizeText(titleElement.textContent);
    return (
      cardTitle.toLowerCase().includes(normalizedSearchTitle.toLowerCase()) ||
      normalizedSearchTitle.toLowerCase().includes(cardTitle.toLowerCase())
    );
  });
}
