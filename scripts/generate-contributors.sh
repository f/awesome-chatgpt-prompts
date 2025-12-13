#!/bin/bash

# Script to generate contributor commits from prompts.csv
# Fetches latest prompts from prompts.chat/prompts.csv
# Compares with existing prompts.csv and creates commits only for new prompts

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CSV_FILE="$PROJECT_DIR/prompts.csv"
REMOTE_CSV="$PROJECT_DIR/prompts.csv.remote"
REMOTE_CSV_URL="https://prompts.chat/prompts.csv"

# Fetch latest prompts.csv from prompts.chat
echo "Fetching latest prompts.csv from $REMOTE_CSV_URL..."
if ! curl -fsSL "$REMOTE_CSV_URL" -o "$REMOTE_CSV"; then
    echo "Error: Failed to fetch prompts.csv from $REMOTE_CSV_URL"
    echo "Make sure prompts.chat is running and the endpoint is available."
    exit 1
fi
echo "Successfully fetched remote prompts.csv"

# Initialize local CSV if it doesn't exist
if [ ! -f "$CSV_FILE" ]; then
    echo "Local prompts.csv not found, initializing with header..."
    head -1 "$REMOTE_CSV" > "$CSV_FILE"
    git add "$CSV_FILE"
    git commit -m "Initialize prompts.csv with header" --allow-empty 2>/dev/null || true
fi

echo ""
echo "Comparing local and remote prompts.csv..."

# Process diffs and create commits for new prompts
export PROJECT_DIR
python3 << 'PYTHON_SCRIPT'
import csv
import subprocess
import os

project_dir = os.environ.get('PROJECT_DIR', '.')
csv_file = os.path.join(project_dir, 'prompts.csv')
remote_csv = os.path.join(project_dir, 'prompts.csv.remote')

# Read existing local prompts (by act title as key)
local_prompts = {}
fieldnames = None
with open(csv_file, 'r') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        act = row.get('act', '').strip()
        if act:
            local_prompts[act] = row

print(f"Found {len(local_prompts)} existing local prompts")

# Read remote prompts
remote_prompts = []
with open(remote_csv, 'r') as f:
    reader = csv.DictReader(f)
    remote_fieldnames = reader.fieldnames
    for row in reader:
        remote_prompts.append(row)

print(f"Found {len(remote_prompts)} remote prompts")

# Use remote fieldnames if local is empty
if not fieldnames:
    fieldnames = remote_fieldnames

# Find new prompts (in remote but not in local)
new_prompts = []
for row in remote_prompts:
    act = row.get('act', '').strip()
    if act and act not in local_prompts:
        new_prompts.append(row)

print(f"Found {len(new_prompts)} new prompts to add")

if not new_prompts:
    print("\nNo new prompts to add. Already up to date!")
else:
    print("\nCreating commits for new prompts...")
    
    for i, row in enumerate(new_prompts, 1):
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
        
        print(f"[{i}/{len(new_prompts)}] {contributor}: {act}")
    
    print(f"\nDone! Created {len(new_prompts)} new commits.")

PYTHON_SCRIPT

# Clean up
rm -f "$REMOTE_CSV"

echo ""
echo "Review with: git log --oneline prompts.csv"
echo ""
echo "To push: git push origin main"
