function parseCSV(csv) {
  const lines = csv.split("\n");
  const headers = lines[0]
    .split(",")
    .map((header) => header.replace(/"/g, "").trim());

  // Helper function to properly parse CSV line with quoted fields
  function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"' && !inQuotes) {
        inQuotes = true;
      } else if (char === '"' && inQuotes) {
        if (nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = false;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  }

  return lines
    .slice(1)
    .map((line) => {
      const values = parseCSVLine(line);
      const entry = {};

      headers.forEach((header, index) => {
        let value = values[index] ? values[index].trim() : "";
        // Remove backticks from the act/title
        if (header === "act") {
          value = value.replace(/`/g, "");
        }
        // Convert 'TRUE'/'FALSE' strings to boolean for for_devs
        if (header === "for_devs") {
          value = value.toUpperCase() === "TRUE";
        }
        // Default type to TEXT if not specified
        if (header === "type" && !value) {
          value = "TEXT";
        }
        entry[header] = value;
      });

      // Ensure type defaults to TEXT if not present
      if (!entry.type) {
        entry.type = "TEXT";
      }

      return entry;
    })
    .filter((entry) => entry.act && entry.prompt);
}
