#!/bin/bash

# Script to generate contributor commits from prompts.csv
# Rebuilds prompts.csv line-by-line, with each line committed by its contributor
# This creates git history showing each contributor adding their prompt

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CSV_FILE="$PROJECT_DIR/prompts.csv"
CSV_BACKUP="$PROJECT_DIR/prompts.csv.backup"

if [ ! -f "$CSV_FILE" ]; then
    echo "Error: prompts.csv not found at $CSV_FILE"
    exit 1
fi

# Backup original file
cp "$CSV_FILE" "$CSV_BACKUP"
echo "Backed up prompts.csv to prompts.csv.backup"

# Count total lines (excluding header)
total=$(tail -n +2 "$CSV_BACKUP" | wc -l | tr -d ' ')
echo "Found $total prompts to process"

# Start fresh - write only header
head -1 "$CSV_BACKUP" > "$CSV_FILE"
git add "$CSV_FILE"
git commit -m "Initialize prompts.csv with header" --allow-empty

echo ""
echo "Creating commits for each prompt line..."

# Process each line and commit with contributor as author
python3 << 'PYTHON_SCRIPT'
import csv
import subprocess
import os

csv_backup = os.path.join(os.environ.get('PROJECT_DIR', '.'), 'prompts.csv.backup')
csv_file = os.path.join(os.environ.get('PROJECT_DIR', '.'), 'prompts.csv')

# Read all rows
rows = []
with open(csv_backup, 'r') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        rows.append(row)

total = len(rows)
print(f"Processing {total} prompts...")

for i, row in enumerate(rows, 1):
    contributor = row.get('contributor', '').strip()
    act = row.get('act', 'Unknown')
    
    if not contributor:
        contributor = 'anonymous'
    
    email = f"{contributor}@users.noreply.github.com"
    
    # Append this row to the CSV
    with open(csv_file, 'a', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writerow(row)
    
    # Stage and commit
    subprocess.run(['git', 'add', csv_file], check=True)
    
    env = os.environ.copy()
    env['GIT_AUTHOR_NAME'] = contributor
    env['GIT_AUTHOR_EMAIL'] = email
    env['GIT_COMMITTER_NAME'] = contributor
    env['GIT_COMMITTER_EMAIL'] = email
    
    subprocess.run([
        'git', 'commit',
        '-m', f'Add prompt: {act}',
        f'--author={contributor} <{email}>'
    ], env=env, check=True)
    
    print(f"[{i}/{total}] {contributor}: {act}")

print(f"\nDone! Created {total} contributor commits.")
PYTHON_SCRIPT

# Clean up backup
rm -f "$CSV_BACKUP"

echo ""
echo "Review with: git log --oneline prompts.csv"
echo ""
echo "To push: git push origin main --force"
