// Function to show a modal with YAML format and GitHub create button
function showYamlModal(event, title, content) {
  event.stopPropagation();
  let modalOverlay = document.getElementById("yamlModalOverlay");
  if (!modalOverlay) {
    const modalHTML = renderYamlModalHtml();
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    modalOverlay = document.getElementById("yamlModalOverlay");

    // Add event listeners
    const modalClose = modalOverlay.querySelector(".modal-close");
    modalClose.addEventListener("click", () => {
      modalOverlay.style.display = "none";
      document.body.style.overflow = "";
      modalOverlay.remove();
    });

    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.style.display = "none";
        document.body.style.overflow = "";
        modalOverlay.remove();
      }
    });
  }

  const decodedTitle = decodeURIComponent(title);
  const decodedContent = decodeURIComponent(content);

  // Convert to YAML format
  const convertedContent = decodedContent
    .replace(/\n/g, "\n    ")
    .replace(/"/g, '\\"');

  const yamlText = `name: "Add ${decodedTitle} Prompt"
about: "Add a new prompt to the collection"
title: "${decodedTitle}"
body:
  - type: textarea
    attributes:
      label: "Prompt"
      value: |
    ${convertedContent}`;

  // Apply YAML syntax highlighting
  const highlightedYaml = yamlText
    .replace(/^(\s*)([\w-]+):/gm, '$1<span class="yaml-key">$2</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="yaml-string">"$1"</span>')
    .replace(/: \|/g, ': <span class="yaml-pipe">|</span>')
    .replace(/^(\s+)([^<\s].*)/gm, '$1<span class="yaml-value">$2</span>');

  const yamlPre = modalOverlay.querySelector(".yaml-pre");
  yamlPre.innerHTML = highlightedYaml;

  // Add copy functionality
  const modalCopyButton = modalOverlay.querySelector(".modal-copy-button");
  modalCopyButton.onclick = async () => {
    try {
      await navigator.clipboard.writeText(yamlText);
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
      console.error("Failed to copy YAML:", err);
    }
  };

  // Update GitHub button link
  const githubButton = modalOverlay.querySelector(".modal-github-button");
  const issueBody = encodeURIComponent(
    `## Prompt Title\n${decodedTitle}\n\n## Prompt Content\n${decodedContent}`
  );
  githubButton.href = `https://github.com/f/awesome-chatgpt-prompts/issues/new?title=${encodeURIComponent(
    `Add: ${decodedTitle}`
  )}&body=${issueBody}`;

  modalOverlay.style.display = "block";
  document.body.style.overflow = "hidden";
}
