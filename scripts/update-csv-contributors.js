#!/usr/bin/env node

/**
 * This script parses README.md to extract contributor GitHub usernames
 * and updates prompts.csv to include a contributor column.
 * 
 * Usage: node scripts/update-csv-contributors.js
 */

const fs = require('fs');
const path = require('path');

const README_PATH = path.join(__dirname, '..', 'README.md');
const CSV_PATH = path.join(__dirname, '..', 'prompts.csv');

// Parse README.md to extract prompt titles and their contributors
function parseReadme(content) {
  const promptContributors = new Map();
  
  // Split by ## Act as headers
  const sections = content.split(/^## Act as /gmi);
  
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const lines = section.split('\n');
    
    // First line is the title (after "Act as ")
    const titleLine = lines[0].trim();
    // Remove any markdown links or extra text after the title
    const title = titleLine.split('\n')[0].trim();
    
    // Look for "Contributed by:" line
    const contributedLine = lines.find(line => 
      line.toLowerCase().includes('contributed by:')
    );
    
    if (contributedLine) {
      // Extract GitHub usernames from [@username](https://github.com/username) pattern
      // Also handle [username](https://github.com/username) without @ prefix
      const usernameMatches = contributedLine.matchAll(/@?([a-zA-Z0-9_-]+)\]\(https?:\/\/github\.com\/[^)]+\)/gi);
      const usernames = [...usernameMatches].map(match => match[1].toLowerCase());
      
      if (usernames.length > 0) {
        // Store all contributors, joined by comma (first one is primary for import)
        promptContributors.set(normalizeTitle(title), usernames.join(','));
      }
    }
  }
  
  return promptContributors;
}

// Normalize title for matching (remove "an ", "a ", etc.)
function normalizeTitle(title) {
  return title
    .replace(/^(an?\s+)/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// Parse CSV content
function parseCSV(content) {
  const lines = content.split('\n');
  const rows = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Parse CSV with proper handling of quoted fields
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const nextChar = line[j + 1];
      
      if (char === '"' && !inQuotes) {
        inQuotes = true;
      } else if (char === '"' && inQuotes) {
        if (nextChar === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = false;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    
    rows.push(values);
  }
  
  return rows;
}

// Escape CSV field
function escapeCSV(field) {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return '"' + field.replace(/"/g, '""') + '"';
  }
  return field;
}

// Main function
function main() {
  console.log('Reading README.md...');
  const readmeContent = fs.readFileSync(README_PATH, 'utf-8');
  
  console.log('Parsing contributors from README.md...');
  const promptContributors = parseReadme(readmeContent);
  console.log(`Found ${promptContributors.size} prompts with contributors`);
  
  console.log('\nReading prompts.csv...');
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const rows = parseCSV(csvContent);
  
  // Check if contributor column already exists
  const header = rows[0];
  const hasContributorCol = header.includes('contributor');
  
  if (!hasContributorCol) {
    header.push('contributor');
  }
  
  // Trim header to only have 5 columns (act, prompt, for_devs, type, contributor)
  rows[0] = header.slice(0, 5);
  if (rows[0].length < 5) rows[0].push('contributor');

  let matched = 0;
  let unmatched = [];
  
  // Process each row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 1) continue;
    
    const act = row[0].replace(/^"|"$/g, ''); // Remove surrounding quotes
    const normalizedAct = normalizeTitle(act);
    
    // Try to find contributor
    let contributor = '';
    
    // Direct match
    if (promptContributors.has(normalizedAct)) {
      contributor = promptContributors.get(normalizedAct);
    } else {
      // Try partial matching
      for (const [title, user] of promptContributors) {
        if (title.includes(normalizedAct) || normalizedAct.includes(title)) {
          contributor = user;
          break;
        }
      }
    }
    
    if (contributor) {
      matched++;
    } else {
      unmatched.push(act);
    }
    
    // Trim row to 4 columns and add contributor as 5th
    rows[i] = row.slice(0, 4);
    rows[i].push(contributor);
  }
  
  console.log(`\nMatched ${matched} prompts with contributors`);
  if (unmatched.length > 0) {
    console.log(`\nUnmatched prompts (${unmatched.length}):`);
    unmatched.slice(0, 10).forEach(title => console.log(`  - ${title}`));
    if (unmatched.length > 10) {
      console.log(`  ... and ${unmatched.length - 10} more`);
    }
  }
  
  // Generate new CSV
  console.log('\nWriting updated prompts.csv...');
  const newCSV = rows.map(row => row.map(escapeCSV).join(',')).join('\n');
  fs.writeFileSync(CSV_PATH, newCSV);
  
  console.log('Done!');
  
  // Print some stats
  console.log('\n--- Contributor Stats ---');
  const contributorCounts = new Map();
  for (let i = 1; i < rows.length; i++) {
    const contributor = rows[i][rows[i].length - 1];
    if (contributor) {
      contributorCounts.set(contributor, (contributorCounts.get(contributor) || 0) + 1);
    }
  }
  
  const sorted = [...contributorCounts.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`\nTop contributors:`);
  sorted.slice(0, 10).forEach(([user, count]) => {
    console.log(`  @${user}: ${count} prompts`);
  });
}

main();
