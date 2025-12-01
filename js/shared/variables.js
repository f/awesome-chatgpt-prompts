function extractVariables(text) {
  const variables = [];
  
  // Extract ${var:default} format variables
  const regex1 = /\${([^}]+)}/g;
  let match;
  while ((match = regex1.exec(text)) !== null) {
    const [variable, defaultValue] = match[1].split(":").map((s) => s.trim());
    variables.push({ name: variable, default: defaultValue || "" });
  }
  
  // Extract {{var}} format variables
  const regex2 = /\{\{([^}]+)\}\}/g;
  while ((match = regex2.exec(text)) !== null) {
    const variable = match[1].trim();
    if (!variables.some(v => v.name === variable)) {
      variables.push({ name: variable, default: "" });
    }
  }

  return [...new Set(variables.map((v) => JSON.stringify(v)))].map((v) =>
    JSON.parse(v)
  ); // Remove duplicates
}

function createVariableInputs(variables, container) {
  const form = document.createElement("div");
  form.className = "variable-form";

  variables.forEach((variable) => {
    const wrapper = document.createElement("div");
    wrapper.className = "variable-input-wrapper";

    const label = document.createElement("label");
    label.textContent = variable.name;
    label.style.fontWeight = "600";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "variable-input";
    input.placeholder = variable.default || `Enter ${variable.name}`;
    input.dataset.variable = variable.name;
    input.dataset.default = variable.default || "";

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    form.appendChild(wrapper);
  });

  container.appendChild(form);
  return form;
}

// Function to update the prompt preview with user input or default values
function updatePromptPreview(promptText, form) {
  const variables = extractVariables(promptText);

  if (variables.length === 0) {
    return promptText; // Return original text if no variables found
  }

  let previewText = promptText;
  // Replace variables with their default values without editting (for prompt cards, copy buttons, chat)
  if (!form) {
    variables.forEach(variable => {
      // Handle old-style ${var:default} format
      const pattern1 = new RegExp(`\\$\{${variable.name}[^}]*\}`, 'g');
      const replacement = variable.default || `<b>${variable.name}</b>`;
      previewText = previewText.replace(pattern1, replacement);
      
      // Handle new-style {{var}} format
      const pattern2 = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g');
      previewText = previewText.replace(pattern2, replacement);
    });
  }
  // Replace variables according to the user inputs.
  else {
    const inputs = form.querySelectorAll(".variable-input");

    inputs.forEach((input) => {
      const value = input.value.trim();
      const variable = input.dataset.variable;
      const defaultValue = input.dataset.default;
      
      // Handle old-style ${var:default} format
      const pattern1 = new RegExp(`\\$\{${variable}[^}]*\}`, 'g');
      // Handle new-style {{var}} format
      const pattern2 = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
      
      let replacement;
      if (value) {
        // User entered value
        replacement = value;
      } else if (defaultValue) {
        // Show default value with highlight
        replacement = defaultValue;
      } else {
        // No value or default, show variable name
        replacement = variable;
      }
      replacement = `<b>${replacement}</b>`;

      previewText = previewText.replace(pattern1, replacement);
      previewText = previewText.replace(pattern2, replacement);
    });
  }
  return previewText;
}
