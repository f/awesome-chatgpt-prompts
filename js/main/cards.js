// Update the modal initialization and event listeners
function createPromptCards() {
  const container = document.querySelector(".container-lg.markdown-body");
  const promptsGrid = document.createElement("div");
  promptsGrid.className = "prompts-grid";

  // Add contribute box
  const contributeCard = document.createElement("div");
  contributeCard.className = "prompt-card contribute-card";
  contributeCard.innerHTML = renderContributeCardHtml();
  promptsGrid.appendChild(contributeCard);

  // Fetch prompts.csv to get for_devs information
  fetch("/prompts.csv")
    .then((response) => response.text())
    .then((csvText) => {
      const prompts = parseCSV(csvText);
      const isDevMode = document.getElementById("audienceSelect").value === "developers";

      const promptElements = document.querySelectorAll(
        "h2[id^=act] + p + blockquote"
      );

      promptElements.forEach((blockquote) => {
        const title =
          blockquote.previousElementSibling.previousElementSibling.textContent.trim();
        const content = blockquote.textContent.trim();

        // Find matching prompt in CSV
        const matchingPrompt = prompts.find((p) => {
          const csvTitle = p.act
            .replace(/\s+/g, " ")
            .replace(/[\n\r]/g, "")
            .trim();
          const elementTitle = title
            .replace(/\s+/g, " ")
            .replace(/[\n\r]/g, "")
            .trim();
          return (
            csvTitle.toLowerCase() === elementTitle.toLowerCase() ||
            csvTitle.toLowerCase().includes(elementTitle.toLowerCase()) ||
            elementTitle.toLowerCase().includes(csvTitle.toLowerCase())
          );
        });

        // Extract contributor from the paragraph element
        const contributorParagraph = blockquote.previousElementSibling;
        const contributorText = contributorParagraph.textContent;
        let contributor = null;

        // Try different contributor formats
        const formats = [
          /Contributed by: \[([^\]]+)\]/i,
          /Contributed by \[([^\]]+)\]/i,
          /Contributed by: @([^\s]+)/i,
          /Contributed by @([^\s]+)/i,
          /Contributed by: \[@([^\]]+)\]/i,
          /Contributed by \[@([^\]]+)\]/i,
        ];

        for (const format of formats) {
          const match = contributorText.match(format);
          if (match) {
            contributor = match[1];
            // Remove @ if it exists at the start
            contributor = contributor.replace(/^@/, "");
            break;
          }
        }

        // Set default contributor to 'f' if none found
        if (!contributor) {
          contributor = "f";
        }

        const card = document.createElement("div");
        card.className = "prompt-card";

        // Set initial visibility based on dev mode
        if (isDevMode && (!matchingPrompt || !matchingPrompt.for_devs)) {
          card.style.display = "none";
        }

        // Determine prompt type from CSV data
        const promptType = matchingPrompt && matchingPrompt.type ? matchingPrompt.type : 'TEXT';
        const isJsonPrompt = promptType === 'JSON';
        
        // Get encoded prompt for buttons
        const encodedPrompt = encodeURIComponent(
          isJsonPrompt ? content.trim() : updatePromptPreview(content.trim())
        );

        // Use template to render card HTML
        card.innerHTML = renderPromptCardHtml({
          title,
          content,
          contributor,
          encodedPrompt,
          promptType,
          isJsonPrompt
        });

        // Add click event for showing modal
        card.addEventListener("click", (e) => {
          if (
            !e.target.closest(".copy-button") &&
            !e.target.closest(".contributor-badge") &&
            !e.target.closest(".yaml-button")
          ) {
            showModal(title, content, promptType);
          }
        });

        promptsGrid.appendChild(card);
      });

      container.innerHTML = "";
      container.appendChild(promptsGrid);

      // Initialize modal event listeners
      initializeModalListeners();
    })
    .catch((error) => {
      console.error("Error loading prompts:", error);
    });
}
