#!/bin/bash

# Script to generate contributor commits from prompts.csv
# Fetches latest prompts from prompts.chat/prompts.csv
# Rebuilds prompts.csv line-by-line, with each line committed by its contributor

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CSV_FILE="$PROJECT_DIR/prompts.csv"
CSV_BACKUP="$PROJECT_DIR/prompts.csv.backup"
REMOTE_CSV_URL="https://prompts.chat/prompts.csv"

# Fetch latest prompts.csv from prompts.chat
echo "Fetching latest prompts.csv from $REMOTE_CSV_URL..."
if ! curl -fsSL "$REMOTE_CSV_URL" -o "$CSV_FILE"; then
    echo "Error: Failed to fetch prompts.csv from $REMOTE_CSV_URL"
    echo "Make sure prompts.chat is running and the endpoint is available."
    exit 1
fi
echo "Successfully fetched prompts.csv"

# Backup the fetched file
cp "$CSV_FILE" "$CSV_BACKUP"

# Count total lines (excluding header)
total=$(tail -n +2 "$CSV_BACKUP" | wc -l | tr -d ' ')
echo "Found $total prompts to process"

# Start fresh - write only header
head -1 "$CSV_BACKUP" > "$CSV_FILE"
git add "$CSV_FILE"
git commit -m "Initialize prompts.csv with header" --allow-empty 2>/dev/null || true

echo ""
echo "Creating commits for each prompt line..."

# Process each line and commit with contributor as author
python3 << 'PYTHON_SCRIPT'
import csv
import subprocess
import os

csv_backup = os.path.join(os.environ.get('PROJECT_DIR', '.'), 'prompts.csv.backup')
csv_file = os.path.join(os.environ.get('PROJECT_DIR', '.'), 'prompts.csv')

# Get existing commits (author + prompt act) to skip duplicates
def get_existing_commits():
    existing = set()
    try:
        result = subprocess.run(
            ['git', 'log', '--format=%ae|%s', '--', 'prompts.csv'],
            capture_output=True, text=True
        )
        for line in result.stdout.strip().split('\n'):
            if '|Add prompt:' in line:
                parts = line.split('|Add prompt:')
                if len(parts) == 2:
                    email = parts[0].strip()
                    act = parts[1].strip()
                    # Extract username from email
                    username = email.replace('@users.noreply.github.com', '')
                    existing.add((username, act))
    except:
        pass
    return existing

existing_commits = get_existing_commits()
print(f"Found {len(existing_commits)} existing contributor commits")

# Read all rows
rows = []
with open(csv_backup, 'r') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        rows.append(row)

total = len(rows)
created = 0
skipped = 0
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
    
    # Check if commit already exists for this contributor + prompt
    if (contributor, act) in existing_commits:
        print(f"[{i}/{total}] SKIP (exists): {contributor}: {act}")
        skipped += 1
        continue
    
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
    
    created += 1
    print(f"[{i}/{total}] {contributor}: {act}")

print(f"\nDone! Created {created} commits, skipped {skipped} existing.")
PYTHON_SCRIPT

# Clean up backup
rm -f "$CSV_BACKUP"

echo ""
echo "Review with: git log --oneline prompts.csv"
echo ""
echo "To push: git push origin main --force"
