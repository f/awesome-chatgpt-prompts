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
        // Remove backticks from the act/title
        if (header === "app") {
          value = value.replace(/`/g, "");
        }
        entry[header] = value;
      });

      return entry;
    })
    .filter((entry) => entry.app && entry.prompt);
}

// Load prompts from CSV
async function loadPrompts() {
  const response = await fetch('/vibeprompts.csv');
  const text = await response.text();
  return parseCSV(text);
}
