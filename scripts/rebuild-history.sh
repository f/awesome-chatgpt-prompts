#!/bin/bash

# ONE-TIME SCRIPT: Rebuild prompts.csv git history with contributor ownership
# This script will:
# 1. Remove prompts.csv from git history
# 2. Recreate it with individual commits for each prompt, attributed to their contributors
#
# WARNING: This rewrites git history! Only run this once, then delete this script.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CSV_FILE="$PROJECT_DIR/prompts.csv"
BACKUP_FILE="$PROJECT_DIR/prompts.csv.backup"

echo "=== Rebuild prompts.csv History ==="
echo ""
echo "WARNING: This will rewrite git history for prompts.csv!"
echo "Make sure you have a backup and coordinate with your team."
echo ""
read -p "Continue? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

# Backup current prompts.csv
cp "$CSV_FILE" "$BACKUP_FILE"
echo "Backed up prompts.csv to prompts.csv.backup"

# Store current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

cd "$PROJECT_DIR"

# Run the Python script to rebuild history
export PROJECT_DIR
python3 << 'PYTHON_SCRIPT'
import csv
import subprocess
import os
import io

project_dir = os.environ.get('PROJECT_DIR', '.')
csv_file = os.path.join(project_dir, 'prompts.csv')
backup_file = os.path.join(project_dir, 'prompts.csv.backup')

# Read all prompts from backup (normalize CRLF to LF)
prompts = []
fieldnames = None
with open(backup_file, 'r', newline='', encoding='utf-8') as f:
    content = f.read().replace('\r\n', '\n').replace('\r', '\n')
    reader = csv.DictReader(io.StringIO(content))
    fieldnames = reader.fieldnames
    for row in reader:
        prompts.append(row)

print(f"Found {len(prompts)} prompts to process")

# Helper function to parse contributors
def parse_contributors(contributor_field):
    """Parse contributor field, returns (primary_author, co_authors_list)"""
    if not contributor_field:
        return 'anonymous', []
    
    contributors = [c.strip() for c in contributor_field.split(',') if c.strip()]
    
    if not contributors:
        return 'anonymous', []
    
    primary = contributors[0]
    co_authors = contributors[1:] if len(contributors) > 1 else []
    return primary, co_authors

def build_commit_message(act, co_authors):
    """Build commit message with optional co-author trailers"""
    msg = f'Add prompt: {act}'
    
    if co_authors:
        msg += '\n\n'
        for co_author in co_authors:
            co_email = f"{co_author}@users.noreply.github.com"
            msg += f'Co-authored-by: {co_author} <{co_email}>\n'
    
    return msg

# Remove prompts.csv from git (but keep the file)
print("\nRemoving prompts.csv from git tracking...")
subprocess.run(['git', 'rm', '--cached', csv_file], check=False)

# Create empty CSV with header
print("Creating empty prompts.csv with header...")
with open(csv_file, 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()

# Commit header
subprocess.run(['git', 'add', csv_file], check=True)
subprocess.run([
    'git', 'commit',
    '-m', 'Initialize prompts.csv',
    '--author=f <f@users.noreply.github.com>'
], check=True)

print(f"\nCreating {len(prompts)} commits with contributor ownership...")

# Add each prompt with proper attribution
for i, row in enumerate(prompts, 1):
    contributor_field = row.get('contributor', '').strip()
    act = row.get('act', 'Unknown')
    
    primary_author, co_authors = parse_contributors(contributor_field)
    email = f"{primary_author}@users.noreply.github.com"
    
    # Append this row to the CSV (only include known fieldnames)
    with open(csv_file, 'a', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
        writer.writerow(row)
    
    # Stage and commit
    subprocess.run(['git', 'add', csv_file], check=True)
    
    env = os.environ.copy()
    env['GIT_AUTHOR_NAME'] = primary_author
    env['GIT_AUTHOR_EMAIL'] = email
    env['GIT_COMMITTER_NAME'] = primary_author
    env['GIT_COMMITTER_EMAIL'] = email
    
    commit_msg = build_commit_message(act, co_authors)
    
    subprocess.run([
        'git', 'commit',
        '-m', commit_msg,
        f'--author={primary_author} <{email}>'
    ], env=env, check=True)
    
    co_authors_str = f" (+ {', '.join(co_authors)})" if co_authors else ""
    print(f"[{i}/{len(prompts)}] {primary_author}{co_authors_str}: {act}")

print(f"\nDone! Created {len(prompts)} commits with proper contributor attribution.")
print("\nTo push (force required since history changed):")
print("  git push origin main --force")

PYTHON_SCRIPT

# Clean up backup
rm -f "$BACKUP_FILE"

echo ""
echo "=== History Rebuilt ==="
echo ""
echo "Review with: git log --oneline prompts.csv | head -20"
echo ""
echo "To push (FORCE REQUIRED):"
echo "  git push origin main --force"
echo ""
echo "DELETE THIS SCRIPT after use: rm scripts/rebuild-history.sh"
