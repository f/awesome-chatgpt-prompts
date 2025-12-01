// Format JSON with syntax highlighting
function formatJsonWithHighlighting(jsonString) {
  try {
    // Clean up the JSON string - replace curly quotes with straight quotes
    let cleanedJson = jsonString
      .replace(/[\u201C\u201D]/g, '"')  // Replace curly double quotes
      .replace(/[\u2018\u2019]/g, "'")  // Replace curly single quotes
      .replace(/"/g, '"')               // Replace left double quote
      .replace(/"/g, '"');               // Replace right double quote
      // .replace(/\n/g, '\\n');           // Replace newlines

    // Try to parse and re-format the JSON
    const parsed = JSON.parse(cleanedJson);
    const formatted = JSON.stringify(parsed, null, 2);
    
    // Apply syntax highlighting
    return formatted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g, (match) => {
        let cls = 'json-string';
        if (/:$/.test(match)) {
          cls = 'json-key';
          match = match.replace(/:$/, '');
          return `<span class="${cls}">${match}</span>:`;
        }
        return `<span class="${cls}">${match}</span>`;
      })
      .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
      .replace(/\b(null)\b/g, '<span class="json-null">$1</span>')
      .replace(/\b(-?\d+\.?\d*)\b/g, '<span class="json-number">$1</span>');
  } catch (e) {
    // If JSON parsing fails, try to format it as-is with basic highlighting
    console.warn('JSON parsing failed:', e.message);
    return jsonString
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

// Check if a string is valid JSON
function isValidJson(str) {
  try {
    // First try to parse as-is
    JSON.parse(str);
    return true;
  } catch (e) {
    // If that fails, try to clean it up and parse again
    try {
      const cleaned = str
        .replace(/[\u201C\u201D]/g, '"')  // Replace curly double quotes
        .replace(/[\u2018\u2019]/g, "'"); // Replace curly single quotes
      JSON.parse(cleaned);
      return true;
    } catch (e2) {
      return false;
    }
  }
}
