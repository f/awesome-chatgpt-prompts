// Search functionality
async function initializeSearch() {
  try {
    const response = await fetch("/prompts.csv");
    const csvText = await response.text();
    const prompts = parseCSV(csvText);

    // Sort prompts alphabetically by act
    prompts.sort((a, b) => a.act.localeCompare(b.act));

    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");
    const promptCount = document.getElementById("promptCount");
    const isDevMode = document.getElementById("audienceSelect").value === "developers";

    // Update prompt count
    const totalPrompts = isDevMode
      ? prompts.filter((p) => p.for_devs === true).length
      : prompts.length;
    updatePromptCount(totalPrompts, totalPrompts);

    // Show filtered prompts initially
    const filteredPrompts = isDevMode
      ? prompts.filter((p) => p.for_devs === true)
      : prompts;
    displaySearchResults(filteredPrompts);

    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const isDevMode = document.getElementById("audienceSelect").value === "developers";

      const filteredPrompts = prompts.filter((prompt) => {
        const matchesSearch =
          prompt.act.toLowerCase().includes(searchTerm) ||
          prompt.prompt.toLowerCase().includes(searchTerm);

        return isDevMode
          ? matchesSearch && prompt.for_devs === true
          : matchesSearch;
      });

      // Update count with filtered results
      const totalPrompts = isDevMode
        ? prompts.filter((p) => p.for_devs === true).length
        : prompts.length;
      updatePromptCount(filteredPrompts.length, totalPrompts);
      displaySearchResults(filteredPrompts);
    });
  } catch (error) {
    console.error("Error loading prompts:", error);
  }
}

function updatePromptCount(filteredCount, totalCount) {
  const promptCount = document.getElementById("promptCount");
  const countLabel = promptCount.querySelector(".count-label");
  const countNumber = promptCount.querySelector(".count-number");

  if (filteredCount === totalCount) {
    promptCount.classList.remove("filtered");
    countLabel.textContent = "All Prompts";
    countNumber.textContent = totalCount;
  } else {
    promptCount.classList.add("filtered");
    countLabel.textContent = `Found ${filteredCount} of ${totalCount}`;
    countNumber.textContent = filteredCount;
  }
}

function displaySearchResults(results) {
  const searchResults = document.getElementById("searchResults");
  const searchInput = document.getElementById("searchInput");
  const isDevMode = document.getElementById("audienceSelect").value === "developers";

  // Filter results based on dev mode
  if (isDevMode) {
    results = results.filter((result) => result.for_devs === true);
  }

  searchResults.innerHTML = "";

  if (window.innerWidth <= 768 && !searchInput.value.trim()) {
    return;
  }

  if (results.length === 0) {
    const li = document.createElement("li");
    li.className = "search-result-item add-prompt";
    li.innerHTML = `
    <a href="https://github.com/f/awesome-chatgpt-prompts/pulls" target="_blank" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        Add this prompt
    </a>
    `;
    searchResults.appendChild(li);
    return;
  }

  results.forEach((result) => {
    const li = document.createElement("li");
    li.className = "search-result-item";
    li.textContent = result.act;
    li.addEventListener("click", () => {
      // Find the prompt card with matching title
      const cards = document.querySelectorAll(".prompt-card");
      const targetCard = Array.from(cards).find((card) => {
        const cardTitle = card
          .querySelector(".prompt-title")
          .textContent.replace(/\s+/g, " ") // Normalize whitespace
          .replace(/[\n\r]/g, "") // Remove newlines
          .trim();

        const searchTitle = result.act
          .replace(/\s+/g, " ") // Normalize whitespace
          .replace(/[\n\r]/g, "") // Remove newlines
          .trim();

        return (
          cardTitle.toLowerCase().includes(searchTitle.toLowerCase()) ||
          searchTitle.toLowerCase().includes(cardTitle.toLowerCase())
        );
      });

      if (targetCard) {
        // Remove highlight from all cards
        cards.forEach((card) => {
          card.style.transition = "all 0.3s ease";
          card.style.transform = "none";
          card.style.boxShadow = "none";
          card.style.borderColor = "";
        });

        // Different scroll behavior for mobile and desktop
        const isMobile = window.innerWidth <= 768;
        const headerHeight =
          document.querySelector(".site-header").offsetHeight;

        if (isMobile) {
          // On mobile, scroll the window
          const cardRect = targetCard.getBoundingClientRect();
          const scrollTop =
            window.pageYOffset + cardRect.top - headerHeight - 50;

          window.scrollTo({
            top: scrollTop,
            behavior: "smooth",
          });
        } else {
          // On desktop, scroll the main-content container
          const mainContent = document.querySelector(".main-content");
          const cardRect = targetCard.getBoundingClientRect();
          const scrollTop =
            mainContent.scrollTop + cardRect.top - headerHeight - 50;

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
      } else {
        console.log("Card not found for:", result.act);
      }
    });
    searchResults.appendChild(li);
  });
}

// Function to filter prompts based on dev mode
function filterPrompts() {
  const isDevMode = document.getElementById("audienceSelect").value === "developers";
  const searchInput = document.getElementById("searchInput");
  const searchTerm = searchInput.value.toLowerCase();

  // Re-fetch and filter prompts
  fetch("/prompts.csv")
    .then((response) => response.text())
    .then((csvText) => {
      const prompts = parseCSV(csvText);
      const filteredPrompts = prompts.filter((prompt) => {
        const matchesSearch =
          !searchTerm ||
          prompt.act.toLowerCase().includes(searchTerm) ||
          prompt.prompt.toLowerCase().includes(searchTerm);

        return isDevMode
          ? matchesSearch && prompt.for_devs === true
          : matchesSearch;
      });

      // Update count with filtered results
      updatePromptCount(
        filteredPrompts.length,
        isDevMode
          ? prompts.filter((p) => p.for_devs === true).length
          : prompts.length
      );
      displaySearchResults(filteredPrompts);

      // Update prompt cards visibility
      const promptsGrid = document.querySelector(".prompts-grid");
      if (promptsGrid) {
        const cards = promptsGrid.querySelectorAll(
          ".prompt-card:not(.contribute-card)"
        );
        cards.forEach((card) => {
          const title = card.querySelector(".prompt-title").textContent.trim();
          const matchingPrompt = prompts.find((p) => {
            const pTitle = p.act
              .replace(/\s+/g, " ")
              .replace(/[\n\r]/g, "")
              .trim();
            const cardTitle = title
              .replace(/\s+/g, " ")
              .replace(/[\n\r]/g, "")
              .trim();
            return (
              pTitle.toLowerCase() === cardTitle.toLowerCase() ||
              pTitle.toLowerCase().includes(cardTitle.toLowerCase()) ||
              cardTitle.toLowerCase().includes(pTitle.toLowerCase())
            );
          });

          // Show card if not in dev mode or if it's a dev prompt in dev mode
          card.style.display =
            !isDevMode || (matchingPrompt && matchingPrompt.for_devs === true)
              ? ""
              : "none";
        });
      }
    });
}
